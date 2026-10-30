import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../lib/api.js';
import ParticleField from '../components/three/ParticleField.jsx';
import TiltCard from '../components/three/TiltCard.jsx';
import Loader from '../components/ui/Loader.jsx';
import { initials, splitTech } from '../lib/format.js';

const SOCIAL_LABELS = {
  github: 'GitHub',
  linkedin: 'LinkedIn',
  twitter: 'X',
  dribbble: 'Dribbble',
  website: 'Web',
};

export default function PublicPortfolio() {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const result = await api.public.portfolio(slug);
      setData(result);
    } catch (err) {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    load();
  }, [load]);

  const skillGroups = useMemo(() => {
    if (!data?.skills) return [];
    const groups = new Map();
    for (const skill of data.skills) {
      if (!groups.has(skill.category)) groups.set(skill.category, []);
      groups.get(skill.category).push(skill);
    }
    return [...groups.entries()];
  }, [data]);

  const socialEntries = useMemo(
    () => Object.entries(data?.portfolio?.socials ?? {}).filter(([, value]) => Boolean(value)),
    [data]
  );

  const submitContact = async (event) => {
    event.preventDefault();
    setError('');
    setSending(true);
    try {
      await api.public.contact(slug, form);
      setSent(true);
      setForm({ name: '', email: '', message: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  if (loading) return <Loader label="Loading portfolio" />;

  if (notFound || !data) {
    return (
      <div className="shell" style={{ padding: '6rem 0', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.4rem', marginBottom: '0.6rem' }}>Portfolio not found</h1>
        <p style={{ marginBottom: '1.6rem' }}>
          This portfolio is either unpublished or the link has changed.
        </p>
        <Link className="btn btn-primary" to="/">
          Back to Prismfolio
        </Link>
      </div>
    );
  }

  const { portfolio, owner, projects, skills, experiences } = data;

  return (
    <div className="pf-page" data-accent={portfolio.accent} data-template={portfolio.template}>
      <header className="nav">
        <div className="nav-inner">
          <Link to="/" className="brand">
            <span className="brand-mark">◈</span>
            <span>
              Prism<span className="gradient-text">folio</span>
            </span>
          </Link>
          <nav className="nav-links">
            <a href="#work">Work</a>
            <a href="#skills">Skills</a>
            <a href="#about">About</a>
            <a href="#contact" className="btn btn-primary btn-sm">
              Contact
            </a>
          </nav>
        </div>
      </header>

      <section className="pf-hero">
        <ParticleField className="pf-hero-bg" density={70} />
        <div className="shell pf-hero-inner">
          <div>
            <span className="eyebrow">{owner?.headline || portfolio.tagline || 'Portfolio'}</span>
            <h1 className="pf-title" style={{ marginTop: '0.9rem' }}>
              {portfolio.title}
            </h1>
            <p className="pf-tagline">{portfolio.tagline}</p>

            <div className="pf-contact-row">
              {portfolio.location ? (
                <span className="pf-chip">◎ {portfolio.location}</span>
              ) : null}
              {portfolio.email ? (
                <a className="pf-chip" href={`mailto:${portfolio.email}`}>
                  ✉ {portfolio.email}
                </a>
              ) : null}
              {portfolio.phone ? (
                <span className="pf-chip">☎ {portfolio.phone}</span>
              ) : null}
              {portfolio.resumeUrl ? (
                <a className="pf-chip" href={portfolio.resumeUrl} target="_blank" rel="noreferrer">
                  ⤓ Résumé
                </a>
              ) : null}
            </div>

            {socialEntries.length > 0 ? (
              <div className="pf-socials">
                {socialEntries.map(([key, url]) => (
                  <a
                    key={key}
                    className="pf-social"
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    title={SOCIAL_LABELS[key] ?? key}
                  >
                    {(SOCIAL_LABELS[key] ?? key).slice(0, 2).toUpperCase()}
                  </a>
                ))}
              </div>
            ) : null}
          </div>

          <div className="pf-orb-stage">
            <div className="pf-avatar-ring">
              <span className="ring r1" />
              <span className="ring r2" />
              <span className="ring r3" />
              <div className="pf-avatar-core">{initials(owner?.name || portfolio.title)}</div>
            </div>
          </div>
        </div>
      </section>

      {portfolio.about ? (
        <section className="pf-section" id="about">
          <div className="shell">
            <div className="pf-section-head">
              <h2>About</h2>
              <span className="count">01</span>
            </div>
            <p style={{ fontSize: '1.05rem', lineHeight: 1.75, maxWidth: '72ch' }}>{portfolio.about}</p>
          </div>
        </section>
      ) : null}

      {projects.length > 0 ? (
        <section className="pf-section" id="work">
          <div className="shell">
            <div className="pf-section-head">
              <h2>Selected work</h2>
              <span className="count">{String(projects.length).padStart(2, '0')} projects</span>
            </div>
            <div className="pf-projects">
              {projects.map((project) => (
                <TiltCard key={project.id} maxTilt={6} className={`pf-project ${project.featured ? 'featured' : ''}`}>
                  {project.featured ? <span className="featured-flag">Featured</span> : null}
                  <h3>{project.title}</h3>
                  <p>{project.description}</p>
                  {splitTech(project.tech).length > 0 ? (
                    <div className="pf-tech">
                      {splitTech(project.tech).map((tech) => (
                        <span key={tech}>{tech}</span>
                      ))}
                    </div>
                  ) : null}
                  <div className="pf-links">
                    {project.liveUrl ? (
                      <a className="pf-link" href={project.liveUrl} target="_blank" rel="noreferrer">
                        Live site ↗
                      </a>
                    ) : null}
                    {project.repoUrl ? (
                      <a className="pf-link" href={project.repoUrl} target="_blank" rel="noreferrer">
                        Source ↗
                      </a>
                    ) : null}
                  </div>
                </TiltCard>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {skills.length > 0 ? (
        <section className="pf-section" id="skills">
          <div className="shell">
            <div className="pf-section-head">
              <h2>Skills</h2>
              <span className="count">{skills.length} total</span>
            </div>
            <div className="pf-skill-groups">
              {skillGroups.map(([category, items]) => (
                <div className="pf-skill-group" key={category}>
                  <h4>{category}</h4>
                  {items.map((skill) => (
                    <div className="pf-skill" key={skill.id}>
                      <div className="pf-skill-top">
                        <span>{skill.name}</span>
                        <span>{skill.level}%</span>
                      </div>
                      <div className="meter">
                        <div className="meter-fill" style={{ width: `${skill.level}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {experiences.length > 0 ? (
        <section className="pf-section" id="experience">
          <div className="shell">
            <div className="pf-section-head">
              <h2>Experience</h2>
              <span className="count">{experiences.length} roles</span>
            </div>
            <div className="pf-timeline">
              {experiences.map((experience) => (
                <div className="pf-tl-item" key={experience.id}>
                  <h4>{experience.role}</h4>
                  <div className="where">{experience.company}</div>
                  {experience.startDate ? (
                    <div className="when">
                      {experience.startDate} — {experience.endDate || 'Present'}
                    </div>
                  ) : null}
                  {experience.description ? <p>{experience.description}</p> : null}
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="pf-section" id="contact">
        <div className="shell pf-contact-grid">
          <div>
            <div className="pf-section-head">
              <h2>Get in touch</h2>
              <span className="count">04</span>
            </div>
            <p style={{ fontSize: '1.02rem', maxWidth: '46ch' }}>
              Interested in working together? Send a note — it lands directly in {portfolio.title.split('—')[0].trim()}&rsquo;s
              inbox.
            </p>
            {portfolio.email ? (
              <a className="btn btn-ghost" href={`mailto:${portfolio.email}`} style={{ marginTop: '1.2rem' }}>
                ✉ {portfolio.email}
              </a>
            ) : null}
          </div>

          <form className="card card-pad-lg" onSubmit={submitContact}>
            {sent ? (
              <div className="form-success">Thanks — your message has been delivered.</div>
            ) : null}
            {error ? <div className="form-error">{error}</div> : null}

            <div className="field">
              <label className="label" htmlFor="ct-name">
                Your name
              </label>
              <input
                id="ct-name"
                className="input"
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                required
              />
            </div>

            <div className="field">
              <label className="label" htmlFor="ct-email">
                Email
              </label>
              <input
                id="ct-email"
                className="input"
                type="email"
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
              />
            </div>

            <div className="field">
              <label className="label" htmlFor="ct-message">
                Message
              </label>
              <textarea
                id="ct-message"
                className="textarea"
                rows={5}
                placeholder="Tell me about the role or project…"
                value={form.message}
                onChange={(event) => setForm({ ...form, message: event.target.value })}
                required
              />
            </div>

            <button className="btn btn-primary btn-block" type="submit" disabled={sending}>
              {sending ? <span className="spinner" /> : null}
              {sending ? 'Sending' : 'Send message'}
            </button>
          </form>
        </div>
      </section>

      <div className="shell">
        <div className="pf-powered">
          Built with <Link to="/">Prismfolio</Link> · {portfolio.views} views
        </div>
      </div>
    </div>
  );
}
