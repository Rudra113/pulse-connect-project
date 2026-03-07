/**
 * Notification Model
 * Defines the schema for user notifications
 */

const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    // Reference to the user receiving this notification
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required']
    },

    // Notification title
    title: {
        type: String,
        required: [true, 'Notification title is required'],
        trim: true
    },

    // Notification message
    message: {
        type: String,
        required: [true, 'Notification message is required'],
        trim: true
    },

    // Type of notification
    type: {
        type: String,
        enum: ['consultation_started', 'consultation_completed', 'new_message', 'prescription', 'general', 'appointment'],
        default: 'general'
    },

    // Whether the notification has been read
    isRead: {
        type: Boolean,
        default: false
    },

    // Reference to related data (e.g., chatId, consultationId, prescriptionId)
    relatedId: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'relatedModel'
    },

    // Model name for the related document
    relatedModel: {
        type: String,
        enum: ['Chat', 'PatientQueue', 'Prescription', 'Appointment']
    },

    // Additional metadata
    metadata: {
        type: mongoose.Schema.Types.Mixed
    }
}, {
    timestamps: true
});

// Index for efficient querying
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

/**
 * Static method to create a notification
 */
notificationSchema.statics.createNotification = async function (data) {
    return await this.create(data);
};

/**
 * Static method to get unread count for a user
 */
notificationSchema.statics.getUnreadCount = async function (userId) {
    return await this.countDocuments({ userId, isRead: false });
};

/**
 * Static method to mark all as read for a user
 */
notificationSchema.statics.markAllAsRead = async function (userId) {
    return await this.updateMany(
        { userId, isRead: false },
        { isRead: true }
    );
};

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
