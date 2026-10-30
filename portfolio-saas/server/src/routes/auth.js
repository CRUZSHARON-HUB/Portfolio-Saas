import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { all, get, run, transaction } from '../db/index.js';
import { signToken, requireAuth } from '../middleware/auth.js';
import { isEmail, requiredText, text, uniqueSlug } from '../lib/validate.js';

const router = Router();

function publicUser(user) {
  return {
    id: user.id,
    email: user.email,
    fullName: user.full_name,
    headline: user.headline,
    avatarHue: user.avatar_hue,
    plan: user.plan,
    createdAt: user.created_at,
  };
}

router.post('/register', (req, res) => {
  const email = text(req.body?.email, { max: 160 }).toLowerCase();
  const password = String(req.body?.password ?? '');
  const fullName = requiredText(req.body?.fullName, { max: 120 });

  if (!isEmail(email)) {
    return res.status(400).json({ error: 'Enter a valid email address' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' });
  }
  if (!fullName) {
    return res.status(400).json({ error: 'Full name is required' });
  }
  if (get('SELECT id FROM users WHERE email = ?', email)) {
    return res.status(409).json({ error: 'An account with that email already exists' });
  }

  const passwordHash = bcrypt.hashSync(password, 10);

  const user = transaction(() => {
    const result = run(
      `INSERT INTO users (email, password_hash, full_name, headline, avatar_hue, plan)
       VALUES (?, ?, ?, ?, ?, 'free')`,
      email,
      passwordHash,
      fullName,
      text(req.body?.headline, { max: 160 }),
      Math.floor(Math.random() * 360),
    );

    const slug = uniqueSlug(`${fullName}-portfolio`, (candidate) =>
      Boolean(get('SELECT id FROM portfolios WHERE slug = ?', candidate))
    );

    run(
      `INSERT INTO portfolios (user_id, slug, title, tagline, about, accent, template)
       VALUES (?, ?, ?, ?, ?, 'violet', 'nebula')`,
      result.lastInsertRowid,
      slug,
      `${fullName}'s Portfolio`,
      'Crafting digital products people love to use.',
      'Tell the world what you build.',
    );

    return get('SELECT * FROM users WHERE id = ?', result.lastInsertRowid);
  });

  return res.status(201).json({ token: signToken(user), user: publicUser(user) });
});

router.post('/login', (req, res) => {
  const email = text(req.body?.email, { max: 160 }).toLowerCase();
  const password = String(req.body?.password ?? '');

  const user = get('SELECT * FROM users WHERE email = ?', email);
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'Incorrect email or password' });
  }

  return res.json({ token: signToken(user), user: publicUser(user) });
});

router.get('/me', requireAuth, (req, res) => {
  const user = get('SELECT * FROM users WHERE id = ?', req.user.id);
  if (!user) return res.status(404).json({ error: 'Account not found' });

  const plan = get('SELECT * FROM plans WHERE code = ?', user.plan);
  return res.json({ user: publicUser(user), plan: plan ?? null });
});

router.patch('/me', requireAuth, (req, res) => {
  const fullName = requiredText(req.body?.fullName ?? '', { max: 120 });
  if (!fullName) return res.status(400).json({ error: 'Full name cannot be empty' });

  run(
    'UPDATE users SET full_name = ?, headline = ?, avatar_hue = ? WHERE id = ?',
    fullName,
    text(req.body?.headline, { max: 160 }),
    Math.max(0, Math.min(359, Number(req.body?.avatarHue) || 210)),
    req.user.id
  );

  const user = get('SELECT * FROM users WHERE id = ?', req.user.id);
  return res.json({ user: publicUser(user) });
});

router.get('/plans', (_req, res) => {
  return res.json({ plans: all('SELECT * FROM plans ORDER BY price_monthly ASC') });
});

export default router;
