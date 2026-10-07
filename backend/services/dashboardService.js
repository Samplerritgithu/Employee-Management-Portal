const Employee = require('../models/Employee');
const Department = require('../models/Department');
const Project = require('../models/Project');
const Task = require('../models/Task');

const getAdminDashboard = async () => {
  const [
    totalEmployees,
    activeEmployees,
    departments,
    projects,
    pendingTasks,
    completedTasks,
    inProgressTasks,
    recentEmployees,
    recentProjects,
    tasksByPriority,
  ] = await Promise.all([
    Employee.countDocuments({ role: 'EMPLOYEE' }),
    Employee.countDocuments({ role: 'EMPLOYEE', status: 'ACTIVE' }),
    Department.countDocuments({ status: 'ACTIVE' }),
    Project.countDocuments(),
    Task.countDocuments({ status: { $in: ['TODO', 'IN_PROGRESS'] } }),
    Task.countDocuments({ status: 'COMPLETED' }),
    Task.countDocuments({ status: 'IN_PROGRESS' }),
    Employee.find({ role: 'EMPLOYEE' })
      .populate('department', 'name')
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email department status joiningDate'),
    Project.find()
      .populate('manager', 'name')
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name status startDate endDate manager'),
    Task.aggregate([
      { $group: { _id: '$priority', count: { $sum: 1 } } },
    ]),
  ]);

  const taskStats = {
    pending: pendingTasks,
    completed: completedTasks,
    inProgress: inProgressTasks,
    byPriority: tasksByPriority.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {}),
  };

  return {
    stats: {
      totalEmployees,
      activeEmployees,
      departments,
      projects,
      pendingTasks,
      completedTasks,
    },
    recentEmployees,
    recentProjects,
    taskStats,
  };
};

const getEmployeeDashboard = async (userId) => {
  const [myProjects, myTasks, pendingTasks, completedTasks] = await Promise.all([
    Project.find({
      $or: [{ members: userId }, { manager: userId }],
    })
      .populate('manager', 'name')
      .sort({ createdAt: -1 }),
    Task.find({ assignedTo: userId })
      .populate('project', 'name')
      .sort({ createdAt: -1 }),
    Task.countDocuments({
      assignedTo: userId,
      status: { $in: ['TODO', 'IN_PROGRESS'] },
    }),
    Task.countDocuments({ assignedTo: userId, status: 'COMPLETED' }),
  ]);

  return {
    stats: {
      myProjects: myProjects.length,
      myTasks: myTasks.length,
      pendingTasks,
      completedTasks,
    },
    myProjects: myProjects.slice(0, 5),
    myTasks: myTasks.slice(0, 5),
  };
};

module.exports = { getAdminDashboard, getEmployeeDashboard };
