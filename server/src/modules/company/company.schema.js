const { z } = require('zod');

const listEmployeesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

const addEmployeeSchema = z.object({
  email: z.email(),
  planCode: z.string().min(1),
});

module.exports = {
  listEmployeesQuerySchema,
  addEmployeeSchema,
};
