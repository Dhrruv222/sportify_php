const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');

const app = require('../../app');

test('GET /api/v1/fitpass/plans returns success envelope', async () => {
  const response = await request(app).get('/api/v1/fitpass/plans');

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.success, true);
  assert.equal(Array.isArray(response.body.data), true);
});

test('POST /api/v1/fitpass/subscribe validates payload', async () => {
  const response = await request(app)
    .post('/api/v1/fitpass/subscribe')
    .set('x-user-id', 'test-user')
    .send({});

  assert.equal(response.statusCode, 400);
  assert.equal(response.body.success, false);
});
