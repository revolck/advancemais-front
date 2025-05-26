"use client";

import React from "react";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import { FooterLogo } from "./FooterLogo";
import { SocialLinks } from "./SocialLinks";
import { FooterSection } from "./FooterSection";
import { ContactInfo } from "./ContactInfo";
import { FooterBottom } from "./FooterBottom";
import { FOOTER_CONFIG } from "../constants/navigation";
import {
  FOOTER_VARIANTS,
  FOOTER_SECTION_VARIANTS,
} from "../constants/animations";

export const Footer: React.FC = () => {
  const isMobile = useIsMobile();

  return (
    <footer className="bg-[#001a57] text-white">
      <motion.div
        variants={FOOTER_VARIANTS}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        className="container mx-auto py-16 px-4"
      >
        {isMobile ? (
          // Versão Mobile - Alinhamento à esquerda
          <div className="space-y-8">
            {/* Logo e Redes Sociais */}
            <motion.div
              variants={FOOTER_SECTION_VARIANTS}
              className="flex flex-col items-center"
            >
              <FooterLogo />
              <SocialLinks />
            </motion.div>

            {/* Seções de Links - Alinhadas à esquerda */}
            <div className="grid grid-cols-1 gap-8">
              {FOOTER_CONFIG.sections.map((section, index) => (
                <FooterSection
                  key={index}
                  section={section}
                  isMobile={isMobile}
                />
              ))}

              {/* Informações de Contato - Alinhadas à esquerda */}
              <motion.div variants={FOOTER_SECTION_VARIANTS}>
                <ContactInfo
                  contact={FOOTER_CONFIG.contact}
                  isMobile={isMobile}
                />
              </motion.div>
            </div>
          </div>
        ) : (
          // Versão Desktop
          <div className="space-y-8">
            <div className="flex flex-wrap lg:flex-nowrap justify-between gap-8">
              {/* Logo e Redes Sociais */}
              <div className="flex-1 lg:basis-[30%]">
                <FooterLogo />
                <SocialLinks />
              </div>

              {/* Seções de Navegação */}
              {FOOTER_CONFIG.sections.map((section, index) => (
                <div key={index} className="flex-1 lg:basis-[17.5%]">
                  <FooterSection section={section} isMobile={isMobile} />
                </div>
              ))}

              {/* Informações de Contato */}
              <div className="flex-1 lg:basis-[17.5%]">
                <ContactInfo
                  contact={FOOTER_CONFIG.contact}
                  isMobile={isMobile}
                />
              </div>
            </div>
          </div>
        )}

        {/* Footer Inferior */}
        <FooterBottom
          legal={FOOTER_CONFIG.legal}
          copyright={FOOTER_CONFIG.copyright}
          address={FOOTER_CONFIG.contact.address}
        />
      </motion.div>
    </footer>
  );
};
