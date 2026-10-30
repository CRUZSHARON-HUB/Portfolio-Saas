import { Router } from 'express';
import { all, get, run } from '../db/index.js';
import { requireAuth } from '../middleware/auth.js';
import { bool, clamp, int, parseJsonObject, slugify, text, uniqueSlug } from '../lib/validate.js';

const router = Router();

router.use(requireAuth);

const TEMPLATES = ['nebula', 'prism', 'atlas', 'monolith'];
const ACCENTS = ['violet', 'cyan', 'amber', 'emerald', 'rose'];

function planFor(userId) {
  const user = get('SELECT plan FROM users WHERE id = ?', userId);
  return get('SELECT * FROM plans WHERE code = ?', user?.plan ?? 'free') ?? {
    code: 'free',
    max_portfolios: 1,
    max_projects: 6,
  };
}

/** Resolve a portfolio the current user owns, or null. */
function ownedPortfolio(userId, portfolioId) {
  return get('SELECT * FROM portfolios WHERE id = ? AND user_id = ?', portfolioId, userId);
}

function withCounts(portfolio) {
  const projectCount = get(
    'SELECT COUNT(*) AS n FROM projects WHERE portfolio_id = ?',
    portfolio.id
  ).n;
  const skillCount = get('SELECT COUNT(*) AS n FROM skills WHERE portfolio_id = ?', portfolio.id).n;
  const experienceCount = get(
    'SELECT COUNT(*) AS n FROM experiences WHERE portfolio_id = ?',
    portfolio.id
  ).n;
  return { ...portfolio, projectCount, skillCount, experienceCount };
}

function shapePortfolio(portfolio) {
  return {
    id: portfolio.id,
    slug: portfolio.slug,
    title: portfolio.title,
    tagline: portfolio.tagline,
    about: portfolio.about,
    template: portfolio.template,
    accent: portfolio.accent,
    location: portfolio.location,
    email: portfolio.email,
    phone: portfolio.phone,
    resumeUrl: portfolio.resume_url,
    socials: parseJsonObject(portfolio.socials),
    published: Boolean(portfolio.published),
    views: portfolio.views,
    createdAt: portfolio.created_at,
    updatedAt: portfolio.updated_at,
  };
}

function shapeProject(row) {
  return {
    id: row.id,
    portfolioId: row.portfolio_id,
    title: row.title,
    description: row.description,
    tech: row.tech,
    imageUrl: row.image_url,
    repoUrl: row.repo_url,
    liveUrl: row.live_url,
    featured: Boolean(row.featured),
    sortOrder: row.sort_order,
  };
}

function shapeSkill(row) {
  return {
    id: row.id,
    portfolioId: row.portfolio_id,
    name: row.name,
    category: row.category,
    level: row.level,
    sortOrder: row.sort_order,
  };
}

function shapeExperience(row) {
  return {
    id: row.id,
    portfolioId: row.portfolio_id,
    role: row.role,
    company: row.company,
    startDate: row.start_date,
    endDate: row.end_date,
    description: row.description,
    sortOrder: row.sort_order,
  };
}

/* ------------------------------------------------------------------ *
 * Portfolio collection
 * ------------------------------------------------------------------ */

router.get('/', (req, res) => {
  const rows = all(
    'SELECT * FROM portfolios WHERE user_id = ? ORDER BY updated_at DESC',
    req.user.id
  );
  return res.json({ portfolios: rows.map((row) => withCounts(row)), plan: planFor(req.user.id) });
});

router.post('/', (req, res) => {
  const plan = planFor(req.user.id);
  const owned = get('SELECT COUNT(*) AS n FROM portfolios WHERE user_id = ?', req.user.id).n;

  if (owned >= plan.max_portfolios) {
    return res.status(403).json({
      error: `The ${plan.name} plan allows ${plan.max_portfolios} portfolio(s). Upgrade to add more.`,
    });
  }

  const title = text(req.body?.title, { max: 120 }) || 'Untitled Portfolio';
  const slug = uniqueSlug(
    text(req.body?.slug, { max: 60 }) || `${title}-${req.user.id}`,
    (candidate) => Boolean(get('SELECT id FROM portfolios WHERE slug = ?', candidate))
  );

  const result = run(
    `INSERT INTO portfolios (user_id, slug, title, tagline, about, template, accent)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    req.user.id,
    slug,
    title,
    text(req.body?.tagline, { max: 220 }),
    text(req.body?.about),
    TEMPLATES.includes(req.body?.template) ? req.body.template : 'nebula',
    ACCENTS.includes(req.body?.accent) ? req.body.accent : 'violet'
  );

  const portfolio = get('SELECT * FROM portfolios WHERE id = ?', result.lastInsertRowid);
  return res.status(201).json({ portfolio: shapePortfolio(portfolio) });
});

/* ------------------------------------------------------------------ *
 * Single portfolio
 * ------------------------------------------------------------------ */

router.get('/:id', (req, res) => {
  const portfolio = ownedPortfolio(req.user.id, req.params.id);
  if (!portfolio) return res.status(404).json({ error: 'Portfolio not found' });

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
    portfolio: shapePortfolio(portfolio),
    projects: projects.map(shapeProject),
    skills: skills.map(shapeSkill),
    experiences: experiences.map(shapeExperience),
    plan: planFor(req.user.id),
  });
});

router.patch('/:id', (req, res) => {
  const portfolio = ownedPortfolio(req.user.id, req.params.id);
  if (!portfolio) return res.status(404).json({ error: 'Portfolio not found' });

  const fields = {
    title: text(req.body?.title, { max: 120 }) || portfolio.title,
    tagline: req.body?.tagline !== undefined ? text(req.body?.tagline, { max: 220 }) : portfolio.tagline,
    about: req.body?.about !== undefined ? text(req.body?.about) : portfolio.about,
    location: req.body?.location !== undefined ? text(req.body?.location, { max: 120 }) : portfolio.location,
    email: req.body?.email !== undefined ? text(req.body?.email, { max: 160 }) : portfolio.email,
    phone: req.body?.phone !== undefined ? text(req.body?.phone, { max: 40 }) : portfolio.phone,
    resume_url:
      req.body?.resumeUrl !== undefined ? text(req.body?.resumeUrl, { max: 300 }) : portfolio.resume_url,
    template: TEMPLATES.includes(req.body?.template) ? req.body.template : portfolio.template,
    accent: ACCENTS.includes(req.body?.accent) ? req.body.accent : portfolio.accent,
    socials:
      req.body?.socials !== undefined
        ? JSON.stringify(req.body.socials ?? {})
        : portfolio.socials,
  };

  if (req.body?.slug !== undefined) {
    const requested = slugify(req.body.slug);
    if (requested && requested !== portfolio.slug) {
      const taken = get('SELECT id FROM portfolios WHERE slug = ? AND id != ?', requested, portfolio.id);
      if (taken) return res.status(409).json({ error: 'That URL is already taken' });
      fields.slug = requested;
    }
  }

  run(
    `UPDATE portfolios
        SET title = ?, tagline = ?, about = ?, location = ?, email = ?, phone = ?,
            resume_url = ?, template = ?, accent = ?, socials = ?, slug = ?,
            updated_at = datetime('now')
      WHERE id = ?`,
    fields.title,
    fields.tagline,
    fields.about,
    fields.location,
    fields.email,
    fields.phone,
    fields.resume_url,
    fields.template,
    fields.accent,
    fields.socials,
    fields.slug ?? portfolio.slug,
    portfolio.id
  );

  const updated = get('SELECT * FROM portfolios WHERE id = ?', portfolio.id);
  return res.json({ portfolio: shapePortfolio(updated) });
});

router.delete('/:id', (req, res) => {
  const portfolio = ownedPortfolio(req.user.id, req.params.id);
  if (!portfolio) return res.status(404).json({ error: 'Portfolio not found' });

  run('DELETE FROM portfolios WHERE id = ?', portfolio.id);
  return res.json({ ok: true, deleted: portfolio.id });
});

router.post('/:id/publish', (req, res) => {
  const portfolio = ownedPortfolio(req.user.id, req.params.id);
  if (!portfolio) return res.status(404).json({ error: 'Portfolio not found' });

  const published = bool(req.body?.published);
  run(
    'UPDATE portfolios SET published = ?, updated_at = datetime(\'now\') WHERE id = ?',
    published,
    portfolio.id
  );

  return res.json({ portfolio: shapePortfolio(get('SELECT * FROM portfolios WHERE id = ?', portfolio.id)) });
});

/* ------------------------------------------------------------------ *
 * Projects
 * ------------------------------------------------------------------ */

router.post('/:id/projects', (req, res) => {
  const portfolio = ownedPortfolio(req.user.id, req.params.id);
  if (!portfolio) return res.status(404).json({ error: 'Portfolio not found' });

  const plan = planFor(req.user.id);
  const count = get('SELECT COUNT(*) AS n FROM projects WHERE portfolio_id = ?', portfolio.id).n;
  if (count >= plan.max_projects) {
    return res.status(403).json({
      error: `The ${plan.name} plan allows ${plan.max_projects} projects. Upgrade for more.`,
    });
  }

  const title = text(req.body?.title, { max: 140 });
  if (!title) return res.status(400).json({ error: 'Project title is required' });

  const nextOrder = get(
    'SELECT COALESCE(MAX(sort_order), 0) + 1 AS n FROM projects WHERE portfolio_id = ?',
    portfolio.id
  ).n;

  const result = run(
    `INSERT INTO projects
       (portfolio_id, title, description, tech, image_url, repo_url, live_url, featured, sort_order)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    portfolio.id,
    title,
    text(req.body?.description),
    text(req.body?.tech, { max: 300 }),
    text(req.body?.imageUrl, { max: 400 }),
    text(req.body?.repoUrl, { max: 400 }),
    text(req.body?.liveUrl, { max: 400 }),
    bool(req.body?.featured),
    int(req.body?.sortOrder, nextOrder)
  );

  const row = get('SELECT * FROM projects WHERE id = ?', result.lastInsertRowid);
  return res.status(201).json({ project: shapeProject(row) });
});

router.patch('/:id/projects/:projectId', (req, res) => {
  const portfolio = ownedPortfolio(req.user.id, req.params.id);
  if (!portfolio) return res.status(404).json({ error: 'Portfolio not found' });

  const project = get(
    'SELECT * FROM projects WHERE id = ? AND portfolio_id = ?',
    req.params.projectId,
    portfolio.id
  );
  if (!project) return res.status(404).json({ error: 'Project not found' });

  run(
    `UPDATE projects
        SET title = ?, description = ?, tech = ?, image_url = ?, repo_url = ?,
            live_url = ?, featured = ?, sort_order = ?
      WHERE id = ?`,
    req.body?.title !== undefined ? text(req.body.title, { max: 140 }) || project.title : project.title,
    req.body?.description !== undefined ? text(req.body.description) : project.description,
    req.body?.tech !== undefined ? text(req.body.tech, { max: 300 }) : project.tech,
    req.body?.imageUrl !== undefined ? text(req.body.imageUrl, { max: 400 }) : project.image_url,
    req.body?.repoUrl !== undefined ? text(req.body.repoUrl, { max: 400 }) : project.repo_url,
    req.body?.liveUrl !== undefined ? text(req.body.liveUrl, { max: 400 }) : project.live_url,
    req.body?.featured !== undefined ? bool(req.body.featured) : project.featured,
    req.body?.sortOrder !== undefined ? int(req.body.sortOrder, project.sort_order) : project.sort_order,
    project.id
  );

  return res.json({ project: shapeProject(get('SELECT * FROM projects WHERE id = ?', project.id)) });
});

router.delete('/:id/projects/:projectId', (req, res) => {
  const portfolio = ownedPortfolio(req.user.id, req.params.id);
  if (!portfolio) return res.status(404).json({ error: 'Portfolio not found' });

  const result = run(
    'DELETE FROM projects WHERE id = ? AND portfolio_id = ?',
    req.params.projectId,
    portfolio.id
  );
  if (!result.changes) return res.status(404).json({ error: 'Project not found' });

  return res.json({ ok: true });
});

/* ------------------------------------------------------------------ *
 * Skills
 * ------------------------------------------------------------------ */

router.post('/:id/skills', (req, res) => {
  const portfolio = ownedPortfolio(req.user.id, req.params.id);
  if (!portfolio) return res.status(404).json({ error: 'Portfolio not found' });

  const name = text(req.body?.name, { max: 60 });
  if (!name) return res.status(400).json({ error: 'Skill name is required' });

  const nextOrder = get(
    'SELECT COALESCE(MAX(sort_order), 0) + 1 AS n FROM skills WHERE portfolio_id = ?',
    portfolio.id
  ).n;

  const result = run(
    'INSERT INTO skills (portfolio_id, name, category, level, sort_order) VALUES (?, ?, ?, ?, ?)',
    portfolio.id,
    name,
    text(req.body?.category, { max: 40 }) || 'Core',
    clamp(req.body?.level, 0, 100, 80),
    int(req.body?.sortOrder, nextOrder)
  );

  return res.status(201).json({ skill: shapeSkill(get('SELECT * FROM skills WHERE id = ?', result.lastInsertRowid)) });
});

router.patch('/:id/skills/:skillId', (req, res) => {
  const portfolio = ownedPortfolio(req.user.id, req.params.id);
  if (!portfolio) return res.status(404).json({ error: 'Portfolio not found' });

  const skill = get('SELECT * FROM skills WHERE id = ? AND portfolio_id = ?', req.params.skillId, portfolio.id);
  if (!skill) return res.status(404).json({ error: 'Skill not found' });

  run(
    'UPDATE skills SET name = ?, category = ?, level = ?, sort_order = ? WHERE id = ?',
    req.body?.name !== undefined ? text(req.body.name, { max: 60 }) || skill.name : skill.name,
    req.body?.category !== undefined ? text(req.body.category, { max: 40 }) || skill.category : skill.category,
    req.body?.level !== undefined ? clamp(req.body.level, 0, 100, skill.level) : skill.level,
    req.body?.sortOrder !== undefined ? int(req.body.sortOrder, skill.sort_order) : skill.sort_order,
    skill.id
  );

  return res.json({ skill: shapeSkill(get('SELECT * FROM skills WHERE id = ?', skill.id)) });
});

router.delete('/:id/skills/:skillId', (req, res) => {
  const portfolio = ownedPortfolio(req.user.id, req.params.id);
  if (!portfolio) return res.status(404).json({ error: 'Portfolio not found' });

  const result = run(
    'DELETE FROM skills WHERE id = ? AND portfolio_id = ?',
    req.params.skillId,
    portfolio.id
  );
  if (!result.changes) return res.status(404).json({ error: 'Skill not found' });

  return res.json({ ok: true });
});

/* ------------------------------------------------------------------ *
 * Experiences
 * ------------------------------------------------------------------ */

router.post('/:id/experiences', (req, res) => {
  const portfolio = ownedPortfolio(req.user.id, req.params.id);
  if (!portfolio) return res.status(404).json({ error: 'Portfolio not found' });

  const role = text(req.body?.role, { max: 140 });
  const company = text(req.body?.company, { max: 140 });
  if (!role || !company) {
    return res.status(400).json({ error: 'Role and company are required' });
  }

  const nextOrder = get(
    'SELECT COALESCE(MAX(sort_order), 0) + 1 AS n FROM experiences WHERE portfolio_id = ?',
    portfolio.id
  ).n;

  const result = run(
    `INSERT INTO experiences (portfolio_id, role, company, start_date, end_date, description, sort_order)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    portfolio.id,
    role,
    company,
    text(req.body?.startDate, { max: 40 }),
    text(req.body?.endDate, { max: 40 }),
    text(req.body?.description),
    int(req.body?.sortOrder, nextOrder)
  );

  return res.status(201).json({
    experience: shapeExperience(get('SELECT * FROM experiences WHERE id = ?', result.lastInsertRowid)),
  });
});

router.patch('/:id/experiences/:experienceId', (req, res) => {
  const portfolio = ownedPortfolio(req.user.id, req.params.id);
  if (!portfolio) return res.status(404).json({ error: 'Portfolio not found' });

  const experience = get(
    'SELECT * FROM experiences WHERE id = ? AND portfolio_id = ?',
    req.params.experienceId,
    portfolio.id
  );
  if (!experience) return res.status(404).json({ error: 'Experience not found' });

  run(
    `UPDATE experiences SET role = ?, company = ?, start_date = ?, end_date = ?, description = ?, sort_order = ?
      WHERE id = ?`,
    req.body?.role !== undefined ? text(req.body.role, { max: 140 }) || experience.role : experience.role,
    req.body?.company !== undefined ? text(req.body.company, { max: 140 }) || experience.company : experience.company,
    req.body?.startDate !== undefined ? text(req.body.startDate, { max: 40 }) : experience.start_date,
    req.body?.endDate !== undefined ? text(req.body.endDate, { max: 40 }) : experience.end_date,
    req.body?.description !== undefined ? text(req.body.description) : experience.description,
    req.body?.sortOrder !== undefined ? int(req.body.sortOrder, experience.sort_order) : experience.sort_order,
    experience.id
  );

  return res.json({
    experience: shapeExperience(get('SELECT * FROM experiences WHERE id = ?', experience.id)),
  });
});

router.delete('/:id/experiences/:experienceId', (req, res) => {
  const portfolio = ownedPortfolio(req.user.id, req.params.id);
  if (!portfolio) return res.status(404).json({ error: 'Portfolio not found' });

  const result = run(
    'DELETE FROM experiences WHERE id = ? AND portfolio_id = ?',
    req.params.experienceId,
    portfolio.id
  );
  if (!result.changes) return res.status(404).json({ error: 'Experience not found' });

  return res.json({ ok: true });
});

export default router;
