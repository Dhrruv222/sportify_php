const test = require('node:test');
const assert = require('node:assert/strict');

const {
  getPresignedUploadUrl,
  sendEmail,
  getUserSubscription,
  generateQRCode,
  computeScoutScore,
  getArticles,
} = require('./handoffs');

test('handoff stubs return expected shapes', async () => {
  const upload = await getPresignedUploadUrl('user_1', 'image/png');
  assert.equal(upload.provider, 'mock');
  assert.equal(typeof upload.url, 'string');

  const emailResult = await sendEmail('dev1@sportify.dev', 'verify_account', { user: 'Dev1' });
  assert.equal(emailResult, undefined);

  const subscription = await getUserSubscription('user_1');
  assert.equal(subscription.plan, 'gold');
  assert.equal(subscription.status, 'active');

  const qr = await generateQRCode('sub_1');
  assert.equal(typeof qr.qrImageUrl, 'string');

  const score = await computeScoutScore('player_1', { pace: 80 });
  assert.equal(typeof score.score, 'number');
  assert.equal(typeof score.breakdown.technical, 'number');

  const articles = await getArticles({ locale: 'de', page: 1, limit: 10 });
  assert.equal(Array.isArray(articles), true);
  assert.equal(articles[0].locale, 'de');
});
