const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const FileSchema = new mongoose.Schema({
    fileId: {
        type: String,
        default: uuidv4,
        unique: true,
        index: true,
    },
    originalName: {
        type: String,
        required: true,
    },
    filename: {
        type: String,
        required: true,
        unique: true,
    },
    filepath: {
        type: String,
        required: true,
    },
    mimeType: {
        type: String,
        required: true,
    },
    size: {
        type: Number,
        required: true,
    },
    category: {
        type: String,
        enum: ['image', 'video', 'json'],
        required: true,
        index: true,
    },
    metadata: {
        description: String,
        tags: [String],
        category: String,
        comments: String,
    },
    fileStats: {
        processingTime: Number,
        accuracy: Number,
        processedAt: Date,
    },
    uploadedAt: {
        type: Date,
        default: Date.now,
        index: true,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
    isDeleted: {
        type: Boolean,
        default: false,
        index: true,
    },
}, {
    timestamps: true,
    collection: 'files',
});

// Index for efficient queries
FileSchema.index({ category: 1, uploadedAt: -1 });
FileSchema.index({ 'metadata.tags': 1 });
FileSchema.index({ isDeleted: 1, uploadedAt: -1 });

module.exports = mongoose.model('File', FileSchema);
