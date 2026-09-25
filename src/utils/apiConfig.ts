/**
 * apiConfig.ts — Centralized API Base Configuration
 * ===================================================
 * Resolution order:
 *   1. `VITE_API_URL` when it is set to a usable value.
 *   2. Same-origin on a real HTTP(S) host — in production the static bundle and
 *      the API are served behind one origin / reverse proxy, so a hardcoded
 *      `localhost:8000` here would make every request fail for end users.
 *   3. `http://localhost:8000` only for local dev / native shells (file://),
 *      where same-origin infrastructure does not exist.
 */

const LOCAL_BACKEND = 'http://localhost:8000';

function resolveApiBase(): string {
  const env = (import.meta as unknown as { env?: Record<string, string | undefined> }).env ?? {};

  const configured = env.VITE_API_URL?.trim();
  if (configured) return configured.replace(/\/+$/, '');

  if (typeof window !== 'undefined' && /^https?:$/.test(window.location.protocol)) {
    return window.location.origin;
  }

  return LOCAL_BACKEND;
}

export const API_BASE = resolveApiBase();

export default API_BASE;
