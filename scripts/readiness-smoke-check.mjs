#!/usr/bin/env node

const args = process.argv.slice(2);
const baseUrlArgIndex = args.findIndex((arg) => arg === '--base-url');
const baseUrl = baseUrlArgIndex >= 0 && args[baseUrlArgIndex + 1]
  ? args[baseUrlArgIndex + 1]
  : process.env.SMOKE_BASE_URL || 'http://localhost:3000';

async function fetchJson(url) {
  const response = await fetch(url);
  let body;

  try {
    body = await response.json();
  } catch {
    body = null;
  }

  return { response, body };
}

function fail(message, details) {
  console.error(`❌ ${message}`);
  if (details) {
    console.error(details);
  }
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

async function run() {
  console.log(`Running readiness smoke checks against ${baseUrl}`);

  const healthUrl = `${baseUrl}/api/health`;
  const readyUrl = `${baseUrl}/api/health/ready`;

  const health = await fetchJson(healthUrl);
  if (!health.response.ok) {
    fail(`/api/health returned ${health.response.status}`, health.body);
  }

  if (health.body?.data?.status !== 'ok') {
    fail('/api/health did not return status=ok', health.body);
  }

  pass('/api/health is OK');

  const ready = await fetchJson(readyUrl);
  if (![200, 503].includes(ready.response.status)) {
    fail(`/api/health/ready returned unexpected status ${ready.response.status}`, ready.body);
  }

  if (!ready.body?.data?.checks) {
    fail('/api/health/ready missing checks payload', ready.body);
  }

  const queueMode = ready.body.data?.checks?.queue?.mode;
  if (!['bullmq', 'inline'].includes(queueMode)) {
    fail('/api/health/ready queue mode is invalid', ready.body);
  }

  const envValidation = ready.body.data?.checks?.envValidation;
  if (!envValidation || typeof envValidation.ok !== 'boolean') {
    fail('/api/health/ready envValidation shape is invalid', ready.body);
  }

  pass(`/api/health/ready is valid (${ready.response.status})`);
  console.log('Smoke checks completed successfully.');
}

run().catch((error) => {
  fail('Smoke check failed with runtime error', error?.message || String(error));
});
