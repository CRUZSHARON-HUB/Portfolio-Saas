import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../lib/api.js';
import { useToast } from '../context/ToastContext.jsx';
import Loader from '../components/ui/Loader.jsx';
import Modal from '../components/ui/Modal.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import Icon from '../components/ui/Icon.jsx';
import { ACCENT_OPTIONS, TEMPLATE_OPTIONS, splitTech } from '../lib/format.js';

const EMPTY_PROJECT = {
  title: '',
  description: '',
  tech: '',
  imageUrl: '',
  repoUrl: '',
  liveUrl: '',
  featured: false,
};

const EMPTY_EXPERIENCE = {
  role: '',
  company: '',
  startDate: '',
  endDate: '',
  description: '',
};

const TABS = [
  { id: 'details', label: 'Details' },
  { id: 'projects', label: 'Projects' },
  { id: 'skills', label: 'Skills' },
  { id: 'experience', label: 'Experience' },
];

function SocialInputs({ socials, onChange }) {
  const keys = ['github', 'linkedin', 'twitter', 'dribbble', 'website'];

  return (
    <div className="field-row">
      {keys.map((key) => (
        <div className="field" key={key}>
          <label className="label" htmlFor={`social-${key}`}>
            {key}
          </label>
          <input
            id={`social-${key}`}
            className="input"
            placeholder={`https://${key}.com/you`}
            value={socials[key] ?? ''}
            onChange={(event) => onChange({ ...socials, [key]: event.target.value })}
          />
        </div>
      ))}
    </div>
  );
}

export default function PortfolioEditor() {
  const { id } = useParams();
  const { push } = useToast();

  const [portfolio, setPortfolio] = useState(null);
  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState([]);
  const [experiences, setExperiences] = useState([]);
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('details');
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState(null);
  const [projectModal, setProjectModal] = useState(null);
  const [projectForm, setProjectForm] = useState(EMPTY_PROJECT);
  const [experienceModal, setExperienceModal] = useState(null);
  const [experienceForm, setExperienceForm] = useState(EMPTY_EXPERIENCE);
  const [skillForm, setSkillForm] = useState({ name: '', category: 'Core', level: 80 });

  const load = useCallback(async () => {
    try {
      const result = await api.portfolios.get(id);
      setPortfolio(result.portfolio);
      setProjects(result.projects);
      setSkills(result.skills);
      setExperiences(result.experiences);
      setPlan(result.plan);
      setForm({
        title: result.portfolio.title,
        slug: result.portfolio.slug,
        tagline: result.portfolio.tagline,
        about: result.portfolio.about,
        location: result.portfolio.location,
        email: result.portfolio.email,
        phone: result.portfolio.phone,
        resumeUrl: result.portfolio.resumeUrl,
        template: result.portfolio.template,
        accent: result.portfolio.accent,
        socials: result.portfolio.socials ?? {},
      });
    } catch (error) {
      push(error.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [id, push]);

  useEffect(() => {
    load();
  }, [load]);

  const dirty = useMemo(() => {
    if (!portfolio || !form) return false;
    return JSON.stringify(form) !== JSON.stringify({
      title: portfolio.title,
      slug: portfolio.slug,
      tagline: portfolio.tagline,
      about: portfolio.about,
      location: portfolio.location,
      email: portfolio.email,
      phone: portfolio.phone,
      resumeUrl: portfolio.resumeUrl,
      template: portfolio.template,
      accent: portfolio.accent,
      socials: portfolio.socials ?? {},
    });
  }, [form, portfolio]);

  const saveDetails = async (event) => {
    event?.preventDefault();
    setSaving(true);
    try {
      const result = await api.portfolios.update(id, form);
      setPortfolio(result.portfolio);
      push('Portfolio saved');
    } catch (error) {
      push(error.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const togglePublish = async () => {
    try {
      const result = await api.portfolios.publish(id, !portfolio.published);
      setPortfolio(result.portfolio);
      push(portfolio.published ? 'Portfolio unpublished' : 'Portfolio is live');
    } catch (error) {
      push(error.message, 'error');
    }
  };

  const openProjectModal = (project = null) => {
    setProjectForm(project ? { ...project } : EMPTY_PROJECT);
    setProjectModal(project ?? { id: null });
  };

  const saveProject = async (event) => {
    event.preventDefault();
    try {
      if (projectModal?.id) {
        const result = await api.portfolios.updateProject(id, projectModal.id, projectForm);
        setProjects((current) => current.map((item) => (item.id === result.project.id ? result.project : item)));
        push('Project updated');
      } else {
        const result = await api.portfolios.addProject(id, projectForm);
        setProjects((current) => [...current, result.project]);
        push('Project added');
      }
      setProjectModal(null);
    } catch (error) {
      push(error.message, 'error');
    }
  };

  const removeProject = async (project) => {
    if (!window.confirm(`Remove "${project.title}"?`)) return;
    try {
      await api.portfolios.removeProject(id, project.id);
      setProjects((current) => current.filter((item) => item.id !== project.id));
      push('Project removed');
    } catch (error) {
      push(error.message, 'error');
    }
  };

  const toggleFeatured = async (project) => {
    try {
      const result = await api.portfolios.updateProject(id, project.id, { featured: !project.featured });
      setProjects((current) => current.map((item) => (item.id === result.project.id ? result.project : item)));
    } catch (error) {
      push(error.message, 'error');
    }
  };

  const addSkill = async (event) => {
    event.preventDefault();
    if (!skillForm.name.trim()) return;
    try {
      const result = await api.portfolios.addSkill(id, skillForm);
      setSkills((current) => [...current, result.skill]);
      setSkillForm({ name: '', category: skillForm.category, level: 80 });
    } catch (error) {
      push(error.message, 'error');
    }
  };

  const updateSkill = async (skill, patch) => {
    try {
      const result = await api.portfolios.updateSkill(id, skill.id, { ...skill, ...patch });
      setSkills((current) => current.map((item) => (item.id === result.skill.id ? result.skill : item)));
    } catch (error) {
      push(error.message, 'error');
    }
  };

  const removeSkill = async (skill) => {
    try {
      await api.portfolios.removeSkill(id, skill.id);
      setSkills((current) => current.filter((item) => item.id !== skill.id));
    } catch (error) {
      push(error.message, 'error');
    }
  };

  const openExperienceModal = (experience = null) => {
    setExperienceForm(experience ? { ...experience } : EMPTY_EXPERIENCE);
    setExperienceModal(experience ?? { id: null });
  };

  const saveExperience = async (event) => {
    event.preventDefault();
    try {
      if (experienceModal?.id) {
        const result = await api.portfolios.updateExperience(id, experienceModal.id, experienceForm);
        setExperiences((current) =>
          current.map((item) => (item.id === result.experience.id ? result.experience : item))
        );
        push('Experience updated');
      } else {
        const result = await api.portfolios.addExperience(id, experienceForm);
        setExperiences((current) => [...current, result.experience]);
        push('Experience added');
      }
      setExperienceModal(null);
    } catch (error) {
      push(error.message, 'error');
    }
  };

  const removeExperience = async (experience) => {
    if (!window.confirm(`Remove ${experience.role} at ${experience.company}?`)) return;
    try {
      await api.portfolios.removeExperience(id, experience.id);
      setExperiences((current) => current.filter((item) => item.id !== experience.id));
    } catch (error) {
      push(error.message, 'error');
    }
  };

  if (loading || !form) return <Loader label="Opening editor" />;

  const projectCount = projects.length;
  const maxProjects = plan?.max_projects ?? 6;

  return (
    <>
      <header className="page-head">
        <div>
          <span className="eyebrow">Editor</span>
          <h1 style={{ marginTop: '0.6rem' }}>{portfolio.title}</h1>
          <p>
            <span className="mono">/p/{portfolio.slug}</span> · {portfolio.published ? 'Live' : 'Draft'} ·{' '}
            {portfolio.views} views
          </p>
        </div>
        <div className="row" style={{ gap: '0.6rem', flexWrap: 'wrap' }}>
          <Link className="btn btn-ghost" to={`/p/${portfolio.slug}`} target="_blank" rel="noreferrer">
            Open live page
          </Link>
          <button className="btn btn-ghost" onClick={togglePublish}>
            {portfolio.published ? 'Unpublish' : 'Publish'}
          </button>
          <button className="btn btn-primary" onClick={saveDetails} disabled={saving}>
            {saving ? <span className="spinner" /> : null}
            {saving ? 'Saving' : dirty ? 'Save changes' : 'Saved'}
          </button>
        </div>
      </header>

      <div className="editor-grid">
        <div>
          <div className="tabs">
            {TABS.map((item) => (
              <button
                key={item.id}
                className={`tab ${tab === item.id ? 'active' : ''}`}
                onClick={() => setTab(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>

          {tab === 'details' ? (
            <form className="card card-pad-lg" onSubmit={saveDetails}>
              <div className="field">
                <label className="label" htmlFor="ed-title">
                  Portfolio title
                </label>
                <input
                  id="ed-title"
                  className="input"
                  value={form.title}
                  onChange={(event) => setForm({ ...form, title: event.target.value })}
                />
              </div>

              <div className="field">
                <label className="label" htmlFor="ed-slug">
                  Public URL
                </label>
                <div className="row" style={{ gap: '0.5rem' }}>
                  <span className="mono faint" style={{ fontSize: '0.85rem' }}>
                    /p/
                  </span>
                  <input
                    id="ed-slug"
                    className="input"
                    value={form.slug}
                    onChange={(event) => setForm({ ...form, slug: event.target.value })}
                  />
                </div>
                <span className="field-hint">Lowercase letters, numbers and dashes only.</span>
              </div>

              <div className="field">
                <label className="label" htmlFor="ed-tagline">
                  Tagline
                </label>
                <input
                  id="ed-tagline"
                  className="input"
                  placeholder="I design and ship fast, accessible web products."
                  value={form.tagline}
                  onChange={(event) => setForm({ ...form, tagline: event.target.value })}
                />
              </div>

              <div className="field">
                <label className="label" htmlFor="ed-about">
                  About
                </label>
                <textarea
                  id="ed-about"
                  className="textarea"
                  rows={5}
                  value={form.about}
                  onChange={(event) => setForm({ ...form, about: event.target.value })}
                />
              </div>

              <div className="field-row">
                <div className="field">
                  <label className="label" htmlFor="ed-location">
                    Location
                  </label>
                  <input
                    id="ed-location"
                    className="input"
                    placeholder="Barcelona, Spain"
                    value={form.location}
                    onChange={(event) => setForm({ ...form, location: event.target.value })}
                  />
                </div>
                <div className="field">
                  <label className="label" htmlFor="ed-email">
                    Contact email
                  </label>
                  <input
                    id="ed-email"
                    className="input"
                    type="email"
                    placeholder="you@studio.com"
                    value={form.email}
                    onChange={(event) => setForm({ ...form, email: event.target.value })}
                  />
                </div>
                <div className="field">
                  <label className="label" htmlFor="ed-phone">
                    Phone
                  </label>
                  <input
                    id="ed-phone"
                    className="input"
                    placeholder="+34 600 000 000"
                    value={form.phone}
                    onChange={(event) => setForm({ ...form, phone: event.target.value })}
                  />
                </div>
                <div className="field">
                  <label className="label" htmlFor="ed-resume">
                    Résumé link
                  </label>
                  <input
                    id="ed-resume"
                    className="input"
                    placeholder="https://…"
                    value={form.resumeUrl}
                    onChange={(event) => setForm({ ...form, resumeUrl: event.target.value })}
                  />
                </div>
              </div>

              <hr className="hairline" style={{ margin: '1.6rem 0' }} />

              <span className="label">Social profiles</span>
              <div style={{ marginTop: '0.8rem' }}>
                <SocialInputs
                  socials={form.socials}
                  onChange={(socials) => setForm({ ...form, socials })}
                />
              </div>

              <hr className="hairline" style={{ margin: '1.6rem 0' }} />

              <span className="label">Template</span>
              <div className="picker-grid" style={{ marginTop: '0.8rem' }}>
                {TEMPLATE_OPTIONS.map((template) => (
                  <button
                    type="button"
                    key={template.id}
                    className={`picker ${form.template === template.id ? 'active' : ''}`}
                    onClick={() => setForm({ ...form, template: template.id })}
                  >
                    <strong style={{ display: 'block' }}>{template.label}</strong>
                    <span className="faint" style={{ fontSize: '0.76rem' }}>
                      {template.hint}
                    </span>
                  </button>
                ))}
              </div>

              <span className="label" style={{ display: 'block', marginTop: '1.6rem' }}>
                Accent colour
              </span>
              <div className="swatches" style={{ marginTop: '0.8rem' }}>
                {ACCENT_OPTIONS.map((accent) => (
                  <button
                    type="button"
                    key={accent.id}
                    className={`swatch ${form.accent === accent.id ? 'active' : ''}`}
                    style={{ background: accent.color }}
                    onClick={() => setForm({ ...form, accent: accent.id })}
                    aria-label={accent.label}
                    title={accent.label}
                  />
                ))}
              </div>

              <button type="submit" className="btn btn-primary" style={{ marginTop: '1.8rem' }}>
                Save details
              </button>
            </form>
          ) : null}

          {tab === 'projects' ? (
            <section className="card card-pad-lg">
              <div className="spread" style={{ marginBottom: '1.2rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem' }}>Projects</h3>
                  <p className="faint" style={{ fontSize: '0.85rem' }}>
                    {projectCount} of {maxProjects} used on the {plan?.name ?? 'free'} plan
                  </p>
                </div>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => openProjectModal()}
                  disabled={projectCount >= maxProjects}
                >
                  + Add project
                </button>
              </div>

              {projects.length === 0 ? (
                <EmptyState icon="▤" title="No projects yet" message="Showcase your best work — start with one project." />
              ) : (
                <div className="stack">
                  {projects.map((project) => (
                    <div className="list-row" key={project.id}>
                      <div className="grow" style={{ minWidth: 0 }}>
                        <h5>
                          {project.title}
                          {project.featured ? (
                            <span className="badge badge-accent" style={{ marginLeft: '0.5rem', fontSize: '0.62rem' }}>
                              Featured
                            </span>
                          ) : null}
                        </h5>
                        <p>{project.description.slice(0, 110) || 'No description'}</p>
                        {splitTech(project.tech).length > 0 ? (
                          <div style={{ marginTop: '0.4rem' }}>
                            {splitTech(project.tech).map((tech) => (
                              <span className="mini-chip" key={tech}>
                                {tech}
                              </span>
                            ))}
                          </div>
                        ) : null}
                      </div>
                      <div className="row" style={{ gap: '0.35rem' }}>
                        <button
                          className="icon-btn"
                          onClick={() => toggleFeatured(project)}
                          title="Toggle featured"
                          style={project.featured ? { color: 'var(--accent)' } : undefined}
                        >
                          <Icon name="star" size={15} />
                        </button>
                        <button className="icon-btn" onClick={() => openProjectModal(project)} title="Edit">
                          <Icon name="edit" size={15} />
                        </button>
                        <button className="icon-btn danger" onClick={() => removeProject(project)} title="Delete">
                          <Icon name="trash" size={15} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          ) : null}

          {tab === 'skills' ? (
            <section className="card card-pad-lg">
              <div className="spread" style={{ marginBottom: '1.2rem' }}>
                <h3 style={{ fontSize: '1.1rem' }}>Skills</h3>
              </div>

              <form className="row" style={{ gap: '0.6rem', alignItems: 'flex-end', flexWrap: 'wrap' }} onSubmit={addSkill}>
                <div className="field" style={{ flex: '2 1 190px', marginBottom: 0 }}>
                  <label className="label" htmlFor="sk-name">
                    Skill
                  </label>
                  <input
                    id="sk-name"
                    className="input"
                    placeholder="React"
                    value={skillForm.name}
                    onChange={(event) => setSkillForm({ ...skillForm, name: event.target.value })}
                  />
                </div>
                <div className="field" style={{ flex: '1 1 130px', marginBottom: 0 }}>
                  <label className="label" htmlFor="sk-cat">
                    Category
                  </label>
                  <input
                    id="sk-cat"
                    className="input"
                    placeholder="Frontend"
                    value={skillForm.category}
                    onChange={(event) => setSkillForm({ ...skillForm, category: event.target.value })}
                  />
                </div>
                <div className="field" style={{ flex: '1 1 120px', marginBottom: 0 }}>
                  <label className="label" htmlFor="sk-level">
                    Level ({skillForm.level})
                  </label>
                  <input
                    id="sk-level"
                    type="range"
                    min={0}
                    max={100}
                    value={skillForm.level}
                    onChange={(event) => setSkillForm({ ...skillForm, level: Number(event.target.value) })}
                    style={{ width: '100%', accentColor: 'var(--accent)' }}
                  />
                </div>
                <button className="btn btn-primary" type="submit">
                  Add
                </button>
              </form>

              <hr className="hairline" style={{ margin: '1.4rem 0' }} />

              {skills.length === 0 ? (
                <EmptyState icon="◇" title="No skills yet" message="Add the tools and technologies you want to be known for." />
              ) : (
                <div className="stack">
                  {skills.map((skill) => (
                    <div className="list-row" key={skill.id} style={{ alignItems: 'center' }}>
                      <div className="grow">
                        <h5>{skill.name}</h5>
                        <div className="meter" style={{ marginTop: '0.45rem', maxWidth: '320px' }}>
                          <div className="meter-fill" style={{ width: `${skill.level}%` }} />
                        </div>
                      </div>
                      <span className="badge">{skill.category}</span>
                      <span className="mono faint" style={{ fontSize: '0.82rem' }}>
                        {skill.level}%
                      </span>
                      <button className="icon-btn danger" onClick={() => removeSkill(skill)} aria-label="Remove skill">
                        <Icon name="trash" size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          ) : null}

          {tab === 'experience' ? (
            <section className="card card-pad-lg">
              <div className="spread" style={{ marginBottom: '1.2rem' }}>
                <h3 style={{ fontSize: '1.1rem' }}>Experience</h3>
                <button className="btn btn-primary btn-sm" onClick={() => openExperienceModal()}>
                  + Add role
                </button>
              </div>

              {experiences.length === 0 ? (
                <EmptyState icon="◷" title="No roles yet" message="Add the jobs and roles that shaped your career." />
              ) : (
                <div className="stack">
                  {experiences.map((experience) => (
                    <div className="list-row" key={experience.id}>
                      <div className="grow" style={{ minWidth: 0 }}>
                        <h5>{experience.role}</h5>
                        <p>
                          {experience.company}
                          {experience.startDate ? ` · ${experience.startDate} — ${experience.endDate || 'Now'}` : ''}
                        </p>
                        {experience.description ? (
                          <p style={{ marginTop: '0.35rem', color: 'var(--text-dim)' }}>{experience.description}</p>
                        ) : null}
                      </div>
                      <div className="row" style={{ gap: '0.35rem' }}>
                        <button className="icon-btn" onClick={() => openExperienceModal(experience)} title="Edit">
                          <Icon name="edit" size={15} />
                        </button>
                        <button className="icon-btn danger" onClick={() => removeExperience(experience)} title="Delete">
                          <Icon name="trash" size={15} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          ) : null}
        </div>

        <aside className="editor-preview">
          <div className="spread" style={{ marginBottom: '0.8rem' }}>
            <span className="eyebrow">Live preview</span>
            <Link to={`/p/${portfolio.slug}`} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">
              Open ↗
            </Link>
          </div>

          <div className="preview-frame" data-accent={form.accent}>
            <div className="preview-bar">
              <span className="preview-dot" />
              <span className="preview-dot" />
              <span className="preview-dot" />
              <span className="preview-url">prismfolio.app/p/{form.slug}</span>
            </div>

            <div className="preview-body">
              <div className="mini-portfolio">
                <div className="mini-hero">
                  <div className="mini-title">{form.title || 'Untitled'}</div>
                  <div className="mini-sub">{form.tagline || 'Your tagline appears here.'}</div>
                </div>

                {projects.length > 0 ? (
                  <div>
                    <div className="mini-section-title">Selected work</div>
                    {projects.slice(0, 3).map((project) => (
                      <div className="mini-proj" key={project.id} style={{ marginBottom: '0.45rem' }}>
                        <h5>{project.title}</h5>
                        <div className="faint" style={{ fontSize: '0.76rem' }}>
                          {splitTech(project.tech).slice(0, 3).join(' · ') || 'Add a tech stack'}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}

                {skills.length > 0 ? (
                  <div>
                    <div className="mini-section-title">Skills</div>
                    <div>
                      {skills.slice(0, 8).map((skill) => (
                        <span className="mini-chip" key={skill.id}>
                          {skill.name}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}

                {experiences.length > 0 ? (
                  <div>
                    <div className="mini-section-title">Experience</div>
                    {experiences.slice(0, 2).map((experience) => (
                      <div className="mini-proj" key={experience.id} style={{ marginBottom: '0.45rem' }}>
                        <h5>{experience.role}</h5>
                        <div className="faint" style={{ fontSize: '0.76rem' }}>
                          {experience.company}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </aside>
      </div>

      <Modal
        title={projectModal?.id ? 'Edit project' : 'Add project'}
        open={Boolean(projectModal)}
        onClose={() => setProjectModal(null)}
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setProjectModal(null)}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={saveProject}>
              Save
            </button>
          </>
        }
      >
        <form onSubmit={saveProject}>
          <div className="field">
            <label className="label" htmlFor="pj-title">
              Title
            </label>
            <input
              id="pj-title"
              className="input"
              value={projectForm.title}
              onChange={(event) => setProjectForm({ ...projectForm, title: event.target.value })}
              required
            />
          </div>
          <div className="field">
            <label className="label" htmlFor="pj-desc">
              Description
            </label>
            <textarea
              id="pj-desc"
              className="textarea"
              value={projectForm.description}
              onChange={(event) => setProjectForm({ ...projectForm, description: event.target.value })}
            />
          </div>
          <div className="field">
            <label className="label" htmlFor="pj-tech">
              Tech stack
            </label>
            <input
              id="pj-tech"
              className="input"
              placeholder="React, Node.js, PostgreSQL"
              value={projectForm.tech}
              onChange={(event) => setProjectForm({ ...projectForm, tech: event.target.value })}
            />
            <span className="field-hint">Comma separated.</span>
          </div>
          <div className="field-row">
            <div className="field">
              <label className="label" htmlFor="pj-repo">
              Repository
              </label>
              <input
                id="pj-repo"
                className="input"
                placeholder="https://github.com/…"
                value={projectForm.repoUrl}
                onChange={(event) => setProjectForm({ ...projectForm, repoUrl: event.target.value })}
              />
            </div>
            <div className="field">
              <label className="label" htmlFor="pj-live">
                Live URL
              </label>
              <input
                id="pj-live"
                className="input"
                placeholder="https://…"
                value={projectForm.liveUrl}
                onChange={(event) => setProjectForm({ ...projectForm, liveUrl: event.target.value })}
              />
            </div>
          </div>
          <label className="row" style={{ gap: '0.6rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={Boolean(projectForm.featured)}
              onChange={(event) => setProjectForm({ ...projectForm, featured: event.target.checked })}
              style={{ accentColor: 'var(--accent)', width: '16px', height: '16px' }}
            />
            <span style={{ fontSize: '0.9rem' }}>Mark as featured</span>
          </label>
          <button type="submit" className="sr-only">
            Save
          </button>
        </form>
      </Modal>

      <Modal
        title={experienceModal?.id ? 'Edit role' : 'Add role'}
        open={Boolean(experienceModal)}
        onClose={() => setExperienceModal(null)}
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setExperienceModal(null)}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={saveExperience}>
              Save
            </button>
          </>
        }
      >
        <form onSubmit={saveExperience}>
          <div className="field-row">
            <div className="field">
              <label className="label" htmlFor="ex-role">
                Role
              </label>
              <input
                id="ex-role"
                className="input"
                value={experienceForm.role}
                onChange={(event) => setExperienceForm({ ...experienceForm, role: event.target.value })}
                required
              />
            </div>
            <div className="field">
              <label className="label" htmlFor="ex-company">
                Company
              </label>
              <input
                id="ex-company"
                className="input"
                value={experienceForm.company}
                onChange={(event) => setExperienceForm({ ...experienceForm, company: event.target.value })}
                required
              />
            </div>
          </div>
          <div className="field-row">
            <div className="field">
              <label className="label" htmlFor="ex-start">
                Start
              </label>
              <input
                id="ex-start"
                className="input"
                placeholder="2022"
                value={experienceForm.startDate}
                onChange={(event) => setExperienceForm({ ...experienceForm, startDate: event.target.value })}
              />
            </div>
            <div className="field">
              <label className="label" htmlFor="ex-end">
                End
              </label>
              <input
                id="ex-end"
                className="input"
                placeholder="Present"
                value={experienceForm.endDate}
                onChange={(event) => setExperienceForm({ ...experienceForm, endDate: event.target.value })}
              />
            </div>
          </div>
          <div className="field">
            <label className="label" htmlFor="ex-desc">
              What you did
            </label>
            <textarea
              id="ex-desc"
              className="textarea"
              value={experienceForm.description}
              onChange={(event) => setExperienceForm({ ...experienceForm, description: event.target.value })}
            />
          </div>
          <button type="submit" className="sr-only">
            Save
          </button>
        </form>
      </Modal>
    </>
  );
}
