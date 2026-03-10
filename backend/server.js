/**
 * Server Entry Point
 * Main file for the Medication Tracker Backend
 */

// Load environment variables from .env file
require('dotenv').config();

// ===========================================
// STARTUP ENVIRONMENT VALIDATION
// Fail fast if critical environment variables are missing
// ===========================================
const REQUIRED_ENV_VARS = ['MONGODB_URI', 'JWT_SECRET'];
const missingVars = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);
if (missingVars.length > 0) {
    console.error('❌ FATAL: Missing required environment variables:', missingVars.join(', '));
    console.error('   Please check your .env file. See .env.example for reference.');
    process.exit(1);
}

// Import required modules
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const medicationRoutes = require('./routes/medicationRoutes');
const authRoutes = require('./routes/authRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const chatRoutes = require('./routes/chatRoutes');
const queueRoutes = require('./routes/queueRoutes');
const prescriptionRoutes = require('./routes/prescriptionRoutes');
const symptomRoutes = require('./routes/symptomRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const { protect, authorize } = require('./middleware/auth');
const { initCronJob, checkMedicationsAndAlert } = require('./jobs/cronJob');

// Initialize Express app
const app = express();

// ===========================================
// MIDDLEWARE CONFIGURATION
// ===========================================

// Enable CORS for cross-origin requests
const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:3000', 'http://localhost:3001'];

app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));

// Parse JSON request bodies
app.use(express.json());

// Parse URL-encoded request bodies
app.use(express.urlencoded({ extended: true }));

// ===========================================
// RATE LIMITING
// Protect auth endpoints from brute-force attacks
// ===========================================
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20,                    // max 20 requests per window per IP
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many requests from this IP. Please try again after 15 minutes.'
    }
});

// ===========================================
// DATABASE CONNECTION
// ===========================================

// Connect to MongoDB
connectDB();

// ===========================================
// API ROUTES
// ===========================================

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Medication Tracker API is running',
        timestamp: new Date().toISOString()
    });
});

// Authentication routes (rate-limited to prevent brute-force)
app.use('/api/auth', authLimiter, authRoutes);

// Medication routes
app.use('/api/medications', medicationRoutes);

// Appointment routes
app.use('/api/appointments', appointmentRoutes);

// Chat routes
app.use('/api/chats', chatRoutes);

// Patient queue routes (for doctors)
app.use('/api/queue', queueRoutes);

// Prescription routes
app.use('/api/prescriptions', prescriptionRoutes);

// Symptom checker routes
app.use('/api/symptoms', symptomRoutes);

// User routes
app.use('/api/users', userRoutes);

// Admin routes (doctor approval, user management)
app.use('/api/admin', adminRoutes);

// Notification routes
app.use('/api/notifications', notificationRoutes);

// Manual cron trigger — ONLY in development, requires admin authentication
if (process.env.NODE_ENV !== 'production') {
    app.get('/api/test-cron', protect, authorize('admin'), async (req, res) => {
        console.log(`[DEV] Manual cron trigger by admin: ${req.user.email}`);
        await checkMedicationsAndAlert();
        res.json({ message: 'Cron job executed. Check console for results.' });
    });
}

// ===========================================
// ERROR HANDLING
// ===========================================

// 404 handler for undefined routes
app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Server Error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// ===========================================
// SERVER INITIALIZATION
// ===========================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log('\n' + '='.repeat(50));
    console.log('🏥 MEDICATION TRACKER API');
    console.log('='.repeat(50));
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 API URL: http://localhost:${PORT}/api`);
    console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log('='.repeat(50) + '\n');

    // Initialize the cron job for nightly medication checks
    initCronJob();
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
});
