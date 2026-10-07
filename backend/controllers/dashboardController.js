const dashboardService = require('../services/dashboardService');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');

const getDashboard = asyncHandler(async (req, res) => {
  let data;

  if (req.user.role === 'ADMIN') {
    data = await dashboardService.getAdminDashboard();
  } else {
    data = await dashboardService.getEmployeeDashboard(req.user._id);
  }

  sendSuccess(res, 200, 'Dashboard data retrieved', data);
});

module.exports = { getDashboard };
