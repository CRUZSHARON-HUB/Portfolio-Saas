import { Router } from 'express';
import { all, get, run } from '../db/index.js';
import { isEmail, parseJsonObject, text } from '../lib/validate.js';

const router = Router();

function detectDevice(userAgent = '') {
  const ua = userAgent.toLowerCase();
  if (/mobile|android|iphone/.test(ua)) return 'mobile';
  if (/ipad|tablet/.test(ua)) return 'tablet';
  return 'desktop';
}

function shapePublicPortfolio(row) {
  return {
    slug: row.slug,
    title: row.title,
    tagline: row.tagline,
    about: row.about,
    template: row.template,
    accent: row.accent,
    location: row.location,
    email: row.email,
    phone: row.phone,
    resumeUrl: row.resume_url,
    socials: parseJsonObject(row.socials),
    views: row.views,
    updatedAt: row.updated_at,
  };
}

router.get('/directory', (_req, res) => {
  const rows = all(
    `SELECT p.slug, p.title, p.tagline, p.template, p.accent, p.views,
            u.full_name AS owner_name
       FROM portfolios p
       JOIN users u ON u.id = p.user_id
      WHERE p.published = 1
      ORDER BY p.views DESC
      LIMIT 24`
  );

  return res.json({
    portfolios: rows.map((row) => ({
      slug: row.slug,
      title: row.title,
      tagline: row.tagline,
      template: row.template,
      accent: row.accent,
      views: row.views,
      ownerName: row.owner_name,
    })),
  });
});

router.post('/:slug/contact', (req, res) => {
  const portfolio = get('SELECT * FROM portfolios WHERE slug = ?', req.params.slug);
  if (!portfolio || !portfolio.published) {
    return res.status(404).json({ error: 'Portfolio not found' });
  }

  const name = text(req.body?.name, { max: 120 });
  const email = text(req.body?.email, { max: 160 });
  const message = text(req.body?.message, { max: 4000 });

  if (!name || !message) {
    return res.status(400).json({ error: 'Name and message are required' });
  }
  if (email && !isEmail(email)) {
    return res.status(400).json({ error: 'Enter a valid email address' });
  }

  run(
    'INSERT INTO inquiries (portfolio_id, name, email, message) VALUES (?, ?, ?, ?)',
    portfolio.id,
    name,
    email,
    message
  );

  return res.status(201).json({ ok: true, message: 'Thanks! Your message was delivered.' });
});

router.get('/:slug', (req, res) => {
  const portfolio = get('SELECT * FROM portfolios WHERE slug = ?', req.params.slug);
  if (!portfolio || !portfolio.published) {
    return res.status(404).json({ error: 'Portfolio not found or unpublished' });
  }

  const owner = get('SELECT full_name, headline FROM users WHERE id = ?', portfolio.user_id);

  run(
    'UPDATE portfolios SET views = views + 1 WHERE id = ?',
    portfolio.id
  );
  run(
    'INSERT INTO views (portfolio_id, path, referrer, device) VALUES (?, ?, ?, ?)',
    portfolio.id,
    text(req.query?.path, { max: 200 }) || '/',
    text(req.headers.referer, { max: 300 }),
    detectDevice(req.headers['user-agent'])
  );

  const projects = all(
    'SELECT * FROM projects WHERE portfolio_id = ? ORDER BY sort_order ASC, id ASC',
    portfolio.id
  );
  const skills = all(
    'SELECT * FROM skills WHERE portfolio_id = ? ORDER BY sort_order ASC, id ASC',
    portfolio.id
  );
  const experiences = all(
    'SELECT * FROM experiences WHERE portfolio_id = ? ORDER BY sort_order ASC, id ASC',
    portfolio.id
  );

  return res.json({
    portfolio: { ...shapePublicPortfolio(portfolio), views: portfolio.views + 1 },
    owner: { name: owner?.full_name ?? '', headline: owner?.headline ?? '' },
    projects: projects.map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      tech: row.tech,
      imageUrl: row.image_url,
      repoUrl: row.repo_url,
      liveUrl: row.live_url,
      featured: Boolean(row.featured),
    })),
    skills: skills.map((row) => ({
      id: row.id,
      name: row.name,
      category: row.category,
      level: row.level,
    })),
    experiences: experiences.map((row) => ({
      id: row.id,
      role: row.role,
      company: row.company,
      startDate: row.start_date,
      endDate: row.end_date,
      description: row.description,
    })),
  });
});

export default router;
