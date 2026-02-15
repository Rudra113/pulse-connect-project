/**
 * Symptom Check Routes
 * API endpoints for the symptom checker feature
 */

const express = require('express');
const router = express.Router();
const SymptomCheck = require('../models/SymptomCheck');
const { protect } = require('../middleware/auth');

/**
 * @route   POST /api/symptoms/check
 * @desc    Submit symptoms for analysis
 * @access  Private
 */
router.post('/check', protect, async (req, res) => {
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
