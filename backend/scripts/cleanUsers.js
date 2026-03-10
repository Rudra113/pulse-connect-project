/**
 * cleanUsers.js — Development utility script
 * Deletes all non-admin users from the database.
 *
 * ⚠️  DANGER: This is irreversible. Only use in development!
 */

require('dotenv').config();
const mongoose = require('mongoose');
const readline = require('readline');

// Safety guard: refuse to run in production
if (process.env.NODE_ENV === 'production') {
    console.error('❌ ERROR: cleanUsers.js must NOT be run in production!');
    console.error('   Set NODE_ENV to something other than "production" to use this script.');
    process.exit(1);
}

const User = require('../models/User');

// Interactive confirmation prompt
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

rl.question(
    '⚠️  WARNING: This will permanently delete ALL patients and doctors from the database.\n' +
    '   Are you sure you want to continue? Type "yes" to confirm: ',
    async (answer) => {
        rl.close();

        if (answer.trim().toLowerCase() !== 'yes') {
            console.log('❌ Aborted. No changes were made.');
            process.exit(0);
        }

        try {
            await mongoose.connect(process.env.MONGODB_URI);
            console.log('✅ Connected to MongoDB');

            // Delete all users except admin
            const result = await User.deleteMany({ role: { $ne: 'admin' } });
            console.log(`🗑️  Deleted ${result.deletedCount} users (patients/doctors)`);

            // Show remaining users
            const remaining = await User.find({}).select('email role');
            console.log('📋 Remaining users:', remaining);

            await mongoose.disconnect();
            console.log('✅ Done. Disconnected from MongoDB.');
        } catch (err) {
            console.error('❌ Error:', err.message);
            process.exit(1);
        }
    }
);
