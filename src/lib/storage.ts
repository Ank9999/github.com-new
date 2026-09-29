// Thin LocalStorage wrappers. Everything here stays on the user's device —
// nothing in this file makes a network call. See spec §15/§16.

const HISTORY_KEY = "bns-finder:recent-searches";
const THEME_KEY = "bns-finder:theme";
const MAX_HISTORY = 10;

export type Theme = "light" | "dark";

function safeGet(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // LocalStorage unavailable (private mode, quota, etc.) — fail silently.
  }
}

export function getRecentSearches(): string[] {
  const raw = safeGet(HISTORY_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export function addRecentSearch(query: string): string[] {
  const trimmed = query.trim();
  if (!trimmed) return getRecentSearches();
  const existing = getRecentSearches().filter(
    (q) => q.toLowerCase() !== trimmed.toLowerCase()
  );
  const updated = [trimmed, ...existing].slice(0, MAX_HISTORY);
  safeSet(HISTORY_KEY, JSON.stringify(updated));
  return updated;
}

export function clearRecentSearches(): void {
  try {
    window.localStorage.removeItem(HISTORY_KEY);
  } catch {
    // ignore
  }
}

export function getStoredTheme(): Theme | null {
  const raw = safeGet(THEME_KEY);
  return raw === "light" || raw === "dark" ? raw : null;
}

export function setStoredTheme(theme: Theme): void {
  safeSet(THEME_KEY, theme);
}
