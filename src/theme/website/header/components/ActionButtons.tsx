"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MenuIcon, CloseIcon } from "../icons";
import { NavLink } from "./NavLink";
import { UserButton } from "@/components/ui/custom/user-button/components/UserButton";

interface ActionButtonsProps {
  isMobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  isMobileMenuOpen,
  onToggleMobileMenu,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authCheckCompleted, setAuthCheckCompleted] = useState(false);

  useEffect(() => {
    const hasToken = document.cookie
      .split("; ")
      .some((row) => row.startsWith("token="));
    setIsAuthenticated(hasToken);
    setAuthCheckCompleted(true);
  }, []);

  return (
    <div className="flex items-center flex-shrink-0 space-x-4 lg:space-x-6">
      {authCheckCompleted && isAuthenticated ? (
        <UserButton className="text-white" />
      ) : (
        <>
      <motion.div
        className="bg-white px-4 py-1 rounded-md hidden md:inline-block"
        whileHover={{ scale: 1.03, y: -1 }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: "spring", stiffness: 400, damping: 15 }}
      >
        <NavLink
          href="https://auth.advancemais.com/login"
          className="text-base text-[var(--color-blue)] hover:text-[var(--color-blue)]"
        >
          Entrar
        </NavLink>
      </motion.div>

      <motion.div
        className="bg-[var(--secondary-color)] px-4 py-1 rounded-md"
        whileHover={{ scale: 1.03, y: -1 }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: "spring", stiffness: 400, damping: 15 }}
      >
        <NavLink
          href="https://auth.advancemais.com/register"
          className="text-base text-white hover:text-white"
        >
          Cadastre-se
        </NavLink>
      </motion.div>
        </>
      )}

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
