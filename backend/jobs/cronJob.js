/**
 * Cron Job for Refill Reminders
 * This job runs every night at midnight to check medications
 * and send email alerts for those needing a refill
 */

const cron = require('node-cron');
const nodemailer = require('nodemailer');
const Medication = require('../models/Medication');
const User = require('../models/User');

/**
 * Configure the email transporter
 * Using Ethereal.email for testing (fake SMTP service)
 * In production, replace with real SMTP credentials
 */
const createTransporter = async () => {
    // For development: Create a test account with Ethereal
    // In production: Use real SMTP credentials from .env

    // Check if we have Ethereal credentials
    if (process.env.EMAIL_USER && process.env.EMAIL_USER !== 'your_ethereal_username') {
        return nodemailer.createTransport({
            host: process.env.EMAIL_HOST || 'smtp.ethereal.email',
            port: process.env.EMAIL_PORT || 587,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    }

    // If no credentials, return null (we'll use console.log instead)
    return null;
};

/**
 * Send refill reminder email (or log to console)
 * @param {Object} user - User document
 * @param {Array} medications - Array of medications needing refill
 */
const sendRefillAlert = async (user, medications) => {
    const transporter = await createTransporter();

    // Build the medication list for the email
    const medList = medications.map(med =>
        `- ${med.medicineName}: ${med.remainingStock} pills left (${med.daysRemaining} days remaining)`
    ).join('\n');

    const emailContent = {
        from: '"MedTracker Alert" <alerts@medtracker.com>',
        to: user.email,
        subject: '⚠️ Medication Refill Reminder',
        text: `
Hello ${user.name},

This is a friendly reminder that the following medications are running low and need a refill:

${medList}

Please contact your pharmacy or healthcare provider to arrange a refill.

Stay healthy!
- MedTracker Team
        `,
        html: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #e74c3c;">⚠️ Medication Refill Reminder</h2>
    <p>Hello <strong>${user.name}</strong>,</p>
    <p>This is a friendly reminder that the following medications are running low:</p>
    <ul style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
        ${medications.map(med => `
            <li style="margin: 10px 0;">
                <strong>${med.medicineName}</strong>: 
                <span style="color: ${med.remainingStock <= 3 ? '#e74c3c' : '#f39c12'}">
                    ${med.remainingStock} pills left
                </span>
                (${med.daysRemaining} days remaining)
            </li>
        `).join('')}
    </ul>
    <p>Please contact your pharmacy or healthcare provider to arrange a refill.</p>
    <p style="color: #666;">Stay healthy!<br>- MedTracker Team</p>
</div>
        `
    };

    if (transporter) {
        // Send actual email via Ethereal
        try {
            const info = await transporter.sendMail(emailContent);
            console.log(`📧 Email sent to ${user.email}`);
            console.log(`   Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
        } catch (error) {
            console.error(`❌ Failed to send email to ${user.email}:`, error.message);
        }
    } else {
        // Mock email - just log to console
        console.log('\n' + '='.repeat(60));
        console.log('📧 MOCK EMAIL ALERT (No SMTP configured)');
        console.log('='.repeat(60));
        console.log(`To: ${user.email}`);
        console.log(`Subject: ${emailContent.subject}`);
        console.log('-'.repeat(60));
        console.log(emailContent.text);
        console.log('='.repeat(60) + '\n');
    }
};

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
            // Calculate remaining stock
            const stockInfo = med.calculateRemainingStock();

            // Check if medication needs refill
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
            // Get user details
            const user = await User.findById(userId);

            if (user) {
                await sendRefillAlert(user, medications);
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
 * Schedule: Runs every day at midnight (00:00)
 * Cron expression: '0 0 * * *'
 *   - First 0: At minute 0
 *   - Second 0: At hour 0 (midnight)
 *   - First *: Every day of month
 *   - Second *: Every month
 *   - Third *: Every day of week
 */
const initCronJob = () => {
    // Schedule the nightly check at midnight
    cron.schedule('0 0 * * *', () => {
        checkMedicationsAndAlert();
    }, {
        scheduled: true,
        timezone: "America/New_York" // Adjust timezone as needed
    });

    console.log('⏰ Cron job scheduled: Nightly medication check at midnight');

    // For testing: Also run every minute (comment out in production)
    // cron.schedule('* * * * *', () => {
    //     checkMedicationsAndAlert();
    // });
};

// Export functions for use in server.js
module.exports = {
    initCronJob,
    checkMedicationsAndAlert // Export for manual testing
};
