/**
 * Admin Routes
 * Routes for admin functionality - doctor approval, user management
 */

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// All admin routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

/**
 * @route   GET /api/admin/doctors/pending
 * @desc    Get all pending doctor registrations
 * @access  Admin only
 */
router.get('/doctors/pending', async (req, res) => {
    try {
        const pendingDoctors = await User.find({
            role: 'doctor',
            status: 'pending'
        }).select('-password').sort({ createdAt: -1 });

        res.json({
            success: true,
            count: pendingDoctors.length,
            data: pendingDoctors
        });
    } catch (error) {
        console.error('Error fetching pending doctors:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

/**
 * @route   GET /api/admin/doctors/all
 * @desc    Get all doctors with their status
 * @access  Admin only
 */
router.get('/doctors/all', async (req, res) => {
    try {
        const doctors = await User.find({ role: 'doctor' })
            .select('-password')
            .populate('approvedBy', 'name email')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: doctors.length,
            data: doctors
        });
    } catch (error) {
        console.error('Error fetching doctors:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

/**
 * @route   PUT /api/admin/doctors/:id/approve
 * @desc    Approve a doctor registration
 * @access  Admin only
 */
router.put('/doctors/:id/approve', async (req, res) => {
    try {
        const doctor = await User.findById(req.params.id);

        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: 'Doctor not found'
            });
        }

        if (doctor.role !== 'doctor') {
            return res.status(400).json({
                success: false,
                message: 'User is not a doctor'
            });
        }

        if (doctor.status === 'approved') {
            return res.status(400).json({
                success: false,
                message: 'Doctor is already approved'
            });
        }

        doctor.status = 'approved';
        doctor.isApproved = true;
        doctor.approvedBy = req.user._id;
        doctor.approvalDate = new Date();
        doctor.rejectionReason = null;

        await doctor.save();

        res.json({
            success: true,
            message: 'Doctor approved successfully',
            data: doctor
        });
    } catch (error) {
        console.error('Error approving doctor:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

/**
 * @route   PUT /api/admin/doctors/:id/reject
 * @desc    Reject a doctor registration
 * @access  Admin only
 */
router.put('/doctors/:id/reject', async (req, res) => {
    try {
        const { reason } = req.body;

        const doctor = await User.findById(req.params.id);

        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: 'Doctor not found'
            });
        }

        if (doctor.role !== 'doctor') {
            return res.status(400).json({
                success: false,
                message: 'User is not a doctor'
            });
        }

        doctor.status = 'rejected';
        doctor.isApproved = false;
        doctor.approvedBy = req.user._id;
        doctor.approvalDate = new Date();
        doctor.rejectionReason = reason || 'Application rejected';

        await doctor.save();

        res.json({
            success: true,
            message: 'Doctor registration rejected',
            data: doctor
        });
    } catch (error) {
        console.error('Error rejecting doctor:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

/**
 * @route   PUT /api/admin/doctors/:id/suspend
 * @desc    Suspend an approved doctor
 * @access  Admin only
 */
router.put('/doctors/:id/suspend', async (req, res) => {
    try {
        const { reason } = req.body;

        const doctor = await User.findById(req.params.id);

        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: 'Doctor not found'
            });
        }

        doctor.status = 'suspended';
        doctor.isApproved = false;
        doctor.rejectionReason = reason || 'Account suspended';

        await doctor.save();

        res.json({
            success: true,
            message: 'Doctor suspended',
            data: doctor
        });
    } catch (error) {
        console.error('Error suspending doctor:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

/**
 * @route   GET /api/admin/users
 * @desc    Get all users
 * @access  Admin only
 */
router.get('/users', async (req, res) => {
    try {
        const { role, status } = req.query;

        const filter = {};
        if (role) filter.role = role;
        if (status) filter.status = status;

        const users = await User.find(filter)
            .select('-password')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

/**
 * @route   GET /api/admin/stats
 * @desc    Get admin dashboard stats
 * @access  Admin only
 */
router.get('/stats', async (req, res) => {
    try {
        const [
            totalPatients,
            totalDoctors,
            pendingDoctors,
            approvedDoctors,
            totalAdmins
        ] = await Promise.all([
            User.countDocuments({ role: 'patient' }),
            User.countDocuments({ role: 'doctor' }),
            User.countDocuments({ role: 'doctor', status: 'pending' }),
            User.countDocuments({ role: 'doctor', status: 'approved' }),
            User.countDocuments({ role: 'admin' })
        ]);

        res.json({
            success: true,
            data: {
                totalPatients,
                totalDoctors,
                pendingDoctors,
                approvedDoctors,
                totalAdmins,
                totalUsers: totalPatients + totalDoctors + totalAdmins
            }
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

module.exports = router;
