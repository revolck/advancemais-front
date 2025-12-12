"use client";

import React from "react";
import { motion } from "framer-motion";
import { Menu, X, Search } from "lucide-react";
import { UserButton } from "@/components/ui/custom/user-button/components/UserButton";

interface ActionButtonsProps {
  isMobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  isMobileMenuOpen,
  onToggleMobileMenu,
}) => {
  return (
    <div className="flex items-center flex-shrink-0 space-x-4 lg:space-x-6">
      <button
        className="hidden md:inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/85 hover:bg-white/15"
        aria-label="Pesquisar"
        type="button"
        onClick={() => {
          const el = document.getElementById("catalogo");
          el?.scrollIntoView({ behavior: "smooth", block: "start" });
        }}
      >
        <Search className="h-4 w-4" />
      </button>

      {/* User Button */}
      <UserButton className="text-white" />

      {/* Mobile Menu Toggle */}
      <motion.button
        className="md:hidden text-gray-300 hover:text-white z-50"
        onClick={onToggleMobileMenu}
        aria-label="Toggle menu"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </motion.button>
    </div>
  );
};

