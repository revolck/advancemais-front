"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useIsMobile } from "@/hooks/use-mobile";
import { DashboardSidebar, DashboardHeader } from "@/theme";
import { toastCustom, ToasterCustom } from "@/components/ui/custom/toast";
import { DashboardHeader as Breadcrumb } from "@/components/layout";

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
  const searchParams = useSearchParams();
  const pathname = usePathname() || "";
  const router = useRouter();

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

  // Efeito para manipulação do estado inicial e notificações
  useEffect(() => {
    setMounted(true);

    if (searchParams && searchParams.get("denied")) {
      toastCustom.error("Acesso negado");
      const params = new URLSearchParams(searchParams.toString());
      params.delete("denied");
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    }

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
  }, [
    isMobileDevice,
    isCollapsed,
    isMobileMenuOpen,
    searchParams,
    pathname,
    router,
  ]);

  // Evita problemas de hidratação SSR
  if (!mounted) {
    return null;
  }

  return (
    <>
      <div className="flex h-screen">
        {/* Sidebar principal do dashboard */}
        <DashboardSidebar
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
          isCollapsed={isCollapsed}
        />

        {/* Container principal de conteúdo */}
        <div className="flex flex-1 flex-col bg-white transition-all duration-300 ease-in-out">
          {/* Header do Dashboard */}
          <DashboardHeader
            toggleSidebar={toggleSidebar}
            isCollapsed={isCollapsed}
          />

          {/* Conteúdo principal */}
          <main className="flex-1 overflow-auto bg-gray-100 p-10">
            <div className="min-h-full">
              <Breadcrumb showBreadcrumb={pathname !== "/empresas"} />
              {children}
            </div>
          </main>
        </div>
      </div>
      <ToasterCustom />
    </>
  );
}
