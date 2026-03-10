/**
 * Email Service
 * Handles sending emails for verification and password reset
 * Uses Nodemailer with support for multiple providers
 */

const nodemailer = require('nodemailer');

/**
 * Create email transporter
 * Supports Ethereal (testing), Gmail, and custom SMTP
 */
const createTransporter = () => {
    // Check if we're using Gmail
    if (process.env.EMAIL_SERVICE === 'gmail') {
        return nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS // Use App Password for Gmail
            }
        });
    }

    // Default: Use custom SMTP (Ethereal for testing)
    return nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.ethereal.email',
        port: parseInt(process.env.EMAIL_PORT) || 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
};

/**
 * Send email verification link
 * @param {Object} user - User object with email and name
 * @param {string} verificationToken - The unhashed verification token
 * @returns {Object} - Email send result
 */
const sendVerificationEmail = async (user, verificationToken) => {
    const transporter = createTransporter();

    // Build verification URL
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email/${verificationToken}`;

    const mailOptions = {
        from: `"PulseConnect" <${process.env.EMAIL_FROM || 'noreply@pulseconnect.health'}>`,
        to: user.email,
        subject: 'Verify Your Email - PulseConnect',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Email Verification</title>
            </head>
            <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6;">
                <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
                    <!-- Header -->
                    <div style="background: linear-gradient(135deg, #14b8a6 0%, #0891b2 100%); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
                        <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">
                            ⚡ PulseConnect
                        </h1>
                        <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">
                            Your Health, Connected
                        </p>
                    </div>
                    
                    <!-- Content -->
                    <div style="background: white; padding: 40px 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                        <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">
                            Welcome, ${user.name}! 👋
                        </h2>
                        
                        <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                            Thank you for signing up for PulseConnect! To complete your registration and start 
                            managing your health, please verify your email address.
                        </p>
                        
                        <!-- Verification Button -->
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${verificationUrl}" 
                               style="display: inline-block; background: linear-gradient(135deg, #14b8a6 0%, #0891b2 100%); 
                                      color: white; text-decoration: none; padding: 16px 40px; border-radius: 12px; 
                                      font-size: 18px; font-weight: bold; box-shadow: 0 4px 14px rgba(20, 184, 166, 0.4);">
                                ✓ Verify My Email
                            </a>
                        </div>
                        
                        <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 20px 0;">
                            Or copy and paste this link into your browser:
                        </p>
                        <p style="background: #f3f4f6; padding: 12px; border-radius: 8px; word-break: break-all; 
                                  color: #0891b2; font-size: 14px; margin: 0 0 20px 0;">
                            ${verificationUrl}
                        </p>
                        
                        <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 20px;">
                            <p style="color: #9ca3af; font-size: 13px; margin: 0;">
                                ⏰ This link will expire in <strong>24 hours</strong>.
                            </p>
                            <p style="color: #9ca3af; font-size: 13px; margin: 10px 0 0 0;">
                                If you didn't create an account with PulseConnect, you can safely ignore this email.
                            </p>
                        </div>
                    </div>
                    
                    <!-- Footer -->
                    <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
                        <p style="margin: 0;">© ${new Date().getFullYear()} PulseConnect. All rights reserved.</p>
                        <p style="margin: 5px 0 0 0;">Making healthcare accessible for everyone.</p>
                    </div>
                </div>
            </body>
            </html>
        `
    };

    const result = await transporter.sendMail(mailOptions);

    // Log preview URL for Ethereal (testing)
    if (process.env.EMAIL_HOST === 'smtp.ethereal.email' || !process.env.EMAIL_HOST) {
        console.log('📧 Preview URL:', nodemailer.getTestMessageUrl(result));
    }

    return result;
};

/**
 * Send password reset email
 * @param {Object} user - User object with email and name
 * @param {string} resetToken - The unhashed reset token
 * @returns {Object} - Email send result
 */
const sendPasswordResetEmail = async (user, resetToken) => {
    const transporter = createTransporter();

    // Build reset URL
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;

    const mailOptions = {
        from: `"PulseConnect" <${process.env.EMAIL_FROM || 'noreply@pulseconnect.health'}>`,
        to: user.email,
        subject: 'Reset Your Password - PulseConnect',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Password Reset</title>
            </head>
            <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6;">
                <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
                    <!-- Header -->
                    <div style="background: linear-gradient(135deg, #14b8a6 0%, #0891b2 100%); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
                        <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">
                            ⚡ PulseConnect
                        </h1>
                        <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">
                            Your Health, Connected
                        </p>
                    </div>
                    
                    <!-- Content -->
                    <div style="background: white; padding: 40px 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                        <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">
                            Password Reset Request 🔐
                        </h2>
                        
                        <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 10px 0;">
                            Hi ${user.name},
                        </p>
                        
                        <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                            We received a request to reset your password for your PulseConnect account. 
                            Click the button below to create a new password.
                        </p>
                        
                        <!-- Reset Button -->
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${resetUrl}" 
                               style="display: inline-block; background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); 
                                      color: white; text-decoration: none; padding: 16px 40px; border-radius: 12px; 
                                      font-size: 18px; font-weight: bold; box-shadow: 0 4px 14px rgba(239, 68, 68, 0.4);">
                                🔑 Reset Password
                            </a>
                        </div>
                        
                        <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 20px 0;">
                            Or copy and paste this link into your browser:
                        </p>
                        <p style="background: #f3f4f6; padding: 12px; border-radius: 8px; word-break: break-all; 
                                  color: #dc2626; font-size: 14px; margin: 0 0 20px 0;">
                            ${resetUrl}
                        </p>
                        
                        <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 15px; margin: 20px 0;">
                            <p style="color: #991b1b; font-size: 14px; margin: 0; font-weight: 500;">
                                ⚠️ Security Notice
                            </p>
                            <p style="color: #b91c1c; font-size: 13px; margin: 8px 0 0 0;">
                                If you didn't request this password reset, please ignore this email. 
                                Your password will remain unchanged.
                            </p>
                        </div>
                        
                        <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 20px;">
                            <p style="color: #9ca3af; font-size: 13px; margin: 0;">
                                ⏰ This link will expire in <strong>1 hour</strong> for security reasons.
                            </p>
                        </div>
                    </div>
                    
                    <!-- Footer -->
                    <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
                        <p style="margin: 0;">© ${new Date().getFullYear()} PulseConnect. All rights reserved.</p>
                        <p style="margin: 5px 0 0 0;">Making healthcare accessible for everyone.</p>
                    </div>
                </div>
            </body>
            </html>
        `
    };

    const result = await transporter.sendMail(mailOptions);

    // Log preview URL for Ethereal (testing)
    if (process.env.EMAIL_HOST === 'smtp.ethereal.email' || !process.env.EMAIL_HOST) {
        console.log('📧 Preview URL:', nodemailer.getTestMessageUrl(result));
    }

    return result;
};

/**
 * Send welcome email after verification
 * @param {Object} user - User object with email and name
 * @returns {Object} - Email send result
 */
const sendWelcomeEmail = async (user) => {
    const transporter = createTransporter();

    const mailOptions = {
        from: `"PulseConnect" <${process.env.EMAIL_FROM || 'noreply@pulseconnect.health'}>`,
        to: user.email,
        subject: 'Welcome to PulseConnect! 🎉',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Welcome to PulseConnect</title>
            </head>
            <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6;">
                <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
                    <!-- Header -->
                    <div style="background: linear-gradient(135deg, #14b8a6 0%, #0891b2 100%); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
                        <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">
                            ⚡ PulseConnect
                        </h1>
                        <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">
                            Your Health, Connected
                        </p>
                    </div>
                    
                    <!-- Content -->
                    <div style="background: white; padding: 40px 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                        <div style="text-align: center; margin-bottom: 20px;">
                            <span style="font-size: 60px;">🎉</span>
                        </div>
                        
                        <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px; text-align: center;">
                            Welcome to PulseConnect, ${user.name}!
                        </h2>
                        
                        <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0; text-align: center;">
                            Your email has been verified successfully. You now have full access to all features!
                        </p>
                        
                        <!-- Features -->
                        <div style="background: #f0fdfa; border-radius: 12px; padding: 20px; margin: 20px 0;">
                            <h3 style="color: #0f766e; margin: 0 0 15px 0; font-size: 16px;">
                                Here's what you can do:
                            </h3>
                            <ul style="color: #4b5563; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
                                <li>💬 Chat with certified doctors instantly</li>
                                <li>💊 Track your medications with smart reminders</li>
                                <li>🩺 Check symptoms with AI-powered analysis</li>
                                <li>📅 Schedule and manage appointments</li>
                            </ul>
                        </div>
                        
                        <!-- CTA Button -->
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login" 
                               style="display: inline-block; background: linear-gradient(135deg, #14b8a6 0%, #0891b2 100%); 
                                      color: white; text-decoration: none; padding: 16px 40px; border-radius: 12px; 
                                      font-size: 18px; font-weight: bold; box-shadow: 0 4px 14px rgba(20, 184, 166, 0.4);">
                                Get Started →
                            </a>
                        </div>
                    </div>
                    
                    <!-- Footer -->
                    <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
                        <p style="margin: 0;">© ${new Date().getFullYear()} PulseConnect. All rights reserved.</p>
                        <p style="margin: 5px 0 0 0;">Making healthcare accessible for everyone.</p>
                    </div>
                </div>
            </body>
            </html>
        `
    };

    const result = await transporter.sendMail(mailOptions);

    // Log preview URL for Ethereal (testing)
    if (process.env.EMAIL_HOST === 'smtp.ethereal.email' || !process.env.EMAIL_HOST) {
        console.log('📧 Preview URL:', nodemailer.getTestMessageUrl(result));
    }

    return result;
};

/**
 * Send refill alert email
 * Called by the nightly cron job when a medication is running low
 * @param {Object} user - User document with name and email
 * @param {Array} medications - Array of [{medicineName, remainingStock, daysRemaining}]
 */
const sendRefillAlertEmail = async (user, medications) => {
    const transporter = createTransporter();

    const medListHtml = medications.map(med => `
        <li style="margin: 10px 0;">
            <strong>${med.medicineName}</strong>:
            <span style="color: ${med.remainingStock <= 3 ? '#e74c3c' : '#f39c12'}">
                ${med.remainingStock} pills left
            </span>
            (${med.daysRemaining} days remaining)
        </li>
    `).join('');

    const medListText = medications.map(med =>
        `- ${med.medicineName}: ${med.remainingStock} pills left (${med.daysRemaining} days remaining)`
    ).join('\n');

    const mailOptions = {
        from: `"PulseConnect Alerts" <${process.env.EMAIL_FROM || 'alerts@pulseconnect.health'}>`,
        to: user.email,
        subject: '⚠️ Medication Refill Reminder - PulseConnect',
        text: `Hello ${user.name},\n\nThe following medications are running low and need a refill:\n\n${medListText}\n\nPlease contact your pharmacy or healthcare provider.\n\nStay healthy!\n- PulseConnect Team`,
        html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
                <div style="background: linear-gradient(135deg, #14b8a6 0%, #0891b2 100%); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
                    <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">⚡ PulseConnect</h1>
                    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Your Health, Connected</p>
                </div>
                <div style="background: white; padding: 40px 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    <h2 style="color: #e74c3c; margin: 0 0 20px 0;">⚠️ Medication Refill Reminder</h2>
                    <p style="color: #4b5563;">Hello <strong>${user.name}</strong>,</p>
                    <p style="color: #4b5563;">The following medications are running low and need a refill:</p>
                    <ul style="background: #f8f9fa; padding: 20px 20px 20px 40px; border-radius: 8px;">
                        ${medListHtml}
                    </ul>
                    <p style="color: #4b5563;">Please contact your pharmacy or healthcare provider to arrange a refill.</p>
                    <p style="color: #666;">Stay healthy!<br>- PulseConnect Team</p>
                </div>
                <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
                    <p style="margin: 0;">© ${new Date().getFullYear()} PulseConnect. All rights reserved.</p>
                </div>
            </div>
        `
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`📧 Refill alert sent to ${user.email}`);
        if (process.env.EMAIL_HOST === 'smtp.ethereal.email' || !process.env.EMAIL_HOST) {
            console.log('   Preview URL:', require('nodemailer').getTestMessageUrl(info));
        }
    } catch (error) {
        console.error(`❌ Failed to send refill alert to ${user.email}:`, error.message);
    }
};

module.exports = {
    sendVerificationEmail,
    sendPasswordResetEmail,
    sendWelcomeEmail,
    sendRefillAlertEmail
};
