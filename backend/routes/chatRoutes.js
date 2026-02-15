/**
 * Chat Routes
 * API endpoints for managing chats and messages
 */

const express = require('express');
const router = express.Router();
const Chat = require('../models/Chat');
const Message = require('../models/Message');
const { protect } = require('../middleware/auth');

/**
 * @route   GET /api/chats
 * @desc    Get all chats for the authenticated user
 * @access  Private
 */
router.get('/', protect, async (req, res) => {
    try {
        const chats = await Chat.find({
            participants: req.user._id,
            isActive: true
        })
            .populate('participants', 'name email avatarColor role specialty')
            .populate('lastMessage.senderId', 'name')
            .sort({ updatedAt: -1 });

        // Format response with unread count for current user
        const formattedChats = chats.map(chat => {
            const otherParticipant = chat.participants.find(
                p => p._id.toString() !== req.user._id.toString()
            );

            return {
                _id: chat._id,
                participant: otherParticipant,
                lastMessage: chat.lastMessage,
                unreadCount: chat.unreadCount.get(req.user._id.toString()) || 0,
                updatedAt: chat.updatedAt
            };
        });

        res.status(200).json({
            success: true,
            count: formattedChats.length,
            data: formattedChats
        });
    } catch (error) {
        console.error('Error fetching chats:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching chats',
            error: error.message
        });
    }
});

/**
 * @route   POST /api/chats
 * @desc    Create or get existing chat with another user
 * @access  Private
 */
router.post('/', protect, async (req, res) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'Please provide userId to start a chat with'
            });
        }

        // Determine patient and doctor based on roles
        const patientId = req.user.role === 'patient' ? req.user._id : userId;
        const doctorId = req.user.role === 'doctor' ? req.user._id : userId;

        const chat = await Chat.getOrCreate(patientId, doctorId);

        res.status(200).json({
            success: true,
            data: chat
        });
    } catch (error) {
        console.error('Error creating chat:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while creating chat',
            error: error.message
        });
    }
});

/**
 * @route   GET /api/chats/:chatId/messages
 * @desc    Get all messages for a chat
 * @access  Private
 */
router.get('/:chatId/messages', protect, async (req, res) => {
    try {
        const { chatId } = req.params;
        const { page = 1, limit = 50 } = req.query;

        // Verify user is participant in chat
        const chat = await Chat.findOne({
            _id: chatId,
            participants: req.user._id
        });

        if (!chat) {
            return res.status(404).json({
                success: false,
                message: 'Chat not found or unauthorized'
            });
        }

        const messages = await Message.find({ chatId })
            .populate('senderId', 'name email avatarColor role')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit));

        // Mark chat as read for current user
        await chat.markAsRead(req.user._id);

        res.status(200).json({
            success: true,
            count: messages.length,
            data: messages.reverse() // Return in chronological order
        });
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching messages',
            error: error.message
        });
    }
});

/**
 * @route   POST /api/chats/:chatId/messages
 * @desc    Send a message in a chat
 * @access  Private
 */
router.post('/:chatId/messages', protect, async (req, res) => {
    try {
        const { chatId } = req.params;
        const { text, type = 'text', attachmentUrl } = req.body;

        if (!text) {
            return res.status(400).json({
                success: false,
                message: 'Message text is required'
            });
        }

        // Verify user is participant in chat
        const chat = await Chat.findOne({
            _id: chatId,
            participants: req.user._id
        });

        if (!chat) {
            return res.status(404).json({
                success: false,
                message: 'Chat not found or unauthorized'
            });
        }

        // Create message
        const message = await Message.create({
            chatId,
            senderId: req.user._id,
            text,
            type,
            attachmentUrl,
            readBy: [{ userId: req.user._id }]
        });

        await message.populate('senderId', 'name email avatarColor role');

        // Increment unread count for other participant
        const otherParticipantId = chat.participants.find(
            p => p.toString() !== req.user._id.toString()
        );
        await chat.incrementUnread(otherParticipantId);

        res.status(201).json({
            success: true,
            message: 'Message sent successfully',
            data: message
        });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while sending message',
            error: error.message
        });
    }
});

/**
 * @route   PUT /api/chats/:chatId/read
 * @desc    Mark all messages in a chat as read
 * @access  Private
 */
router.put('/:chatId/read', protect, async (req, res) => {
    try {
        const { chatId } = req.params;

        const chat = await Chat.findOne({
            _id: chatId,
            participants: req.user._id
        });

        if (!chat) {
            return res.status(404).json({
                success: false,
                message: 'Chat not found or unauthorized'
            });
        }

        await chat.markAsRead(req.user._id);

        // Update all unread messages to read
        await Message.updateMany(
            {
                chatId,
                'readBy.userId': { $ne: req.user._id }
            },
            {
                $push: { readBy: { userId: req.user._id } },
                status: 'read'
            }
        );

        res.status(200).json({
            success: true,
            message: 'Chat marked as read'
        });
    } catch (error) {
        console.error('Error marking chat as read:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while marking chat as read',
            error: error.message
        });
    }
});

module.exports = router;
