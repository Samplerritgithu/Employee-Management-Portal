const mongoose = require('mongoose');
const Project = require('../models/Project');
const Employee = require('../models/Employee');
const AppError = require('../utils/AppError');
const { createNotification, createBulkNotifications } = require('./notificationService');

const createProject = async (data) => {
  if (data.manager) {
    if (!mongoose.Types.ObjectId.isValid(data.manager)) {
      throw new AppError('Invalid manager ID', 400);
    }
    const manager = await Employee.findById(data.manager);
    if (!manager) throw new AppError('Manager not found', 404);
  }

  const members = data.members || [];
  for (const memberId of members) {
    if (!mongoose.Types.ObjectId.isValid(memberId)) {
      throw new AppError(`Invalid member ID: ${memberId}`, 400);
    }
  }

  const project = await Project.create({
    name: data.name,
    description: data.description || '',
    startDate: data.startDate,
    endDate: data.endDate || null,
    status: data.status || 'PLANNED',
    manager: data.manager || null,
    members,
  });

  if (members.length > 0) {
    await createBulkNotifications(
      members,
      `You have been assigned to project: ${project.name}`,
      'PROJECT'
    );
  }

  return Project.findById(project._id)
    .populate('manager', 'name email')
    .populate('members', 'name email position');
};

const getProjects = async (user) => {
  let filter = {};

  if (user.role !== 'ADMIN') {
    filter = {
      $or: [{ members: user._id }, { manager: user._id }],
    };
  }

  return Project.find(filter)
    .populate('manager', 'name email')
    .populate('members', 'name email position')
    .sort({ createdAt: -1 });
};

const getProjectById = async (id, user) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError('Invalid project ID', 400);
  }

  const project = await Project.findById(id)
    .populate('manager', 'name email')
    .populate('members', 'name email position department');

  if (!project) {
    throw new AppError('Project not found', 404);
  }

  if (user.role !== 'ADMIN') {
    const isMember = project.members.some(
      (m) => m._id.toString() === user._id.toString()
    );
    const isManager =
      project.manager && project.manager._id.toString() === user._id.toString();

    if (!isMember && !isManager) {
      throw new AppError('Access denied', 403);
    }
  }

  return project;
};

const updateProject = async (id, data) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError('Invalid project ID', 400);
  }

  const project = await Project.findById(id);
  if (!project) {
    throw new AppError('Project not found', 404);
  }

  if (data.name !== undefined) project.name = data.name;
  if (data.description !== undefined) project.description = data.description;
  if (data.startDate !== undefined) project.startDate = data.startDate;
  if (data.endDate !== undefined) project.endDate = data.endDate;
  if (data.status !== undefined) project.status = data.status;

  if (data.manager !== undefined) {
    if (data.manager) {
      const manager = await Employee.findById(data.manager);
      if (!manager) throw new AppError('Manager not found', 404);
    }
    project.manager = data.manager || null;
  }

  if (data.members !== undefined) {
    const oldMembers = project.members.map((m) => m.toString());
    const newMembers = data.members.map((m) => m.toString());
    const added = newMembers.filter((m) => !oldMembers.includes(m));

    project.members = data.members;

    if (added.length > 0) {
      await createBulkNotifications(
        added,
        `You have been assigned to project: ${project.name}`,
        'PROJECT'
      );
    }
  }

  await project.save();
  return Project.findById(project._id)
    .populate('manager', 'name email')
    .populate('members', 'name email position');
};

const deleteProject = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError('Invalid project ID', 400);
  }

  const project = await Project.findById(id);
  if (!project) {
    throw new AppError('Project not found', 404);
  }

  await project.deleteOne();
  return project;
};

const assignMembers = async (id, memberIds) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError('Invalid project ID', 400);
  }

  const project = await Project.findById(id);
  if (!project) {
    throw new AppError('Project not found', 404);
  }

  const existing = project.members.map((m) => m.toString());
  const toAdd = [];

  for (const memberId of memberIds) {
    if (!mongoose.Types.ObjectId.isValid(memberId)) {
      throw new AppError(`Invalid member ID: ${memberId}`, 400);
    }
    const employee = await Employee.findById(memberId);
    if (!employee) throw new AppError(`Employee not found: ${memberId}`, 404);

    if (!existing.includes(memberId.toString())) {
      project.members.push(memberId);
      toAdd.push(memberId);
    }
  }

  await project.save();

  if (toAdd.length > 0) {
    await createBulkNotifications(
      toAdd,
      `You have been assigned to project: ${project.name}`,
      'PROJECT'
    );
  }

  return Project.findById(project._id)
    .populate('manager', 'name email')
    .populate('members', 'name email position');
};

const removeMember = async (id, memberId) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError('Invalid project ID', 400);
  }

  const project = await Project.findById(id);
  if (!project) {
    throw new AppError('Project not found', 404);
  }

  project.members = project.members.filter(
    (m) => m.toString() !== memberId.toString()
  );
  await project.save();

  return Project.findById(project._id)
    .populate('manager', 'name email')
    .populate('members', 'name email position');
};

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  assignMembers,
  removeMember,
};
