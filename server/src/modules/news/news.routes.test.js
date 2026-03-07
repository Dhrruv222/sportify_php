const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');

const app = require('../../app');

test('GET /api/v1/news validates query params', async () => {
  const response = await request(app).get('/api/v1/news?page=0');

  assert.equal(response.statusCode, 400);
  assert.equal(response.body.success, false);
});

test('POST /api/v1/news validates payload', async () => {
  const response = await request(app)
    .post('/api/v1/news')
    .send({ sourceUrl: 'not-a-url' });

  assert.equal(response.statusCode, 400);
  assert.equal(response.body.success, false);
});

test('POST /api/v1/news/internal/ingest validates payload', async () => {
  const response = await request(app)
    .post('/api/v1/news/internal/ingest')
    .send({ limit: 0 });

  assert.equal(response.statusCode, 400);
  assert.equal(response.body.success, false);
});

test('POST /api/v1/news/internal/ingest requires internal API key when configured', async () => {
  const previousKey = process.env.INTERNAL_API_KEY;
  process.env.INTERNAL_API_KEY = 'test_internal_key';

  try {
    const response = await request(app)
      .post('/api/v1/news/internal/ingest')
      .send({ locale: 'en', limit: 1 });

    assert.equal(response.statusCode, 401);
    assert.equal(response.body.success, false);
  } finally {
    if (previousKey === undefined) {
      delete process.env.INTERNAL_API_KEY;
    } else {
      process.env.INTERNAL_API_KEY = previousKey;
    }
  }
});

test('POST /api/v1/news/internal/enqueue runs in inline mode without REDIS_URL', async () => {
  const previousRedisUrl = process.env.REDIS_URL;
  const previousKey = process.env.INTERNAL_API_KEY;
  delete process.env.REDIS_URL;
  delete process.env.INTERNAL_API_KEY;

  try {
    const response = await request(app)
      .post('/api/v1/news/internal/enqueue')
      .send({ locale: 'en', limit: 1 });

    assert.equal(response.statusCode, 200);
    assert.equal(response.body.success, true);
    assert.equal(response.body.data.mode, 'inline');
    assert.equal(response.body.data.accepted, true);
  } finally {
    if (previousRedisUrl === undefined) {
      delete process.env.REDIS_URL;
    } else {
      process.env.REDIS_URL = previousRedisUrl;
    }

    if (previousKey === undefined) {
      delete process.env.INTERNAL_API_KEY;
    } else {
      process.env.INTERNAL_API_KEY = previousKey;
    }
  }
});

test('POST /api/v1/news/internal/enqueue requires internal API key when configured', async () => {
  const previousKey = process.env.INTERNAL_API_KEY;
  process.env.INTERNAL_API_KEY = 'test_internal_key';

  try {
    const response = await request(app)
      .post('/api/v1/news/internal/enqueue')
      .send({ locale: 'en', limit: 1 });

    assert.equal(response.statusCode, 401);
    assert.equal(response.body.success, false);
  } finally {
    if (previousKey === undefined) {
      delete process.env.INTERNAL_API_KEY;
    } else {
      process.env.INTERNAL_API_KEY = previousKey;
    }
  }
});

test('GET /api/v1/news/internal/queue/status returns inline mode without REDIS_URL', async () => {
  const previousRedisUrl = process.env.REDIS_URL;
  const previousKey = process.env.INTERNAL_API_KEY;
  delete process.env.REDIS_URL;
  delete process.env.INTERNAL_API_KEY;

  try {
    const response = await request(app)
      .get('/api/v1/news/internal/queue/status');

    assert.equal(response.statusCode, 200);
    assert.equal(response.body.success, true);
    assert.equal(response.body.data.mode, 'inline');
  } finally {
    if (previousRedisUrl === undefined) {
      delete process.env.REDIS_URL;
    } else {
      process.env.REDIS_URL = previousRedisUrl;
    }

    if (previousKey === undefined) {
      delete process.env.INTERNAL_API_KEY;
    } else {
      process.env.INTERNAL_API_KEY = previousKey;
    }
  }
});

test('POST /api/v1/news/internal/queue/retry validates payload', async () => {
  const response = await request(app)
    .post('/api/v1/news/internal/queue/retry')
    .send({ limit: 0 });

  assert.equal(response.statusCode, 400);
  assert.equal(response.body.success, false);
});

test('POST /api/v1/news/internal/queue/retry requires internal API key when configured', async () => {
  const previousKey = process.env.INTERNAL_API_KEY;
  process.env.INTERNAL_API_KEY = 'test_internal_key';

  try {
    const response = await request(app)
      .post('/api/v1/news/internal/queue/retry')
      .send({ limit: 1 });

    assert.equal(response.statusCode, 401);
    assert.equal(response.body.success, false);
  } finally {
    if (previousKey === undefined) {
      delete process.env.INTERNAL_API_KEY;
    } else {
      process.env.INTERNAL_API_KEY = previousKey;
    }
  }
});