"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { FOOTER_SECTION_VARIANTS } from "../constants/animations";
import type { FooterLink } from "../types";

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
  return (
    <motion.div
      variants={FOOTER_SECTION_VARIANTS}
      className="mt-8 border-t border-gray-700 pt-6"
    >
      <div className="text-center space-y-2">
        {/* Endereço */}
        <div className="flex items-start justify-center gap-2">
          <p className="text-gray-400 text-xs">{address}</p>
        </div>

        {/* Copyright */}
        <p className="text-gray-400 text-xs">{copyright}</p>

        {/* Links Legais */}
        <nav className="flex flex-wrap justify-center gap-4 text-sm">
          {legal.map((link, index) => {
            const getIconEmoji = getIcon(link.icon);

            return (
              <Link
                key={index}
                href={link.href}
                className="text-gray-400 hover:text-white hover:underline transition-colors duration-200 flex items-center gap-1"
              >
                {getIconEmoji && <span>{getIconEmoji()}</span>}
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </motion.div>
  );
};
