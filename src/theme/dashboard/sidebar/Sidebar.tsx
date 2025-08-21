"use client";

import React, { useMemo } from "react";
import { cn } from "@/lib/utils";
import { SidebarHeader } from "./components/header/SidebarHeader";
import { MenuList } from "./components/menu/MenuList";
import { useSidebarNavigation } from "./hooks/useSidebarNavigation";
import { menuSections } from "./config/menuConfig";
import type {
  SidebarProps,
  MenuSection,
  MenuItem,
} from "./types/sidebar.types";
import { useUserRole } from "@/hooks/useUserRole";
import { UserRole } from "@/config/roles";

const filterItemsByRole = (
  items: readonly MenuItem[],
  role: UserRole
): MenuItem[] => {
  return items
    .filter((item) => !item.permissions || item.permissions.includes(role))
    .map((item) => ({
      ...item,
      submenu: item.submenu ? filterItemsByRole(item.submenu, role) : undefined,
    }))
    .filter((item) => !item.submenu || item.submenu.length > 0);
};

const filterSectionsByRole = (
  sections: readonly MenuSection[],
  role: UserRole
): MenuSection[] => {
  return sections
    .map((section) => ({
      ...section,
      items: filterItemsByRole(section.items, role),
    }))
    .filter((section) => section.items.length > 0);
};

/**
 * Componente principal do Sidebar
 */
export function Sidebar({
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  isCollapsed,
}: SidebarProps) {
  // Hook para navegação
  const { handleNavigation } = useSidebarNavigation(setIsMobileMenuOpen);
  const role = useUserRole();

  const sections = useMemo(() => {
    if (!role) return [];
    return filterSectionsByRole(menuSections, role);
  }, [role]);

  return (
    <>
      {/* Container principal do sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 bg-sidebar text-sidebar-foreground",
          "lg:translate-x-0 lg:static border-r border-[var(--color-blue)]",
          "h-full flex flex-col overflow-hidden",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full",
          "transition-all duration-300 ease-in-out",
          isCollapsed ? "w-16" : "w-64"
        )}
      >
        {/* Cabeçalho do Sidebar */}
        <SidebarHeader
          isCollapsed={isCollapsed}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />

        {/* Linha divisória abaixo da logo - agora pega toda a largura */}
        <div className="border-b border-[#314e93]" />

        {/* Conteúdo do Menu com espaçamento maior */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent pt-6">
          <MenuList
            sections={sections}
            isCollapsed={isCollapsed}
            handleNavigation={handleNavigation}
          />
        </div>
      </div>

      {/* Overlay móvel semi-transparente */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
}
