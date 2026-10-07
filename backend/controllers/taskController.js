const taskService = require('../services/taskService');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');

const createTask = asyncHandler(async (req, res) => {
  const task = await taskService.createTask(req.body, req.user._id);
  sendSuccess(res, 201, 'Task created successfully', task);
});

const getTasks = asyncHandler(async (req, res) => {
  const tasks = await taskService.getTasks(req.user, req.query);
  sendSuccess(res, 200, 'Tasks retrieved', tasks);
});

const getTask = asyncHandler(async (req, res) => {
  const task = await taskService.getTaskById(req.params.id, req.user);
  sendSuccess(res, 200, 'Task retrieved', task);
});

const updateTask = asyncHandler(async (req, res) => {
  const task = await taskService.updateTask(req.params.id, req.body, req.user);
  sendSuccess(res, 200, 'Task updated successfully', task);
});

const deleteTask = asyncHandler(async (req, res) => {
  await taskService.deleteTask(req.params.id);
  sendSuccess(res, 200, 'Task deleted successfully');
});

module.exports = {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask,
};
