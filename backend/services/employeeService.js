const mongoose = require('mongoose');
const Employee = require('../models/Employee');
const Department = require('../models/Department');
const AppError = require('../utils/AppError');

const createEmployee = async (data) => {
  const existing = await Employee.findOne({ email: data.email.toLowerCase() });
  if (existing) {
    throw new AppError('Email already registered', 400);
  }

  if (data.department) {
    const dept = await Department.findById(data.department);
    if (!dept) {
      throw new AppError('Department not found', 404);
    }
  }

  const employee = await Employee.create({
    name: data.name,
    email: data.email,
    password: data.password || 'Employee@123',
    phone: data.phone || '',
    department: data.department || null,
    position: data.position || '',
    salary: data.salary || 0,
    joiningDate: data.joiningDate || Date.now(),
    role: data.role || 'EMPLOYEE',
    status: data.status || 'ACTIVE',
    address: data.address || '',
  });

  return Employee.findById(employee._id).populate('department', 'name');
};

const getEmployees = async (query) => {
  const {
    search,
    department,
    role,
    status,
    position,
    page = 1,
    limit = 10,
  } = query;

  const filter = {};

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { position: { $regex: search, $options: 'i' } },
    ];

    const matchingDepts = await Department.find({
      name: { $regex: search, $options: 'i' },
    }).select('_id');

    if (matchingDepts.length > 0) {
      filter.$or.push({ department: { $in: matchingDepts.map((d) => d._id) } });
    }
  }

  if (department) {
    if (!mongoose.Types.ObjectId.isValid(department)) {
      const dept = await Department.findOne({ name: { $regex: `^${department}$`, $options: 'i' } });
      if (dept) filter.department = dept._id;
      else filter.department = department;
    } else {
      filter.department = department;
    }
  }

  if (role) filter.role = role;
  if (status) filter.status = status;
  if (position) filter.position = { $regex: position, $options: 'i' };

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
  const skip = (pageNum - 1) * limitNum;

  const [employees, total] = await Promise.all([
    Employee.find(filter)
      .populate('department', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    Employee.countDocuments(filter),
  ]);

  return {
    employees,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
    },
  };
};

const getEmployeeById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError('Invalid employee ID', 400);
  }

  const employee = await Employee.findById(id).populate('department', 'name description');
  if (!employee) {
    throw new AppError('Employee not found', 404);
  }
  return employee;
};

const updateEmployee = async (id, data, isAdmin = false) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError('Invalid employee ID', 400);
  }

  const employee = await Employee.findById(id);
  if (!employee) {
    throw new AppError('Employee not found', 404);
  }

  if (data.email && data.email !== employee.email) {
    const existing = await Employee.findOne({ email: data.email.toLowerCase() });
    if (existing) {
      throw new AppError('Email already in use', 400);
    }
    employee.email = data.email;
  }

  if (data.name !== undefined) employee.name = data.name;
  if (data.phone !== undefined) employee.phone = data.phone;
  if (data.address !== undefined) employee.address = data.address;
  if (data.position !== undefined) employee.position = data.position;
  if (data.profileImage !== undefined) employee.profileImage = data.profileImage;

  if (data.department !== undefined) {
    if (data.department) {
      const dept = await Department.findById(data.department);
      if (!dept) throw new AppError('Department not found', 404);
    }
    employee.department = data.department || null;
  }

  if (isAdmin) {
    if (data.salary !== undefined) employee.salary = data.salary;
    if (data.role !== undefined) employee.role = data.role;
    if (data.status !== undefined) employee.status = data.status;
    if (data.joiningDate !== undefined) employee.joiningDate = data.joiningDate;
  }

  if (data.password) {
    employee.password = data.password;
  }

  await employee.save();
  return Employee.findById(employee._id).populate('department', 'name');
};

const deleteEmployee = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError('Invalid employee ID', 400);
  }

  const employee = await Employee.findById(id);
  if (!employee) {
    throw new AppError('Employee not found', 404);
  }

  if (employee.role === 'ADMIN') {
    const adminCount = await Employee.countDocuments({ role: 'ADMIN' });
    if (adminCount <= 1) {
      throw new AppError('Cannot delete the last admin', 400);
    }
  }

  await employee.deleteOne();
  return employee;
};

module.exports = {
  createEmployee,
  getEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
};
