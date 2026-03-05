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
});
