const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');

const app = require('./app');

test('GET /api/health returns success envelope', async () => {
  const response = await request(app).get('/api/health');

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.success, true);
  assert.equal(response.body.data.status, 'ok');
  assert.equal(response.body.data.service, 'sportify-server');
});

test('GET /api/health/ready returns readiness checks', async () => {
  const response = await request(app).get('/api/health/ready');

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.success, true);
  assert.equal(response.body.data.service, 'sportify-server');
  assert.equal(typeof response.body.data.status, 'string');
  assert.equal(typeof response.body.data.checks.database.configured, 'boolean');
  assert.equal(typeof response.body.data.checks.jwt.configured, 'boolean');
  assert.equal(typeof response.body.data.checks.aiService.configured, 'boolean');
  assert.ok(['bullmq', 'inline'].includes(response.body.data.checks.queue.mode));
  assert.equal(typeof response.body.data.checks.envValidation.ok, 'boolean');
  assert.ok(Array.isArray(response.body.data.checks.envValidation.errors));
  assert.ok(Array.isArray(response.body.data.checks.envValidation.warnings));
  assert.equal(typeof response.body.data.checks.envValidation.nodeEnv, 'string');
});

test('GET /api/health/ready returns 503 in production when required env is missing', async () => {
  const previousNodeEnv = process.env.NODE_ENV;
  const previousDatabaseUrl = process.env.DATABASE_URL;
  const previousDirectUrl = process.env.DIRECT_URL;

  process.env.NODE_ENV = 'production';
  delete process.env.DATABASE_URL;
  delete process.env.DIRECT_URL;

  try {
    const response = await request(app).get('/api/health/ready');

    assert.equal(response.statusCode, 503);
    assert.equal(response.body.success, true);
    assert.equal(response.body.data.status, 'degraded');
  } finally {
    if (previousNodeEnv === undefined) {
      delete process.env.NODE_ENV;
    } else {
      process.env.NODE_ENV = previousNodeEnv;
    }

    if (previousDatabaseUrl === undefined) {
      delete process.env.DATABASE_URL;
    } else {
      process.env.DATABASE_URL = previousDatabaseUrl;
    }

    if (previousDirectUrl === undefined) {
      delete process.env.DIRECT_URL;
    } else {
      process.env.DIRECT_URL = previousDirectUrl;
    }
  }
});
