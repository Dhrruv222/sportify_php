const BASE_URL = process.env.BASE_URL || "http://127.0.0.1:8000/api";

const results = [];

async function hit(name, method, path, { headers = {}, body, expected = [200] } = {}) {
  const url = `${BASE_URL}${path}`;
  const opts = { method, headers: { ...headers } };

  if (body !== undefined) {
    opts.headers["Content-Type"] = "application/json";
    opts.body = JSON.stringify(body);
  }

  let status = 0;
  let json = null;
  let text = "";
  let ok = false;
  let error = null;
  let responseHeaders = {};

  try {
    const res = await fetch(url, opts);
    status = res.status;
    responseHeaders = Object.fromEntries(res.headers.entries());
    text = await res.text();
    try {
      json = text ? JSON.parse(text) : null;
    } catch {
      json = null;
    }
    ok = expected.includes(status);
  } catch (e) {
    error = String(e.message || e);
    ok = false;
  }

  const row = { name, method, path, status, expected, ok, json, text, error, responseHeaders };
  results.push(row);
  return row;
}

function getAccessToken(res) {
  return res?.json?.data?.accessToken || null;
}

function getUserId(res) {
  return res?.json?.data?.user?.id || null;
}

function parseRefreshCookie(res) {
  const raw = res?.responseHeaders?.["set-cookie"] || "";
  if (!raw) return null;
  const cookie = raw.split(",").find((c) => c.includes("refreshToken="));
  if (!cookie) return null;
  return cookie.split(";")[0].trim();
}

async function main() {
  const now = Date.now();
  const playerEmail = `player_${now}@example.com`;
  const companyEmail = `company_${now}@example.com`;
  const fanEmail = `fan_${now}@example.com`;

  // 1) Health (2)
  await hit("health", "GET", "/health", { expected: [200] });
  await hit("health-ready", "GET", "/health/ready", { expected: [200, 503] });

  // 2) Auth register/login setup
  const regPlayer = await hit("auth-register-player", "POST", "/v1/auth/register", {
    body: { email: playerEmail, password: "Password1", role: "PLAYER", gdprConsent: true },
    expected: [201],
  });
  const regCompany = await hit("auth-register-company", "POST", "/v1/auth/register", {
    body: { email: companyEmail, password: "Password1", role: "COMPANY", gdprConsent: true },
    expected: [201],
  });
  const regFan = await hit("auth-register-fan", "POST", "/v1/auth/register", {
    body: { email: fanEmail, password: "Password1", role: "FAN", gdprConsent: true },
    expected: [201],
  });

  const playerToken = getAccessToken(regPlayer);
  const companyToken = getAccessToken(regCompany);
  const fanToken = getAccessToken(regFan);

  const playerId = getUserId(regPlayer);
  const companyId = getUserId(regCompany);
  const fanId = getUserId(regFan);

  const loginPlayer = await hit("auth-login-player", "POST", "/v1/auth/login", {
    body: { email: playerEmail, password: "Password1" },
    expected: [200],
  });
  const refreshCookie = parseRefreshCookie(loginPlayer);

  await hit("auth-oauth-google", "GET", "/v1/auth/oauth/google", { expected: [302] });
  await hit("auth-oauth-callback", "GET", `/v1/auth/oauth/callback?email=oauth_${now}@example.com`, {
    expected: [200],
  });
  await hit("auth-refresh", "POST", "/v1/auth/refresh", {
    headers: refreshCookie ? { Cookie: refreshCookie } : {},
    expected: [200, 401, 403],
  });
  await hit("auth-logout", "POST", "/v1/auth/logout", { expected: [200] });

  await hit("auth-profile", "GET", "/v1/auth/profile", {
    headers: { Authorization: `Bearer ${playerToken}` },
    expected: [200],
  });
  await hit("auth-admin-stats", "GET", "/v1/auth/admin/stats", {
    headers: { Authorization: `Bearer ${playerToken}` },
    expected: [403],
  });
  await hit("auth-player-upload", "GET", "/v1/auth/player/upload", {
    headers: { Authorization: `Bearer ${playerToken}` },
    expected: [200],
  });

  // 3) Prepare profile state for downstream endpoints
  const upPlayerProfile = await hit("profile-update-player", "PUT", "/v1/profile/me", {
    headers: { Authorization: `Bearer ${playerToken}` },
    body: {
      firstName: "Smoke",
      lastName: "Player",
      position: "Midfielder",
      dominantFoot: "Right",
      height: 180,
      weight: 75,
      skills: ["passing", "vision"],
      playingStyle: "Creative",
      location: "Madrid",
    },
    expected: [200],
  });
  const playerProfileId = upPlayerProfile?.json?.data?.id || null;

  await hit("profile-update-company", "PUT", "/v1/profile/me", {
    headers: { Authorization: `Bearer ${companyToken}` },
    body: { name: "Smoke Company", industry: "Sports" },
    expected: [200],
  });

  // 4) Fitpass (4)
  const plansRes = await hit("fitpass-plans", "GET", "/v1/fitpass/plans", { expected: [200] });
  const planCode = plansRes?.json?.data?.[0]?.code;
  const planId = plansRes?.json?.data?.[0]?.id;

  const subscribe = await hit("fitpass-subscribe", "POST", "/v1/fitpass/subscribe", {
    headers: { "x-user-id": playerId },
    body: { planCode },
    expected: [201, 400],
  });

  await hit("fitpass-me-qr", "GET", "/v1/fitpass/me/qr", {
    headers: { "x-user-id": playerId },
    expected: [200, 404],
  });

  const qrValue = subscribe?.json?.data?.qr_value || subscribe?.json?.data?.qrValue || "BAD_QR";
  await hit("fitpass-checkin", "POST", "/v1/fitpass/checkin", {
    body: { qrValue, partnerId: "demo-partner" },
    expected: [200, 400],
  });

  // 5) Company (4)
  await hit("company-employees-list", "GET", "/v1/company/employees", {
    headers: { Authorization: `Bearer ${companyToken}` },
    expected: [200, 400],
  });
  await hit("company-employees-add", "POST", "/v1/company/employees", {
    headers: { Authorization: `Bearer ${companyToken}` },
    body: { email: fanEmail, planId },
    expected: [201, 400],
  });
  await hit("company-employees-remove", "DELETE", "/v1/company/employees/not-a-real-id", {
    headers: { Authorization: `Bearer ${companyToken}` },
    expected: [400],
  });
  await hit("company-stats", "GET", "/v1/company/stats", {
    headers: { Authorization: `Bearer ${companyToken}` },
    expected: [200, 400],
  });

  // 6) News (7)
  await hit("news-index", "GET", "/v1/news", { expected: [200] });
  const newsCreate = await hit("news-store", "POST", "/v1/news", {
    body: { title: `Smoke News ${now}`, content: "Smoke content", locale: "en" },
    expected: [201],
  });
  const newsId = newsCreate?.json?.data?.id || "00000000-0000-0000-0000-000000000000";
  await hit("news-show", "GET", `/v1/news/${newsId}`, { expected: [200, 404] });
  await hit("news-internal-ingest", "POST", "/v1/news/internal/ingest", {
    body: { articles: [{ title: `Ingested ${now}`, locale: "en" }] },
    expected: [200, 401],
  });
  await hit("news-internal-enqueue", "POST", "/v1/news/internal/enqueue", {
    body: { locales: ["en"] },
    expected: [200, 401],
  });
  await hit("news-internal-queue-status", "GET", "/v1/news/internal/queue/status", {
    expected: [200, 401],
  });
  await hit("news-internal-queue-retry", "POST", "/v1/news/internal/queue/retry", {
    expected: [200, 401],
  });

  // 7) Users (4)
  await hit("users-account", "GET", "/v1/users/account", {
    headers: { Authorization: `Bearer ${playerToken}` },
    expected: [200],
  });
  await hit("users-avatar-url", "GET", "/v1/users/avatar-url", {
    headers: { Authorization: `Bearer ${playerToken}` },
    expected: [200],
  });
  await hit("users-photos-update", "PUT", "/v1/users/photos", {
    headers: { Authorization: `Bearer ${playerToken}` },
    body: { profilePhoto: "https://cdn.example.com/p.jpg", coverPhoto: "https://cdn.example.com/c.jpg" },
    expected: [200],
  });

  // 8) Profile (8)
  await hit("profile-show", "GET", "/v1/profile", {
    headers: { Authorization: `Bearer ${playerToken}` },
    expected: [200],
  });
  await hit("profile-avatar-upload-url", "POST", "/v1/profile/me/avatar", {
    headers: { Authorization: `Bearer ${playerToken}` },
    body: { extension: "jpg" },
    expected: [200],
  });

  const addCareer = await hit("profile-career-add", "POST", "/v1/profile/me/career", {
    headers: { Authorization: `Bearer ${playerToken}` },
    body: {
      teamName: "Smoke FC",
      role: "Midfielder",
      startDate: new Date().toISOString(),
      description: "Smoke career entry",
    },
    expected: [201, 400],
  });
  const careerId = addCareer?.json?.data?.id || "not-a-real-id";

  await hit("profile-career-update", "PUT", `/v1/profile/me/career/${careerId}`, {
    headers: { Authorization: `Bearer ${playerToken}` },
    body: { description: "Updated description" },
    expected: [200, 400],
  });
  await hit("profile-career-delete", "DELETE", `/v1/profile/me/career/${careerId}`, {
    headers: { Authorization: `Bearer ${playerToken}` },
    expected: [200, 400],
  });

  const addAch = await hit("profile-achievement-add", "POST", "/v1/profile/me/achivements", {
    headers: { Authorization: `Bearer ${playerToken}` },
    body: { title: "Smoke Trophy", date: new Date().toISOString(), description: "Demo" },
    expected: [201, 400],
  });
  const achId = addAch?.json?.data?.id || "not-a-real-id";

  await hit("profile-achievement-delete", "DELETE", `/v1/profile/me/achivements/${achId}`, {
    headers: { Authorization: `Bearer ${playerToken}` },
    expected: [200, 400],
  });

  // 9) Social (8)
  await hit("social-follow", "POST", `/v1/social/follow/${companyId}`, {
    headers: { Authorization: `Bearer ${playerToken}` },
    expected: [201, 409, 400],
  });
  await hit("social-unfollow", "DELETE", `/v1/social/unfollow/${companyId}`, {
    headers: { Authorization: `Bearer ${playerToken}` },
    expected: [200, 404, 400],
  });
  await hit("social-followers", "GET", "/v1/social/followers", {
    headers: { Authorization: `Bearer ${playerToken}` },
    expected: [200],
  });
  await hit("social-following", "GET", "/v1/social/following", {
    headers: { Authorization: `Bearer ${playerToken}` },
    expected: [200],
  });
  await hit("social-feed", "GET", "/v1/social/feed", {
    headers: { Authorization: `Bearer ${playerToken}` },
    expected: [200],
  });

  await hit("social-shortlist-save", "POST", `/v1/social/shortlist/saved/${playerProfileId || playerId}`, {
    headers: { Authorization: `Bearer ${companyToken}` },
    expected: [201, 400, 409],
  });
  await hit("social-shortlist-remove", "DELETE", `/v1/social/shortlist/saved/${playerProfileId || playerId}`, {
    headers: { Authorization: `Bearer ${companyToken}` },
    expected: [200, 400, 404],
  });
  await hit("social-shortlist-index", "GET", "/v1/social/shortlist/saved", {
    headers: { Authorization: `Bearer ${companyToken}` },
    expected: [200],
  });

  // 10) Players (1)
  await hit("players-search", "GET", "/v1/players/search?q=Smoke", {
    headers: { Authorization: `Bearer ${playerToken}` },
    expected: [200],
  });

  // 11) Messages (5)
  await hit("messages-conversations", "GET", "/v1/messages/conversations", {
    headers: { Authorization: `Bearer ${playerToken}` },
    expected: [200],
  });
  await hit("messages-unread-count", "GET", "/v1/messages/unread-count", {
    headers: { Authorization: `Bearer ${playerToken}` },
    expected: [200],
  });
  await hit("messages-thread", "GET", `/v1/messages/thread/${companyId}`, {
    headers: { Authorization: `Bearer ${playerToken}` },
    expected: [200],
  });
  await hit("messages-send", "POST", `/v1/messages/send/${companyId}`, {
    headers: { Authorization: `Bearer ${playerToken}` },
    body: { content: "Smoke test message" },
    expected: [201, 400],
  });
  await hit("messages-read", "PUT", `/v1/messages/read/${companyId}`, {
    headers: { Authorization: `Bearer ${playerToken}` },
    expected: [200],
  });

  // 12) Users delete endpoint at the end (1)
  await hit("users-account-delete", "DELETE", "/v1/users/account/delete", {
    headers: { Authorization: `Bearer ${fanToken}` },
    expected: [200],
  });

  const failed = results.filter((r) => !r.ok);
  const passed = results.length - failed.length;

  console.log("\n=== All Endpoints Smoke Test Summary ===");
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Total endpoints tested: ${results.length}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed.length}`);

  console.log("\n=== Endpoint Results ===");
  for (const r of results) {
    const mark = r.ok ? "PASS" : "FAIL";
    console.log(`${mark} | ${r.method.padEnd(6)} ${r.path.padEnd(42)} -> ${String(r.status).padEnd(3)} expected [${r.expected.join(",")}]`);
  }

  if (failed.length > 0) {
    console.log("\n=== Failures Detail ===");
    for (const f of failed) {
      console.log(`\n${f.method} ${f.path}`);
      console.log(`Status: ${f.status} expected [${f.expected.join(",")}]`);
      if (f.error) console.log(`Error: ${f.error}`);
      if (f.text) console.log(`Body: ${f.text.slice(0, 600)}`);
    }
    process.exitCode = 1;
  }
}

main().catch((e) => {
  console.error("Smoke script crashed:", e);
  process.exit(1);
});
