"use client";

import Link from "next/link";
import { ButtonCustom, Icon } from "@/components/ui/custom";
import { useCookieConsent } from "./CookieConsentProvider";

export function CookieConsentBanner() {
  const {
    isReady,
    consent,
    isPreferencesOpen,
    acceptAll,
    rejectAll,
    openPreferences,
  } = useCookieConsent();

  if (!isReady) return null;
  if (consent) return null;
  if (isPreferencesOpen) return null;

  return (
    <div
      id="cookie-consent-banner"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] p-4 sm:p-6"
    >
      <div className="mx-auto max-w-5xl">
        <div
          id="cookie-consent-card"
          className="pointer-events-auto relative overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-[0_24px_60px_rgba(0,0,0,0.35)] ring-1 ring-black/5"
        >
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[var(--primary-color)]/6 via-transparent to-[var(--secondary-color)]/10" />
          <div className="relative flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:p-5">
            <div className="flex gap-3">
              <div className="mt-0.5 flex size-10 items-center justify-center rounded-xl bg-[var(--primary-color)]/10 text-[var(--primary-color)] ring-1 ring-[var(--primary-color)]/15">
                <Icon name="Cookie" size={18} />
              </div>
              <div className="min-w-0">
                <p className="mb-1! text-sm! font-semibold! text-gray-900!">
                  Preferências de cookies
                </p>
                <p className="mb-0! text-sm! leading-relaxed! text-gray-600!">
                  Usamos cookies essenciais e, com seu consentimento, cookies
                  opcionais.{" "}
                  <Link
                    href="/cookies"
                    className="font-semibold! text-[var(--primary-color)]! hover:underline"
                  >
                    Saiba mais
                  </Link>{" "}
                  ou{" "}
                  <Link
                    href="/politica-privacidade"
                    className="font-semibold! text-[var(--primary-color)]! hover:underline"
                  >
                    Política de Privacidade
                  </Link>
                  .
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
              <ButtonCustom
                variant="outline"
                size="sm"
                withAnimation={false}
                onClick={rejectAll}
              >
                Somente essenciais
              </ButtonCustom>
              <ButtonCustom
                variant="ghost"
                size="sm"
                withAnimation={false}
                onClick={openPreferences}
              >
                Gerenciar
              </ButtonCustom>
              <ButtonCustom
                variant="primary"
                size="sm"
                withAnimation={false}
                onClick={acceptAll}
              >
                Aceitar todos
              </ButtonCustom>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
