/**
 * Patient Queue Routes
 * API endpoints for managing the patient waiting queue (for doctors)
 */

const express = require('express');
const router = express.Router();
const PatientQueue = require('../models/PatientQueue');
const Chat = require('../models/Chat');
const Notification = require('../models/Notification');
const { protect, authorize } = require('../middleware/auth');

/**
 * @route   GET /api/queue
 * @desc    Get the patient queue for the authenticated doctor
 * @access  Private (Doctors only)
 */
router.get('/', protect, async (req, res) => {
    try {
        // Only doctors can view the queue
        if (req.user.role !== 'doctor' && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Only doctors can access the patient queue'
            });
        }

        const queue = await PatientQueue.getQueue(req.user._id);

        res.status(200).json({
            success: true,
            count: queue.length,
            data: queue
        });
    } catch (error) {
        console.error('Error fetching queue:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching queue',
            error: error.message
        });
    }
});

/**
 * @route   GET /api/queue/completed
 * @desc    Get completed consultations for the authenticated doctor
 * @access  Private (Doctors only)
 */
router.get('/completed', protect, async (req, res) => {
    try {
        // Only doctors can view completed consultations
        if (req.user.role !== 'doctor' && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Only doctors can access completed consultations'
            });
        }

        const completed = await PatientQueue.find({
            doctorId: req.user._id,
            status: 'completed'
        })
            .populate('patientId', 'name email age avatarColor phone')
            .sort({ consultationEndedAt: -1 })
            .limit(50); // Limit to most recent 50

        res.status(200).json({
            success: true,
            count: completed.length,
            data: completed
        });
    } catch (error) {
        console.error('Error fetching completed consultations:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching completed consultations',
            error: error.message
        });
    }
});

/**
 * @route   GET /api/queue/my-consultations
 * @desc    Get patient's own consultation requests
 * @access  Private (Patients)
 */
router.get('/my-consultations', protect, async (req, res) => {
    try {
        const consultations = await PatientQueue.find({ patientId: req.user._id })
            .populate('doctorId', 'name email specialty avatarColor')
            .populate('chatId')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: consultations.length,
            data: consultations
        });
    } catch (error) {
        console.error('Error fetching consultations:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching consultations',
            error: error.message
        });
    }
});

/**
 * @route   POST /api/queue
 * @desc    Add a patient to the queue (request consultation)
 * @access  Private (Patients)
 */
router.post('/', protect, async (req, res) => {
    try {
        const {
            doctorId,
            condition,
            age,
            symptoms,
            symptomDuration,
            urgency,
            consultationType,
            consultationMode
        } = req.body;

        if (!doctorId || !condition) {
            return res.status(400).json({
                success: false,
                message: 'Please provide doctorId and condition'
            });
        }

        // Check if already in queue for this doctor
        const existingEntry = await PatientQueue.findOne({
            patientId: req.user._id,
            doctorId,
            status: { $in: ['waiting', 'in-consultation'] }
        });

        if (existingEntry) {
            return res.status(400).json({
                success: false,
                message: 'You already have a pending consultation with this doctor'
            });
        }

        const queueEntry = await PatientQueue.create({
            patientId: req.user._id,
            doctorId,
            condition,
            age: age || null,
            symptoms: symptoms || '',
            symptomDuration: symptomDuration || '',
            urgency: urgency || 'medium',
            consultationType: consultationType || 'general',
            consultationMode: consultationMode || 'video'
        });

        // Automatically create a chat between patient and doctor for the consultation
        const chat = await Chat.getOrCreate(req.user._id, doctorId);
        queueEntry.chatId = chat._id;
        await queueEntry.save();

        await queueEntry.populate('patientId', 'name email age avatarColor phone');
        await queueEntry.populate('doctorId', 'name email specialty avatarColor');

        // Create notification for the doctor about new consultation request
        await Notification.createNotification({
            userId: doctorId,
            title: 'New Consultation Request',
            message: `${req.user.name} has requested a consultation for: ${condition}`,
            type: 'consultation_started',
            relatedId: queueEntry._id,
            relatedModel: 'PatientQueue',
            metadata: {
                patientId: req.user._id,
                patientName: req.user.name,
                condition: condition,
                urgency: urgency || 'medium'
            }
        });

        res.status(201).json({
            success: true,
            message: 'Consultation request submitted successfully',
            data: queueEntry
        });
    } catch (error) {
        console.error('Error adding to queue:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while adding to queue',
            error: error.message
        });
    }
});

/**
 * @route   PUT /api/queue/:id/start
 * @desc    Start consultation with a patient (doctor action)
 * @access  Private (Doctors only)
 */
router.put('/:id/start', protect, async (req, res) => {
    try {
        if (req.user.role !== 'doctor' && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Only doctors can start consultations'
            });
        }

        const queueEntry = await PatientQueue.findOneAndUpdate(
            { _id: req.params.id, doctorId: req.user._id, status: 'waiting' },
            {
                status: 'in-consultation',
                consultationStartedAt: new Date()
            },
            { new: true }
        ).populate('patientId', 'name email age avatarColor');

        if (!queueEntry) {
            return res.status(404).json({
                success: false,
                message: 'Queue entry not found or already in consultation'
            });
        }

        // Create notification for the patient
        await Notification.createNotification({
            userId: queueEntry.patientId._id,
            title: 'Consultation Started',
            message: `Dr. ${req.user.name} has started your consultation. Please join the chat to continue.`,
            type: 'consultation_started',
            relatedId: queueEntry.chatId,
            relatedModel: 'Chat',
            metadata: {
                doctorId: req.user._id,
                doctorName: req.user.name,
                condition: queueEntry.condition
            }
        });

        res.status(200).json({
            success: true,
            message: 'Consultation started',
            data: queueEntry
        });
    } catch (error) {
        console.error('Error starting consultation:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while starting consultation',
            error: error.message
        });
    }
});

/**
 * @route   PUT /api/queue/:id/complete
 * @desc    Complete consultation with a patient (doctor action)
 * @access  Private (Doctors only)
 */
router.put('/:id/complete', protect, async (req, res) => {
    try {
        if (req.user.role !== 'doctor' && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Only doctors can complete consultations'
            });
        }

        const { notes } = req.body;

        const queueEntry = await PatientQueue.findOneAndUpdate(
            { _id: req.params.id, doctorId: req.user._id, status: 'in-consultation' },
            {
                status: 'completed',
                consultationEndedAt: new Date(),
                notes: notes || ''
            },
            { new: true }
        ).populate('patientId', 'name email age avatarColor');

        if (!queueEntry) {
            return res.status(404).json({
                success: false,
                message: 'Queue entry not found or not in consultation'
            });
        }

        // Create notification for the patient
        await Notification.createNotification({
            userId: queueEntry.patientId._id,
            title: 'Consultation Completed',
            message: `Your consultation with Dr. ${req.user.name} has been completed. Check your messages for any prescriptions or notes.`,
            type: 'consultation_completed',
            relatedId: queueEntry.chatId,
            relatedModel: 'Chat',
            metadata: {
                doctorId: req.user._id,
                doctorName: req.user.name,
                condition: queueEntry.condition
            }
        });

        res.status(200).json({
            success: true,
            message: 'Consultation completed',
            data: queueEntry
        });
    } catch (error) {
        console.error('Error completing consultation:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while completing consultation',
            error: error.message
        });
    }
});

/**
 * @route   DELETE /api/queue/:id
 * @desc    Remove a patient from the queue (cancel)
 * @access  Private
 */
router.delete('/:id', protect, async (req, res) => {
    try {
        const queueEntry = await PatientQueue.findById(req.params.id);

        if (!queueEntry) {
            return res.status(404).json({
                success: false,
                message: 'Queue entry not found'
            });
        }

        // Check authorization - either the patient or the doctor can cancel
        const isAuthorized =
            queueEntry.patientId.toString() === req.user._id.toString() ||
            queueEntry.doctorId.toString() === req.user._id.toString() ||
            req.user.role === 'admin';

        if (!isAuthorized) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to cancel this queue entry'
            });
        }

        queueEntry.status = 'cancelled';
        await queueEntry.save();

        res.status(200).json({
            success: true,
            message: 'Removed from queue successfully'
        });
    } catch (error) {
        console.error('Error removing from queue:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while removing from queue',
            error: error.message
        });
    }
});

/**
 * @route   GET /api/queue/stats
 * @desc    Get queue statistics for the doctor
 * @access  Private (Doctors only)
 */
router.get('/stats', protect, async (req, res) => {
    try {
        if (req.user.role !== 'doctor' && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Only doctors can access queue stats'
            });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const stats = await PatientQueue.aggregate([
            { $match: { doctorId: req.user._id, createdAt: { $gte: today } } },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        const formattedStats = {
            waiting: 0,
            inConsultation: 0,
            completed: 0,
            cancelled: 0,
            total: 0
        };

        stats.forEach(stat => {
            if (stat._id === 'waiting') formattedStats.waiting = stat.count;
            if (stat._id === 'in-consultation') formattedStats.inConsultation = stat.count;
            if (stat._id === 'completed') formattedStats.completed = stat.count;
            if (stat._id === 'cancelled') formattedStats.cancelled = stat.count;
            formattedStats.total += stat.count;
        });

        res.status(200).json({
            success: true,
            data: formattedStats
        });
    } catch (error) {
        console.error('Error fetching queue stats:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching queue stats',
            error: error.message
        });
    }
});

module.exports = router;
