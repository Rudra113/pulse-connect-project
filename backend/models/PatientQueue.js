/**
 * PatientQueue Model
 * Defines the schema for the patient waiting queue for doctors
 */

const mongoose = require('mongoose');

const patientQueueSchema = new mongoose.Schema({
    // Reference to the patient
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Patient ID is required']
    },

    // Reference to the doctor they're waiting for
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Doctor ID is required']
    },

    // Condition/reason for visit
    condition: {
        type: String,
        trim: true,
        required: [true, 'Condition is required']
    },

    // Detailed symptoms description
    symptoms: {
        type: String,
        trim: true
    },

    // Duration of symptoms
    symptomDuration: {
        type: String,
        trim: true
    },

    // Consultation type
    consultationType: {
        type: String,
        enum: ['general', 'follow-up', 'emergency', 'specialist'],
        default: 'general'
    },

    // Preferred consultation mode
    consultationMode: {
        type: String,
        enum: ['video', 'chat', 'in-person'],
        default: 'video'
    },

    // Urgency level
    urgency: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium'
    },

    // Status in the queue
    status: {
        type: String,
        enum: ['waiting', 'in-consultation', 'completed', 'cancelled'],
        default: 'waiting'
    },

    // When the patient joined the queue
    joinedAt: {
        type: Date,
        default: Date.now
    },

    // When consultation started
    consultationStartedAt: {
        type: Date
    },

    // When consultation ended
    consultationEndedAt: {
        type: Date
    },

    // Notes from the consultation
    notes: {
        type: String,
        trim: true
    },

    // Position in queue (calculated virtually)
    queuePosition: {
        type: Number
    }
}, {
    timestamps: true
});

// Index for efficient querying
patientQueueSchema.index({ doctorId: 1, status: 1, joinedAt: 1 });
patientQueueSchema.index({ patientId: 1 });

/**
 * Static method to get the current queue for a doctor
 */
patientQueueSchema.statics.getQueue = async function (doctorId) {
    const queue = await this.find({
        doctorId,
        status: 'waiting'
    })
        .populate('patientId', 'name email age avatarColor')
        .sort({ urgency: -1, joinedAt: 1 }); // High urgency first, then by wait time

    // Add wait time and position to each entry
    return queue.map((entry, index) => {
        const waitTime = Math.floor((Date.now() - entry.joinedAt.getTime()) / 60000); // in minutes
        return {
            ...entry.toObject(),
            queuePosition: index + 1,
            waitTime: `${waitTime} min`
        };
    });
};

/**
 * Static method to add patient to queue
 */
patientQueueSchema.statics.addToQueue = async function (patientId, doctorId, condition, urgency = 'medium') {
    // Check if patient is already in queue
    const existing = await this.findOne({
        patientId,
        doctorId,
        status: 'waiting'
    });

    if (existing) {
        throw new Error('Patient is already in the queue');
    }

    return this.create({
        patientId,
        doctorId,
        condition,
        urgency
    });
};

const PatientQueue = mongoose.model('PatientQueue', patientQueueSchema);

module.exports = PatientQueue;
