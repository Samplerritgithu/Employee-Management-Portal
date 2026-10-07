const departmentService = require('../services/departmentService');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');

const createDepartment = asyncHandler(async (req, res) => {
  const department = await departmentService.createDepartment(req.body);
  sendSuccess(res, 201, 'Department created successfully', department);
});

const getDepartments = asyncHandler(async (req, res) => {
  const departments = await departmentService.getDepartments(req.query);
  sendSuccess(res, 200, 'Departments retrieved', departments);
});

const getDepartment = asyncHandler(async (req, res) => {
  const department = await departmentService.getDepartmentById(req.params.id);
  sendSuccess(res, 200, 'Department retrieved', department);
});

const updateDepartment = asyncHandler(async (req, res) => {
  const department = await departmentService.updateDepartment(req.params.id, req.body);
  sendSuccess(res, 200, 'Department updated successfully', department);
});

const deleteDepartment = asyncHandler(async (req, res) => {
  await departmentService.deleteDepartment(req.params.id);
  sendSuccess(res, 200, 'Department deleted successfully');
});

module.exports = {
  createDepartment,
  getDepartments,
  getDepartment,
  updateDepartment,
  deleteDepartment,
};
