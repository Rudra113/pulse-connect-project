/**
 * Medication Routes
 * API endpoints for managing medications
 */

const express = require('express');
const router = express.Router();
const Medication = require('../models/Medication');
const { protect } = require('../middleware/auth');

/**
 * @route   POST /api/medications
 * @desc    Add a new medication
 * @access  Private (requires authentication)
 */
router.post('/', protect, async (req, res) => {
    try {
        // Extract medication data from request body
        const { medicineName, totalQuantity, dailyDosage, startDate, refillThreshold, remainingStock, notes } = req.body;

        // Validate required fields
        if (!medicineName || !totalQuantity || !dailyDosage) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields: medicineName, totalQuantity, dailyDosage'
            });
        }

        // If remainingStock is provided and less than totalQuantity, use it as initial value
        const initialRemainingStock = (remainingStock !== undefined && remainingStock < totalQuantity)
            ? remainingStock
            : null;

        // Create new medication document (userId comes from authenticated user)
        const newMedication = new Medication({
            userId: req.user._id,
            medicineName,
            totalQuantity,
            dailyDosage,
            startDate: startDate || new Date(), // Default to today if not provided
            refillThreshold: refillThreshold || 5, // Default threshold
            initialRemainingStock
        });

        // Save to database
        const savedMedication = await newMedication.save();

        // Calculate remaining stock for response
        const stockInfo = savedMedication.calculateRemainingStock();

        // Send success response with medication data
        res.status(201).json({
            success: true,
            message: 'Medication added successfully',
            data: {
                ...savedMedication.toObject(),
                ...stockInfo // Append calculated stock info
            }
        });

    } catch (error) {
        console.error('Error adding medication:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while adding medication',
            error: error.message
        });
    }
});

/**
 * @route   GET /api/medications
 * @desc    Get all medications for the authenticated user with calculated remaining stock
 * @access  Private (requires authentication)
 */
router.get('/', protect, async (req, res) => {
    try {
        // Find all active medications for the authenticated user
        const medications = await Medication.find({
            userId: req.user._id,
            isActive: true
        }).sort({ createdAt: -1 }); // Sort by newest first

        // Map through medications and append calculated stock info
        const medicationsWithStock = medications.map(med => {
            // Calculate remaining stock using our model method
            const stockInfo = med.calculateRemainingStock();

            return {
                _id: med._id,
                userId: med.userId,
                medicineName: med.medicineName,
                totalQuantity: med.totalQuantity,
                dailyDosage: med.dailyDosage,
                startDate: med.startDate,
                refillThreshold: med.refillThreshold,
                isActive: med.isActive,
                createdAt: med.createdAt,
                // Appended calculated fields
                remainingStock: stockInfo.remainingStock,
                daysElapsed: stockInfo.daysElapsed,
                pillsConsumed: stockInfo.pillsConsumed,
                daysRemaining: stockInfo.daysRemaining,
                // Flag if refill is needed
                needsRefill: stockInfo.remainingStock <= med.refillThreshold
            };
        });

        res.status(200).json({
            success: true,
            count: medicationsWithStock.length,
            data: medicationsWithStock
        });

    } catch (error) {
        console.error('Error fetching medications:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching medications',
            error: error.message
        });
    }
});

/**
 * @route   DELETE /api/medications/:id
 * @desc    Delete (deactivate) a medication
 * @access  Private (requires authentication)
 */
router.delete('/:id', protect, async (req, res) => {
    try {
        const { id } = req.params;

        // Soft delete - only if medication belongs to user
        const medication = await Medication.findOneAndUpdate(
            { _id: id, userId: req.user._id },
            { isActive: false },
            { new: true }
        );

        if (!medication) {
            return res.status(404).json({
                success: false,
                message: 'Medication not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Medication deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting medication:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while deleting medication',
            error: error.message
        });
    }
});

/**
 * @route   PUT /api/medications/:id
 * @desc    Update a medication's details
 * @access  Private (requires authentication)
 */
router.put('/:id', protect, async (req, res) => {
    try {
        const { id } = req.params;
        const { medicineName, totalQuantity, dailyDosage, refillThreshold, remainingStock, notes } = req.body;

        // Find the medication
        const medication = await Medication.findOne({ _id: id, userId: req.user._id });

        if (!medication) {
            return res.status(404).json({
                success: false,
                message: 'Medication not found'
            });
        }

        // Update fields if provided
        if (medicineName) medication.medicineName = medicineName;
        if (totalQuantity) medication.totalQuantity = totalQuantity;
        if (dailyDosage) medication.dailyDosage = dailyDosage;
        if (refillThreshold) medication.refillThreshold = refillThreshold;

        // If remainingStock is provided, calculate and set initialRemainingStock
        if (remainingStock !== undefined) {
            medication.initialRemainingStock = remainingStock;
            medication.startDate = new Date(); // Reset start date when stock is manually updated
            medication.manualPillsTaken = 0; // Reset manual pills taken
        }

        await medication.save();

        // Calculate stock info
        const stockInfo = medication.calculateRemainingStock();

        res.status(200).json({
            success: true,
            message: 'Medication updated successfully',
            data: {
                ...medication.toObject(),
                ...stockInfo,
                needsRefill: stockInfo.remainingStock <= medication.refillThreshold
            }
        });

    } catch (error) {
        console.error('Error updating medication:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating medication',
            error: error.message
        });
    }
});

/**
 * @route   PUT /api/medications/:id/take-dose
 * @desc    Record taking a dose of medication
 * @access  Private (requires authentication)
 */
router.put('/:id/take-dose', protect, async (req, res) => {
    try {
        const { id } = req.params;
        const { pillCount = 1 } = req.body; // Default to 1 pill if not specified

        // Find the medication
        const medication = await Medication.findOne({ _id: id, userId: req.user._id });

        if (!medication) {
            return res.status(404).json({
                success: false,
                message: 'Medication not found'
            });
        }

        // Check if medication has started yet
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const startDate = new Date(medication.startDate);
        startDate.setHours(0, 0, 0, 0);

        if (startDate > today) {
            return res.status(400).json({
                success: false,
                message: 'Cannot take dose before medication start date'
            });
        }

        // Check current stock
        const currentStock = medication.calculateRemainingStock();
        if (currentStock.remainingStock < pillCount) {
            return res.status(400).json({
                success: false,
                message: 'Not enough pills remaining'
            });
        }

        // Update the manual pills taken count
        medication.manualPillsTaken = (medication.manualPillsTaken || 0) + pillCount;
        medication.lastDoseTakenAt = new Date();
        await medication.save();

        // Calculate new stock info
        const stockInfo = medication.calculateRemainingStock();

        res.status(200).json({
            success: true,
            message: `Took ${pillCount} pill${pillCount > 1 ? 's' : ''} successfully`,
            data: {
                ...medication.toObject(),
                ...stockInfo,
                needsRefill: stockInfo.remainingStock <= medication.refillThreshold
            }
        });

    } catch (error) {
        console.error('Error taking dose:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while recording dose',
            error: error.message
        });
    }
});

/**
 * @route   PUT /api/medications/:id/refill
 * @desc    Refill a medication (reset quantity and start date)
 * @access  Private (requires authentication)
 */
router.put('/:id/refill', protect, async (req, res) => {
    try {
        const { id } = req.params;
        const { totalQuantity } = req.body;

        // Find and update the medication (only if it belongs to user)
        const medication = await Medication.findOneAndUpdate(
            { _id: id, userId: req.user._id },
            {
                totalQuantity: totalQuantity || 30, // Default to 30 if not specified
                startDate: new Date(), // Reset start date to today
                manualPillsTaken: 0, // Reset manual pills taken on refill
                lastDoseTakenAt: null // Reset last dose taken
            },
            { new: true }
        );

        if (!medication) {
            return res.status(404).json({
                success: false,
                message: 'Medication not found'
            });
        }

        // Calculate new stock info
        const stockInfo = medication.calculateRemainingStock();

        res.status(200).json({
            success: true,
            message: 'Medication refilled successfully',
            data: {
                ...medication.toObject(),
                ...stockInfo
            }
        });

    } catch (error) {
        console.error('Error refilling medication:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while refilling medication',
            error: error.message
        });
    }
});

module.exports = router;
