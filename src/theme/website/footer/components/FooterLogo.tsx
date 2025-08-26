"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { FOOTER_SECTION_VARIANTS } from "../constants/animations";

export const FooterLogo: React.FC = () => {
  return (
    <motion.div
      variants={FOOTER_SECTION_VARIANTS}
      className="flex flex-col items-center lg:items-start"
    >
      <Image
        src="/images/logos/logo_branco.webp"
        alt="Advance+ Logo"
        width={170}
        height={100}
        className="mb-4"
        priority={false}
        quality={90}
      />
    </motion.div>
  );
};
