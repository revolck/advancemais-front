import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { NavLink } from "./NavLink";
import { MOBILE_MENU_VARIANTS } from "../constants/animations";
import { ACADEMIA_NAVIGATION_ITEMS } from "../config/navigation";
import {
  ChevronDown,
  Video,
  FileText,
  BookOpen,
  HelpCircle,
  LifeBuoy,
  Code2,
} from "lucide-react";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const iconMap: Record<string, React.ElementType> = {
  Video,
  FileText,
  BookOpen,
  HelpCircle,
  LifeBuoy,
  Code2,
};

export const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose }) => {
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

  const toggleSubmenu = (key: string) => {
    setOpenSubmenu(openSubmenu === key ? null : key);
  };

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
          <div className="flex flex-col space-y-2 px-6">
            {ACADEMIA_NAVIGATION_ITEMS.map((item) => {
              if (item.type === "dropdown") {
                return (
                  <div key={item.key} className="space-y-2">
                    <button
                      onClick={() => toggleSubmenu(item.key)}
                      className="flex items-center justify-between w-full text-left text-base font-semibold text-gray-200 hover:text-[var(--secondary-color)] transition-colors duration-200 py-2"
                    >
                      <span>{item.label}</span>
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-200 ${
                          openSubmenu === item.key ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    <AnimatePresence>
                      {openSubmenu === item.key && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="pl-4 space-y-2 overflow-hidden"
                        >
                          {item.items?.map((subItem, index) => {
                            const IconComponent = subItem.iconName
                              ? iconMap[subItem.iconName]
                              : null;

                            return (
                              <a
                                key={index}
                                href={subItem.href}
                                onClick={onClose}
                                className="flex items-center gap-2 text-sm text-gray-300 hover:text-[var(--secondary-color)] py-2"
                              >
                                {IconComponent && (
                                  <IconComponent className="h-4 w-4" />
                                )}
                                <span>{subItem.label}</span>
                              </a>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              }

              return (
                <NavLink key={item.key} href={item.href} onClick={onClose}>
                  {item.label}
                </NavLink>
              );
            })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

