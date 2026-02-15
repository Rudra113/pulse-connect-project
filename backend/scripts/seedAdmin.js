/**
 * Admin Seeding Script
 * Creates the initial admin user for the system
 * 
 * Usage: npm run seed:admin
 * 
 * IMPORTANT: Configure admin credentials in .env file before running
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Admin credentials from environment variables (required)
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const ADMIN_NAME = process.env.ADMIN_NAME;

// Validate required environment variables
if (!ADMIN_EMAIL || !ADMIN_PASSWORD || !ADMIN_NAME) {
    console.error('\n❌ Missing required environment variables!');
    console.error('   Please set ADMIN_EMAIL, ADMIN_PASSWORD, and ADMIN_NAME in .env file');
    process.exit(1);
}

// User schema (simplified for seeding)
const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true, lowercase: true },
    password: String,
    avatarColor: String,
    role: { type: String, enum: ['patient', 'doctor', 'admin'], default: 'patient' },
    isApproved: { type: Boolean, default: true },
    status: { type: String, default: 'approved' }
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

const User = mongoose.model('User', userSchema);

const seedAdmin = async () => {
    try {
        console.log('\n' + '='.repeat(50));
        console.log('🔐 ADMIN SEEDING SCRIPT');
        console.log('='.repeat(50));

        // Connect to MongoDB
        console.log('\n📡 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Check if admin already exists
        console.log('\n🔍 Checking for existing admin...');
        const existingAdmin = await User.findOne({ email: ADMIN_EMAIL.toLowerCase() });

        if (existingAdmin) {
            console.log('⚠️  Admin user already exists!');
            console.log(`   Email: ${existingAdmin.email}`);
            console.log(`   Created: ${existingAdmin.createdAt}`);
            console.log('\n💡 To reset the admin, delete the user from the database first.');
        } else {
            // Create admin user
            console.log('\n📝 Creating admin user...');

            const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4'];
            const avatarColor = colors[Math.floor(Math.random() * colors.length)];

            const admin = new User({
                name: ADMIN_NAME,
                email: ADMIN_EMAIL.toLowerCase(),
                password: ADMIN_PASSWORD,
                avatarColor,
                role: 'admin',
                isApproved: true,
                status: 'approved'
            });

            await admin.save();

            console.log('✅ Admin user created successfully!');
            console.log('\n' + '-'.repeat(50));
            console.log('🔑 ADMIN CREDENTIALS');
            console.log('-'.repeat(50));
            console.log(`   Email:    ${ADMIN_EMAIL}`);
            console.log(`   Password: ${ADMIN_PASSWORD}`);
            console.log('-'.repeat(50));
            console.log('\n⚠️  SECURITY NOTICE:');
            console.log('   Please change these credentials in production!');
            console.log('   Update ADMIN_EMAIL and ADMIN_PASSWORD in .env file');
        }

        console.log('\n' + '='.repeat(50));
        console.log('✨ Seeding complete!');
        console.log('='.repeat(50) + '\n');

    } catch (error) {
        console.error('\n❌ Error seeding admin:', error.message);

        if (error.code === 11000) {
            console.log('💡 An admin with this email already exists.');
        }
    } finally {
        // Close database connection
        await mongoose.connection.close();
        console.log('📡 Database connection closed');
        process.exit(0);
    }
};

// Run the seed function
seedAdmin();
