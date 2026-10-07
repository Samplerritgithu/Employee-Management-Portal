const { body, param, query } = require('express-validator');

const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('department').optional({ nullable: true }).isMongoId().withMessage('Invalid department ID'),
  body('position').optional().trim(),
];

const loginValidation = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

const employeeValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password')
    .optional()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('phone').optional().trim(),
  body('department').optional({ nullable: true }).isMongoId().withMessage('Invalid department ID'),
  body('position').optional().trim(),
  body('salary').optional().isFloat({ min: 0 }).withMessage('Salary must be a positive number'),
  body('joiningDate').optional().isISO8601().withMessage('Invalid joining date'),
  body('role').optional().isIn(['ADMIN', 'EMPLOYEE']).withMessage('Invalid role'),
  body('status')
    .optional()
    .isIn(['ACTIVE', 'INACTIVE', 'ON_LEAVE'])
    .withMessage('Invalid status'),
];

const employeeUpdateValidation = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('email').optional().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('phone').optional().trim(),
  body('department').optional({ nullable: true }).isMongoId().withMessage('Invalid department ID'),
  body('position').optional().trim(),
  body('salary').optional().isFloat({ min: 0 }).withMessage('Salary must be a positive number'),
  body('joiningDate').optional().isISO8601().withMessage('Invalid joining date'),
  body('role').optional().isIn(['ADMIN', 'EMPLOYEE']).withMessage('Invalid role'),
  body('status')
    .optional()
    .isIn(['ACTIVE', 'INACTIVE', 'ON_LEAVE'])
    .withMessage('Invalid status'),
  body('address').optional().trim(),
];

const departmentValidation = [
  body('name').trim().notEmpty().withMessage('Department name is required'),
  body('description').optional().trim(),
  body('manager').optional({ nullable: true }).isMongoId().withMessage('Invalid manager ID'),
  body('status').optional().isIn(['ACTIVE', 'INACTIVE']).withMessage('Invalid status'),
];

const projectValidation = [
  body('name').trim().notEmpty().withMessage('Project name is required'),
  body('description').optional().trim(),
  body('startDate').isISO8601().withMessage('Valid start date is required'),
  body('endDate').optional({ nullable: true }).isISO8601().withMessage('Invalid end date'),
  body('status')
    .optional()
    .isIn(['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD'])
    .withMessage('Invalid status'),
  body('manager').optional({ nullable: true }).isMongoId().withMessage('Invalid manager ID'),
  body('members').optional().isArray().withMessage('Members must be an array'),
  body('members.*').optional().isMongoId().withMessage('Invalid member ID'),
];

const taskValidation = [
  body('title').trim().notEmpty().withMessage('Task title is required'),
  body('description').optional().trim(),
  body('project').optional({ nullable: true }).isMongoId().withMessage('Invalid project ID'),
  body('assignedTo').optional({ nullable: true }).isMongoId().withMessage('Invalid assignee ID'),
  body('priority')
    .optional()
    .isIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
    .withMessage('Invalid priority'),
  body('status')
    .optional()
    .isIn(['TODO', 'IN_PROGRESS', 'COMPLETED'])
    .withMessage('Invalid status'),
  body('dueDate').optional({ nullable: true }).isISO8601().withMessage('Invalid due date'),
];

const mongoIdParam = [param('id').isMongoId().withMessage('Invalid ID')];

const paginationQuery = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
];

module.exports = {
  registerValidation,
  loginValidation,
  employeeValidation,
  employeeUpdateValidation,
  departmentValidation,
  projectValidation,
  taskValidation,
  mongoIdParam,
  paginationQuery,
};
