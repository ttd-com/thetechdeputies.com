/**
 * Environment helpers
 * Provides a single place to resolve the active `DATABASE_URL` based
 * on `DB_HOST_LOCAL` toggle.
 */

export function getDatabaseUrl(): string | undefined {
  const toggle = (process.env.DB_HOST_LOCAL || '').toLowerCase();

  // If explicit local toggle set to 'true', prefer DATABASE_URL_LOCAL
  if (toggle === 'true') {
    return process.env.DATABASE_URL_LOCAL || process.env.DATABASE_URL;
  }

  // If explicit toggle set to 'false', prefer DATABASE_URL_REMOTE
  if (toggle === 'false') {
    return process.env.DATABASE_URL_REMOTE || process.env.DATABASE_URL;
  }

  // Fallback: use DATABASE_URL if present
  return process.env.DATABASE_URL;
}

export default getDatabaseUrl;
