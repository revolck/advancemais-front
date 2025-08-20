import React from "react";
import { cn } from "@/lib/utils";
import { SidebarHeader } from "./components/header/SidebarHeader";
import { MenuList } from "./components/menu/MenuList";
import { useSidebarNavigation } from "./hooks/useSidebarNavigation";
import { menuSections } from "./config/menuConfig";
import type { SidebarProps } from "./types/sidebar.types";

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

  return (
    <>
      {/* Container principal do sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 bg-white z-50",
          "lg:translate-x-0 lg:static border-r border-gray-200",
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

        {/* Conteúdo do Menu */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
          <MenuList
            sections={menuSections}
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
