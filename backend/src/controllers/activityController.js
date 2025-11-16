const Activity = require('../models/Activity');
const mongoose = require('mongoose');

class ActivityController {
    static isDBAvailable() {
        return mongoose.connection.readyState === 1;
    }

    static async getActivities(req, res, next) {
        try {
            const limit = Math.max(1, parseInt(req.query.limit) || 10);
            const page = Math.max(1, parseInt(req.query.page) || 1);
            const skip = (page - 1) * limit;
            const { type } = req.query;

            if (!ActivityController.isDBAvailable()) {
                return res.status(200).json({
                    success: true,
                    data: [],
                    pagination: {
                        total: 0,
                        page,
                        limit,
                        pages: 0,
                    },
                });
            }

            const query = type ? { type } : {};
            
            let total = 0;
            let activities = [];
            
            try {
                total = await Activity.countDocuments(query);
                activities = await Activity.find(query)
                    .sort({ timestamp: -1 })
                    .skip(skip)
                    .limit(limit);
            } catch (dbErr) {
                console.warn('Activity DB error:', dbErr.message);
                return res.status(200).json({
                    success: true,
                    data: [],
                    pagination: { total: 0, page, limit, pages: 0 },
                });
            }

            const formattedActivities = activities.map(activity => ({
                activityId: activity.activityId,
                type: activity.type,
                fileName: activity.fileName,
                fileSize: activity.fileSize,
                fileCategory: activity.fileCategory,
                description: activity.description,
                status: activity.status,
                timestamp: activity.timestamp,
            }));

            res.status(200).json({
                success: true,
                data: formattedActivities,
                pagination: {
                    total,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    pages: Math.ceil(total / limit),
                },
            });
        } catch (error) {
            next(error);
        }
    }

    static async clearActivities(req, res, next) {
        try {
            await Activity.deleteMany({});

            res.status(200).json({
                success: true,
                message: 'All activities cleared',
            });
        } catch (error) {
            next(error);
        }
    }

    static async getActivityStats(req, res, next) {
        try {
            const stats = await Activity.aggregate([
                {
                    $group: {
                        _id: '$type',
                        count: { $sum: 1 },
                    },
                },
            ]);

            const formattedStats = stats.reduce((acc, stat) => {
                acc[stat._id] = stat.count;
                return acc;
            }, {});

            res.status(200).json({
                success: true,
                data: formattedStats,
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = ActivityController;
