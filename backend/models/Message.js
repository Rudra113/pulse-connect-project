/**
 * Message Model
 * Defines the schema for individual messages in a chat
 */

const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    // Reference to the chat this message belongs to
    chatId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chat',
        required: [true, 'Chat ID is required']
    },

    // Who sent this message
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Sender ID is required']
    },

    // Message content
    text: {
        type: String,
        required: [true, 'Message text is required'],
        trim: true,
        maxlength: [2000, 'Message cannot exceed 2000 characters']
    },

    // Message type
    type: {
        type: String,
        enum: ['text', 'image', 'file', 'prescription'],
        default: 'text'
    },

    // Attachment URL (for images/files)
    attachmentUrl: {
        type: String,
        trim: true
    },

    // Read status per participant
    readBy: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        readAt: {
            type: Date,
            default: Date.now
        }
    }],

    // Message status
    status: {
        type: String,
        enum: ['sent', 'delivered', 'read'],
        default: 'sent'
    }
}, {
    timestamps: true
});

// Index for efficient querying
messageSchema.index({ chatId: 1, createdAt: -1 });
messageSchema.index({ senderId: 1 });

/**
 * Post-save hook to update chat's last message
 */
messageSchema.post('save', async function () {
    const Chat = mongoose.model('Chat');
    await Chat.findByIdAndUpdate(this.chatId, {
        lastMessage: {
            text: this.text,
            senderId: this.senderId,
            sentAt: this.createdAt
        }
    });
});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
