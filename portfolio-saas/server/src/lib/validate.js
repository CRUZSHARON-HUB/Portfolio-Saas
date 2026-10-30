const MAX_FIELD = 5000;

export function text(value, { max = MAX_FIELD, fallback = '' } = {}) {
  if (value === undefined || value === null) return fallback;
  return String(value).trim().slice(0, max);
}

export function requiredText(value, { max = 200 } = {}) {
  const cleaned = text(value, { max });
  return cleaned.length > 0 ? cleaned : null;
}

export function int(value, fallback = 0) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function clamp(value, min, max, fallback = min) {
  const parsed = int(value, fallback);
  return Math.min(max, Math.max(min, parsed));
}

export function bool(value) {
  return value === true || value === 1 || value === '1' || value === 'true' ? 1 : 0;
}

export function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(value || '').trim());
}

export function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 48);
}

export function parseJsonObject(value, fallback = {}) {
  if (value && typeof value === 'object') return value;
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

export function uniqueSlug(base, isTaken) {
  const root = slugify(base) || 'portfolio';
  let candidate = root;
  let suffix = 1;
  while (isTaken(candidate)) {
    suffix += 1;
    candidate = `${root}-${suffix}`;
  }
  return candidate;
}
