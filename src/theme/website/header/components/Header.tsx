"use client";

import React from "react";
import { motion } from "framer-motion";
import { Logo } from "./Logo";
import { Navigation } from "./Navigation";
import { MobileMenu } from "./MobileMenu";
import { ActionButtons } from "./ActionButtons";
import { useScrollHeader } from "../hooks/useScrollHeader";
import { useMobileMenu } from "../hooks/useMobileMenu";
import { useDropdown } from "../hooks/useDropdown";
import { HEADER_VARIANTS } from "../constants/animations";

export const Header: React.FC = () => {
  const { isScrolled } = useScrollHeader();
  const { isMobileMenuOpen, toggleMobileMenu, closeMobileMenu } =
    useMobileMenu();
  const { openDropdown, handleDropdownEnter, handleDropdownLeave } =
    useDropdown();

  return (
    <motion.header
      variants={HEADER_VARIANTS}
      initial="top"
      animate={isScrolled ? "scrolled" : "top"}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="px-6 w-full md:px-10 lg:px-16 sticky top-0 z-30 backdrop-blur-md border-b"
    >
      <nav className="flex justify-between items-center max-w-screen-xl mx-auto h-[80px]">
        <Logo />

        <Navigation
          openDropdown={openDropdown}
          onDropdownEnter={handleDropdownEnter}
          onDropdownLeave={handleDropdownLeave}
        />

        <ActionButtons
          isMobileMenuOpen={isMobileMenuOpen}
          onToggleMobileMenu={toggleMobileMenu}
        />
      </nav>

      <MobileMenu isOpen={isMobileMenuOpen} onClose={closeMobileMenu} />
    </motion.header>
  );
};
