/**
 * Authentication Routes
 * Handles user registration, login, and profile
 */

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role, specialty, qualifications, experience, licenseNumber, age } = req.body;

        // Validate required fields
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide name, email, and password'
            });
        }

        // Validate role - Admin registration is not allowed via API
        // Admins must be created using: npm run seed:admin
        const validRoles = ['patient', 'doctor'];
        if (role === 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Admin registration is not allowed via API. Contact system administrator.'
            });
        }
        const userRole = validRoles.includes(role) ? role : 'patient';

        // Validate doctor-specific fields
        if (userRole === 'doctor') {
            if (!specialty) {
                return res.status(400).json({
                    success: false,
                    message: 'Doctors must provide a specialty'
                });
            }
            if (!qualifications) {
                return res.status(400).json({
                    success: false,
                    message: 'Doctors must provide qualifications'
                });
            }
            if (!licenseNumber) {
                return res.status(400).json({
                    success: false,
                    message: 'Doctors must provide a license number'
                });
            }
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'An account with this email already exists'
            });
        }

        // Create new user
        const userData = {
            name,
            email: email.toLowerCase(),
            password,
            role: userRole
        };

        // Add role-specific fields
        if (userRole === 'doctor') {
            userData.specialty = specialty;
            userData.qualifications = qualifications;
            userData.experience = experience || 0;
            userData.licenseNumber = licenseNumber;
            userData.isApproved = false;
            userData.status = 'pending';
        }
        if (userRole === 'patient' && age) {
            userData.age = age;
        }

        const user = await User.create(userData);

        // Generate token
        const token = user.generateAuthToken();

        // Send response (exclude password)
        res.status(201).json({
            success: true,
            message: user.role === 'doctor' ? 'Registration successful. Your account is pending admin approval.' : 'Registration successful',
            data: {
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    specialty: user.specialty,
                    age: user.age,
                    avatarColor: user.avatarColor,
                    isApproved: user.isApproved,
                    status: user.status,
                    createdAt: user.createdAt
                },
                token
            }
        });

    } catch (error) {
        console.error('Registration error:', error);

        // Handle validation errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: messages.join(', ')
            });
        }

        res.status(500).json({
            success: false,
            message: 'Server error during registration',
            error: error.message
        });
    }
});

/**
 * @route   POST /api/auth/login
 * @desc    Login user and return token
 * @access  Public
 */
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate required fields
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        // Find user by credentials
        const user = await User.findByCredentials(email.toLowerCase(), password);

        // Generate token
        const token = user.generateAuthToken();

        // Send response
        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    specialty: user.specialty,
                    age: user.age,
                    avatarColor: user.avatarColor,
                    isApproved: user.isApproved,
                    status: user.status,
                    qualifications: user.qualifications,
                    experience: user.experience,
                    createdAt: user.createdAt
                },
                token
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(401).json({
            success: false,
            message: error.message || 'Invalid email or password'
        });
    }
});

/**
 * @route   GET /api/auth/me
 * @desc    Get current logged-in user profile
 * @access  Private (requires token)
 */
router.get('/me', protect, async (req, res) => {
    try {
        // req.user is set by the protect middleware
        const user = await User.findById(req.user._id);

        res.status(200).json({
            success: true,
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                specialty: user.specialty,
                age: user.age,
                avatarColor: user.avatarColor,
                isApproved: user.isApproved,
                status: user.status,
                qualifications: user.qualifications,
                experience: user.experience,
                createdAt: user.createdAt
            }
        });

    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching profile'
        });
    }
});

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile', protect, async (req, res) => {
    try {
        const { name, email } = req.body;

        // Build update object
        const updateFields = {};
        if (name) updateFields.name = name;
        if (email) updateFields.email = email.toLowerCase();

        // Check if email is already taken by another user
        if (email) {
            const existingUser = await User.findOne({
                email: email.toLowerCase(),
                _id: { $ne: req.user._id }
            });
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'Email is already taken'
                });
            }
        }

        // Update user
        const user = await User.findByIdAndUpdate(
            req.user._id,
            updateFields,
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                avatarColor: user.avatarColor
            }
        });

    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating profile'
        });
    }
});

/**
 * @route   PUT /api/auth/password
 * @desc    Change user password
 * @access  Private
 */
router.put('/password', protect, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Please provide current and new password'
            });
        }

        // Get user with password
        const user = await User.findById(req.user._id).select('+password');

        // Verify current password
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Update password
        user.password = newPassword;
        await user.save();

        // Generate new token
        const token = user.generateAuthToken();

        res.status(200).json({
            success: true,
            message: 'Password changed successfully',
            data: { token }
        });

    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            message: 'Error changing password'
        });
    }
});

module.exports = router;
