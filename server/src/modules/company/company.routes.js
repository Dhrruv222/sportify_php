const express = require('express');

const { validateBody, validateQuery } = require('../../middlewares/validate');
const { requireAuth, requireRoles } = require('../../middlewares/auth');
const {
  listEmployeesQuerySchema,
  addEmployeeSchema,
} = require('./company.schema');
const {
  listEmployees,
  addEmployee,
  removeEmployee,
  getStats,
} = require('./company.controller');

const router = express.Router();

router.use(requireAuth);
router.use(requireRoles('COMPANY'));

router.get('/employees', validateQuery(listEmployeesQuerySchema), listEmployees);
router.post('/employees', validateBody(addEmployeeSchema), addEmployee);
router.delete('/employees/:id', removeEmployee);
router.get('/stats', getStats);

module.exports = router;
