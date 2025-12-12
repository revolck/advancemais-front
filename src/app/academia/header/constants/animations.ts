import { type Variants } from "framer-motion";

export const HEADER_VARIANTS: Variants = {
  top: {
    backgroundColor: "rgba(0, 0, 0, 0.25)", // Netflix: transparente sobre o banner
    borderBottomColor: "rgba(255, 255, 255, 0.08)",
    position: "fixed",
    boxShadow: "none",
  },
  scrolled: {
    backgroundColor: "rgba(0, 0, 0, 0.92)", // Netflix: sólido ao rolar
    borderBottomColor: "rgba(255, 255, 255, 0.08)",
    boxShadow:
      "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    position: "fixed",
  },
};

export const MOBILE_MENU_VARIANTS: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.2, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: { duration: 0.15, ease: "easeIn" },
  },
};

export const DROPDOWN_VARIANTS: Variants = {
  hidden: { opacity: 0, y: 10, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.2, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    y: 10,
    scale: 0.95,
    transition: { duration: 0.15 },
  },
};

