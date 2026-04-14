const test = require('node:test');
const assert = require('node:assert/strict');

const { validateEnv } = require('./env');

function withEnv(tempValues, run) {
  const snapshot = {
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL,
    DIRECT_URL: process.env.DIRECT_URL,
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
    REDIS_URL: process.env.REDIS_URL,
  };

  const keys = Object.keys(tempValues);
  for (const key of keys) {
    const value = tempValues[key];
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }

  try {
    run();
  } finally {
    for (const [key, value] of Object.entries(snapshot)) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  }
}

test('validateEnv fails when no database URL is configured', () => {
  withEnv({ DATABASE_URL: undefined, DIRECT_URL: undefined }, () => {
    const result = validateEnv();
    assert.equal(result.ok, false);
    assert.equal(result.errors.includes('Set DATABASE_URL or DIRECT_URL'), true);
  });
});

test('validateEnv requires JWT secrets in production', () => {
  withEnv({
    NODE_ENV: 'production',
    DATABASE_URL: 'postgres://example',
    JWT_SECRET: undefined,
    JWT_REFRESH_SECRET: undefined,
  }, () => {
    const result = validateEnv();
    assert.equal(result.ok, false);
    assert.equal(result.errors.includes('Set JWT_SECRET in production'), true);
    assert.equal(result.errors.includes('Set JWT_REFRESH_SECRET in production'), true);
  });
});

test('validateEnv passes in development with warnings for optional values', () => {
  withEnv({
    NODE_ENV: 'development',
    DATABASE_URL: 'postgres://example',
    JWT_SECRET: undefined,
    JWT_REFRESH_SECRET: undefined,
    REDIS_URL: undefined,
  }, () => {
    const result = validateEnv();
    assert.equal(result.ok, true);
    assert.equal(result.warnings.length >= 1, true);
  });
});