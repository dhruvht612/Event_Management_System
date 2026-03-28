const jwt = require('jsonwebtoken');
const { getDb } = require('../db/init');

function getSecret() {
  const s = process.env.JWT_SECRET;
  if (!s && process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET is required in production');
  }
  return s || 'dev-only-secret-change-me';
}

function signToken(payload) {
  return jwt.sign(payload, getSecret(), {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

function verifyToken(token) {
  return jwt.verify(token, getSecret());
}

function authOptional(req, res, next) {
  const h = req.headers.authorization;
  if (!h || !h.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }
  try {
    const decoded = verifyToken(h.slice(7));
    const row = getDb()
      .prepare(
        'SELECT id, email, name, role, membership_tier, organization FROM users WHERE id = ?'
      )
      .get(decoded.sub);
    req.user = row || null;
  } catch {
    req.user = null;
  }
  next();
}

function authRequired(req, res, next) {
  const h = req.headers.authorization;
  if (!h || !h.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const decoded = verifyToken(h.slice(7));
    const row = getDb()
      .prepare(
        'SELECT id, email, name, role, membership_tier, organization FROM users WHERE id = ?'
      )
      .get(decoded.sub);
    if (!row) return res.status(401).json({ error: 'Invalid user' });
    req.user = row;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

function requireRoles(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
}

module.exports = {
  signToken,
  verifyToken,
  authOptional,
  authRequired,
  requireRoles,
};
