"use client";

import type { PreparedScriptSnippet } from "@/lib/scripts/load-published-scripts";
import { ScriptInjector } from "@/components/scripts/script-injector";
import { useCookieConsent } from "./CookieConsentProvider";

/**
 * Importante:
 * - Hoje os scripts publicados pelo CMS não possuem metadados de categoria.
 * - Por segurança (LGPD), tratamos esses scripts como "Marketing" (não essenciais)
 *   e só injetamos quando houver consentimento explícito.
 */
export function ConsentAwareScriptInjector({
  scripts,
}: {
  scripts: PreparedScriptSnippet[];
}) {
  const { isReady, consent } = useCookieConsent();

  if (!isReady) return null;
  if (!consent?.marketing) return null;
  if (!scripts?.length) return null;

  return <ScriptInjector scripts={scripts} />;
}

