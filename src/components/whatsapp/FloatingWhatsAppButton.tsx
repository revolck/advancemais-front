"use client";

import React, { useLayoutEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { listInformacoesGerais } from "@/api/websites/components";
import { useCookieConsent } from "@/components/cookies/CookieConsentProvider";
import { formatPhoneForWhatsApp } from "@/lib/support";
import { cn } from "@/lib/utils";

const websiteInfoQueryKey = ["website", "informacoes-gerais"] as const;

const WhatsAppIcon: React.FC<{ className?: string; size?: number }> = ({
  className = "",
  size = 22,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    focusable="false"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);

export function FloatingWhatsAppButton({
  message = "Olá! Vim pelo site e gostaria de mais informações.",
  className,
}: {
  message?: string;
  className?: string;
}) {
  const { data } = useQuery({
    queryKey: websiteInfoQueryKey,
    queryFn: listInformacoesGerais,
    staleTime: 1000 * 60, // 1 minuto
  });

  const phone = useMemo(() => {
    const raw = data?.[0]?.whatsapp;
    if (!raw) return null;
    const formatted = formatPhoneForWhatsApp(String(raw));
    if (!formatted || formatted.length < 10) return null;
    return formatted;
  }, [data]);

  const href = useMemo(() => {
    if (!phone) return null;
    const url = new URL(`https://wa.me/${phone}`);
    if (message) url.searchParams.set("text", message);
    return url.toString();
  }, [phone, message]);

  const { isReady, consent, isPreferencesOpen } = useCookieConsent();
  const isCookieBannerVisible = isReady && !consent && !isPreferencesOpen;
  const baseOffsetPx = 20;
  const buttonSizePx = 56;
  const rightOffsetPx = 20;
  const overlapGapPx = 16;
  const [bottomPx, setBottomPx] = useState<number>(baseOffsetPx);

  useLayoutEffect(() => {
    const update = () => {
      if (!isCookieBannerVisible) {
        setBottomPx(baseOffsetPx);
        return;
      }

      const card = document.getElementById("cookie-consent-card");
      if (!card) {
        setBottomPx(baseOffsetPx);
        return;
      }

      const cardRect = card.getBoundingClientRect();

      const proposedButtonRect = {
        left: window.innerWidth - rightOffsetPx - buttonSizePx,
        right: window.innerWidth - rightOffsetPx,
        top: window.innerHeight - baseOffsetPx - buttonSizePx,
        bottom: window.innerHeight - baseOffsetPx,
      };

      const intersects =
        cardRect.left < proposedButtonRect.right &&
        cardRect.right > proposedButtonRect.left &&
        cardRect.top < proposedButtonRect.bottom &&
        cardRect.bottom > proposedButtonRect.top;

      if (!intersects) {
        setBottomPx(baseOffsetPx);
        return;
      }

      const nextBottom = Math.ceil(
        window.innerHeight - cardRect.top + overlapGapPx,
      );
      setBottomPx(Math.max(baseOffsetPx, nextBottom));
    };

    update();

    const resizeObserver =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(update)
        : null;

    const card = document.getElementById("cookie-consent-card");
    if (card) resizeObserver?.observe(card);
    window.addEventListener("resize", update);

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [isCookieBannerVisible]);

  if (!href) return null;

  return (
    <div
      className={cn("fixed right-5 z-[55]", className)}
      style={{
        bottom: `calc(${bottomPx}px + env(safe-area-inset-bottom))`,
      }}
    >
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Falar no WhatsApp"
        title="Falar no WhatsApp"
        className="group flex size-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_18px_40px_rgba(0,0,0,0.28)] ring-1 ring-black/10 transition hover:-translate-y-0.5 hover:shadow-[0_22px_55px_rgba(0,0,0,0.34)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2"
      >
        <WhatsAppIcon className="drop-shadow-sm transition-transform group-hover:scale-105" />
      </a>
    </div>
  );
}
