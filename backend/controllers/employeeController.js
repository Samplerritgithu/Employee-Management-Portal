const employeeService = require('../services/employeeService');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');

const createEmployee = asyncHandler(async (req, res) => {
  const employee = await employeeService.createEmployee(req.body);
  sendSuccess(res, 201, 'Employee created successfully', employee);
});

const getEmployees = asyncHandler(async (req, res) => {
  const { employees, pagination } = await employeeService.getEmployees(req.query);
  sendSuccess(res, 200, 'Employees retrieved', employees, pagination);
});

const getEmployee = asyncHandler(async (req, res) => {
  const employee = await employeeService.getEmployeeById(req.params.id);
  sendSuccess(res, 200, 'Employee retrieved', employee);
});

const updateEmployee = asyncHandler(async (req, res) => {
  const isAdmin = req.user.role === 'ADMIN';
  const employee = await employeeService.updateEmployee(req.params.id, req.body, isAdmin);
  sendSuccess(res, 200, 'Employee updated successfully', employee);
});

const deleteEmployee = asyncHandler(async (req, res) => {
  await employeeService.deleteEmployee(req.params.id);
  sendSuccess(res, 200, 'Employee deleted successfully');
});

module.exports = {
  createEmployee,
  getEmployees,
  getEmployee,
  updateEmployee,
  deleteEmployee,
};
