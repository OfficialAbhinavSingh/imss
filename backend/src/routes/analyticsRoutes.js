const express = require('express');
const router = express.Router();
const AnalyticsController = require('../controllers/analyticsController');

// Analytics routes
router.get('/dashboard-stats', AnalyticsController.getDashboardStats);
router.get('/storage-breakdown', AnalyticsController.getStorageBreakdown);
router.get('/trend-data', AnalyticsController.getTrendData);
router.get('/distribution', AnalyticsController.getFileDistribution);
router.get('/performance', AnalyticsController.getPerformanceMetrics);
router.post('/snapshot', AnalyticsController.createAnalyticsSnapshot);

module.exports = router;
