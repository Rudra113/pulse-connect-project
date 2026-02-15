/**
 * Appointment Routes
 * API endpoints for managing appointments
 */

const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const { protect, authorize } = require('../middleware/auth');

/**
 * @route   POST /api/appointments
 * @desc    Create a new appointment
 * @access  Private
 */
router.post('/', protect, async (req, res) => {
    try {
        const { doctorId, scheduledAt, duration, type, reason } = req.body;

        if (!doctorId || !scheduledAt) {
            return res.status(400).json({
                success: false,
                message: 'Please provide doctorId and scheduledAt'
            });
        }

        const appointment = await Appointment.create({
            patientId: req.user._id,
            doctorId,
            scheduledAt: new Date(scheduledAt),
            duration: duration || 30,
            type: type || 'video',
            reason
        });

        await appointment.populate([
            { path: 'patientId', select: 'name email avatarColor' },
            { path: 'doctorId', select: 'name email specialty avatarColor' }
        ]);

        res.status(201).json({
            success: true,
            message: 'Appointment created successfully',
            data: appointment
        });
    } catch (error) {
        console.error('Error creating appointment:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while creating appointment',
            error: error.message
        });
    }
});

/**
 * @route   GET /api/appointments
 * @desc    Get all appointments for the authenticated user
 * @access  Private
 */
router.get('/', protect, async (req, res) => {
    try {
        const { status, upcoming } = req.query;
        const query = req.user.role === 'doctor'
            ? { doctorId: req.user._id }
            : { patientId: req.user._id };

        if (status) {
            query.status = status;
        }

        if (upcoming === 'true') {
            query.scheduledAt = { $gte: new Date() };
            query.status = { $nin: ['cancelled', 'completed'] };
        }

        const appointments = await Appointment.find(query)
            .populate('patientId', 'name email avatarColor age')
            .populate('doctorId', 'name email specialty avatarColor')
            .sort({ scheduledAt: 1 });

        res.status(200).json({
            success: true,
            count: appointments.length,
            data: appointments
        });
    } catch (error) {
        console.error('Error fetching appointments:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching appointments',
            error: error.message
        });
    }
});

/**
 * @route   GET /api/appointments/:id
 * @desc    Get a single appointment by ID
 * @access  Private
 */
router.get('/:id', protect, async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id)
            .populate('patientId', 'name email avatarColor age')
            .populate('doctorId', 'name email specialty avatarColor');

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found'
            });
        }

        // Check if user is authorized to view this appointment
        const isAuthorized =
            appointment.patientId._id.toString() === req.user._id.toString() ||
            appointment.doctorId._id.toString() === req.user._id.toString() ||
            req.user.role === 'admin';

        if (!isAuthorized) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this appointment'
            });
        }

        res.status(200).json({
            success: true,
            data: appointment
        });
    } catch (error) {
        console.error('Error fetching appointment:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching appointment',
            error: error.message
        });
    }
});

/**
 * @route   PUT /api/appointments/:id
 * @desc    Update an appointment
 * @access  Private
 */
router.put('/:id', protect, async (req, res) => {
    try {
        const { status, scheduledAt, doctorNotes, cancellationReason } = req.body;

        const appointment = await Appointment.findById(req.params.id);

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found'
            });
        }

        // Check authorization
        const isAuthorized =
            appointment.patientId.toString() === req.user._id.toString() ||
            appointment.doctorId.toString() === req.user._id.toString() ||
            req.user.role === 'admin';

        if (!isAuthorized) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this appointment'
            });
        }

        // Update fields
        if (status) appointment.status = status;
        if (scheduledAt) appointment.scheduledAt = new Date(scheduledAt);
        if (doctorNotes && req.user.role === 'doctor') appointment.doctorNotes = doctorNotes;
        if (cancellationReason && status === 'cancelled') appointment.cancellationReason = cancellationReason;

        await appointment.save();

        await appointment.populate([
            { path: 'patientId', select: 'name email avatarColor' },
            { path: 'doctorId', select: 'name email specialty avatarColor' }
        ]);

        res.status(200).json({
            success: true,
            message: 'Appointment updated successfully',
            data: appointment
        });
    } catch (error) {
        console.error('Error updating appointment:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating appointment',
            error: error.message
        });
    }
});

/**
 * @route   DELETE /api/appointments/:id
 * @desc    Cancel an appointment
 * @access  Private
 */
router.delete('/:id', protect, async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id);

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found'
            });
        }

        // Check authorization
        const isAuthorized =
            appointment.patientId.toString() === req.user._id.toString() ||
            appointment.doctorId.toString() === req.user._id.toString() ||
            req.user.role === 'admin';

        if (!isAuthorized) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to cancel this appointment'
            });
        }

        appointment.status = 'cancelled';
        appointment.cancellationReason = req.body.reason || 'Cancelled by user';
        await appointment.save();

        res.status(200).json({
            success: true,
            message: 'Appointment cancelled successfully'
        });
    } catch (error) {
        console.error('Error cancelling appointment:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while cancelling appointment',
            error: error.message
        });
    }
});

module.exports = router;
