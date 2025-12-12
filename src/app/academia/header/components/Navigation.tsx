import React from "react";
import { NavLink } from "./NavLink";
import { ACADEMIA_NAVIGATION_ITEMS } from "../config/navigation";

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
  return (
    <div className="hidden md:flex items-center justify-center flex-grow space-x-5 lg:space-x-7 px-6">
      {ACADEMIA_NAVIGATION_ITEMS.map((item) => {
        return (
          <NavLink key={item.key} href={item.href}>
            {item.label}
          </NavLink>
        );
      })}
    </div>
  );
};

