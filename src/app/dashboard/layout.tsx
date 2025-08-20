"use client";

import { ReactNode, useEffect, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { DashboardSidebar, DashboardHeader } from "@/theme";

interface DashboardLayoutProps {
  children: ReactNode;
}

/**
 * Layout específico para a seção de Dashboard
 */
export default function DashboardLayout({ children }: DashboardLayoutProps) {
  // Hook personalizado para detectar dispositivos móveis
  const isMobileDevice = useIsMobile();

  // Estados locais
  const [mounted, setMounted] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  /**
   * Alterna o estado de colapso do sidebar
   */
  function toggleSidebar() {
    if (!isMobileDevice) {
      setIsCollapsed(!isCollapsed);
    } else {
      setIsMobileMenuOpen(!isMobileMenuOpen);
    }
  }

  // Efeito para manipulação do estado inicial
  useEffect(() => {
    setMounted(true);

    // Reset collapsed state when switching to mobile
    if (isMobileDevice && isCollapsed) {
      setIsCollapsed(false);
    }

    // Adiciona classe ao body quando o menu está aberto em mobile
    // para evitar scroll
    if (isMobileMenuOpen && isMobileDevice) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileDevice, isCollapsed, isMobileMenuOpen]);

  // Evita problemas de hidratação SSR
  if (!mounted) {
    return null;
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar principal do dashboard */}
      <DashboardSidebar
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        isCollapsed={isCollapsed}
      />

      {/* Container principal de conteúdo */}
      <div className="w-full flex flex-1 flex-col transition-all duration-300 ease-in-out bg-white">
        {/* Header do Dashboard */}
        <DashboardHeader toggleSidebar={toggleSidebar} isCollapsed={isCollapsed} />

        {/* Conteúdo principal */}
        <main className="flex-1 overflow-auto p-8 bg-white">
          {children}
        </main>
      </div>
    </div>
  );
}
