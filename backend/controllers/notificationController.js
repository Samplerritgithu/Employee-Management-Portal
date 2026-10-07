const mongoose = require('mongoose');
const Notification = require('../models/Notification');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const AppError = require('../utils/AppError');
const { createBulkNotifications } = require('../services/notificationService');
const Employee = require('../models/Employee');

const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ recipient: req.user._id })
    .sort({ createdAt: -1 })
    .limit(50);

  const unreadCount = await Notification.countDocuments({
    recipient: req.user._id,
    isRead: false,
  });

  sendSuccess(res, 200, 'Notifications retrieved', { notifications, unreadCount });
});

const markAsRead = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw new AppError('Invalid notification ID', 400);
  }

  const notification = await Notification.findOne({
    _id: req.params.id,
    recipient: req.user._id,
  });

  if (!notification) {
    throw new AppError('Notification not found', 404);
  }

  notification.isRead = true;
  await notification.save();

  sendSuccess(res, 200, 'Notification marked as read', notification);
});

const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { recipient: req.user._id, isRead: false },
    { isRead: true }
  );
  sendSuccess(res, 200, 'All notifications marked as read');
});

const createAnnouncement = asyncHandler(async (req, res) => {
  const { message } = req.body;
  if (!message) {
    throw new AppError('Message is required', 400);
  }

  const employees = await Employee.find({ role: 'EMPLOYEE', status: 'ACTIVE' }).select('_id');
  const ids = employees.map((e) => e._id);

  if (ids.length === 0) {
    throw new AppError('No employees to notify', 400);
  }

  await createBulkNotifications(ids, message, 'ANNOUNCEMENT');
  sendSuccess(res, 201, 'Announcement sent successfully');
});

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  createAnnouncement,
};
