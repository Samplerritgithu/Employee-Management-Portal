const jwt = require('jsonwebtoken');
const Employee = require('../models/Employee');
const AppError = require('../utils/AppError');

const generateToken = (userId, role) => {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

const register = async (data) => {
  const existing = await Employee.findOne({ email: data.email.toLowerCase() });
  if (existing) {
    throw new AppError('Email already registered', 400);
  }

  const employee = await Employee.create({
    name: data.name,
    email: data.email,
    password: data.password,
    department: data.department || null,
    position: data.position || '',
    phone: data.phone || '',
    role: 'EMPLOYEE',
    status: 'ACTIVE',
  });

  const token = generateToken(employee._id, employee.role);
  const populated = await Employee.findById(employee._id).populate('department', 'name');

  return { employee: populated, token };
};

const login = async (email, password) => {
  const employee = await Employee.findOne({ email: email.toLowerCase() }).select('+password');

  if (!employee) {
    throw new AppError('Invalid email or password', 401);
  }

  const isMatch = await employee.comparePassword(password);
  if (!isMatch) {
    throw new AppError('Invalid email or password', 401);
  }

  if (employee.status === 'INACTIVE') {
    throw new AppError('Your account is inactive. Contact admin.', 401);
  }

  const token = generateToken(employee._id, employee.role);
  const populated = await Employee.findById(employee._id).populate('department', 'name');

  return { employee: populated, token };
};

module.exports = { register, login, generateToken };
