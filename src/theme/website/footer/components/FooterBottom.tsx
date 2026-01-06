"use client";

import React from "react";
import Link from "next/link";
import type { FooterLink } from "../types";
import { APP_VERSION } from "@/lib/constants";
import { useCookieConsent } from "@/components/cookies/CookieConsentProvider";

interface FooterBottomProps {
  legal: FooterLink[];
  copyright: string;
  address: string;
}

const getIcon = (iconName?: string) => {
  if (!iconName) return null;

  const iconMap = {
    shield: () => "🛡️",
    "file-text": () => "📄",
    cookie: () => "🍪",
  } as const;

  return iconMap[iconName as keyof typeof iconMap];
};

export const FooterBottom: React.FC<FooterBottomProps> = ({
  legal,
  copyright,
  address,
}) => {
  const { openPreferences } = useCookieConsent();

  return (
    <div className="mt-6 border-t border-white/5 pt-8 mb-[-20px]">
      <div className="text-center space-y-3">
        {/* Endereço */}
        <div className="flex items-start justify-center gap-2">
          <p className="text-gray-400! text-xs! mb-0!">{address}</p>
        </div>

        {/* Links Legais */}
        <nav className="flex flex-wrap justify-center gap-4 text-sm">
          {legal.map((link, index) => {
            const getIconEmoji = getIcon(link.icon);
            const opensPreferences = link.href === "/cookies";

            return (
              <Link
                key={index}
                href={link.href}
                className="text-gray-400 hover:text-white hover:underline transition-colors duration-200 flex items-center gap-1"
                onClick={(event) => {
                  if (!opensPreferences) return;
                  if (
                    event.defaultPrevented ||
                    event.button !== 0 ||
                    event.metaKey ||
                    event.altKey ||
                    event.ctrlKey ||
                    event.shiftKey
                  ) {
                    return;
                  }
                  event.preventDefault();
                  openPreferences();
                }}
              >
                {getIconEmoji && <span>{getIconEmoji()}</span>}
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Copyright */}
        <p className="text-[var(--secondary-color)]! text-xs! mb-0!">
          {copyright}
        </p>

        {/* Versão e Créditos */}
        <div className="flex flex-col items-center gap-1 pt-2">
          <p className="text-gray-500! text-[10px]! mb-0!">
            Versão {APP_VERSION}
          </p>
          <p className="text-gray-500! text-[10px]! mb-0!">
            Desenvolvido por{" "}
            <a
              href="https://revolck.com.br"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400! hover:text-white! hover:underline transition-colors"
            >
              Revolck
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};
