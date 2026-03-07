/**
 * Medication Model
 * Defines the schema for medications that users want to track
 */

const mongoose = require('mongoose');

// Define the Medication Schema
const medicationSchema = new mongoose.Schema({
    // Reference to the user who owns this medication
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required']
    },

    // Name of the medication (e.g., "Aspirin", "Vitamin D")
    medicineName: {
        type: String,
        required: [true, 'Medicine name is required'],
        trim: true
    },

    // Total quantity of pills in the bottle/pack
    totalQuantity: {
        type: Number,
        required: [true, 'Total quantity is required'],
        min: [1, 'Total quantity must be at least 1']
    },

    // How many pills the user takes per day
    dailyDosage: {
        type: Number,
        required: [true, 'Daily dosage is required'],
        min: [1, 'Daily dosage must be at least 1']
    },

    // When the user started taking this medication
    startDate: {
        type: Date,
        required: [true, 'Start date is required'],
        default: Date.now
    },

    // Threshold for refill reminder (default: 5 pills remaining)
    refillThreshold: {
        type: Number,
        default: 5,
        min: [1, 'Threshold must be at least 1']
    },

    // Initial remaining stock (when user adds medication that's already partially used)
    initialRemainingStock: {
        type: Number,
        default: null, // null means use totalQuantity as starting point
        min: [0, 'Initial remaining stock cannot be negative']
    },

    // Whether this medication is currently active
    isActive: {
        type: Boolean,
        default: true
    },

    // Track manually taken pills (user clicks "Take Dose" button)
    manualPillsTaken: {
        type: Number,
        default: 0,
        min: [0, 'Manual pills taken cannot be negative']
    },

    // Last date when dose was taken (to prevent multiple doses per day)
    lastDoseTakenAt: {
        type: Date,
        default: null
    },

    // Additional notes (e.g., prescription details)
    notes: {
        type: String,
        trim: true,
        default: ''
    }
}, {
    // Automatically add createdAt and updatedAt timestamps
    timestamps: true
});

/**
 * Virtual property to calculate remaining stock
 * Formula: Remaining = Total - (DailyDosage × DaysElapsed)
 * Note: Virtuals are not included in JSON by default, we handle this in routes
 */
medicationSchema.methods.calculateRemainingStock = function () {
    // Get today's date (reset to midnight for accurate day calculation)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get the start date (reset to midnight)
    const startDate = new Date(this.startDate);
    startDate.setHours(0, 0, 0, 0);

    // Calculate the number of days elapsed since start
    const timeDifference = today.getTime() - startDate.getTime();
    let daysElapsed = Math.floor(timeDifference / (1000 * 60 * 60 * 24));

    // If start date is in the future, no pills have been consumed yet
    if (daysElapsed < 0) {
        daysElapsed = 0;
    }

    // Calculate pills consumed (only if medication has started)
    // Now includes manual pills taken by user
    const pillsConsumed = (this.dailyDosage * daysElapsed) + (this.manualPillsTaken || 0);

    // Use initial remaining stock if provided, otherwise use total quantity
    const startingStock = this.initialRemainingStock !== null ? this.initialRemainingStock : this.totalQuantity;

    // Calculate remaining stock (minimum 0)
    const remainingStock = Math.max(0, startingStock - pillsConsumed);

    // Calculate how many days of pills are left
    const daysRemaining = Math.floor(remainingStock / this.dailyDosage);

    return {
        daysElapsed,
        pillsConsumed,
        remainingStock,
        daysRemaining
    };
};

// Create and export the Medication model
const Medication = mongoose.model('Medication', medicationSchema);

module.exports = Medication;
