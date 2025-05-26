import React from "react";
import { NavLink } from "./NavLink";
import { DropdownMenu } from "./DropdownMenu";
import { NAVIGATION_ITEMS } from "../constants/navigation";

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
              <NavLink href={item.href} hasDropdown>
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
          <NavLink key={item.key} href={item.href}>
            {item.label}
          </NavLink>
        );
      })}
    </div>
  );
};
