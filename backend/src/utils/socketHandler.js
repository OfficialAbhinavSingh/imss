const File = require('../models/File');
const Activity = require('../models/Activity');

class SocketHandler {
    static io = null;

    static initializeSocket(io) {
        this.io = io;
        io.on('connection', (socket) => {
            console.log('Client connected:', socket.id);

            // Send initial data
            socket.on('requestInitialData', async () => {
                try {
                    const files = await File.find({ isDeleted: false }).limit(10);
                    const activities = await Activity.find().sort({ timestamp: -1 }).limit(5);

                    socket.emit('initialData', {
                        files,
                        activities,
                    });
                } catch (error) {
                    console.error('Error sending initial data:', error);
                }
            });

            // Real-time file updates
            socket.on('subscribeToUpdates', () => {
                socket.join('updates');
                socket.emit('subscriptionConfirmed', { message: 'Subscribed to real-time updates' });
            });

            // Analytics subscription
            socket.on('subscribeToAnalytics', () => {
                socket.join('analytics');
                socket.emit('analyticsSubscriptionConfirmed', { message: 'Subscribed to analytics' });
            });

            // Activity subscription
            socket.on('subscribeToActivity', () => {
                socket.join('activity');
                socket.emit('activitySubscriptionConfirmed', { message: 'Subscribed to activity' });
            });

            socket.on('disconnect', () => {
                console.log('Client disconnected:', socket.id);
            });
        });
    }

    static broadcastFileUpdate(fileData) {
        if (this.io) {
            this.io.to('updates').emit('fileUpdated', {
                timestamp: new Date(),
                data: fileData,
            });
        }
    }

    static broadcastStatsUpdate(statsData) {
        if (this.io) {
            this.io.to('updates').emit('statsUpdate', {
                timestamp: new Date(),
                data: statsData,
            });
        }
    }

    static broadcastAnalyticsUpdate(analyticsData) {
        if (this.io) {
            this.io.to('analytics').emit('analyticsUpdated', {
                timestamp: new Date(),
                data: analyticsData,
            });
        }
    }

    static broadcastActivityUpdate(activityData) {
        if (this.io) {
            this.io.to('activity').emit('activityUpdated', {
                timestamp: new Date(),
                data: activityData,
            });
        }
    }

    static broadcastToAll(eventName, data) {
        if (this.io) {
            this.io.emit(eventName, {
                timestamp: new Date(),
                data,
            });
        }
    }
}

module.exports = SocketHandler;
