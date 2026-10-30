import '../lib/env.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'portfolio-saas-dev-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export function signToken(user) {
  return jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : null;

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = { id: Number(payload.sub), email: payload.email };
    next();
  } catch {
    return res.status(401).json({ error: 'Session expired, please sign in again' });
  }
}
