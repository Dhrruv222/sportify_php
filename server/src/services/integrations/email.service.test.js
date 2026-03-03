const test = require('node:test');
const assert = require('node:assert/strict');

const { sendEmail } = require('./email.service');

test('sendEmail returns mock acceptance payload', async () => {
  const result = await sendEmail('dev1@sportify.dev', 'verify_account', { user: 'Dev1' });

  assert.equal(result.provider, 'mock');
  assert.equal(result.accepted, true);
  assert.equal(typeof result.messageId, 'string');
});
