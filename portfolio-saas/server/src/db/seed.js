import bcrypt from 'bcryptjs';
import { get, run, transaction } from './index.js';

const DEMO_EMAIL = 'demo@portfoliosaas.dev';
const DEMO_PASSWORD = 'demo1234';

const PROJECTS = [
  {
    title: 'Helios Analytics',
    description:
      'Real-time product analytics dashboard with streaming charts, cohort retention and alerting for SaaS teams.',
    tech: 'React, TypeScript, D3, PostgreSQL',
    image_url: '',
    repo_url: 'https://github.com/example/helios-analytics',
    live_url: 'https://example.com/helios',
    featured: 1,
  },
  {
    title: 'Prism Design System',
    description:
      'Accessible, themeable component library powering 40+ products across web and mobile.',
    tech: 'React, Figma, Storybook, Tokens',
    image_url: '',
    repo_url: 'https://github.com/example/prism-ds',
    live_url: 'https://example.com/prism',
    featured: 1,
  },
  {
    title: 'Ledgerly API',
    description:
      'Payments and invoicing API with idempotent retries, multi-currency support and a sandbox mode.',
    tech: 'Node.js, Express, SQLite, Redis',
    image_url: '',
    repo_url: 'https://github.com/example/ledgerly',
    live_url: '',
    featured: 0,
  },
  {
    title: 'Atlas Design Ops',
    description:
      'Asset pipeline that compresses, fingerprints and serves responsive media from a global edge.',
    tech: 'Go, Docker, AWS, Terraform',
    image_url: '',
    repo_url: 'https://github.com/example/atlas-ops',
    live_url: '',
    featured: 0,
  },
  {
    title: 'Nimbus Chat',
    description:
      'Group chat with offline-first sync, presence, and end-to-end encrypted attachments.',
    tech: 'React Native, WebRTC, SQLite',
    image_url: '',
    repo_url: 'https://github.com/example/nimbus-chat',
    live_url: '',
    featured: 0,
  },
  {
    title: 'Vector Search Kit',
    description:
      'Drop-in semantic search for product catalogues using HNSW indexes and hybrid ranking.',
    tech: 'Python, FAISS, FastAPI',
    image_url: '',
    repo_url: 'https://github.com/example/vector-search-kit',
    live_url: '',
    featured: 0,
  },
];

const SKILLS = [
  ['React', 'Frontend', 95],
  ['TypeScript', 'Frontend', 90],
  ['CSS Architecture', 'Frontend', 88],
  ['Three.js', 'Frontend', 72],
  ['Node.js', 'Backend', 92],
  ['SQL', 'Backend', 90],
  ['REST & GraphQL', 'Backend', 86],
  ['PostgreSQL', 'Backend', 84],
  ['Docker', 'Platform', 78],
  ['AWS', 'Platform', 74],
  ['Figma', 'Design', 80],
  ['Design Systems', 'Design', 87],
];

const EXPERIENCES = [
  {
    role: 'Lead Frontend Engineer',
    company: 'Nimbus Labs',
    start_date: '2022',
    end_date: 'Present',
    description:
      'Owned the design system and rebuilt the analytics surface, lifting render performance 3x and cutting bundle size by 45%.',
  },
  {
    role: 'Full-Stack Engineer',
    company: 'Brightline',
    start_date: '2019',
    end_date: '2022',
    description:
      'Built the multi-tenant billing platform and public API used by 2,400 paying accounts.',
  },
  {
    role: 'Software Engineer',
    company: 'Studio Kite',
    start_date: '2017',
    end_date: '2019',
    description:
      'Delivered client work across fintech and health, from prototyping through production rollout.',
  },
];

export function seed({ silent = false } = {}) {
  const log = (...args) => {
    if (!silent) console.log(...args);
  };

  const existing = get('SELECT id FROM users WHERE email = ?', DEMO_EMAIL);
  if (existing) {
    log(`Seed skipped — demo account ${DEMO_EMAIL} already exists.`);
    return { created: false, email: DEMO_EMAIL };
  }

  const userId = transaction(() => {
    const result = run(
      `INSERT INTO users (email, password_hash, full_name, headline, avatar_hue, plan)
       VALUES (?, ?, ?, ?, ?, 'pro')`,
      DEMO_EMAIL,
      bcrypt.hashSync(DEMO_PASSWORD, 10),
      'Alex Rivera',
      'Product-minded Full-Stack Engineer',
      268,
    );

    const userId = Number(result.lastInsertRowid);

    const portfolioResult = run(
      `INSERT INTO portfolios
         (user_id, slug, title, tagline, about, template, accent, location, email, phone, resume_url, socials, published)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      userId,
      'alex-rivera',
      'Alex Rivera — Product Engineer',
      'I design and ship fast, accessible web products that people actually enjoy using.',
      'Full-stack engineer with 8+ years of experience building products used by millions. Currently focused on developer tooling, design systems and data-heavy interfaces.',
      'nebula',
      'cyan',
      'Barcelona, Spain',
      'alex@portfolio.dev',
      '+34 600 000 000',
      'https://example.com/resume.pdf',
      JSON.stringify({
        github: 'https://github.com/example',
        linkedin: 'https://linkedin.com/in/example',
        twitter: 'https://x.com/example',
        dribbble: 'https://dribbble.com/example',
      })
    );

    const portfolioId = Number(portfolioResult.lastInsertRowid);

    PROJECTS.forEach((project, index) => {
      run(
        `INSERT INTO projects
           (portfolio_id, title, description, tech, image_url, repo_url, live_url, featured, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        portfolioId,
        project.title,
        project.description,
        project.tech,
        project.image_url,
        project.repo_url,
        project.live_url,
        project.featured,
        index + 1
      );
    });

    SKILLS.forEach(([name, category, level], index) => {
      run(
        'INSERT INTO skills (portfolio_id, name, category, level, sort_order) VALUES (?, ?, ?, ?, ?)',
        portfolioId,
        name,
        category,
        level,
        index + 1
      );
    });

    EXPERIENCES.forEach((experience, index) => {
      run(
        `INSERT INTO experiences (portfolio_id, role, company, start_date, end_date, description, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        portfolioId,
        experience.role,
        experience.company,
        experience.start_date,
        experience.end_date,
        experience.description,
        index + 1
      );
    });

    // Backfill 30 days of traffic so the analytics dashboard has a real curve.
    const referrers = ['Direct', 'https://github.com', 'https://linkedin.com', 'https://news.ycombinator.com'];
    const devices = ['desktop', 'desktop', 'mobile', 'tablet'];

    for (let day = 29; day >= 0; day -= 1) {
      const visits = 2 + ((day * 7) % 9);
      for (let i = 0; i < visits; i += 1) {
        const hour = 8 + ((i * 3) % 14);
        const stamp = `datetime('now', '-${day} days', '-${(24 - hour)} hours')`;
        run(
          `INSERT INTO views (portfolio_id, path, referrer, device, viewed_at)
           VALUES (?, '/', ?, ?, ${stamp})`,
          portfolioId,
          referrers[(day + i) % referrers.length],
          devices[(day + i) % devices.length]
        );
      }
    }

    run(
      'INSERT INTO inquiries (portfolio_id, name, email, message) VALUES (?, ?, ?, ?)',
      portfolioId,
      'Maya Chen',
      'maya@example.com',
      'Loved the Helios write-up. Would you be open to chatting about a product engineering role?'
    );

    return userId;
  });

  log(`Seeded demo account  →  ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
  log('Public portfolio     →  /p/alex-rivera');
  void userId;
  return { created: true, email: DEMO_EMAIL, password: DEMO_PASSWORD };
}

export const DEMO_CREDENTIALS = { email: DEMO_EMAIL, password: DEMO_PASSWORD };

if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  const users = get('SELECT COUNT(*) AS n FROM users').n;
  seed();
  console.log(`Database now has ${get('SELECT COUNT(*) AS n FROM users').n} users (was ${users}).`);
}

export default seed;
