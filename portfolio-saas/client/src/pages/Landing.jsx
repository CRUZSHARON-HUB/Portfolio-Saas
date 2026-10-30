import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar.jsx';
import ParticleField from '../components/three/ParticleField.jsx';
import CubeScene from '../components/three/CubeScene.jsx';
import TiltCard from '../components/three/TiltCard.jsx';

const MARQUEE_ITEMS = [
  'React 18',
  'Express',
  'SQLite / PostgreSQL',
  'JWT Auth',
  'CSS 3D Transforms',
  'Canvas Projection',
  'REST API',
  'Vite',
  'Responsive',
  'Dark Mode',
];

const FEATURES = [
  {
    icon: '◈',
    title: '3D-first templates',
    body: 'Nebula, Prism, Atlas and Monolith ship with layered depth, glass surfaces and parallax motion — no WebGL build step required.',
  },
  {
    icon: '▤',
    title: 'One-click publishing',
    body: 'Every portfolio lives on a shareable /p/your-slug URL. Publish, unpublish or re-theme without touching a deploy pipeline.',
  },
  {
    icon: '◷',
    title: 'Traffic analytics',
    body: 'Views, referrers, device split and a 30-day curve are written to SQL on every hit, so you know exactly who is looking.',
  },
  {
    icon: '✉',
    title: 'Contact capture',
    body: 'Every public page ships with a contact panel. Messages land in your inbox inside the dashboard, not in someone else’s.',
  },
  {
    icon: '⚡',
    title: 'SQL-native backend',
    body: 'Express with a real relational schema — users, portfolios, projects, skills, experiences, views and inquiries.',
  },
  {
    icon: '◐',
    title: 'Plan-aware limits',
    body: 'Free, Professional and Studio tiers are enforced server-side, so quotas cannot be bypassed by editing the client.',
  },
];

const TEMPLATES = [
  { id: 'nebula', name: 'Nebula', hint: 'Immersive 3D hero', gradient: 'linear-gradient(140deg,#8b5cf6,#22d3ee)' },
  { id: 'prism', name: 'Prism', hint: 'Centred editorial', gradient: 'linear-gradient(140deg,#f472b6,#fbbf24)' },
  { id: 'atlas', name: 'Atlas', hint: 'Profile first', gradient: 'linear-gradient(140deg,#34d399,#22d3ee)' },
  { id: 'monolith', name: 'Monolith', hint: 'Typographic minimal', gradient: 'linear-gradient(140deg,#64748b,#a78bfa)' },
];

const PRICES = [
  {
    name: 'Starter',
    price: '$0',
    features: ['1 portfolio', '6 projects', '4 templates', 'Public URL', 'Contact form'],
    cta: 'Start free',
    to: '/register',
  },
  {
    name: 'Professional',
    price: '$19',
    features: ['5 portfolios', '40 projects', 'All templates', 'Traffic analytics', 'Custom accent'],
    cta: 'Go Professional',
    to: '/register',
    featured: true,
  },
  {
    name: 'Studio',
    price: '$49',
    features: ['25 portfolios', '200 projects', 'Priority support', 'Advanced analytics', 'Team seats'],
    cta: 'Choose Studio',
    to: '/register',
  },
];

function TemplatePreview({ gradient, id }) {
  const layouts = {
    nebula: [
      { top: '14%', left: '8%', width: '46%', height: '26%' },
      { top: '14%', right: '8%', width: '32%', height: '46%' },
      { top: '48%', left: '8%', width: '74%', height: '34%' },
    ],
    prism: [
      { top: '16%', left: '22%', width: '56%', height: '30%' },
      { top: '54%', left: '12%', width: '36%', height: '28%' },
      { top: '54%', right: '12%', width: '36%', height: '28%' },
    ],
    atlas: [
      { top: '18%', left: '10%', width: '32%', height: '52%' },
      { top: '18%', right: '10%', width: '48%', height: '24%' },
      { top: '50%', right: '10%', width: '48%', height: '20%' },
    ],
    monolith: [
      { top: '20%', left: '12%', width: '76%', height: '12%' },
      { top: '40%', left: '12%', width: '52%', height: '10%' },
      { top: '58%', left: '12%', width: '76%', height: '22%' },
    ],
  };

  return (
    <div className="template-preview" style={{ background: `radial-gradient(120% 90% at 20% 0%, ${gradient}, transparent 65%), #080a14` }}>
      {layouts[id].map((layer, index) => (
        <div
          key={index}
          className="layer float float-2"
          style={{ ...layer, animationDelay: `${index * 0.7}s` }}
        />
      ))}
    </div>
  );
}

export default function Landing() {
  return (
    <>
      <Navbar />

      <section className="hero">
        <ParticleField className="hero-canvas" density={120} />
        <div className="shell hero-grid">
          <div className="hero-copy">
            <span className="eyebrow">Professional Portfolio SaaS</span>
            <h1>
              <span className="line">
                Your work, in <span className="gradient-text">three dimensions.</span>
              </span>
            </h1>
            <p className="hero-sub">
              Prismfolio turns a stack of résumés into a living portfolio — layered templates, your own URL,
              and analytics that actually tell you who showed up.
            </p>
            <div className="hero-actions">
              <Link to="/register" className="btn btn-primary btn-lg">
                Build your portfolio
              </Link>
              <Link to="/p/alex-rivera" className="btn btn-ghost btn-lg">
                View a live example
              </Link>
            </div>
            <div className="hero-proof">
              <span className="avatar" style={{ '--hue': 268 }}>
                AR
              </span>
              <span className="avatar" style={{ '--hue': 190 }}>
                MC
              </span>
              <span className="avatar" style={{ '--hue': 32 }}>
                JT
              </span>
              <span>Trusted by 4,200+ designers, engineers and founders.</span>
            </div>
          </div>

          <div className="hero-visual scene">
            <div className="hero-cube">
              <CubeScene />
            </div>

            <div className="hero-float-card tl float float-2">
              <div className="mini-stat">128</div>
              <h4>Projects shipped</h4>
              <p>Across 3 templates</p>
            </div>

            <div className="hero-float-card tr float float-3">
              <div className="mini-stat" style={{ color: 'var(--cyan)' }}>
                +42%
              </div>
              <h4>Recruiter interest</h4>
              <p>Since publishing</p>
            </div>

            <div className="hero-float-card bl float float-4">
              <div className="mini-stat" style={{ color: 'var(--emerald)' }}>
                Live
              </div>
              <h4>prismfolio.app/p/you</h4>
              <p>Your URL, instantly</p>
            </div>
          </div>
        </div>
      </section>

      <div className="marquee">
        <div className="marquee-track">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, index) => (
            <span key={`${item}-${index}`}>{item}</span>
          ))}
        </div>
      </div>

      <section className="section">
        <div className="shell">
          <div className="section-head">
            <span className="eyebrow">Capabilities</span>
            <h2>Everything a professional portfolio needs, nothing it doesn’t.</h2>
            <p>
              A focused toolkit: craft the site, publish it, and watch the traffic — all backed by a real SQL
              schema rather than a mock.
            </p>
          </div>

          <div className="feature-grid">
            {FEATURES.map((feature) => (
              <TiltCard key={feature.title} className="feature-card" maxTilt={7}>
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.body}</p>
                <div className="feature-glow" />
              </TiltCard>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="shell">
          <div className="section-head">
            <span className="eyebrow">Templates</span>
            <h2>Four layouts. Infinite depth.</h2>
            <p>Switch template and accent colour at any time — every portfolio keeps its own settings.</p>
          </div>

          <div className="showcase">
            {TEMPLATES.map((template) => (
              <div key={template.id} className="template-card">
                <TemplatePreview gradient={template.gradient} id={template.id} />
                <div className="template-meta">
                  <div>
                    <h4>{template.name}</h4>
                    <p className="faint" style={{ fontSize: '0.83rem' }}>
                      {template.hint}
                    </p>
                  </div>
                  <Link to="/register" className="btn btn-ghost btn-sm">
                    Use
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="shell">
          <div className="section-head">
            <span className="eyebrow">Pricing</span>
            <h2>Start free. Scale when the traffic does.</h2>
          </div>

          <div className="pricing-grid">
            {PRICES.map((plan) => (
              <div key={plan.name} className={`price-card ${plan.featured ? 'featured' : ''}`}>
                <div>
                  <h3>{plan.name}</h3>
                  <div className="price-tag">
                    {plan.price}
                    <small>/month</small>
                  </div>
                </div>
                <ul className="price-list">
                  {plan.features.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <Link to={plan.to} className={`btn ${plan.featured ? 'btn-primary' : 'btn-ghost'} btn-block`}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="shell">
          <div className="cta">
            <h2>Your next role starts with a better first impression.</h2>
            <p>
              Create an account, pick a template, and publish a portfolio on your own URL in under five minutes.
            </p>
            <div className="row" style={{ justifyContent: 'center', gap: '0.8rem', flexWrap: 'wrap' }}>
              <Link to="/register" className="btn btn-primary btn-lg">
                Create free account
              </Link>
              <Link to="/login" className="btn btn-ghost btn-lg">
                I already have one
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="shell">
          <div className="footer-grid">
            <div>
              <div className="brand" style={{ marginBottom: '0.8rem' }}>
                <span className="brand-mark">◈</span>
                <span>
                  Prism<span className="gradient-text">folio</span>
                </span>
              </div>
              <p style={{ fontSize: '0.9rem', maxWidth: '34ch' }}>
                The professional portfolio SaaS. Built with React, Express and SQL.
              </p>
            </div>
            <div>
              <h5>Product</h5>
              <ul>
                <li>
                  <Link to="/features">Features</Link>
                </li>
                <li>
                  <Link to="/pricing">Pricing</Link>
                </li>
                <li>
                  <Link to="/directory">Showcase</Link>
                </li>
              </ul>
            </div>
            <div>
              <h5>Account</h5>
              <ul>
                <li>
                  <Link to="/login">Sign in</Link>
                </li>
                <li>
                  <Link to="/register">Create account</Link>
                </li>
                <li>
                  <Link to="/app">Dashboard</Link>
                </li>
              </ul>
            </div>
            <div>
              <h5>Resources</h5>
              <ul>
                <li>
                  <a href="mailto:hello@prismfolio.dev">Contact</a>
                </li>
                <li>
                  <Link to="/p/alex-rivera">Example portfolio</Link>
                </li>
                <li>
                  <Link to="/features">Templates</Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <span>© {new Date().getFullYear()} Prismfolio. Demo project.</span>
            <span className="mono">React · Express · SQL</span>
          </div>
        </div>
      </footer>
    </>
  );
}
