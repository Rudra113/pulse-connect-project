/**
 * Cron Job for Refill Reminders
 * Runs every night to check medications and send email alerts for those needing a refill.
 * Uses emailService.js for sending emails (no duplicate transporter setup).
 */

const cron = require('node-cron');
const Medication = require('../models/Medication');
const User = require('../models/User');
const { sendRefillAlertEmail } = require('../services/emailService');

/**
 * Main function to check all medications and send alerts
 */
const checkMedicationsAndAlert = async () => {
    console.log('\n🕐 Running nightly medication check...');
    console.log(`   Time: ${new Date().toLocaleString()}`);

    try {
        // Get all active medications
        const allMedications = await Medication.find({ isActive: true });

        // Group medications by user and check which need alerts
        const userAlerts = new Map(); // userId -> [medications needing refill]

        for (const med of allMedications) {
            const stockInfo = med.calculateRemainingStock();

            if (stockInfo.remainingStock <= med.refillThreshold) {
                const userId = med.userId.toString();

                if (!userAlerts.has(userId)) {
                    userAlerts.set(userId, []);
                }

                userAlerts.get(userId).push({
                    medicineName: med.medicineName,
                    remainingStock: stockInfo.remainingStock,
                    daysRemaining: stockInfo.daysRemaining,
                    refillThreshold: med.refillThreshold
                });
            }
        }

        // Send alerts for each user
        let alertsSent = 0;
        for (const [userId, medications] of userAlerts) {
            const user = await User.findById(userId);
            if (user) {
                await sendRefillAlertEmail(user, medications);
                alertsSent++;
            }
        }

        console.log(`✅ Medication check complete!`);
        console.log(`   Total medications checked: ${allMedications.length}`);
        console.log(`   Alerts sent: ${alertsSent}`);

    } catch (error) {
        console.error('❌ Error in medication check cron job:', error);
    }
};

/**
 * Initialize the cron job
 * Schedule: Every day at midnight (00:00)
 * Timezone is configurable via CRON_TIMEZONE env variable (default: UTC)
 */
const initCronJob = () => {
    const timezone = process.env.CRON_TIMEZONE || 'UTC';

    cron.schedule('0 0 * * *', () => {
        checkMedicationsAndAlert();
    }, {
        scheduled: true,
        timezone
    });

    console.log(`⏰ Cron job scheduled: Nightly medication check at midnight (${timezone})`);
};

module.exports = {
    initCronJob,
    checkMedicationsAndAlert
};
