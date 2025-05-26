import React from "react";
import { motion } from "framer-motion";
import { MenuIcon, CloseIcon } from "../icons";
import { NavLink } from "./NavLink";

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
      <NavLink href="#" className="hidden md:inline-block text-base">
        Entrar
      </NavLink>

      <motion.a
        href="#"
        className="bg-[#dc2626] text-white px-6 py-3 rounded-md text-base font-semibold hover:bg-opacity-90 transition-colors duration-200 whitespace-nowrap shadow-sm hover:shadow-md"
        whileHover={{ scale: 1.03, y: -1 }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: "spring", stiffness: 400, damping: 15 }}
      >
        Matricule-se
      </motion.a>

      <motion.button
        className="md:hidden text-gray-300 hover:text-white z-50"
        onClick={onToggleMobileMenu}
        aria-label="Toggle menu"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        {isMobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
      </motion.button>
    </div>
  );
};
