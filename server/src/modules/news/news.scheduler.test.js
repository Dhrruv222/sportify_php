const test = require('node:test');
const assert = require('node:assert/strict');

const {
  parseLocales,
  parseIntervalMs,
  runSchedulerTick,
} = require('./news.scheduler');

test('parseLocales returns defaults for empty input', () => {
  assert.deepEqual(parseLocales(''), ['en']);
});

test('parseLocales splits and trims csv locales', () => {
  assert.deepEqual(parseLocales('en, de,es '), ['en', 'de', 'es']);
});

test('parseIntervalMs enforces minimum interval', () => {
  assert.equal(parseIntervalMs(1000), 60000);
  assert.equal(parseIntervalMs(120000), 120000);
});

test('runSchedulerTick enqueues one payload per locale', async () => {
  const calls = [];
  const enqueue = async (payload) => {
    calls.push(payload);
    return { queued: false, mode: 'inline', accepted: true };
  };

  const logger = { log() {}, error() {} };
  const result = await runSchedulerTick({ locales: ['en', 'de'], limit: 3, enqueue, logger });

  assert.equal(calls.length, 2);
  assert.equal(calls[0].locale, 'en');
  assert.equal(calls[1].locale, 'de');
  assert.equal(result.length, 2);
});