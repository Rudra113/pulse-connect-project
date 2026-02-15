/**
 * User Model
 * Defines the schema for user accounts in the medication tracker
 * Includes password hashing and JWT token generation
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Define the User Schema
const userSchema = new mongoose.Schema({
    // User's full name
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        minlength: [2, 'Name must be at least 2 characters']
    },

    // User's email address (must be unique)
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        // Basic email validation regex
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
    },

    // Password (will be hashed before saving)
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters'],
        select: false // Don't include password in queries by default
    },

    // User's avatar/profile color (for UI personalization)
    avatarColor: {
        type: String,
        default: function () {
            const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4'];
            return colors[Math.floor(Math.random() * colors.length)];
        }
    },

    // User role (patient, doctor, or admin)
    role: {
        type: String,
        enum: ['patient', 'doctor', 'admin'],
        default: 'patient'
    },

    // For doctors: specialty information
    specialty: {
        type: String,
        trim: true,
        default: null
    },

    // For patients: additional health info
    age: {
        type: Number,
        min: [0, 'Age cannot be negative'],
        default: null
    },

    // Phone number for notifications
    phone: {
        type: String,
        trim: true,
        default: null
    },

    // Doctor approval status (for doctors only)
    isApproved: {
        type: Boolean,
        default: function () {
            // Patients and admins are auto-approved, doctors need approval
            return this.role !== 'doctor';
        }
    },

    // Account status
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'suspended'],
        default: function () {
            return this.role === 'doctor' ? 'pending' : 'approved';
        }
    },

    // For doctors: qualifications/license info
    qualifications: {
        type: String,
        trim: true,
        default: null
    },

    // For doctors: years of experience
    experience: {
        type: Number,
        min: 0,
        default: null
    },

    // For doctors: medical license number
    licenseNumber: {
        type: String,
        trim: true,
        default: null
    },

    // Admin who approved/rejected (for doctors)
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },

    // Date when approved/rejected
    approvalDate: {
        type: Date,
        default: null
    },

    // Rejection reason (if rejected)
    rejectionReason: {
        type: String,
        default: null
    }
}, {
    // Automatically add createdAt and updatedAt timestamps
    timestamps: true
});

/**
 * Pre-save middleware to hash password before saving
 * Only runs if password field is modified
 */
userSchema.pre('save', async function (next) {
    // Skip if password is not modified
    if (!this.isModified('password')) {
        return next();
    }

    try {
        // Generate salt and hash password
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

/**
 * Method to compare entered password with hashed password
 * @param {string} enteredPassword - The password to verify
 * @returns {boolean} - True if passwords match
 */
userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

/**
 * Method to generate JWT token for authentication
 * @returns {string} - JWT token
 */
userSchema.methods.generateAuthToken = function () {
    return jwt.sign(
        {
            id: this._id,
            email: this.email,
            role: this.role,
            isApproved: this.isApproved,
            status: this.status
        },
        process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );
};

/**
 * Static method to find user by email and verify password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Object} - User object if credentials are valid
 */
userSchema.statics.findByCredentials = async function (email, password) {
    // Find user by email and include password field
    const user = await this.findOne({ email }).select('+password');

    if (!user) {
        throw new Error('Invalid email or password');
    }

    // Compare passwords
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
        throw new Error('Invalid email or password');
    }

    return user;
};

// Create and export the User model
const User = mongoose.model('User', userSchema);

module.exports = User;
