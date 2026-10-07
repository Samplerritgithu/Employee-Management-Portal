const Notification = require('../models/Notification');

const createNotification = async (recipientId, message, type = 'GENERAL') => {
  return Notification.create({
    recipient: recipientId,
    message,
    type,
  });
};

const createBulkNotifications = async (recipientIds, message, type = 'GENERAL') => {
  const notifications = recipientIds.map((id) => ({
    recipient: id,
    message,
    type,
  }));
  return Notification.insertMany(notifications);
};

module.exports = { createNotification, createBulkNotifications };
