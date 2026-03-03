const { z } = require('zod');

const subscribeSchema = z.object({
  planCode: z.string().min(1),
});

const checkinSchema = z.object({
  qrValue: z.string().min(1),
  partnerId: z.string().min(1),
});

const plansQuerySchema = z.object({
  active: z
    .union([z.literal('true'), z.literal('false')])
    .optional()
    .transform((value) => (value === undefined ? true : value === 'true')),
});

module.exports = {
  subscribeSchema,
  checkinSchema,
  plansQuerySchema,
};
