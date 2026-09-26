export interface CookiePreferences {
  essential: true; // sempre true
  analytics: boolean;
  marketing: boolean;
  timestamp: string;
  version: string;
}

const STORAGE_KEY = 'cookie_consent';
const CURRENT_VERSION = '1.0';

export function getConsent(): CookiePreferences | null {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;
  try {
    const parsed = JSON.parse(stored);
    if (parsed.version !== CURRENT_VERSION) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveConsent(prefs: Omit<CookiePreferences, 'timestamp' | 'version'>) {
  const full: CookiePreferences = {
    ...prefs,
    essential: true,
    timestamp: new Date().toISOString(),
    version: CURRENT_VERSION,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(full));
  return full;
}

export function hasConsent(category: 'analytics' | 'marketing'): boolean {
  const consent = getConsent();
  if (!consent) return false;
  return consent[category] === true;
}