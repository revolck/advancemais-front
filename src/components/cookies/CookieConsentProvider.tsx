"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { toastCustom } from "@/components/ui/custom/toast";
import type { CookieConsentState } from "@/lib/cookies/consent";
import {
  getCookieConsentFromDocument,
  setCookieConsentOnDocument,
} from "@/lib/cookies/consent";

export type CookieConsentPreferencesDraft = {
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
};

type CookieConsentContextValue = {
  isReady: boolean;
  consent: CookieConsentState | null;
  preferences: CookieConsentPreferencesDraft;
  isPreferencesOpen: boolean;
  openPreferences: () => void;
  closePreferences: () => void;
  acceptAll: () => void;
  rejectAll: () => void;
  savePreferences: (prefs: CookieConsentPreferencesDraft) => void;
};

const CookieConsentContext = createContext<CookieConsentContextValue | null>(
  null
);

export function CookieConsentProvider({ children }: { children: React.ReactNode }) {
  const [consent, setConsent] = useState<CookieConsentState | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);

  useEffect(() => {
    setConsent(getCookieConsentFromDocument());
    setIsReady(true);
  }, []);

  const preferences = useMemo<CookieConsentPreferencesDraft>(
    () => ({
      functional: consent?.functional ?? false,
      analytics: consent?.analytics ?? false,
      marketing: consent?.marketing ?? false,
    }),
    [consent]
  );

  const openPreferences = useCallback(() => setIsPreferencesOpen(true), []);
  const closePreferences = useCallback(() => setIsPreferencesOpen(false), []);

  const applyPreferences = useCallback(
    (
      prefs: CookieConsentPreferencesDraft,
      options?: { close?: boolean; toastMessage?: string }
    ) => {
      const next = setCookieConsentOnDocument(prefs);
      setConsent(next);

      if (options?.close) {
        setIsPreferencesOpen(false);
      }

      if (options?.toastMessage) {
        toastCustom.success(options.toastMessage);
      }
    },
    []
  );

  const acceptAll = useCallback(() => {
    applyPreferences(
      { functional: true, analytics: true, marketing: true },
      { close: true, toastMessage: "Cookies aceitos." }
    );
  }, [applyPreferences]);

  const rejectAll = useCallback(() => {
    applyPreferences(
      { functional: false, analytics: false, marketing: false },
      { close: true, toastMessage: "Preferências atualizadas." }
    );
  }, [applyPreferences]);

  const savePreferences = useCallback(
    (prefs: CookieConsentPreferencesDraft) => {
      applyPreferences(prefs, {
        close: true,
        toastMessage: "Preferências de cookies salvas.",
      });
    },
    [applyPreferences]
  );

  const value = useMemo<CookieConsentContextValue>(
    () => ({
      isReady,
      consent,
      preferences,
      isPreferencesOpen,
      openPreferences,
      closePreferences,
      acceptAll,
      rejectAll,
      savePreferences,
    }),
    [
      isReady,
      consent,
      preferences,
      isPreferencesOpen,
      openPreferences,
      closePreferences,
      acceptAll,
      rejectAll,
      savePreferences,
    ]
  );

  return (
    <CookieConsentContext.Provider value={value}>
      {children}
    </CookieConsentContext.Provider>
  );
}

export function useCookieConsent(): CookieConsentContextValue {
  const context = useContext(CookieConsentContext);
  if (!context) {
    throw new Error("useCookieConsent must be used within CookieConsentProvider");
  }
  return context;
}
