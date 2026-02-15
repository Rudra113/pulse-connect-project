/**
 * SymptomCheck Model
 * Defines the schema for symptom checker entries
 */

const mongoose = require('mongoose');

const symptomCheckSchema = new mongoose.Schema({
    // Reference to the patient
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Patient ID is required']
    },

    // Description of symptoms
    symptoms: {
        type: String,
        required: [true, 'Symptoms description is required'],
        trim: true,
        maxlength: [2000, 'Symptoms description cannot exceed 2000 characters']
    },

    // Parsed/identified symptoms (for analysis)
    identifiedSymptoms: [{
        name: String,
        severity: {
            type: String,
            enum: ['mild', 'moderate', 'severe']
        }
    }],

    // AI analysis result
    analysis: {
        possibleConditions: [{
            name: String,
            probability: Number, // 0-100
            description: String
        }],
        urgencyLevel: {
            type: String,
            enum: ['low', 'medium', 'high', 'emergency'],
            default: 'low'
        },
        recommendations: [String],
        disclaimer: {
            type: String,
            default: 'This is not medical advice. Please consult a healthcare professional for proper diagnosis.'
        }
    },

    // Whether this led to a doctor consultation
    ledToConsultation: {
        type: Boolean,
        default: false
    },

    // Reference to resulting appointment if any
    appointmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment'
    }
}, {
    timestamps: true
});

// Index for efficient querying
symptomCheckSchema.index({ patientId: 1, createdAt: -1 });

/**
 * Method to analyze symptoms (placeholder for AI integration)
 */
symptomCheckSchema.methods.analyzeSymptoms = async function () {
    // This is a placeholder for actual AI/ML analysis
    // In production, this would call an AI service

    const symptoms = this.symptoms.toLowerCase();
    const analysis = {
        possibleConditions: [],
        urgencyLevel: 'low',
        recommendations: [],
        disclaimer: 'This is not medical advice. Please consult a healthcare professional for proper diagnosis.'
    };

    // Simple keyword-based analysis (placeholder for actual AI)
    if (symptoms.includes('chest pain') || symptoms.includes('shortness of breath')) {
        analysis.urgencyLevel = 'high';
        analysis.recommendations.push('Seek immediate medical attention');
        analysis.possibleConditions.push({
            name: 'Cardiac-related condition',
            probability: 60,
            description: 'Chest pain with shortness of breath may indicate a heart-related issue'
        });
    }

    if (symptoms.includes('fever') || symptoms.includes('headache')) {
        analysis.possibleConditions.push({
            name: 'Viral infection',
            probability: 70,
            description: 'Common symptoms of viral infections'
        });
        analysis.recommendations.push('Rest and stay hydrated');
        analysis.recommendations.push('Monitor temperature');
    }

    if (symptoms.includes('cough')) {
        analysis.possibleConditions.push({
            name: 'Upper respiratory infection',
            probability: 65,
            description: 'May indicate a common cold or other respiratory condition'
        });
    }

    // Default recommendation
    if (analysis.recommendations.length === 0) {
        analysis.recommendations.push('Monitor your symptoms');
        analysis.recommendations.push('Consider scheduling a consultation if symptoms persist');
    }

    this.analysis = analysis;
    await this.save();

    return analysis;
};

const SymptomCheck = mongoose.model('SymptomCheck', symptomCheckSchema);

module.exports = SymptomCheck;
