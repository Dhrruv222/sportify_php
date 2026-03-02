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
