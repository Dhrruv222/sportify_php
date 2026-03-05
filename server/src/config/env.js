function getNodeEnv() {
  return process.env.NODE_ENV || 'development';
}

function validateEnv() {
  const errors = [];
  const warnings = [];
  const nodeEnv = getNodeEnv();

  const hasDbUrl = Boolean(process.env.DATABASE_URL || process.env.DIRECT_URL);
  if (!hasDbUrl) {
    errors.push('Set DATABASE_URL or DIRECT_URL');
  }

  if (nodeEnv === 'production') {
    if (!process.env.JWT_SECRET) {
      errors.push('Set JWT_SECRET in production');
    }

    if (!process.env.JWT_REFRESH_SECRET) {
      errors.push('Set JWT_REFRESH_SECRET in production');
    }
  } else {
    if (!process.env.JWT_SECRET) {
      warnings.push('JWT_SECRET is not set; bearer token middleware will not validate tokens');
    }

    if (!process.env.JWT_REFRESH_SECRET) {
      warnings.push('JWT_REFRESH_SECRET is not set; refresh-token flow may fail');
    }
  }

  if (!process.env.REDIS_URL) {
    warnings.push('REDIS_URL is not set; news queue will run in inline fallback mode');
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
    nodeEnv,
  };
}

module.exports = {
  getNodeEnv,
  validateEnv,
};