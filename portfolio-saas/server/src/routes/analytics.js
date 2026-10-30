import { Router } from 'express';
import { all, get } from '../db/index.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

router.get('/:id/analytics', (req, res) => {
  const portfolio = get(
    'SELECT * FROM portfolios WHERE id = ? AND user_id = ?',
    req.params.id,
    req.user.id
  );
  if (!portfolio) return res.status(404).json({ error: 'Portfolio not found' });

  const totals = get(
    `SELECT
        (SELECT COUNT(*) FROM views WHERE portfolio_id = ?)                AS total_views,
        (SELECT COUNT(*) FROM views WHERE portfolio_id = ?
           AND viewed_at >= datetime('now', '-7 days'))                   AS views_7d,
        (SELECT COUNT(*) FROM views WHERE portfolio_id = ?
           AND viewed_at >= datetime('now', '-30 days'))                  AS views_30d,
        (SELECT COUNT(*) FROM views WHERE portfolio_id = ?
           AND viewed_at >= datetime('now', '-1 day'))                   AS views_24h,
        (SELECT COUNT(DISTINCT referrer) FROM views WHERE portfolio_id = ?) AS referrers,
        (SELECT COUNT(*) FROM inquiries WHERE portfolio_id = ?)           AS inquiries`,
    portfolio.id,
    portfolio.id,
    portfolio.id,
    portfolio.id,
    portfolio.id,
    portfolio.id
  );

  const daily = all(
    `SELECT date(viewed_at) AS day, COUNT(*) AS views
       FROM views
      WHERE portfolio_id = ?
        AND viewed_at >= datetime('now', '-30 days')
      GROUP BY day
      ORDER BY day ASC`,
    portfolio.id
  );

  const referrers = all(
    `SELECT CASE WHEN referrer = '' THEN 'Direct' ELSE referrer END AS source, COUNT(*) AS views
       FROM views
      WHERE portfolio_id = ?
      GROUP BY source
      ORDER BY views DESC
      LIMIT 6`,
    portfolio.id
  );

  const devices = all(
    `SELECT device, COUNT(*) AS views
       FROM views
      WHERE portfolio_id = ?
      GROUP BY device
      ORDER BY views DESC`,
    portfolio.id
  );

  const topProjects = all(
    `SELECT title, featured FROM projects WHERE portfolio_id = ? ORDER BY sort_order ASC LIMIT 5`,
    portfolio.id
  );

  const recentViews = all(
    `SELECT path, referrer, device, viewed_at
       FROM views
      WHERE portfolio_id = ?
      ORDER BY viewed_at DESC
      LIMIT 12`,
    portfolio.id
  );

  return res.json({
    portfolioId: portfolio.id,
    slug: portfolio.slug,
    published: Boolean(portfolio.published),
    totals: {
      totalViews: totals.total_views,
      views7d: totals.views_7d,
      views30d: totals.views_30d,
      views24h: totals.views_24h,
      referrers: totals.referrers,
      inquiries: totals.inquiries,
    },
    daily,
    referrers,
    devices,
    topProjects,
    recentViews,
  });
});

router.get('/:id/inquiries', (req, res) => {
  const portfolio = get(
    'SELECT id FROM portfolios WHERE id = ? AND user_id = ?',
    req.params.id,
    req.user.id
  );
  if (!portfolio) return res.status(404).json({ error: 'Portfolio not found' });

  const inquiries = all(
    'SELECT * FROM inquiries WHERE portfolio_id = ? ORDER BY created_at DESC',
    portfolio.id
  );

  return res.json({
    inquiries: inquiries.map((row) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      message: row.message,
      isRead: Boolean(row.is_read),
      createdAt: row.created_at,
    })),
  });
});

router.post('/:id/inquiries/:inquiryId/read', (req, res) => {
  const portfolio = get(
    'SELECT id FROM portfolios WHERE id = ? AND user_id = ?',
    req.params.id,
    req.user.id
  );
  if (!portfolio) return res.status(404).json({ error: 'Portfolio not found' });

  const inquiry = get(
    'SELECT * FROM inquiries WHERE id = ? AND portfolio_id = ?',
    req.params.inquiryId,
    portfolio.id
  );
  if (!inquiry) return res.status(404).json({ error: 'Inquiry not found' });

  return res.json({ ok: true, inquiryId: inquiry.id, isRead: true });
});

export default router;
