/**
 * Appointment Model
 * Defines the schema for appointments between patients and doctors
 */

const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    // Reference to the patient
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Patient ID is required']
    },

    // Reference to the doctor
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Doctor ID is required']
    },

    // Appointment date and time
    scheduledAt: {
        type: Date,
        required: [true, 'Scheduled date is required']
    },

    // Duration in minutes
    duration: {
        type: Number,
        default: 30,
        min: [15, 'Minimum appointment duration is 15 minutes']
    },

    // Type of appointment
    type: {
        type: String,
        enum: ['video', 'in-person', 'phone'],
        default: 'video'
    },

    // Appointment status
    status: {
        type: String,
        enum: ['scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'],
        default: 'scheduled'
    },

    // Reason for the appointment
    reason: {
        type: String,
        trim: true,
        maxlength: [500, 'Reason cannot exceed 500 characters']
    },

    // Notes from the doctor after the appointment
    doctorNotes: {
        type: String,
        trim: true
    },

    // Video call link (for video appointments)
    meetingLink: {
        type: String,
        trim: true
    },

    // Cancellation reason if cancelled
    cancellationReason: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

// Index for efficient querying
appointmentSchema.index({ patientId: 1, scheduledAt: -1 });
appointmentSchema.index({ doctorId: 1, scheduledAt: -1 });
appointmentSchema.index({ status: 1 });

/**
 * Static method to get upcoming appointments for a user
 */
appointmentSchema.statics.getUpcoming = async function (userId, role) {
    const now = new Date();
    const query = role === 'doctor'
        ? { doctorId: userId, scheduledAt: { $gte: now }, status: { $nin: ['cancelled', 'completed'] } }
        : { patientId: userId, scheduledAt: { $gte: now }, status: { $nin: ['cancelled', 'completed'] } };

    return this.find(query)
        .populate('patientId', 'name email avatarColor')
        .populate('doctorId', 'name email specialty avatarColor')
        .sort({ scheduledAt: 1 });
};

const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment;
