const employeeService = require('../services/employeeService');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const AppError = require('../utils/AppError');

const getProfile = asyncHandler(async (req, res) => {
  const employee = await employeeService.getEmployeeById(req.user._id);
  sendSuccess(res, 200, 'Profile retrieved', employee);
});

const updateProfile = asyncHandler(async (req, res) => {
  const allowedFields = {
    name: req.body.name,
    phone: req.body.phone,
    address: req.body.address,
  };

  if (req.body.department !== undefined) {
    allowedFields.department = req.body.department;
  }

  Object.keys(allowedFields).forEach((key) => {
    if (allowedFields[key] === undefined) delete allowedFields[key];
  });

  const employee = await employeeService.updateEmployee(req.user._id, allowedFields, false);
  sendSuccess(res, 200, 'Profile updated successfully', employee);
});

const uploadProfileImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new AppError('Please upload an image file', 400);
  }

  const imagePath = `/uploads/${req.file.filename}`;
  const employee = await employeeService.updateEmployee(
    req.user._id,
    { profileImage: imagePath },
    false
  );

  sendSuccess(res, 200, 'Profile image uploaded successfully', employee);
});

module.exports = { getProfile, updateProfile, uploadProfileImage };
