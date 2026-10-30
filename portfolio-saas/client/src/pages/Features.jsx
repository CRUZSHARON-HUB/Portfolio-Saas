import Navbar from '../components/layout/Navbar.jsx';
import ParticleField from '../components/three/ParticleField.jsx';
import TiltCard from '../components/three/TiltCard.jsx';
import CubeScene from '../components/three/CubeScene.jsx';

const SECTIONS = [
  {
    icon: '◈',
    title: 'Depth-first design system',
    body: 'Every surface is built with real CSS 3D transforms: perspective stages, preserve-3d layers, translateZ depth and pointer-tracked tilt. No WebGL dependency, no layout thrash.',
  },
  {
    icon: '◱',
    title: 'Four 3D templates',
    body: 'Nebula spins a lit cube in a particle field. Prism centres the composition. Atlas leads with the profile. Monolith strips everything back to typography.',
  },
  {
    icon: '▦',
    title: 'Real relational backend',
    body: 'Seven tables covering users, portfolios, projects, skills, experiences, page views and inquiries — with foreign keys, indexes and server-side plan enforcement.',
  },
  {
    icon: '◷',
    title: 'Traffic you can read',
    body: 'Every public hit is written to the views table with a timestamp, referrer and device class, then rolled up into a 30-day curve.',
  },
  {
    icon: '✉',
    title: 'Contact capture built in',
    body: 'The public page ships with a contact panel that writes into the inquiries table, so the messages never leave your database.',
  },
  {
    icon: '⚙',
    title: 'Plan-aware limits',
    body: 'Portfolio and project caps are checked on the server for every write, so limits hold regardless of what the browser does.',
  },
];

export default function Features() {
  return (
    <>
      <Navbar />
      <section className="hero" style={{ minHeight: '60vh' }}>
        <ParticleField className="hero-canvas" density={90} />
        <div className="shell hero-grid">
          <div className="hero-copy">
            <span className="eyebrow">Features</span>
            <h1>
              <span className="line">
                Built for <span className="gradient-text">people who ship.</span>
              </span>
            </h1>
            <p className="hero-sub">
              Prismfolio is the layer between your résumé and the job you want. Craft the site, publish it, and
              let the analytics do the talking.
            </p>
            <div className="hero-actions">
              <a href="/register" className="btn btn-primary btn-lg">
                Start free
              </a>
              <a href="/p/alex-rivera" className="btn btn-ghost btn-lg">
                See it live
              </a>
            </div>
          </div>

          <div className="hero-visual scene">
            <CubeScene />
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <div className="feature-grid">
            {SECTIONS.map((item) => (
              <TiltCard key={item.title} className="feature-card" maxTilt={7}>
                <div className="feature-icon">{item.icon}</div>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
                <div className="feature-glow" />
              </TiltCard>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
