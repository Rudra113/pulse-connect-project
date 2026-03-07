/**
 * Authentication Routes
 * Handles user registration, login, and profile
 */

const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { sendVerificationEmail, sendPasswordResetEmail, sendWelcomeEmail } = require('../services/emailService');

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user and send verification email
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

        // Generate email verification token
        const verificationToken = user.generateEmailVerificationToken();
        await user.save({ validateBeforeSave: false });

        // Send verification email
        try {
            await sendVerificationEmail(user, verificationToken);
            console.log(`📧 Verification email sent to ${user.email}`);
        } catch (emailError) {
            console.error('Error sending verification email:', emailError);
            // Don't fail registration if email fails, user can resend later
        }

        // Generate auth token
        const token = user.generateAuthToken();

        // Send response (exclude password)
        res.status(201).json({
            success: true,
            message: user.role === 'doctor'
                ? 'Registration successful. Please verify your email. Your account is also pending admin approval.'
                : 'Registration successful. Please check your email to verify your account.',
            requiresEmailVerification: true,
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
                    isEmailVerified: user.isEmailVerified,
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

        // Update online status
        user.isOnline = true;
        user.lastSeen = new Date();
        await user.save({ validateBeforeSave: false });

        // Generate token
        const token = user.generateAuthToken();

        // Send response
        res.status(200).json({
            success: true,
            message: user.isEmailVerified ? 'Login successful' : 'Login successful. Please verify your email for full access.',
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
                    isEmailVerified: user.isEmailVerified,
                    status: user.status,
                    qualifications: user.qualifications,
                    experience: user.experience,
                    createdAt: user.createdAt,
                    isOnline: user.isOnline,
                    lastSeen: user.lastSeen
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
 * @route   POST /api/auth/logout
 * @desc    Logout user and set offline status
 * @access  Private (requires token)
 */
router.post('/logout', protect, async (req, res) => {
    try {
        // Update user's online status
        await User.findByIdAndUpdate(req.user._id, {
            isOnline: false,
            lastSeen: new Date()
        });

        res.status(200).json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Error logging out'
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
        // Also update online status when checking profile (heartbeat)
        const user = await User.findByIdAndUpdate(
            req.user._id,
            { isOnline: true, lastSeen: new Date() },
            { new: true }
        );

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
                createdAt: user.createdAt,
                isOnline: user.isOnline,
                lastSeen: user.lastSeen
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

/**
 * @route   GET /api/auth/verify-email/:token
 * @desc    Verify user's email address
 * @access  Public
 */
router.get('/verify-email/:token', async (req, res) => {
    try {
        // Hash the token from URL to compare with stored hash
        const hashedToken = crypto
            .createHash('sha256')
            .update(req.params.token)
            .digest('hex');

        // Find user with matching token that hasn't expired
        const user = await User.findOne({
            emailVerificationToken: hashedToken,
            emailVerificationExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired verification token. Please request a new verification email.'
            });
        }

        // Mark email as verified and clear token
        user.isEmailVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationExpires = undefined;
        await user.save({ validateBeforeSave: false });

        // Send welcome email
        try {
            await sendWelcomeEmail(user);
        } catch (emailError) {
            console.error('Error sending welcome email:', emailError);
        }

        res.status(200).json({
            success: true,
            message: 'Email verified successfully! You can now log in.'
        });

    } catch (error) {
        console.error('Email verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Error verifying email'
        });
    }
});

/**
 * @route   POST /api/auth/resend-verification
 * @desc    Resend email verification link
 * @access  Public
 */
router.post('/resend-verification', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Please provide your email address'
            });
        }

        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            // Don't reveal if user exists
            return res.status(200).json({
                success: true,
                message: 'If an account with that email exists, a verification link has been sent.'
            });
        }

        if (user.isEmailVerified) {
            return res.status(400).json({
                success: false,
                message: 'This email is already verified. You can log in.'
            });
        }

        // Generate new verification token
        const verificationToken = user.generateEmailVerificationToken();
        await user.save({ validateBeforeSave: false });

        // Send verification email
        await sendVerificationEmail(user, verificationToken);

        res.status(200).json({
            success: true,
            message: 'Verification email sent. Please check your inbox.'
        });

    } catch (error) {
        console.error('Resend verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Error sending verification email'
        });
    }
});

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Send password reset email
 * @access  Public
 */
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Please provide your email address'
            });
        }

        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            // Don't reveal if user exists - security best practice
            return res.status(200).json({
                success: true,
                message: 'If an account with that email exists, a password reset link has been sent.'
            });
        }

        // Generate password reset token
        const resetToken = user.generatePasswordResetToken();
        await user.save({ validateBeforeSave: false });

        // Send password reset email
        try {
            await sendPasswordResetEmail(user, resetToken);
            console.log(`📧 Password reset email sent to ${user.email}`);

            res.status(200).json({
                success: true,
                message: 'Password reset link sent to your email. Please check your inbox.'
            });
        } catch (emailError) {
            // If email fails, clear the reset token
            user.passwordResetToken = undefined;
            user.passwordResetExpires = undefined;
            await user.save({ validateBeforeSave: false });

            console.error('Error sending password reset email:', emailError);
            return res.status(500).json({
                success: false,
                message: 'Error sending password reset email. Please try again later.'
            });
        }

    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({
            success: false,
            message: 'Error processing password reset request'
        });
    }
});

/**
 * @route   POST /api/auth/reset-password/:token
 * @desc    Reset password using token
 * @access  Public
 */
router.post('/reset-password/:token', async (req, res) => {
    try {
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a new password'
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters'
            });
        }

        // Hash the token from URL to compare with stored hash
        const hashedToken = crypto
            .createHash('sha256')
            .update(req.params.token)
            .digest('hex');

        // Find user with matching token that hasn't expired
        const user = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired reset token. Please request a new password reset.'
            });
        }

        // Update password and clear reset token
        user.password = password;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();

        // Generate new auth token
        const token = user.generateAuthToken();

        res.status(200).json({
            success: true,
            message: 'Password reset successful! You can now log in with your new password.',
            data: { token }
        });

    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({
            success: false,
            message: 'Error resetting password'
        });
    }
});

/**
 * @route   GET /api/auth/verify-reset-token/:token
 * @desc    Verify if reset token is still valid
 * @access  Public
 */
router.get('/verify-reset-token/:token', async (req, res) => {
    try {
        // Hash the token from URL to compare with stored hash
        const hashedToken = crypto
            .createHash('sha256')
            .update(req.params.token)
            .digest('hex');

        // Find user with matching token that hasn't expired
        const user = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired reset token'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Token is valid',
            data: { email: user.email }
        });

    } catch (error) {
        console.error('Verify reset token error:', error);
        res.status(500).json({
            success: false,
            message: 'Error verifying reset token'
        });
    }
});

module.exports = router;
