const mongoose = require('mongoose');

const AnalyticsSchema = new mongoose.Schema({
    analyticsId: {
        type: String,
        unique: true,
        required: true,
        index: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,
        index: true,
    },
    totalFiles: Number,
    totalSize: Number,
    fileCount: {
        images: Number,
        videos: Number,
        jsonFiles: Number,
    },
    storageUsed: {
        images: Number,
        videos: Number,
        jsonFiles: Number,
    },
    processingMetrics: {
        averageProcessingTime: Number,
        averageAccuracy: Number,
        totalProcessed: Number,
    },
    dailyUploads: Number,
    storageEfficiency: Number,
    peakUploadTime: String,
}, {
    timestamps: true,
    collection: 'analytics',
});

// Index for time-series queries
AnalyticsSchema.index({ timestamp: -1 });
AnalyticsSchema.index({ analyticsId: 1, timestamp: -1 });

module.exports = mongoose.model('Analytics', AnalyticsSchema);
