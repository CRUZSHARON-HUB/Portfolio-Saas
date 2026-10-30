-- Professional Portfolio SaaS - relational schema
-- Engine: SQLite (node:sqlite). Portable SQL, no native build step.

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  email         TEXT    NOT NULL UNIQUE,
  password_hash TEXT    NOT NULL,
  full_name     TEXT    NOT NULL,
  headline      TEXT    NOT NULL DEFAULT '',
  avatar_hue    INTEGER NOT NULL DEFAULT 210,
  plan          TEXT    NOT NULL DEFAULT 'free' REFERENCES plans(code),
  created_at    TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS plans (
  code           TEXT    PRIMARY KEY,
  name           TEXT    NOT NULL,
  price_monthly  INTEGER NOT NULL DEFAULT 0,
  max_portfolios INTEGER NOT NULL DEFAULT 1,
  max_projects   INTEGER NOT NULL DEFAULT 6,
  analytics      INTEGER NOT NULL DEFAULT 0,
  custom_domain  INTEGER NOT NULL DEFAULT 0,
  accent         TEXT    NOT NULL DEFAULT 'violet'
);

CREATE TABLE IF NOT EXISTS portfolios (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  slug        TEXT    NOT NULL UNIQUE,
  title       TEXT    NOT NULL,
  tagline     TEXT    NOT NULL DEFAULT '',
  about       TEXT    NOT NULL DEFAULT '',
  template    TEXT    NOT NULL DEFAULT 'nebula',
  accent      TEXT    NOT NULL DEFAULT 'violet',
  location    TEXT    NOT NULL DEFAULT '',
  email       TEXT    NOT NULL DEFAULT '',
  phone       TEXT    NOT NULL DEFAULT '',
  resume_url  TEXT    NOT NULL DEFAULT '',
  socials     TEXT    NOT NULL DEFAULT '{}',
  published   INTEGER NOT NULL DEFAULT 0,
  views       INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_portfolios_user ON portfolios(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolios_slug ON portfolios(slug);

CREATE TABLE IF NOT EXISTS projects (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  portfolio_id INTEGER NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
  title        TEXT    NOT NULL,
  description  TEXT    NOT NULL DEFAULT '',
  tech         TEXT    NOT NULL DEFAULT '',
  image_url    TEXT    NOT NULL DEFAULT '',
  repo_url     TEXT    NOT NULL DEFAULT '',
  live_url     TEXT    NOT NULL DEFAULT '',
  featured     INTEGER NOT NULL DEFAULT 0,
  sort_order   INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_projects_portfolio ON projects(portfolio_id);

CREATE TABLE IF NOT EXISTS skills (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  portfolio_id INTEGER NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
  name         TEXT    NOT NULL,
  category     TEXT    NOT NULL DEFAULT 'Core',
  level        INTEGER NOT NULL DEFAULT 80,
  sort_order   INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_skills_portfolio ON skills(portfolio_id);

CREATE TABLE IF NOT EXISTS experiences (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  portfolio_id INTEGER NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
  role         TEXT    NOT NULL,
  company      TEXT    NOT NULL,
  start_date   TEXT    NOT NULL DEFAULT '',
  end_date     TEXT    NOT NULL DEFAULT '',
  description  TEXT    NOT NULL DEFAULT '',
  sort_order   INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_experiences_portfolio ON experiences(portfolio_id);

CREATE TABLE IF NOT EXISTS inquiries (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  portfolio_id INTEGER NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
  name         TEXT    NOT NULL,
  email        TEXT    NOT NULL,
  message      TEXT    NOT NULL,
  is_read      INTEGER NOT NULL DEFAULT 0,
  created_at   TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_inquiries_portfolio ON inquiries(portfolio_id);

CREATE TABLE IF NOT EXISTS views (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  portfolio_id INTEGER NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
  path         TEXT    NOT NULL DEFAULT '/',
  referrer     TEXT    NOT NULL DEFAULT '',
  device       TEXT    NOT NULL DEFAULT 'desktop',
  viewed_at    TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_views_portfolio ON views(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_views_time ON views(viewed_at);
