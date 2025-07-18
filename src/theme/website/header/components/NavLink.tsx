import React, {
  type ReactNode,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { motion } from "framer-motion";
import { ChevronDownIcon } from "../icons";
import { cn } from "@/lib/utils";

interface NavLinkProps {
  href?: string;
  children: ReactNode;
  hasDropdown?: boolean;
  className?: string;
  onClick?: (event: ReactMouseEvent<HTMLAnchorElement>) => void;
}

export const NavLink: React.FC<NavLinkProps> = ({
  href = "#",
  children,
  hasDropdown = false,
  className = "",
  onClick,
}) => (
  <motion.a
    href={href}
    onClick={onClick}
    className={cn(
      "relative group text-base font-semibold text-gray-200 hover:text-[var(--secondary-color)] transition-colors duration-200 flex items-center py-1",
      className
    )}
    whileHover="hover"
  >
    {children}
    {hasDropdown && <ChevronDownIcon />}
    {!hasDropdown && (
      <motion.div
        className="absolute bottom-[-2px] left-0 right-0 h-[1px] bg-[var(--color-blue)]"
        variants={{
          initial: { scaleX: 0, originX: 0.5 },
          hover: { scaleX: 1, originX: 0.5 },
        }}
        initial="initial"
        transition={{ duration: 0.3, ease: "easeOut" }}
      />
    )}
  </motion.a>
);
