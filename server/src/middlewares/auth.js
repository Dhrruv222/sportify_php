const jwt = require('jsonwebtoken');

function readBearerToken(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  return authHeader.slice('Bearer '.length).trim();
}

function readUserFromToken(req) {
  const token = readBearerToken(req);
  if (!token) return null;

  const secret = process.env.JWT_SECRET;
  if (!secret) return null;

  try {
    const payload = jwt.verify(token, secret);
    return {
      userId: payload.userId,
      role: payload.role,
    };
  } catch {
    return null;
  }
}

function readUserFromHeaders(req) {
  const userId = req.headers['x-user-id'];
  if (!userId) return null;

  return {
    userId,
    role: req.headers['x-user-role'],
  };
}

function requireAuth(req, res, next) {
  const tokenUser = readUserFromToken(req);
  const headerUser = readUserFromHeaders(req);
  const auth = tokenUser || headerUser;

  if (!auth || !auth.userId) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required',
    });
  }

  req.auth = auth;
  return next();
}

function requireRoles(...roles) {
  const allowed = new Set(roles);

  return (req, res, next) => {
    const role = req.auth?.role;
    if (!role || !allowed.has(role)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions',
      });
    }

    return next();
  };
}

function requireInternalApiKey(req, res, next) {
  const requiredKey = process.env.INTERNAL_API_KEY;
  if (!requiredKey) {
    return next();
  }

  if (req.headers['x-internal-api-key'] !== requiredKey) {
    return res.status(401).json({
      success: false,
      error: 'Invalid internal API key',
    });
  }

  return next();
}

module.exports = {
  requireAuth,
  requireRoles,
  requireInternalApiKey,
};