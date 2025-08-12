import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { NavLink } from "./NavLink";
import { MOBILE_MENU_VARIANTS } from "../constants/animations";
import { NAVIGATION_ITEMS } from "@/config/HeaderNavigation";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="mobile-menu"
          variants={MOBILE_MENU_VARIANTS}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="md:hidden absolute top-full left-0 right-0 bg-[var(--color-blue)]/95 backdrop-blur-sm shadow-lg py-4 border-t border-blue-800/50"
        >
          <div className="flex flex-col items-center space-y-4 px-6">
            {NAVIGATION_ITEMS.map((item) => (
              <NavLink key={item.key} href={item.href} onClick={onClose}>
                {item.label}
              </NavLink>
            ))}
            <hr className="w-full border-t border-gray-700/50 my-2" />
            <NavLink href="/auth/login" onClick={onClose}>
              Entrar
            </NavLink>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
