const request = require('supertest');
const jwt = require('jsonwebtoken');

process.env.JWT_SECRET = process.env.JWT_SECRET || 'smoke_jwt_secret';
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'smoke_refresh_secret';
process.env.INTERNAL_API_KEY = process.env.INTERNAL_API_KEY || 'smoke_internal_key';

const app = require('../server/src/app');

function tokenFor(role = 'PLAYER', userId = 'smoke-user') {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET, { expiresIn: '1h' });
}

async function main() {
  const results = [];

  const randomEmail = `smoke_${Date.now()}@example.com`;
  const registerPayload = {
    email: randomEmail,
    password: 'Password1',
    role: 'PLAYER',
    gdprConsent: true,
  };

  const registerRes = await request(app).post('/api/v1/auth/register').send(registerPayload);
  const userToken = registerRes.body?.data?.accessToken || tokenFor('PLAYER', 'fallback-user');
  const userId = registerRes.body?.data?.user?.id || 'fallback-user';

  const adminToken = tokenFor('ADMIN', 'admin-smoke');
  const playerToken = tokenFor('PLAYER', userId);
  const companyToken = tokenFor('COMPANY', 'company-smoke');

  const cases = [
    ['GET', '/api/health', null, null, [200]],
    ['GET', '/api/health/ready', null, null, [200, 503]],

    ['POST', '/api/v1/auth/login', null, { email: randomEmail, password: 'Password1' }, [200]],
    ['POST', '/api/v1/auth/refresh', null, {}, [200, 401, 403]],
    ['POST', '/api/v1/auth/logout', null, {}, [200, 401, 403]],
    ['GET', '/api/v1/auth/oauth/google', null, null, [302]],
    ['GET', '/api/v1/auth/profile', { Authorization: `Bearer ${playerToken}` }, null, [200]],
    ['GET', '/api/v1/auth/admin/stats', { Authorization: `Bearer ${adminToken}` }, null, [200]],
    ['GET', '/api/v1/auth/player/upload', { Authorization: `Bearer ${playerToken}` }, null, [200]],

    ['GET', '/api/v1/fitpass/plans', null, null, [200]],
    ['POST', '/api/v1/fitpass/subscribe', { 'x-user-id': userId }, { planCode: '' }, [400]],
    ['GET', '/api/v1/fitpass/me/qr', { 'x-user-id': userId }, null, [200, 404]],
    ['POST', '/api/v1/fitpass/checkin', null, { qrValue: '', partnerId: '' }, [400]],

    ['GET', '/api/v1/company/employees', { Authorization: `Bearer ${companyToken}` }, null, [200, 400]],
    ['POST', '/api/v1/company/employees', { Authorization: `Bearer ${companyToken}` }, { email: 'bad', planCode: '' }, [400]],
    ['DELETE', '/api/v1/company/employees/smoke-id', { Authorization: `Bearer ${companyToken}` }, null, [200, 400, 404]],
    ['GET', '/api/v1/company/stats', { Authorization: `Bearer ${companyToken}` }, null, [200, 400]],

    ['GET', '/api/v1/news', null, null, [200]],
    ['POST', '/api/v1/news', null, {}, [400]],
    ['GET', '/api/v1/news/not-a-uuid', null, null, [400, 404]],
    ['POST', '/api/v1/news/internal/ingest', { 'x-internal-api-key': 'wrong' }, {}, [401, 400]],
    ['POST', '/api/v1/news/internal/enqueue', { 'x-internal-api-key': process.env.INTERNAL_API_KEY }, { locale: 'en', limit: 1 }, [200]],
    ['GET', '/api/v1/news/internal/queue/status', { 'x-internal-api-key': process.env.INTERNAL_API_KEY }, null, [200]],
    ['POST', '/api/v1/news/internal/queue/retry', { 'x-internal-api-key': process.env.INTERNAL_API_KEY }, { limit: 1 }, [200, 400]],

    ['GET', '/api/v1/users/account', { Authorization: `Bearer ${userToken}` }, null, [200, 404]],
    ['GET', '/api/v1/users/avatar-url', { Authorization: `Bearer ${userToken}` }, null, [200, 400]],
    ['PUT', '/api/v1/users/photos', { Authorization: `Bearer ${userToken}` }, {}, [200, 400]],

    ['GET', '/api/v1/profile', { Authorization: `Bearer ${userToken}` }, null, [200, 404]],
    ['PUT', '/api/v1/profile/me', { Authorization: `Bearer ${userToken}` }, {}, [200, 400]],
    ['POST', '/api/v1/profile/me/avatar', { Authorization: `Bearer ${userToken}` }, {}, [200, 400]],
    ['POST', '/api/v1/profile/me/career', { Authorization: `Bearer ${playerToken}` }, {}, [200, 400, 404]],
    ['PUT', '/api/v1/profile/me/career/smoke-id', { Authorization: `Bearer ${playerToken}` }, {}, [200, 400, 404]],
    ['DELETE', '/api/v1/profile/me/career/smoke-id', { Authorization: `Bearer ${playerToken}` }, null, [200, 400, 404]],
    ['POST', '/api/v1/profile/me/achivements', { Authorization: `Bearer ${playerToken}` }, {}, [200, 400, 404]],
    ['DELETE', '/api/v1/profile/me/achivements/smoke-id', { Authorization: `Bearer ${playerToken}` }, null, [200, 400, 404]],

    ['POST', '/api/v1/social/follow/' + userId, { Authorization: `Bearer ${playerToken}` }, null, [201, 400, 404]],
    ['DELETE', '/api/v1/social/unfollow/' + userId, { Authorization: `Bearer ${playerToken}` }, null, [200, 400]],
    ['GET', '/api/v1/social/followers', { Authorization: `Bearer ${playerToken}` }, null, [200]],
    ['GET', '/api/v1/social/following', { Authorization: `Bearer ${playerToken}` }, null, [200]],
    ['GET', '/api/v1/social/feed', { Authorization: `Bearer ${playerToken}` }, null, [200]],
    ['POST', '/api/v1/social/shortlist/saved/' + userId, { Authorization: `Bearer ${playerToken}` }, null, [403]],
    ['DELETE', '/api/v1/social/shortlist/saved/' + userId, { Authorization: `Bearer ${playerToken}` }, null, [403]],
    ['GET', '/api/v1/social/shortlist/saved', { Authorization: `Bearer ${playerToken}` }, null, [403]],

    ['GET', '/api/v1/players/search', { Authorization: `Bearer ${playerToken}` }, null, [200]],

    ['GET', '/api/v1/messages/conversations', { Authorization: `Bearer ${playerToken}` }, null, [200]],
    ['GET', '/api/v1/messages/unread-count', { Authorization: `Bearer ${playerToken}` }, null, [200]],
    ['GET', '/api/v1/messages/thread/' + userId, { Authorization: `Bearer ${playerToken}` }, null, [200]],
    ['POST', '/api/v1/messages/send/' + userId, { Authorization: `Bearer ${playerToken}` }, { content: 'smoke message' }, [200, 201, 400]],
    ['PUT', '/api/v1/messages/read/' + userId, { Authorization: `Bearer ${playerToken}` }, null, [200, 400]],
  ];

  for (const [method, path, headers, body, expected] of cases) {
    let req = request(app)[method.toLowerCase()](path);
    if (headers) req = req.set(headers);
    if (body) req = req.send(body);
    const res = await req;
    const ok = expected.includes(res.statusCode);
    results.push({ method, path, status: res.statusCode, ok, expected, body: res.body });
  }

  const failed = results.filter((r) => !r.ok);
  console.log('\n=== Endpoint Smoke Summary ===');
  console.log(`Total: ${results.length}`);
  console.log(`Passed: ${results.length - failed.length}`);
  console.log(`Failed: ${failed.length}`);

  if (failed.length) {
    console.log('\nFailed endpoints:');
    for (const f of failed) {
      console.log(`${f.method} ${f.path} -> ${f.status} (expected: ${f.expected.join(',')})`);
      console.log(`  body: ${JSON.stringify(f.body)}`);
    }
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
