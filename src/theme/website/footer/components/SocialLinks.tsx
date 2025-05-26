"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Facebook,
  Linkedin,
  Youtube,
  Instagram,
  ExternalLink,
} from "lucide-react";
import socials from "@/config/socials";
import {
  FOOTER_SECTION_VARIANTS,
  SOCIAL_ICON_VARIANTS,
} from "../constants/animations";

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

export const SocialLinks: React.FC = () => {
  const activeSocials = socials.filter((social) => social.active);

  return (
    <motion.div
      variants={FOOTER_SECTION_VARIANTS}
      className="flex flex-col items-center lg:items-start mt-6"
    >
      <h4 className="text-sm font-semibold uppercase text-white mb-4">
        Siga Nossas Redes Sociais
      </h4>
      <div className="flex gap-4">
        {activeSocials.map((social) => {
          const IconComponent = getIcon(social.icon);
          return (
            <motion.div
              key={social.name}
              variants={SOCIAL_ICON_VARIANTS}
              initial="initial"
              whileHover="hover"
              whileTap="tap"
            >
              <Link
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.name}
                className="text-red-600 hover:text-white transition-colors duration-200"
              >
                <IconComponent size={24} />
              </Link>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};
