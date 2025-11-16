const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const ActivitySchema = new mongoose.Schema({
    activityId: {
        type: String,
        default: uuidv4,
        unique: true,
        index: true,
    },
    fileId: {
        type: String,
        index: true,
    },
    type: {
        type: String,
        enum: ['upload', 'delete', 'update', 'view', 'download'],
        required: true,
        index: true,
    },
    fileName: String,
    fileSize: Number,
    fileCategory: String,
    description: String,
    status: {
        type: String,
        enum: ['success', 'failed', 'pending'],
        default: 'success',
    },
    timestamp: {
        type: Date,
        default: Date.now,
        index: true,
    },
    metadata: mongoose.Schema.Types.Mixed,
}, {
    timestamps: true,
    collection: 'activities',
});

// Index for efficient activity queries
ActivitySchema.index({ type: 1, timestamp: -1 });
ActivitySchema.index({ timestamp: -1 });

module.exports = mongoose.model('Activity', ActivitySchema);
