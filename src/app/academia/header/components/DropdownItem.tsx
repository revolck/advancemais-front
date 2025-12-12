import React, { type ReactNode } from "react";
import {
  Video,
  FileText,
  BookOpen,
  HelpCircle,
  LifeBuoy,
  Code2,
} from "lucide-react";

interface DropdownItemProps {
  href?: string;
  children: ReactNode;
  iconName?: string;
  className?: string;
}

const iconMap: Record<string, React.ElementType> = {
  Video,
  FileText,
  BookOpen,
  HelpCircle,
  LifeBuoy,
  Code2,
};

export const DropdownItem: React.FC<DropdownItemProps> = ({
  href = "#",
  children,
  iconName,
}) => {
  const IconComponent = iconName ? iconMap[iconName] : null;

  return (
    <a
      href={href}
      className="group flex items-center gap-3 w-full px-4 py-3 text-base text-gray-300 hover:text-[var(--secondary-color)] hover:bg-blue-700/30 rounded-md transition-all duration-150 font-medium"
    >
      {IconComponent && (
        <span className="w-4 h-4 opacity-70 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <IconComponent className="h-4 w-4" />
        </span>
      )}
      <span>{children}</span>
    </a>
  );
};

