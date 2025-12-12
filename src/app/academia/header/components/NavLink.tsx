import React, {
  type ReactNode,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
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
      "relative group text-sm! font-medium text-white/80 hover:text-white transition-colors duration-200 flex items-center py-1",
      className
    )}
    whileHover="hover"
  >
    {children}
    {hasDropdown && (
      <ChevronDown className="w-3 h-3 ml-1 inline-block transition-transform duration-200 group-hover:rotate-180" />
    )}
    {!hasDropdown && (
      <motion.div
        className="absolute bottom-[-6px] left-0 right-0 h-[2px] bg-red-600"
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

