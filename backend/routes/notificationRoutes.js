const express = require('express');
const notificationController = require('../controllers/notificationController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const { mongoIdParam } = require('../utils/validators');

const router = express.Router();

router.use(authMiddleware);

router.get('/', notificationController.getNotifications);
router.put('/read-all', notificationController.markAllAsRead);
router.put('/:id/read', mongoIdParam, validate, notificationController.markAsRead);
router.post('/announcement', adminMiddleware, notificationController.createAnnouncement);

module.exports = router;
