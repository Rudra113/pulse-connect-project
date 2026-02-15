/**
 * Prescription Model
 * Defines the schema for prescriptions issued by doctors
 */

const mongoose = require('mongoose');

const prescriptionItemSchema = new mongoose.Schema({
    // Medication name
    medication: {
        type: String,
        required: [true, 'Medication name is required'],
        trim: true
    },

    // Dosage (e.g., "500mg")
    dosage: {
        type: String,
        required: [true, 'Dosage is required'],
        trim: true
    },

    // Frequency (e.g., "2x daily", "every 8 hours")
    frequency: {
        type: String,
        required: [true, 'Frequency is required'],
        trim: true
    },

    // Duration (e.g., "7 days", "1 month")
    duration: {
        type: String,
        required: [true, 'Duration is required'],
        trim: true
    },

    // Special instructions
    instructions: {
        type: String,
        trim: true
    }
}, { _id: true });

const prescriptionSchema = new mongoose.Schema({
    // Reference to the patient
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Patient ID is required']
    },

    // Reference to the prescribing doctor
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Doctor ID is required']
    },

    // Reference to the related appointment (optional)
    appointmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment'
    },

    // List of prescribed medications
    items: [prescriptionItemSchema],

    // Diagnosis or reason for prescription
    diagnosis: {
        type: String,
        trim: true
    },

    // Additional notes from the doctor
    notes: {
        type: String,
        trim: true
    },

    // Status of the prescription
    status: {
        type: String,
        enum: ['active', 'completed', 'cancelled'],
        default: 'active'
    },

    // When the prescription was issued
    issuedAt: {
        type: Date,
        default: Date.now
    },

    // Prescription validity period
    validUntil: {
        type: Date
    }
}, {
    timestamps: true
});

// Index for efficient querying
prescriptionSchema.index({ patientId: 1, createdAt: -1 });
prescriptionSchema.index({ doctorId: 1, createdAt: -1 });

const Prescription = mongoose.model('Prescription', prescriptionSchema);

module.exports = Prescription;
