/**
 * Symptom Check Routes
 * API endpoints for the symptom checker feature
 */

const express = require('express');
const router = express.Router();
const SymptomCheck = require('../models/SymptomCheck');
const { protect } = require('../middleware/auth');
const { analyzeSymptoms: geminiAnalyze } = require('../services/geminiService');
const rateLimit = require('express-rate-limit');

// Rate limiting for public symptom analysis (3 requests per 15 minutes per IP)
const publicAnalyzeLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 3,
    message: {
        success: false,
        message: 'Too many analysis requests from this IP. Please try again after 15 minutes to prevent system abuse.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Rate limiting for logged-in users (5 requests per 15 minutes per IP)
const privateAnalyzeLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    message: {
        success: false,
        message: 'You have reached the limit for symptom checks. Please try again after 15 minutes.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * @route   POST /api/symptoms/analyze-public
 * @desc    Public symptom analysis (no login required) - uses Gemini AI
 * @access  Public
 */
router.post('/analyze-public', publicAnalyzeLimiter, async (req, res) => {
    try {
        const { symptoms } = req.body;

        if (!symptoms || symptoms.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a description of your symptoms'
            });
        }

        // Use Gemini AI for analysis (doesn't save to database)
        const analysis = await geminiAnalyze(symptoms);

        console.log('Symptom analysis result:', JSON.stringify(analysis, null, 2));

        res.status(200).json({
            success: true,
            message: 'Symptoms analyzed successfully',
            data: {
                symptoms,
                analysis
            }
        });
    } catch (error) {
        console.error('Error in public symptom analysis:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while analyzing symptoms',
            error: error.message
        });
    }
});

/**
 * @route   POST /api/symptoms/check
 * @desc    Submit symptoms for analysis
 * @access  Private
 */
router.post('/check', protect, privateAnalyzeLimiter, async (req, res) => {
    try {
        const { symptoms } = req.body;

        if (!symptoms || symptoms.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a description of your symptoms'
            });
        }

        // Create symptom check entry
        const symptomCheck = new SymptomCheck({
            patientId: req.user._id,
            symptoms
        });

        // Analyze symptoms (using the model's method)
        const analysis = await symptomCheck.analyzeSymptoms();

        res.status(201).json({
            success: true,
            message: 'Symptoms analyzed successfully',
            data: {
                _id: symptomCheck._id,
                symptoms: symptomCheck.symptoms,
                analysis,
                createdAt: symptomCheck.createdAt
            }
        });
    } catch (error) {
        console.error('Error analyzing symptoms:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while analyzing symptoms',
            error: error.message
        });
    }
});

/**
 * @route   GET /api/symptoms/history
 * @desc    Get symptom check history for the authenticated user
 * @access  Private
 */
router.get('/history', protect, async (req, res) => {
    try {
        const { limit = 10 } = req.query;

        const history = await SymptomCheck.find({ patientId: req.user._id })
            .sort({ createdAt: -1 })
            .limit(parseInt(limit));

        res.status(200).json({
            success: true,
            count: history.length,
            data: history
        });
    } catch (error) {
        console.error('Error fetching symptom history:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching symptom history',
            error: error.message
        });
    }
});

/**
 * @route   GET /api/symptoms/:id
 * @desc    Get a specific symptom check by ID
 * @access  Private
 */
router.get('/:id', protect, async (req, res) => {
    try {
        const symptomCheck = await SymptomCheck.findOne({
            _id: req.params.id,
            patientId: req.user._id
        });

        if (!symptomCheck) {
            return res.status(404).json({
                success: false,
                message: 'Symptom check not found'
            });
        }

        res.status(200).json({
            success: true,
            data: symptomCheck
        });
    } catch (error) {
        console.error('Error fetching symptom check:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching symptom check',
            error: error.message
        });
    }
});

/**
 * @route   PUT /api/symptoms/:id/schedule
 * @desc    Mark that a symptom check led to scheduling a consultation
 * @access  Private
 */
router.put('/:id/schedule', protect, async (req, res) => {
    try {
        const { appointmentId } = req.body;

        const symptomCheck = await SymptomCheck.findOneAndUpdate(
            { _id: req.params.id, patientId: req.user._id },
            {
                ledToConsultation: true,
                appointmentId
            },
            { new: true }
        );

        if (!symptomCheck) {
            return res.status(404).json({
                success: false,
                message: 'Symptom check not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Symptom check updated',
            data: symptomCheck
        });
    } catch (error) {
        console.error('Error updating symptom check:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating symptom check',
            error: error.message
        });
    }
});

module.exports = router;
