"use client";

import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { useCookieConsent } from "./CookieConsentProvider";

export function ConsentAwareVercelAnalytics() {
  const { isReady, consent } = useCookieConsent();

  if (!isReady) return null;
  if (!consent?.analytics) return null;

  return (
    <>
      <Analytics />
      <SpeedInsights />
    </>
  );
}

