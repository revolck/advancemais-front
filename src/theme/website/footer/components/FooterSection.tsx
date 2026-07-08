"use client";

import React from "react";
import Link from "next/link";
import { useCookieConsent } from "@/components/cookies/CookieConsentProvider";
import {
  ExternalLink,
  Users,
  Zap,
  MessageCircle,
  UserCheck,
  Home,
  Mail,
  GraduationCap,
  Lightbulb,
  Monitor,
  HelpCircle,
  Phone,
  Ear,
  Shield,
  FileText,
  Cookie,
} from "lucide-react";
import type { FooterSection as FooterSectionType } from "../types";

const getIcon = (iconName?: string) => {
  if (!iconName) return null;

  const iconMap = {
    users: Users,
    zap: Zap,
    "message-circle": MessageCircle,
    "user-check": UserCheck,
    home: Home,
    mail: Mail,
    "graduation-cap": GraduationCap,
    lightbulb: Lightbulb,
    monitor: Monitor,
    "help-circle": HelpCircle,
    phone: Phone,
    ear: Ear,
    shield: Shield,
    "file-text": FileText,
    cookie: Cookie,
  } as const;

  const IconComponent = iconMap[iconName as keyof typeof iconMap];
  return IconComponent || ExternalLink;
};

interface FooterSectionProps {
  section: FooterSectionType;
  isMobile?: boolean;
}

export const FooterSection: React.FC<FooterSectionProps> = ({
  section,
  isMobile = false,
}) => {
  const SectionIcon = getIcon(section.icon);
  const { openPreferences } = useCookieConsent();

  return (
    <div className="flex-1">
      <div className="flex items-center gap-2 mb-4">
        {SectionIcon && (
          <SectionIcon
            className="w-5 h-5 text-red-600 shrink-0"
            aria-hidden="true"
            focusable="false"
          />
        )}
        <h4 className="text-sm! font-semibold! uppercase! text-white! leading-none! mb-0!">
          {section.title}
        </h4>
      </div>

      <ul className="space-y-2">
        {section.links.map((link, index) => {
          const LinkIcon = getIcon(link.icon);

          if (link.disabled) {
            return (
              <li key={index}>
                <span className="flex items-center gap-2 text-gray-500">
                  {LinkIcon && <LinkIcon className="w-3 h-3 text-gray-600" />}
                  <span>{link.label}</span>
                </span>
              </li>
            );
          }

          return (
            <li key={index}>
              <Link
                href={link.href}
                data-popup-target={link.popupTarget}
                {...(link.external && {
                  target: "_blank",
                  rel: "noopener noreferrer",
                })}
                className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center group gap-2"
                onClick={(event) => {
                  const opensPreferences = link.href === "/cookies";
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
                {LinkIcon && (
                  <LinkIcon className="w-3 h-3 text-gray-500 group-hover:text-red-600 transition-colors" />
                )}
                <span>{link.label}</span>
                {link.external && (
                  <ExternalLink className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
