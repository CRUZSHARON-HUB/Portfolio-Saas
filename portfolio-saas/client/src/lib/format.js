export function initials(name = '') {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export function formatNumber(value = 0) {
  return new Intl.NumberFormat('en-US').format(value);
}

export function formatDate(value) {
  if (!value) return '—';
  const date = new Date(String(value).replace(' ', 'T'));
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatShortDate(value) {
  if (!value) return '—';
  const date = new Date(String(value).replace(' ', 'T'));
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function splitTech(tech = '') {
  return String(tech)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export function slugToTitle(slug = '') {
  return slug
    .split('-')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export const TEMPLATE_OPTIONS = [
  { id: 'nebula', label: 'Nebula', hint: 'Immersive 3D hero' },
  { id: 'prism', label: 'Prism', hint: 'Centred and editorial' },
  { id: 'atlas', label: 'Atlas', hint: 'Profile-first layout' },
  { id: 'monolith', label: 'Monolith', hint: 'Minimal and typographic' },
];

export const ACCENT_OPTIONS = [
  { id: 'violet', label: 'Violet', color: '#8b5cf6' },
  { id: 'cyan', label: 'Cyan', color: '#22d3ee' },
  { id: 'amber', label: 'Amber', color: '#fbbf24' },
  { id: 'emerald', label: 'Emerald', color: '#34d399' },
  { id: 'rose', label: 'Rose', color: '#fb7185' },
];
