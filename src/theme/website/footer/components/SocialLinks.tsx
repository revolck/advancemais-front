"use client";

import React from "react";
import Link from "next/link";
import {
  Facebook,
  Linkedin,
  Youtube,
  Instagram,
  ExternalLink,
} from "lucide-react";

type Socials = Partial<
  Record<"facebook" | "linkedin" | "youtube" | "instagram", string>
>;

const getIcon = (iconName: string) => {
  const iconMap = {
    facebook: Facebook,
    linkedin: Linkedin,
    youtube: Youtube,
    instagram: Instagram,
  };

  const IconComponent = iconMap[iconName as keyof typeof iconMap];
  return IconComponent || ExternalLink;
};

interface Props {
  socials?: Socials;
}

export const SocialLinks: React.FC<Props> = ({ socials = {} }) => {
  const entries = Object.entries(socials)
    .filter(([, url]) => typeof url === "string" && Boolean(url))
    .map(([key, url]) => ({ key, url })) as { key: string; url: string }[];

  if (entries.length === 0) return null;

  return (
    <div className="flex flex-col items-center lg:items-start mt-6">
      <h4 className="text-sm font-semibold uppercase text-white mb-4">
        Siga Nossas Redes Sociais
      </h4>
      <div className="flex gap-4">
        {entries.map((social) => {
          const IconComponent = getIcon(social.key);
          return (
            <div key={social.key}>
              <Link
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.key}
                className="text-red-600 hover:text-white transition-colors duration-200"
              >
                <IconComponent size={24} />
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
};
