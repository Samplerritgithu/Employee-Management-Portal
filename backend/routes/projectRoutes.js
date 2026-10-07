const express = require('express');
const projectController = require('../controllers/projectController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const { projectValidation, mongoIdParam } = require('../utils/validators');

const router = express.Router();

router.use(authMiddleware);

router.get('/', projectController.getProjects);
router.get('/:id', mongoIdParam, validate, projectController.getProject);

router.post('/', adminMiddleware, projectValidation, validate, projectController.createProject);
router.put('/:id', adminMiddleware, mongoIdParam, validate, projectController.updateProject);
router.delete('/:id', adminMiddleware, mongoIdParam, validate, projectController.deleteProject);
router.post('/:id/members', adminMiddleware, mongoIdParam, validate, projectController.assignMembers);
router.delete('/:id/members/:memberId', adminMiddleware, mongoIdParam, validate, projectController.removeMember);

module.exports = router;
