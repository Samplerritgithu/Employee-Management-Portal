const express = require('express');
const departmentController = require('../controllers/departmentController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const { departmentValidation, mongoIdParam } = require('../utils/validators');

const router = express.Router();

// Public list for registration forms; mutating routes stay protected
router.get('/', departmentController.getDepartments);
router.get('/:id', authMiddleware, mongoIdParam, validate, departmentController.getDepartment);

router.post('/', authMiddleware, adminMiddleware, departmentValidation, validate, departmentController.createDepartment);
router.put('/:id', authMiddleware, adminMiddleware, mongoIdParam, departmentValidation, validate, departmentController.updateDepartment);
router.delete('/:id', authMiddleware, adminMiddleware, mongoIdParam, validate, departmentController.deleteDepartment);

module.exports = router;
