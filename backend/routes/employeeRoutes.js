const express = require('express');
const employeeController = require('../controllers/employeeController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const {
  employeeValidation,
  employeeUpdateValidation,
  mongoIdParam,
  paginationQuery,
} = require('../utils/validators');

const router = express.Router();

router.use(authMiddleware, adminMiddleware);

router.post('/', employeeValidation, validate, employeeController.createEmployee);
router.get('/', paginationQuery, validate, employeeController.getEmployees);
router.get('/:id', mongoIdParam, validate, employeeController.getEmployee);
router.put('/:id', mongoIdParam, employeeUpdateValidation, validate, employeeController.updateEmployee);
router.delete('/:id', mongoIdParam, validate, employeeController.deleteEmployee);

module.exports = router;
