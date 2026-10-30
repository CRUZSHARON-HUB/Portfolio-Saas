const TOKEN_KEY = 'prismfolio.token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  const token = getToken();
  if (auth && token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`/api${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const raw = await response.text();
  let payload = null;
  try {
    payload = raw ? JSON.parse(raw) : null;
  } catch {
    payload = { error: raw || 'Unexpected server response' };
  }

  if (!response.ok) {
    const error = new Error(payload?.error || `Request failed (${response.status})`);
    error.status = response.status;
    throw error;
  }

  return payload;
}

export const api = {
  auth: {
    register: (body) => request('/auth/register', { method: 'POST', body, auth: false }),
    login: (body) => request('/auth/login', { method: 'POST', body, auth: false }),
    me: () => request('/auth/me'),
    updateMe: (body) => request('/auth/me', { method: 'PATCH', body }),
    plans: () => request('/auth/plans', { auth: false }),
  },
  portfolios: {
    list: () => request('/portfolios'),
    get: (id) => request(`/portfolios/${id}`),
    create: (body) => request('/portfolios', { method: 'POST', body }),
    update: (id, body) => request(`/portfolios/${id}`, { method: 'PATCH', body }),
    remove: (id) => request(`/portfolios/${id}`, { method: 'DELETE' }),
    publish: (id, published) => request(`/portfolios/${id}/publish`, { method: 'POST', body: { published } }),
    addProject: (id, body) => request(`/portfolios/${id}/projects`, { method: 'POST', body }),
    updateProject: (id, projectId, body) =>
      request(`/portfolios/${id}/projects/${projectId}`, { method: 'PATCH', body }),
    removeProject: (id, projectId) => request(`/portfolios/${id}/projects/${projectId}`, { method: 'DELETE' }),
    addSkill: (id, body) => request(`/portfolios/${id}/skills`, { method: 'POST', body }),
    updateSkill: (id, skillId, body) => request(`/portfolios/${id}/skills/${skillId}`, { method: 'PATCH', body }),
    removeSkill: (id, skillId) => request(`/portfolios/${id}/skills/${skillId}`, { method: 'DELETE' }),
    addExperience: (id, body) => request(`/portfolios/${id}/experiences`, { method: 'POST', body }),
    updateExperience: (id, experienceId, body) =>
      request(`/portfolios/${id}/experiences/${experienceId}`, { method: 'PATCH', body }),
    removeExperience: (id, experienceId) =>
      request(`/portfolios/${id}/experiences/${experienceId}`, { method: 'DELETE' }),
  },
  analytics: {
    get: (id) => request(`/analytics/${id}/analytics`),
    inquiries: (id) => request(`/analytics/${id}/inquiries`),
    markRead: (id, inquiryId) => request(`/analytics/${id}/inquiries/${inquiryId}/read`, { method: 'POST' }),
  },
  public: {
    portfolio: (slug) => request(`/public/${slug}`, { auth: false }),
    directory: () => request('/public/directory', { auth: false }),
    contact: (slug, body) => request(`/public/${slug}/contact`, { method: 'POST', body, auth: false }),
  },
};

export default api;
