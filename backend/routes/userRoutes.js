/**
 * User Routes
 * API endpoints for user management (admin functions and doctor listing)
 */

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const PatientQueue = require('../models/PatientQueue');
const Prescription = require('../models/Prescription');
const { protect } = require('../middleware/auth');

/**
 * @route   GET /api/users/doctors
 * @desc    Get list of approved doctors (for appointment booking)
 * @access  Private
 */
router.get('/doctors', protect, async (req, res) => {
    try {
        const doctors = await User.find({
            role: 'doctor',
            isApproved: true,
            status: 'approved'
        })
            .select('name email specialty avatarColor qualifications experience')
            .sort({ name: 1 });

        res.status(200).json({
            success: true,
            count: doctors.length,
            data: doctors
        });
    } catch (error) {
        console.error('Error fetching doctors:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching doctors',
            error: error.message
        });
    }
});

/**
 * @route   GET /api/users/patients
 * @desc    Get list of patients (doctors only)
 * @access  Private (Doctors only)
 */
router.get('/patients', protect, async (req, res) => {
    try {
        if (req.user.role !== 'doctor' && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Only doctors can access patient list'
            });
        }

        const patients = await User.find({ role: 'patient' })
            .select('name email age avatarColor createdAt')
            .sort({ name: 1 });

        res.status(200).json({
            success: true,
            count: patients.length,
            data: patients
        });
    } catch (error) {
        console.error('Error fetching patients:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching patients',
            error: error.message
        });
    }
});

/**
 * @route   GET /api/users/profile
 * @desc    Get current user's profile
 * @access  Private
 */
router.get('/profile', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .select('-password');

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching profile',
            error: error.message
        });
    }
});

/**
 * @route   PUT /api/users/profile
 * @desc    Update current user's profile
 * @access  Private
 */
router.put('/profile', protect, async (req, res) => {
    try {
        const { name, phone, age, specialty } = req.body;

        const updateData = {};
        if (name) updateData.name = name;
        if (phone) updateData.phone = phone;
        if (age && req.user.role === 'patient') updateData.age = age;
        if (specialty && req.user.role === 'doctor') updateData.specialty = specialty;

        const user = await User.findByIdAndUpdate(
            req.user._id,
            updateData,
            { new: true, runValidators: true }
        ).select('-password');

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: user
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating profile',
            error: error.message
        });
    }
});

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID (limited info)
 * @access  Private
 */
router.get('/:id', protect, async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select('name email role specialty avatarColor');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching user',
            error: error.message
        });
    }
});

/**
 * @route   GET /api/users/:id/history
 * @desc    Get patient's consultation history (doctors only)
 * @access  Private (Doctors only)
 */
router.get('/:id/history', protect, async (req, res) => {
    try {
        if (req.user.role !== 'doctor' && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Only doctors can access patient history'
            });
        }

        const patientId = req.params.id;

        // Get patient info
        const patient = await User.findById(patientId)
            .select('name email age phone avatarColor createdAt');

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: 'Patient not found'
            });
        }

        // Get past consultations with this doctor
        const consultations = await PatientQueue.find({
            patientId,
            doctorId: req.user._id
        })
            .select('condition symptoms symptomDuration urgency status consultationType consultationMode consultationStartedAt consultationEndedAt notes createdAt')
            .sort({ createdAt: -1 })
            .limit(10);

        // Get prescriptions from this doctor
        const prescriptions = await Prescription.find({
            patientId,
            doctorId: req.user._id
        })
            .select('items diagnosis notes status issuedAt createdAt')
            .sort({ createdAt: -1 })
            .limit(10);

        res.status(200).json({
            success: true,
            data: {
                patient,
                consultations,
                prescriptions,
                totalConsultations: consultations.length,
                totalPrescriptions: prescriptions.length
            }
        });
    } catch (error) {
        console.error('Error fetching patient history:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching patient history',
            error: error.message
        });
    }
});

module.exports = router;
