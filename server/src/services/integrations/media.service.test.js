const test = require('node:test');
const assert = require('node:assert/strict');

const { getPresignedUploadUrl } = require('./media.service');

test('getPresignedUploadUrl returns deterministic mock shape', async () => {
  const result = await getPresignedUploadUrl('user_1', 'image/png');

  assert.equal(result.provider, 'mock');
  assert.equal(typeof result.url, 'string');
  assert.equal(typeof result.objectKey, 'string');
  assert.equal(result.expiresInSeconds, 900);
  assert.ok(result.objectKey.startsWith('uploads/user_1/'));
});
