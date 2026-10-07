const mongoose = require('mongoose');
const Department = require('../models/Department');
const Employee = require('../models/Employee');
const AppError = require('../utils/AppError');

const createDepartment = async (data) => {
  const existing = await Department.findOne({ name: data.name.trim() });
  if (existing) {
    throw new AppError('Department already exists', 400);
  }

  if (data.manager) {
    if (!mongoose.Types.ObjectId.isValid(data.manager)) {
      throw new AppError('Invalid manager ID', 400);
    }
    const manager = await Employee.findById(data.manager);
    if (!manager) throw new AppError('Manager not found', 404);
  }

  return Department.create({
    name: data.name.trim(),
    description: data.description || '',
    manager: data.manager || null,
    status: data.status || 'ACTIVE',
  });
};

const getDepartments = async (query = {}) => {
  const filter = {};
  if (query.status) filter.status = query.status;

  return Department.find(filter)
    .populate('manager', 'name email')
    .sort({ name: 1 });
};

const getDepartmentById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError('Invalid department ID', 400);
  }

  const department = await Department.findById(id).populate('manager', 'name email');
  if (!department) {
    throw new AppError('Department not found', 404);
  }
  return department;
};

const updateDepartment = async (id, data) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError('Invalid department ID', 400);
  }

  const department = await Department.findById(id);
  if (!department) {
    throw new AppError('Department not found', 404);
  }

  if (data.name && data.name.trim() !== department.name) {
    const existing = await Department.findOne({ name: data.name.trim() });
    if (existing) throw new AppError('Department name already exists', 400);
    department.name = data.name.trim();
  }

  if (data.description !== undefined) department.description = data.description;
  if (data.status !== undefined) department.status = data.status;

  if (data.manager !== undefined) {
    if (data.manager) {
      if (!mongoose.Types.ObjectId.isValid(data.manager)) {
        throw new AppError('Invalid manager ID', 400);
      }
      const manager = await Employee.findById(data.manager);
      if (!manager) throw new AppError('Manager not found', 404);
    }
    department.manager = data.manager || null;
  }

  await department.save();
  return Department.findById(department._id).populate('manager', 'name email');
};

const deleteDepartment = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError('Invalid department ID', 400);
  }

  const department = await Department.findById(id);
  if (!department) {
    throw new AppError('Department not found', 404);
  }

  const employeeCount = await Employee.countDocuments({ department: id });
  if (employeeCount > 0) {
    throw new AppError(
      `Cannot delete department. ${employeeCount} employee(s) are assigned to it.`,
      400
    );
  }

  await department.deleteOne();
  return department;
};

module.exports = {
  createDepartment,
  getDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
};
