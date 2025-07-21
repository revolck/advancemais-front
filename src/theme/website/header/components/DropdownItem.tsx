import React, { type ReactNode } from "react";

interface DropdownItemProps {
  href?: string;
  children: ReactNode;
  icon?: ReactNode;
  className?: string;
}

export const DropdownItem: React.FC<DropdownItemProps> = ({
  href = "#",
  children,
  icon,
}) => (
  <a
    href={href}
    className="group flex items-center justify-between w-full px-4 py-3 text-base text-gray-300 hover:text-[var(--secondary-color)] rounded-md transition-colors duration-150 font-medium"
  >
    <span>{children}</span>
    {icon && (
      <span className="w-4 h-4 ml-2 opacity-70 group-hover:opacity-100 transition-opacity">
        {icon}
      </span>
    )}
  </a>
);
