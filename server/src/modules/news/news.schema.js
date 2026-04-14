const { z } = require('zod');

const listNewsQuerySchema = z.object({
  locale: z.string().min(2).max(10).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

const createNewsSchema = z.object({
  title: z.string().min(1),
  summary: z.string().optional(),
  content: z.string().optional(),
  source: z.string().optional(),
  sourceUrl: z.url().optional(),
  locale: z.string().min(2).max(10).default('en'),
  publishedAt: z.coerce.date().optional(),
});

const ingestNewsSchema = z.object({
  locale: z.string().min(2).max(10).default('en'),
  limit: z.coerce.number().int().min(1).max(20).default(5),
});

const enqueueNewsSchema = ingestNewsSchema;

const retryFailedJobsSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

const newsIdParamSchema = z.object({
  id: z.string().min(1),
});

module.exports = {
  listNewsQuerySchema,
  createNewsSchema,
  ingestNewsSchema,
  enqueueNewsSchema,
  retryFailedJobsSchema,
  newsIdParamSchema,
};