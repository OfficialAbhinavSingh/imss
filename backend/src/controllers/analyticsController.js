const File = require('../models/File');
const Analytics = require('../models/Analytics');
const AnalyticsHelper = require('../utils/analyticsHelper');
const { calculateStorageStats, formatFileSize } = require('../utils/fileHelper');
const SocketHandler = require('../utils/socketHandler');

class AnalyticsController {
    static isDBAvailable() {
        try {
            return File.collection.conn && File.collection.conn.readyState === 1;
        } catch (e) {
            return false;
        }
    }

    static async getDashboardStats(req, res, next) {
        try {
            if (!AnalyticsController.isDBAvailable()) {
                // Calculate stats from disk files
                const path = require('path');
                const fs = require('fs');
                const uploadsDir = path.join(__dirname, '../../uploads');
                const { getFileCategory, formatFileSize } = require('../utils/fileHelper');
                
                let stats = {
                    image: 0, video: 0, audio: 0, document: 0,
                    json: 0, code: 0, archive: 0
                };
                let totalSize = 0;
                let totalFiles = 0;

                if (fs.existsSync(uploadsDir)) {
                    const fileNames = fs.readdirSync(uploadsDir);
                    totalFiles = fileNames.length;
                    
                    for (const fileName of fileNames) {
                        const filePath = path.join(uploadsDir, fileName);
                        const stat = fs.statSync(filePath);
                        totalSize += stat.size;
                        
                        const mimeType = require('mime-types').lookup(filePath) || 'application/octet-stream';
                        const category = getFileCategory(mimeType);
                        if (stats[category] !== undefined) stats[category]++;
                    }
                }

                return res.status(200).json({
                    success: true,
                    data: {
                        totalFiles,
                        fileCount: stats,
                        storageUsed: formatFileSize(totalSize),
                        totalSize,
                        storageFormatted: formatFileSize(totalSize),
                        efficiency: 95,
                        image: stats.image,
                        video: stats.video,
                        audio: stats.audio,
                        document: stats.document,
                        json: stats.json,
                        code: stats.code,
                        archive: stats.archive,
                        timestamp: new Date(),
                    },
                });
            }

            const files = await File.find({ isDeleted: false });
            const metrics = AnalyticsHelper.calculateMetrics(files);
            const storageStats = calculateStorageStats(files);

            res.status(200).json({
                success: true,
                data: {
                    totalFiles: metrics.totalFiles,
                    fileCount: metrics.fileCount,
                    storageUsed: metrics.storageUsed,
                    totalSize: storageStats.totalSize,
                    storageFormatted: formatFileSize(storageStats.totalSize),
                    efficiency: AnalyticsHelper.calculateStorageEfficiency(storageStats.totalSize),
                    image: storageStats.image || 0,
                    video: storageStats.video || 0,
                    audio: storageStats.audio || 0,
                    document: storageStats.document || 0,
                    json: storageStats.json || 0,
                    code: storageStats.code || 0,
                    archive: storageStats.archive || 0,
                    timestamp: new Date(),
                },
            });
        } catch (error) {
            next(error);
        }
    }

    static async getStorageBreakdown(req, res, next) {
        try {
            if (!AnalyticsController.isDBAvailable()) {
                const path = require('path');
                const fs = require('fs');
                const uploadsDir = path.join(__dirname, '../../uploads');
                const { getFileCategory, formatFileSize } = require('../utils/fileHelper');

                const breakdown = {};
                const categories = ['image', 'video', 'audio', 'document', 'json', 'code', 'archive'];
                const icons = { image: 'fa-image', video: 'fa-video', audio: 'fa-music', document: 'fa-file-alt', json: 'fa-file-code', code: 'fa-code', archive: 'fa-archive' };
                const colors = { image: '#4361ee', video: '#7209b7', audio: '#f72585', document: '#ff006e', json: '#4cc9f0', code: '#06ffa5', archive: '#ffa502' };

                categories.forEach(cat => {
                    breakdown[cat] = { name: cat.charAt(0).toUpperCase() + cat.slice(1), icon: icons[cat], color: colors[cat], count: 0, sizeBytes: 0, percentage: 0 };
                });

                let totalSize = 0;
                if (fs.existsSync(uploadsDir)) {
                    const fileNames = fs.readdirSync(uploadsDir);
                    fileNames.forEach(fileName => {
                        const filePath = path.join(uploadsDir, fileName);
                        const stat = fs.statSync(filePath);
                        const mimeType = require('mime-types').lookup(filePath) || 'application/o`ctet-stream';
                        const category = getFileCategory(mimeType);
                        
                        if (breakdown[category]) {
                            breakdown[category].count++;
                            breakdown[category].sizeBytes += stat.size;
                            totalSize += stat.size;
                        }
                    });
                }

                const result = Object.values(breakdown).map(item => ({
                    ...item,
                    size: formatFileSize(item.sizeBytes),
                    percentage: totalSize > 0 ? Math.round((item.sizeBytes / totalSize) * 100) : 0,
                }));

                return res.status(200).json({
                    success: true,
                    data: result,
                });
            }

            const files = await File.find({ isDeleted: false });

            const breakdown = {
                images: {
                    name: 'Images',
                    icon: 'fa-image',
                    color: '#4361ee',
                    files: files.filter(f => f.category === 'image'),
                },
                videos: {
                    name: 'Videos',
                    icon: 'fa-video',
                    color: '#7209b7',
                    files: files.filter(f => f.category === 'video'),
                },
                audio: {
                    name: 'Audio',
                    icon: 'fa-music',
                    color: '#f72585',
                    files: files.filter(f => f.category === 'audio'),
                },
                documents: {
                    name: 'Documents',
                    icon: 'fa-file-alt',
                    color: '#ff006e',
                    files: files.filter(f => f.category === 'document'),
                },
                json: {
                    name: 'JSON Data',
                    icon: 'fa-file-code',
                    color: '#4cc9f0',
                    files: files.filter(f => f.category === 'json'),
                },
                code: {
                    name: 'Code Files',
                    icon: 'fa-code',
                    color: '#06ffa5',
                    files: files.filter(f => f.category === 'code'),
                },
                archives: {
                    name: 'Archives',
                    icon: 'fa-archive',
                    color: '#ffe66d',
                    files: files.filter(f => f.category === 'archive'),
                },
            };

            const result = Object.entries(breakdown).map(([key, data]) => {
                const totalSize = data.files.reduce((sum, f) => sum + f.size, 0);
                return {
                    name: data.name,
                    icon: data.icon,
                    color: data.color,
                    count: data.files.length,
                    size: formatFileSize(totalSize),
                    sizeBytes: totalSize,
                    percentage: files.length > 0 ? (data.files.length / files.length) * 100 : 0,
                };
            });

            res.status(200).json({
                success: true,
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }

    static async getTrendData(req, res, next) {
        try {
            const { period = '7d' } = req.query;

            if (!AnalyticsController.isDBAvailable()) {
                // Return default trend data when DB is unavailable
                const trendData = AnalyticsHelper.getTrendData([], period);
                return res.status(200).json({
                    success: true,
                    data: trendData,
                    period,
                });
            }

            const analyticsRecords = await Analytics.find().sort({ timestamp: -1 }).limit(100);
            const trendData = AnalyticsHelper.getTrendData(analyticsRecords, period);

            res.status(200).json({
                success: true,
                data: trendData,
                period,
            });
        } catch (error) {
            next(error);
        }
    }

    static async getFileDistribution(req, res, next) {
        try {
            if (!AnalyticsController.isDBAvailable()) {
                const path = require('path');
                const fs = require('fs');
                const uploadsDir = path.join(__dirname, '../../uploads');
                const { getFileCategory } = require('../utils/fileHelper');

                const distribution = {
                    image: { type: 'image', category: 'Images', color: '#4361ee', count: 0 },
                    video: { type: 'video', category: 'Videos', color: '#7209b7', count: 0 },
                    audio: { type: 'audio', category: 'Audio', color: '#f72585', count: 0 },
                    document: { type: 'document', category: 'Documents', color: '#ff006e', count: 0 },
                    json: { type: 'json', category: 'JSON', color: '#4cc9f0', count: 0 },
                    code: { type: 'code', category: 'Code', color: '#06ffa5', count: 0 },
                    archive: { type: 'archive', category: 'Archives', color: '#ffa502', count: 0 },
                };

                let totalFiles = 0;
                if (fs.existsSync(uploadsDir)) {
                    const fileNames = fs.readdirSync(uploadsDir);
                    fileNames.forEach(fileName => {
                        const filePath = path.join(uploadsDir, fileName);
                        const mimeType = require('mime-types').lookup(filePath) || 'application/octet-stream';
                        const category = getFileCategory(mimeType);
                        
                        if (distribution[category]) {
                            distribution[category].count++;
                            totalFiles++;
                        }
                    });
                }

                const result = Object.values(distribution).map(item => ({
                    ...item,
                    percentage: totalFiles > 0 ? Math.round((item.count / totalFiles) * 100) : 0,
                }));

                return res.status(200).json({
                    success: true,
                    data: result,
                });
            }

            const files = await File.find({ isDeleted: false });
            const distribution = AnalyticsHelper.getDistributionData(files);

            const total = (distribution.image || 0) + (distribution.video || 0) + (distribution.audio || 0) + 
                         (distribution.document || 0) + (distribution.json || 0) + (distribution.code || 0) + (distribution.archive || 0);

            const result = [
                {
                    type: 'image',
                    category: 'Images',
                    count: distribution.image || 0,
                    percentage: total > 0 ? ((distribution.image || 0) / total) * 100 : 0,
                    color: '#4361ee',
                },
                {
                    type: 'video',
                    category: 'Videos',
                    count: distribution.video || 0,
                    percentage: total > 0 ? ((distribution.video || 0) / total) * 100 : 0,
                    color: '#7209b7',
                },
                {
                    type: 'audio',
                    category: 'Audio',
                    count: distribution.audio || 0,
                    percentage: total > 0 ? ((distribution.audio || 0) / total) * 100 : 0,
                    color: '#f72585',
                },
                {
                    type: 'document',
                    category: 'Documents',
                    count: distribution.document || 0,
                    percentage: total > 0 ? ((distribution.document || 0) / total) * 100 : 0,
                    color: '#ff006e',
                },
                {
                    type: 'json',
                    category: 'JSON',
                    count: distribution.json || 0,
                    percentage: total > 0 ? ((distribution.json || 0) / total) * 100 : 0,
                    color: '#4cc9f0',
                },
                {
                    type: 'code',
                    category: 'Code',
                    count: distribution.code || 0,
                    percentage: total > 0 ? ((distribution.code || 0) / total) * 100 : 0,
                    color: '#06ffa5',
                },
                {
                    type: 'archive',
                    category: 'Archives',
                    count: distribution.archive || 0,
                    percentage: total > 0 ? ((distribution.archive || 0) / total) * 100 : 0,
                    color: '#ffe66d',
                },
            ];

            res.status(200).json({
                success: true,
                data: result,
                total,
            });
        } catch (error) {
            next(error);
        }
    }

    static async getPerformanceMetrics(req, res, next) {
        try {
            if (!AnalyticsController.isDBAvailable()) {
                // Return default metrics when DB is unavailable
                const metrics = {
                    processingSpeed: 0,
                    categorizationAccuracy: 0,
                    storageEfficiency: 95,
                    systemStatus: 'Ready',
                    totalProcessed: 0,
                };

                return res.status(200).json({
                    success: true,
                    data: metrics,
                });
            }

            const files = await File.find({ isDeleted: false });
            const processingMetrics = AnalyticsHelper.calculateProcessingMetrics(files);

            const metrics = {
                processingSpeed: processingMetrics.averageProcessingTime ?
                    Math.max(0, 100 - (processingMetrics.averageProcessingTime / 2)) : 0,
                categorizationAccuracy: processingMetrics.averageAccuracy || 0,
                storageEfficiency: AnalyticsHelper.calculateStorageEfficiency(
                    files.reduce((sum, f) => sum + f.size, 0)
                ),
                systemStatus: 'Ready',
                totalProcessed: processingMetrics.totalProcessed,
            };

            res.status(200).json({
                success: true,
                data: metrics,
            });
        } catch (error) {
            next(error);
        }
    }

    static async createAnalyticsSnapshot(req, res, next) {
        try {
            if (!AnalyticsController.isDBAvailable()) {
                return res.status(503).json({
                    success: false,
                    message: 'Database unavailable. Cannot create analytics snapshot.',
                });
            }

            const files = await File.find({ isDeleted: false });
            const analyticsRecord = AnalyticsHelper.createAnalyticsRecord(files);

            const analytics = new Analytics(analyticsRecord);
            const saved = await analytics.save();

            res.status(201).json({
                success: true,
                message: 'Analytics snapshot created',
                data: saved,
            });
        } catch (error) {
            next(error);
        }
    }

    static async getStatsData() {
        try {
            if (!AnalyticsController.isDBAvailable()) {
                // Calculate stats from disk files
                const path = require('path');
                const fs = require('fs');
                const uploadsDir = path.join(__dirname, '../../uploads');
                const { getFileCategory, formatFileSize } = require('../utils/fileHelper');

                let stats = {
                    image: 0, video: 0, audio: 0, document: 0,
                    json: 0, code: 0, archive: 0
                };
                let totalSize = 0;
                let totalFiles = 0;

                if (fs.existsSync(uploadsDir)) {
                    const fileNames = fs.readdirSync(uploadsDir);
                    totalFiles = fileNames.length;

                    for (const fileName of fileNames) {
                        const filePath = path.join(uploadsDir, fileName);
                        const stat = fs.statSync(filePath);
                        totalSize += stat.size;

                        const mimeType = require('mime-types').lookup(filePath) || 'application/octet-stream';
                        const category = getFileCategory(mimeType);
                        if (stats[category] !== undefined) stats[category]++;
                    }
                }

                return {
                    totalFiles,
                    fileCount: stats,
                    storageUsed: formatFileSize(totalSize),
                    totalSize,
                    storageFormatted: formatFileSize(totalSize),
                    efficiency: 95,
                    image: stats.image,
                    video: stats.video,
                    audio: stats.audio,
                    document: stats.document,
                    json: stats.json,
                    code: stats.code,
                    archive: stats.archive,
                    timestamp: new Date(),
                };
            }

            const files = await File.find({ isDeleted: false });
            const metrics = AnalyticsHelper.calculateMetrics(files);
            const storageStats = calculateStorageStats(files);

            return {
                totalFiles: metrics.totalFiles,
                fileCount: metrics.fileCount,
                storageUsed: metrics.storageUsed,
                totalSize: storageStats.totalSize,
                storageFormatted: formatFileSize(storageStats.totalSize),
                efficiency: AnalyticsHelper.calculateStorageEfficiency(storageStats.totalSize),
                image: storageStats.image || 0,
                video: storageStats.video || 0,
                audio: storageStats.audio || 0,
                document: storageStats.document || 0,
                json: storageStats.json || 0,
                code: storageStats.code || 0,
                archive: storageStats.archive || 0,
                timestamp: new Date(),
            };
        } catch (error) {
            console.error('Error getting stats data:', error);
            return null;
        }
    }

}

module.exports = AnalyticsController;
