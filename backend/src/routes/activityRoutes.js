const express = require('express');
const router = express.Router();
const ActivityController = require('../controllers/activityController');

// Activity routes
router.get('/', ActivityController.getActivities);
router.get('/stats', ActivityController.getActivityStats);
router.delete('/clear', ActivityController.clearActivities);

module.exports = router;
