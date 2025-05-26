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
        className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-56 origin-top z-40"
      >
        <div className="bg-[#00257D] border border-blue-700/50 rounded-md shadow-xl p-2">
          {items.map((item, index) => (
            <DropdownItem key={index} href={item.href} icon={item.icon}>
              {item.label}
            </DropdownItem>
          ))}
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);
