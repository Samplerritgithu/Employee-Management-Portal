const mongoose = require('mongoose');
const Task = require('../models/Task');
const Employee = require('../models/Employee');
const Project = require('../models/Project');
const AppError = require('../utils/AppError');
const { createNotification } = require('./notificationService');

const createTask = async (data, createdBy) => {
  if (data.assignedTo) {
    if (!mongoose.Types.ObjectId.isValid(data.assignedTo)) {
      throw new AppError('Invalid assignee ID', 400);
    }
    const assignee = await Employee.findById(data.assignedTo);
    if (!assignee) throw new AppError('Assignee not found', 404);
  }

  if (data.project) {
    if (!mongoose.Types.ObjectId.isValid(data.project)) {
      throw new AppError('Invalid project ID', 400);
    }
    const project = await Project.findById(data.project);
    if (!project) throw new AppError('Project not found', 404);
  }

  const task = await Task.create({
    title: data.title,
    description: data.description || '',
    project: data.project || null,
    assignedTo: data.assignedTo || null,
    priority: data.priority || 'MEDIUM',
    status: data.status || 'TODO',
    dueDate: data.dueDate || null,
    createdBy,
  });

  if (data.assignedTo) {
    await createNotification(
      data.assignedTo,
      `You have been assigned a new task: ${task.title}`,
      'TASK'
    );
  }

  return Task.findById(task._id)
    .populate('project', 'name')
    .populate('assignedTo', 'name email')
    .populate('createdBy', 'name email');
};

const getTasks = async (user, query = {}) => {
  const filter = {};

  if (user.role !== 'ADMIN') {
    filter.assignedTo = user._id;
  } else {
    if (query.assignedTo) filter.assignedTo = query.assignedTo;
  }

  if (query.status) filter.status = query.status;
  if (query.priority) filter.priority = query.priority;
  if (query.project) filter.project = query.project;

  return Task.find(filter)
    .populate('project', 'name')
    .populate('assignedTo', 'name email')
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 });
};

const getTaskById = async (id, user) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError('Invalid task ID', 400);
  }

  const task = await Task.findById(id)
    .populate('project', 'name')
    .populate('assignedTo', 'name email')
    .populate('createdBy', 'name email');

  if (!task) {
    throw new AppError('Task not found', 404);
  }

  if (
    user.role !== 'ADMIN' &&
    (!task.assignedTo || task.assignedTo._id.toString() !== user._id.toString())
  ) {
    throw new AppError('Access denied', 403);
  }

  return task;
};

const updateTask = async (id, data, user) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError('Invalid task ID', 400);
  }

  const task = await Task.findById(id);
  if (!task) {
    throw new AppError('Task not found', 404);
  }

  const isAdmin = user.role === 'ADMIN';
  const isAssignee =
    task.assignedTo && task.assignedTo.toString() === user._id.toString();

  if (!isAdmin && !isAssignee) {
    throw new AppError('Access denied', 403);
  }

  if (!isAdmin && isAssignee) {
    if (data.status !== undefined) {
      const oldStatus = task.status;
      task.status = data.status;

      if (oldStatus !== data.status) {
        await createNotification(
          task.createdBy,
          `Task "${task.title}" status changed to ${data.status} by ${user.name}`,
          'STATUS'
        );
      }
    } else {
      throw new AppError('Employees can only update task status', 403);
    }
  } else {
    const oldStatus = task.status;
    const oldAssignee = task.assignedTo ? task.assignedTo.toString() : null;

    if (data.title !== undefined) task.title = data.title;
    if (data.description !== undefined) task.description = data.description;
    if (data.priority !== undefined) task.priority = data.priority;
    if (data.status !== undefined) task.status = data.status;
    if (data.dueDate !== undefined) task.dueDate = data.dueDate;
    if (data.project !== undefined) task.project = data.project || null;

    if (data.assignedTo !== undefined) {
      if (data.assignedTo) {
        const assignee = await Employee.findById(data.assignedTo);
        if (!assignee) throw new AppError('Assignee not found', 404);
      }
      task.assignedTo = data.assignedTo || null;

      if (data.assignedTo && data.assignedTo.toString() !== oldAssignee) {
        await createNotification(
          data.assignedTo,
          `You have been assigned a task: ${task.title}`,
          'TASK'
        );
      }
    }

    if (data.status !== undefined && data.status !== oldStatus && task.assignedTo) {
      await createNotification(
        task.assignedTo,
        `Task "${task.title}" status updated to ${data.status}`,
        'STATUS'
      );
    }
  }

  await task.save();
  return Task.findById(task._id)
    .populate('project', 'name')
    .populate('assignedTo', 'name email')
    .populate('createdBy', 'name email');
};

const deleteTask = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError('Invalid task ID', 400);
  }

  const task = await Task.findById(id);
  if (!task) {
    throw new AppError('Task not found', 404);
  }

  await task.deleteOne();
  return task;
};

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
};
