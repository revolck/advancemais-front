import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DropdownItem } from "./DropdownItem";
import { DROPDOWN_VARIANTS } from "../constants/animations";
import type { DropdownItemType } from "../types";

interface DropdownMenuProps {
  isOpen: boolean;
  items: DropdownItemType[];
}

export const DropdownMenu: React.FC<DropdownMenuProps> = ({
  isOpen,
  items,
}) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        variants={DROPDOWN_VARIANTS}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 origin-top z-40"
      >
        <div className="bg-[var(--color-blue)] border border-blue-700/50 rounded-lg shadow-xl py-2 w-max min-w-[250px] max-w-[400px]">
          {items.map((item, index) => (
            <DropdownItem
              key={index}
              href={item.href}
              icon={item.icon}
              className="px-6 py-3 text-white hover:bg-blue-700/50 transition-colors duration-200 whitespace-nowrap text-base font-medium"
            >
              {item.label}
            </DropdownItem>
          ))}
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);
