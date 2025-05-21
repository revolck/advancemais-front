"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Sidebar } from "@/theme/dashboard/sidebar";
import { useSidebarStore } from "@/theme/dashboard/sidebar/store/sidebarStore";
import { Button } from "@/components/ui/button";
import { SidebarIcon, PanelLeftCloseIcon } from "lucide-react";

interface SidebarContainerProps {
  children: React.ReactNode;
}

export function SidebarContainer({ children }: SidebarContainerProps) {
  const { isCollapsed, isMobileOpen, toggleCollapsed, setMobileOpen } =
    useSidebarStore();

  // Efeito para detectar redimensionamento da janela e ajustar estado mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024 && isMobileOpen) {
        setMobileOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isMobileOpen, setMobileOpen]);

  // Handler para alternar estado do sidebar
  const handleToggle = () => {
    toggleCollapsed();
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <Sidebar
        isMobileMenuOpen={isMobileOpen}
        setIsMobileMenuOpen={setMobileOpen}
        isCollapsed={isCollapsed}
      />

      {/* Conteúdo principal */}
      <div className="flex flex-col flex-1 w-0 overflow-hidden transition-all duration-200">
        {/* Barra superior com toggle do sidebar */}
        <div className="flex items-center h-16 shadow-sm bg-white dark:bg-gray-800 px-4 border-b border-gray-200 dark:border-gray-700">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleToggle}
            className="mr-4"
            aria-label={isCollapsed ? "Expandir sidebar" : "Colapsar sidebar"}
          >
            {isCollapsed ? <SidebarIcon /> : <PanelLeftCloseIcon />}
          </Button>

          <h1 className="text-xl font-semibold">Dashboard</h1>
        </div>

        {/* Área de conteúdo */}
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}

export default SidebarContainer;
