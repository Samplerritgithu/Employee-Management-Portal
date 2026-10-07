const jwt = require('jsonwebtoken');
const Employee = require('../models/Employee');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

const authMiddleware = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw new AppError('Not authorized. Please login.', 401);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await Employee.findById(decoded.userId).populate('department', 'name');

    if (!user) {
      throw new AppError('User not found. Token invalid.', 401);
    }

    if (user.status === 'INACTIVE') {
      throw new AppError('Your account is inactive. Contact admin.', 401);
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      throw new AppError('Invalid or expired token. Please login again.', 401);
    }
    throw error;
  }
});

const adminMiddleware = (req, res, next) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Access denied',
    });
  }
  next();
};

module.exports = { authMiddleware, adminMiddleware };
