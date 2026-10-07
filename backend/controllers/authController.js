const authService = require('../services/authService');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');

const register = asyncHandler(async (req, res) => {
  const { employee, token } = await authService.register(req.body);
  sendSuccess(res, 201, 'Registration successful', { employee, token });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const { employee, token } = await authService.login(email, password);
  sendSuccess(res, 200, 'Login successful', { employee, token });
});

const getMe = asyncHandler(async (req, res) => {
  sendSuccess(res, 200, 'User retrieved', req.user);
});

module.exports = { register, login, getMe };
