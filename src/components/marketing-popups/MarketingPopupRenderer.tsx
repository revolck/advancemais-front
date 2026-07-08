"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";

import {
  createPopupContact,
  listActivePopups,
} from "@/api/websites/components/popups";
import type {
  PopupFrequency,
  WebsitePopup,
} from "@/api/websites/components/popups";
import ModalCustom, {
  ModalContentWrapper,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/custom/modal";
import { toastCustom } from "@/components/ui/custom";
import { queryKeys } from "@/lib/react-query/queryKeys";
import { PopupPreview } from "@/theme/dashboard/components/marketing/popups";
import { hydratePopupTemplatePresentation } from "@/theme/dashboard/components/marketing/popups/constants";
import { buildBuilderTreeFromPayload } from "@/theme/dashboard/components/marketing/popups/popupBuilder";

interface MarketingPopupRendererProps {
  scope: "WEBSITE" | "DASHBOARD";
}

const HOUR = 60 * 60 * 1000;
const frequencyMs: Partial<Record<PopupFrequency, number>> = {
  UMA_VEZ_A_CADA_HORA: HOUR,
  UMA_VEZ_A_CADA_6_HORAS: 6 * HOUR,
  UMA_VEZ_A_CADA_24_HORAS: 24 * HOUR,
};

function getDevice(): "MOBILE" | "DESKTOP" {
  if (typeof window === "undefined") return "DESKTOP";
  return window.matchMedia("(max-width: 767px)").matches ? "MOBILE" : "DESKTOP";
}

function getLocalKey(id: string) {
  return `advance:marketing-popup:${id}:last-shown`;
}

function getSessionKey(id: string) {
  return `advance:marketing-popup:${id}:session`;
}

function canShowByFrequency(popup: WebsitePopup) {
  if (typeof window === "undefined") return false;
  if (popup.frequencia === "SEM_LIMITE") return true;
  if (popup.frequencia === "UMA_VEZ_POR_SESSAO") {
    return sessionStorage.getItem(getSessionKey(popup.id)) !== "1";
  }
  const lastShown = Number(localStorage.getItem(getLocalKey(popup.id)) ?? 0);
  const interval = frequencyMs[popup.frequencia] ?? 0;
  return interval <= 0 || Date.now() - lastShown > interval;
}

function markShown(popup: WebsitePopup) {
  if (typeof window === "undefined") return;
  if (popup.frequencia === "UMA_VEZ_POR_SESSAO") {
    sessionStorage.setItem(getSessionKey(popup.id), "1");
    return;
  }
  if (popup.frequencia !== "SEM_LIMITE") {
    localStorage.setItem(getLocalKey(popup.id), String(Date.now()));
  }
}

function matchesHtmlSelector(popup: WebsitePopup) {
  const selector = popup.pageRules?.htmlSelector?.trim();
  if (popup.pageRules?.mode !== "HTML_SELECTOR") return true;
  return selector ? Boolean(document.querySelector(selector)) : false;
}

function resolveTriggerTarget(popup: WebsitePopup) {
  const triggerTarget = popup.triggerTarget?.trim();
  if (triggerTarget) {
    return document.querySelector(`[data-popup-target="${triggerTarget}"]`);
  }

  const legacySelector = popup.seletorAlvo?.trim();
  return legacySelector ? document.querySelector(legacySelector) : null;
}

function extractContactPayload(
  popup: WebsitePopup,
  values: Record<string, string | boolean>,
) {
  const builderRoot = buildBuilderTreeFromPayload({
    contentConfig: popup.contentConfig,
    formFields: popup.formFields,
    designConfig: popup.designConfig,
  });
  const builderInputNodes = builderRoot.areas.flatMap((area) =>
    area.children.filter((node) => node.type === "INPUT"),
  );
  const emailField = popup.formFields.find(
    (field) =>
      field.type === "email" || field.id.toLowerCase().includes("email"),
  );
  const phoneField = popup.formFields.find(
    (field) =>
      field.type === "tel" || field.id.toLowerCase().includes("telefone"),
  );
  const whatsappField = popup.formFields.find(
    (field) =>
      field.type === "whatsapp" || field.id.toLowerCase().includes("whatsapp"),
  );
  const nameField = popup.formFields.find(
    (field) =>
      field.id.toLowerCase().includes("nome") ||
      field.label.toLowerCase().includes("nome"),
  );

  const builderEmailField = builderInputNodes.find(
    (node) => node.inputKind === "EMAIL",
  );
  const builderPhoneField = builderInputNodes.find(
    (node) => node.inputKind === "PHONE",
  );
  const builderNameField = builderInputNodes.find(
    (node) => node.inputKind === "NAME",
  );

  const resolveNullableValue = (
    ...candidates: Array<string | boolean | undefined>
  ) => {
    const normalized = candidates.find(
      (candidate) =>
        typeof candidate === "string" && candidate.trim().length > 0,
    );

    const value = typeof normalized === "string" ? normalized.trim() : "";
    return value ? value : null;
  };

  const resolveFieldValue = (
    formFieldId: string | undefined,
    builderFieldId: string | undefined,
  ) => {
    return resolveNullableValue(
      formFieldId ? values[formFieldId] : undefined,
      builderFieldId ? values[builderFieldId] : undefined,
    );
  };

  return {
    nome: resolveFieldValue(nameField?.id, builderNameField?.id),
    email: resolveFieldValue(emailField?.id, builderEmailField?.id),
    telefone: resolveFieldValue(phoneField?.id, builderPhoneField?.id),
    whatsapp: resolveFieldValue(whatsappField?.id, builderPhoneField?.id),
    tag: popup.tag ?? null,
    origemPath: typeof window !== "undefined" ? window.location.pathname : null,
    payload: values,
  };
}

function resolvePopupSubmitError(error: unknown) {
  if (!error || typeof error !== "object") {
    return "Erro ao enviar cadastro.";
  }

  const typedError = error as Error & {
    details?: {
      message?: string;
      error?: string;
    };
  };

  return (
    typedError.details?.message ||
    typedError.details?.error ||
    typedError.message ||
    "Erro ao enviar cadastro."
  );
}

export function MarketingPopupRenderer({ scope }: MarketingPopupRendererProps) {
  const pathname = usePathname() || "/";
  const [device, setDevice] = useState<"MOBILE" | "DESKTOP">("DESKTOP");
  const [activePopup, setActivePopup] = useState<WebsitePopup | null>(null);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(
    () => new Set(),
  );
  const hydratedActivePopup = useMemo(
    () =>
      activePopup ? hydratePopupTemplatePresentation(activePopup) : null,
    [activePopup],
  );

  useEffect(() => {
    setDevice(getDevice());
    const onResize = () => setDevice(getDevice());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const activeQueryParams = useMemo(
    () => ({ scope, path: pathname, device }),
    [device, pathname, scope],
  );

  const query = useQuery({
    queryKey: queryKeys.marketingPopups.active(activeQueryParams),
    queryFn: () => listActivePopups(activeQueryParams),
    enabled: Boolean(pathname),
    refetchOnWindowFocus: false,
    retry: false,
  });

  const submitMutation = useMutation({
    mutationFn: (values: Record<string, string | boolean>) => {
      if (!activePopup) throw new Error("Pop-up não encontrado");
      return createPopupContact(
        hydratedActivePopup?.id ?? activePopup.id,
        extractContactPayload(hydratedActivePopup ?? activePopup, values),
      );
    },
    onSuccess: () => {
      if (!activePopup) return;
      markShown(activePopup);
      setDismissedIds((previous) => new Set(previous).add(activePopup.id));
      const redirectUrl = activePopup.redirectUrl?.trim();
      const redirectNewTab = activePopup.redirectNovaAba;
      setActivePopup(null);
      toastCustom.success("Cadastro enviado com sucesso.");
      if (redirectUrl) {
        if (redirectNewTab)
          window.open(redirectUrl, "_blank", "noopener,noreferrer");
        else window.location.href = redirectUrl;
      }
    },
    onError: (error) => {
      toastCustom.error(resolvePopupSubmitError(error));
    },
  });

  useEffect(() => {
    if (!query.data?.length || activePopup) return;
    const popup = query.data.find(
      (item) =>
        !dismissedIds.has(item.id) &&
        canShowByFrequency(item) &&
        matchesHtmlSelector(item),
    );
    if (!popup) return;

    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    let cleanup: (() => void) | undefined;
    const open = () => setActivePopup((current) => current ?? popup);

    if (popup.gatilho === "IMEDIATAMENTE") {
      timeoutId = setTimeout(open, 0);
    } else if (popup.gatilho === "ATRASO") {
      timeoutId = setTimeout(open, Math.max(0, popup.atrasoSegundos) * 1000);
    } else if (popup.gatilho === "INATIVIDADE") {
      const delay = (popup.inatividadeSegundos ?? 15) * 1000;
      const reset = () => {
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(open, delay);
      };
      ["mousemove", "keydown", "scroll", "touchstart"].forEach((eventName) =>
        window.addEventListener(eventName, reset, { passive: true }),
      );
      reset();
      cleanup = () =>
        ["mousemove", "keydown", "scroll", "touchstart"].forEach((eventName) =>
          window.removeEventListener(eventName, reset),
        );
    } else if (popup.gatilho === "SCROLL") {
      const threshold = popup.scrollPercentual ?? 50;
      const onScroll = () => {
        const scrollable =
          document.documentElement.scrollHeight - window.innerHeight;
        const percent =
          scrollable > 0 ? (window.scrollY / scrollable) * 100 : 100;
        if (percent >= threshold) open();
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      cleanup = () => window.removeEventListener("scroll", onScroll);
    } else if (popup.gatilho === "SAIDA") {
      const onMouseLeave = (event: MouseEvent) => {
        if (event.clientY <= 0) open();
      };
      document.addEventListener("mouseleave", onMouseLeave);
      cleanup = () => document.removeEventListener("mouseleave", onMouseLeave);
    } else if (popup.gatilho === "CLIQUE" || popup.gatilho === "HOVER") {
      const target = resolveTriggerTarget(popup);
      const eventName = popup.gatilho === "CLIQUE" ? "click" : "mouseenter";
      if (target) {
        target.addEventListener(eventName, open);
        cleanup = () => target.removeEventListener(eventName, open);
      }
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      cleanup?.();
    };
  }, [activePopup, dismissedIds, query.data]);

  const handleClose = () => {
    if (activePopup) {
      markShown(activePopup);
      setDismissedIds((previous) => new Set(previous).add(activePopup.id));
    }
    setActivePopup(null);
  };

  if (!activePopup) return null;

  return (
    <ModalCustom
      isOpen={Boolean(activePopup)}
      onClose={handleClose}
      size="full"
      backdrop="blur"
      hideCloseButton
    >
      <ModalContentWrapper
        hideCloseButton
        className="max-w-none bg-transparent p-0 shadow-none"
      >
        <ModalHeader className="sr-only">
          <ModalTitle>{activePopup.nome || "Pop-up promocional"}</ModalTitle>
        </ModalHeader>
        <PopupPreview
          content={(hydratedActivePopup ?? activePopup).contentConfig}
          fields={(hydratedActivePopup ?? activePopup).formFields}
          design={(hydratedActivePopup ?? activePopup).designConfig}
          viewport={device}
          position={
            device === "DESKTOP"
              ? (hydratedActivePopup ?? activePopup).posicaoDesktop
              : (hydratedActivePopup ?? activePopup).posicaoMobile
          }
          interactive
          onClose={handleClose}
          onSubmit={(values) => submitMutation.mutate(values)}
          isSubmitting={submitMutation.isPending}
        />
      </ModalContentWrapper>
    </ModalCustom>
  );
}
