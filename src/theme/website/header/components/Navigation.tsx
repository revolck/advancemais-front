import React from "react";
import { NavLink } from "./NavLink";
import { DropdownMenu } from "./DropdownMenu";
import { NAVIGATION_ITEMS } from "@/config/HeaderNavigation";

interface NavigationProps {
  openDropdown: string | null;
  onDropdownEnter: (key: string) => void;
  onDropdownLeave: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  openDropdown,
  onDropdownEnter,
  onDropdownLeave,
}) => {
  const getPopupTarget = (href: string) => {
    if (href === "/") return "website-nav-home";
    if (href === "/sobre") return "website-nav-about";
    if (href === "/cursos") return "website-nav-courses";
    if (href === "/vagas") return "website-nav-vagas";
    return undefined;
  };

  return (
    <div className="hidden md:flex items-center justify-center flex-grow space-x-6 lg:space-x-8 px-4">
      {NAVIGATION_ITEMS.map((item) => {
        if (item.type === "dropdown") {
          return (
            <div
              key={item.key}
              className="relative"
              onMouseEnter={() => onDropdownEnter(item.key)}
              onMouseLeave={onDropdownLeave}
            >
              <NavLink
                href={item.href}
                hasDropdown
                popupTarget={getPopupTarget(item.href)}
              >
                {item.label}
              </NavLink>
              <DropdownMenu
                isOpen={openDropdown === item.key}
                items={item.items || []}
              />
            </div>
          );
        }

        return (
          <NavLink
            key={item.key}
            href={item.href}
            popupTarget={getPopupTarget(item.href)}
          >
            {item.label}
          </NavLink>
        );
      })}
    </div>
  );
};
