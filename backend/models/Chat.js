/**
 * Chat Model
 * Defines the schema for chat conversations between patients and doctors
 */

const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    // Participants in the chat
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }],

    // Reference to the patient (for easy querying)
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    // Reference to the doctor (for easy querying)
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    // Last message preview
    lastMessage: {
        text: {
            type: String,
            trim: true
        },
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        sentAt: {
            type: Date
        }
    },

    // Unread count per participant
    unreadCount: {
        type: Map,
        of: Number,
        default: {}
    },

    // Chat status
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Index for efficient querying
chatSchema.index({ participants: 1 });
chatSchema.index({ patientId: 1 });
chatSchema.index({ doctorId: 1 });

/**
 * Method to mark messages as read for a user
 */
chatSchema.methods.markAsRead = async function (userId) {
    this.unreadCount.set(userId.toString(), 0);
    await this.save();
};

/**
 * Method to increment unread count for a user
 */
chatSchema.methods.incrementUnread = async function (userId) {
    const currentCount = this.unreadCount.get(userId.toString()) || 0;
    this.unreadCount.set(userId.toString(), currentCount + 1);
    await this.save();
};

/**
 * Static method to get or create a chat between two users
 */
chatSchema.statics.getOrCreate = async function (patientId, doctorId) {
    let chat = await this.findOne({
        patientId,
        doctorId
    }).populate('participants', 'name email avatarColor role');

    if (!chat) {
        chat = await this.create({
            participants: [patientId, doctorId],
            patientId,
            doctorId,
            unreadCount: new Map([[patientId.toString(), 0], [doctorId.toString(), 0]])
        });
        chat = await chat.populate('participants', 'name email avatarColor role');
    }

    return chat;
};

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;
