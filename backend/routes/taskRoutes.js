const express = require('express');
const taskController = require('../controllers/taskController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const { taskValidation, mongoIdParam } = require('../utils/validators');

const router = express.Router();

router.use(authMiddleware);

router.get('/', taskController.getTasks);
router.get('/:id', mongoIdParam, validate, taskController.getTask);
router.put('/:id', mongoIdParam, validate, taskController.updateTask);

router.post('/', adminMiddleware, taskValidation, validate, taskController.createTask);
router.delete('/:id', adminMiddleware, mongoIdParam, validate, taskController.deleteTask);

module.exports = router;
