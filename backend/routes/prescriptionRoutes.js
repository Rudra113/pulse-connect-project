/**
 * Prescription Routes
 * API endpoints for managing prescriptions
 */

const express = require('express');
const router = express.Router();
const Prescription = require('../models/Prescription');
const { protect } = require('../middleware/auth');

/**
 * @route   POST /api/prescriptions
 * @desc    Create a new prescription (doctors only)
 * @access  Private (Doctors only)
 */
router.post('/', protect, async (req, res) => {
    try {
        if (req.user.role !== 'doctor' && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Only doctors can create prescriptions'
            });
        }

        const { patientId, appointmentId, items, diagnosis, notes, validUntil } = req.body;

        if (!patientId || !items || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Please provide patientId and at least one prescription item'
            });
        }

        // Validate each item
        for (const item of items) {
            if (!item.medication || !item.dosage || !item.frequency || !item.duration) {
                return res.status(400).json({
                    success: false,
                    message: 'Each item must have medication, dosage, frequency, and duration'
                });
            }
        }

        const prescription = await Prescription.create({
            patientId,
            doctorId: req.user._id,
            appointmentId,
            items,
            diagnosis,
            notes,
            validUntil: validUntil ? new Date(validUntil) : undefined
        });

        await prescription.populate([
            { path: 'patientId', select: 'name email' },
            { path: 'doctorId', select: 'name email specialty' }
        ]);

        res.status(201).json({
            success: true,
            message: 'Prescription created successfully',
            data: prescription
        });
    } catch (error) {
        console.error('Error creating prescription:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while creating prescription',
            error: error.message
        });
    }
});

/**
 * @route   GET /api/prescriptions
 * @desc    Get all prescriptions for the authenticated user
 * @access  Private
 */
router.get('/', protect, async (req, res) => {
    try {
        const query = req.user.role === 'doctor'
            ? { doctorId: req.user._id }
            : { patientId: req.user._id };

        const { status } = req.query;
        if (status) {
            query.status = status;
        }

        const prescriptions = await Prescription.find(query)
            .populate('patientId', 'name email')
            .populate('doctorId', 'name email specialty')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: prescriptions.length,
            data: prescriptions
        });
    } catch (error) {
        console.error('Error fetching prescriptions:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching prescriptions',
            error: error.message
        });
    }
});

/**
 * @route   GET /api/prescriptions/:id
 * @desc    Get a single prescription by ID
 * @access  Private
 */
router.get('/:id', protect, async (req, res) => {
    try {
        const prescription = await Prescription.findById(req.params.id)
            .populate('patientId', 'name email')
            .populate('doctorId', 'name email specialty');

        if (!prescription) {
            return res.status(404).json({
                success: false,
                message: 'Prescription not found'
            });
        }

        // Check authorization
        const isAuthorized =
            prescription.patientId._id.toString() === req.user._id.toString() ||
            prescription.doctorId._id.toString() === req.user._id.toString() ||
            req.user.role === 'admin';

        if (!isAuthorized) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this prescription'
            });
        }

        res.status(200).json({
            success: true,
            data: prescription
        });
    } catch (error) {
        console.error('Error fetching prescription:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching prescription',
            error: error.message
        });
    }
});

/**
 * @route   PUT /api/prescriptions/:id
 * @desc    Update a prescription (doctors only)
 * @access  Private (Doctors only)
 */
router.put('/:id', protect, async (req, res) => {
    try {
        if (req.user.role !== 'doctor' && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Only doctors can update prescriptions'
            });
        }

        const prescription = await Prescription.findOne({
            _id: req.params.id,
            doctorId: req.user._id
        });

        if (!prescription) {
            return res.status(404).json({
                success: false,
                message: 'Prescription not found or not authorized'
            });
        }

        const { items, diagnosis, notes, status, validUntil } = req.body;

        if (items) prescription.items = items;
        if (diagnosis) prescription.diagnosis = diagnosis;
        if (notes) prescription.notes = notes;
        if (status) prescription.status = status;
        if (validUntil) prescription.validUntil = new Date(validUntil);

        await prescription.save();

        await prescription.populate([
            { path: 'patientId', select: 'name email' },
            { path: 'doctorId', select: 'name email specialty' }
        ]);

        res.status(200).json({
            success: true,
            message: 'Prescription updated successfully',
            data: prescription
        });
    } catch (error) {
        console.error('Error updating prescription:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating prescription',
            error: error.message
        });
    }
});

module.exports = router;
