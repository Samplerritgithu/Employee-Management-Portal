const projectService = require('../services/projectService');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');

const createProject = asyncHandler(async (req, res) => {
  const project = await projectService.createProject(req.body);
  sendSuccess(res, 201, 'Project created successfully', project);
});

const getProjects = asyncHandler(async (req, res) => {
  const projects = await projectService.getProjects(req.user);
  sendSuccess(res, 200, 'Projects retrieved', projects);
});

const getProject = asyncHandler(async (req, res) => {
  const project = await projectService.getProjectById(req.params.id, req.user);
  sendSuccess(res, 200, 'Project retrieved', project);
});

const updateProject = asyncHandler(async (req, res) => {
  const project = await projectService.updateProject(req.params.id, req.body);
  sendSuccess(res, 200, 'Project updated successfully', project);
});

const deleteProject = asyncHandler(async (req, res) => {
  await projectService.deleteProject(req.params.id);
  sendSuccess(res, 200, 'Project deleted successfully');
});

const assignMembers = asyncHandler(async (req, res) => {
  const project = await projectService.assignMembers(req.params.id, req.body.members);
  sendSuccess(res, 200, 'Members assigned successfully', project);
});

const removeMember = asyncHandler(async (req, res) => {
  const project = await projectService.removeMember(req.params.id, req.params.memberId);
  sendSuccess(res, 200, 'Member removed successfully', project);
});

module.exports = {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
  assignMembers,
  removeMember,
};
