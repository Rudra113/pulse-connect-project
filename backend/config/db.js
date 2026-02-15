/**
 * Database Configuration
 * This file handles the MongoDB connection using Mongoose
 */

const mongoose = require('mongoose');

// Function to connect to MongoDB
const connectDB = async () => {
    try {
        // Attempt to connect to MongoDB using the URI from environment variables
        const conn = await mongoose.connect(process.env.MONGODB_URI);

        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        // Log the error and exit the process if connection fails
        console.error(`❌ Error connecting to MongoDB: ${error.message}`);
        process.exit(1); // Exit with failure code
    }
};

module.exports = connectDB;
