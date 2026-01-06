export const COOKIE_CONSENT_COOKIE_NAME = "adv_cookie_consent";
export const COOKIE_CONSENT_VERSION = 1 as const;

export type CookieConsentPreferences = {
  necessary: true;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
};

export type CookieConsentState = CookieConsentPreferences & {
  version: number;
  updatedAt: number;
};

type CookieConsentPayload = {
  v: number;
  f?: 1;
  a?: 1;
  m?: 1;
  t?: number;
};

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

function getCookieValue(name: string): string | null {
  if (typeof document === "undefined") return null;

  const cookie = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`))
    ?.split("=")[1];

  return cookie ? decodeURIComponent(cookie) : null;
}

function getCookieDomainAttribute(): string | null {
  if (typeof window === "undefined") return null;

  const host = window.location.hostname;
  const isLocalhost = host === "localhost" || host === "127.0.0.1";
  if (isLocalhost) return null;

  const baseDomain = host
    .replace(/^app\./, "")
    .replace(/^auth\./, "")
    .replace(/^www\./, "");

  if (!baseDomain.includes(".")) return null;

  return `domain=.${baseDomain}`;
}

function buildCookieString(value: string): string {
  const attributes = [
    `${COOKIE_CONSENT_COOKIE_NAME}=${encodeURIComponent(value)}`,
    "path=/",
    `max-age=${ONE_YEAR_SECONDS}`,
    "samesite=lax",
  ];

  const domain = getCookieDomainAttribute();
  if (domain) attributes.push(domain);

  if (typeof window !== "undefined" && window.location.protocol === "https:") {
    attributes.push("secure");
  }

  return attributes.join("; ");
}

function serializeConsent(preferences: CookieConsentPreferences): string {
  const payload: CookieConsentPayload = {
    v: COOKIE_CONSENT_VERSION,
    t: Date.now(),
  };

  if (preferences.functional) payload.f = 1;
  if (preferences.analytics) payload.a = 1;
  if (preferences.marketing) payload.m = 1;

  return JSON.stringify(payload);
}

function parseConsent(raw: string | null): CookieConsentState | null {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as CookieConsentPayload;

    if (!parsed || typeof parsed !== "object") return null;
    if (parsed.v !== COOKIE_CONSENT_VERSION) return null;

    return {
      version: parsed.v,
      necessary: true,
      functional: Boolean(parsed.f),
      analytics: Boolean(parsed.a),
      marketing: Boolean(parsed.m),
      updatedAt: typeof parsed.t === "number" ? parsed.t : Date.now(),
    };
  } catch {
    return null;
  }
}

export function getCookieConsentFromDocument(): CookieConsentState | null {
  const raw = getCookieValue(COOKIE_CONSENT_COOKIE_NAME);
  return parseConsent(raw);
}

export function setCookieConsentOnDocument(
  preferences: Omit<CookieConsentPreferences, "necessary">,
): CookieConsentState {
  const next: CookieConsentPreferences = { necessary: true, ...preferences };
  const serialized = serializeConsent(next);

  if (typeof document !== "undefined") {
    document.cookie = buildCookieString(serialized);
  }

  return parseConsent(serialized) ?? {
    version: COOKIE_CONSENT_VERSION,
    necessary: true,
    functional: Boolean(preferences.functional),
    analytics: Boolean(preferences.analytics),
    marketing: Boolean(preferences.marketing),
    updatedAt: Date.now(),
  };
}

export function clearCookieConsentOnDocument(): void {
  if (typeof document === "undefined") return;

  const attributes = [
    `${COOKIE_CONSENT_COOKIE_NAME}=`,
    "path=/",
    "max-age=0",
    "samesite=lax",
  ];

  const domain = getCookieDomainAttribute();
  if (domain) attributes.push(domain);

  if (typeof window !== "undefined" && window.location.protocol === "https:") {
    attributes.push("secure");
  }

  document.cookie = attributes.join("; ");
}

export function hasAnalyticsConsent(consent: CookieConsentState | null): boolean {
  return Boolean(consent?.analytics);
}

export function hasFunctionalConsent(consent: CookieConsentState | null): boolean {
  return Boolean(consent?.functional);
}

export function hasMarketingConsent(consent: CookieConsentState | null): boolean {
  return Boolean(consent?.marketing);
}
