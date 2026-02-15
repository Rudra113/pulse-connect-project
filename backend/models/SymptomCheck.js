/**
 * SymptomCheck Model
 * Defines the schema for symptom checker entries
 */

const mongoose = require('mongoose');
const { analyzeSymptoms: geminiAnalyze } = require('../services/geminiService');

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
        urgencyMessage: {
            type: String,
            default: ''
        },
        recommendations: [String],
        shouldConsultDoctor: {
            type: Boolean,
            default: true
        },
        consultationMessage: {
            type: String,
            default: 'Please consider consulting a healthcare professional for proper diagnosis and treatment.'
        },
        disclaimer: {
            type: String,
            default: 'This AI-powered analysis is for informational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment.'
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
 * Method to analyze symptoms using Gemini AI
 */
symptomCheckSchema.methods.analyzeSymptoms = async function () {
    try {
        // Use Gemini AI for symptom analysis
        const analysis = await geminiAnalyze(this.symptoms);

        this.analysis = analysis;
        await this.save();

        return analysis;
    } catch (error) {
        console.error('Error in AI symptom analysis:', error);

        // Fallback to basic analysis if AI fails
        const fallbackAnalysis = {
            possibleConditions: [{
                name: 'General health concern',
                probability: 50,
                description: 'Your symptoms require evaluation by a healthcare professional.'
            }],
            urgencyLevel: 'medium',
            urgencyMessage: '🟠 We recommend consulting with a doctor for a proper evaluation of your symptoms.',
            recommendations: [
                'Monitor your symptoms closely',
                'Rest and stay hydrated',
                'Schedule a consultation with a healthcare provider'
            ],
            shouldConsultDoctor: true,
            consultationMessage: 'Please consult a healthcare professional for proper diagnosis and treatment.',
            disclaimer: 'This analysis is for informational purposes only and is not a substitute for professional medical advice.'
        };

        this.analysis = fallbackAnalysis;
        await this.save();

        return fallbackAnalysis;
    }
};

const SymptomCheck = mongoose.model('SymptomCheck', symptomCheckSchema);

module.exports = SymptomCheck;
