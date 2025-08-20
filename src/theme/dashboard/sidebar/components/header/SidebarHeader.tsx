import React from "react";
import Image from "next/image";
import { Icon } from "@/components/ui/custom/Icons";
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
    <div className="h-16 px-4 flex items-center justify-between border-b border-[var(--color-blue)] transition-all duration-300">
      <div onClick={handleLogoClick} className="cursor-pointer flex items-center">
        <Image
          src={isCollapsed ? "/images/logos/logo_mobile.webp" : "/images/logos/logo_branco.webp"}
          alt="Logo"
          width={isCollapsed ? 32 : 120}
          height={32}
          priority
        />
      </div>

      {/* Botão de fechar para mobile - visível apenas em telas pequenas */}
      <button
        onClick={onCloseMobile}
        className="md:hidden p-1.5 rounded-md text-sidebar-foreground/70 hover:bg-white/10 transition-colors"
        aria-label="Fechar menu"
      >
        <Icon name="X" size={20} />
      </button>
    </div>
  );
}
