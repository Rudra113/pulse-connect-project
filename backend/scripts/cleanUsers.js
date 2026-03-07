require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

(async () => {
    await mongoose.connect(process.env.MONGODB_URI);

    // Delete all users except admin
    const result = await User.deleteMany({ role: { $ne: 'admin' } });
    console.log('Deleted', result.deletedCount, 'users (patients/doctors)');

    // Show remaining users
    const remaining = await User.find({}).select('email role');
    console.log('Remaining users:', remaining);

    await mongoose.disconnect();
})();
