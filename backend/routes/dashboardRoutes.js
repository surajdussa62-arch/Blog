const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

router.get('/dashboard', protect, dashboardController.getDashboard);
router.get('/settings', protect, dashboardController.getSettings);
router.put('/settings', protect, dashboardController.updateSettings);
router.put('/settings/password', protect, dashboardController.updatePassword);

module.exports = router;
