import React from "react";
import Image from "next/image";
import { Icon } from "@/components/ui/custom/Icons";
import { cn } from "@/lib/utils";
import { SidebarHeaderProps } from "../../types/sidebar.types";
import { toastCustom } from "@/components/ui/custom/toast";

/**
 * Componente de cabeçalho para o sidebar
 */
export function SidebarHeader({
  isCollapsed,
  onCloseMobile,
}: SidebarHeaderProps) {
  // Handler para mostrar informações sobre o app
  const handleLogoClick = () => {
    toastCustom.info({
      title: "IntegreApp",
      description: "Sistema de gestão integrada v1.0.2",
      icon: (
        <div className="rounded-full bg-blue-100 p-1.5">
          <Icon name="Info" size={16} className="text-blue-500" />
        </div>
      ),
      duration: 5000,
    });
  };

  return (
    <div
      className={cn(
        "h-20 flex items-center justify-between transition-all duration-300",
        isCollapsed ? "px-3" : "px-6"
      )}
    >
      <div
        onClick={handleLogoClick}
        className="cursor-pointer flex items-center justify-center w-full"
      >
        <Image
          src={
            isCollapsed
              ? "/images/logos/logo_mobile.webp"
              : "/images/logos/logo_branco.webp"
          }
          alt="Logo"
          width={isCollapsed ? 48 : 180}
          height={isCollapsed ? 48 : 48}
          priority
          className="transition-all duration-300"
        />
      </div>

      {/* Botão de fechar para mobile - visível apenas em telas pequenas */}
      <button
        onClick={onCloseMobile}
        className="md:hidden p-2 rounded-md text-sidebar-foreground/70 hover:bg-white/10 transition-colors absolute right-4 top-1/2 transform -translate-y-1/2"
        aria-label="Fechar menu"
      >
        <Icon name="X" size={22} />
      </button>
    </div>
  );
}
