"use client";

import React from "react";
import { Icon } from "@/components/ui/custom/Icons";
import { NotificationButton } from "./components/NotificationButton";
import { UserButton } from "./components/UserButton";
import { DashboardHeaderProps } from "./types/header.types";

export function DashboardHeader({
  toggleSidebar,
  isCollapsed,
}: DashboardHeaderProps) {
  return (
    <>
      {/* Header Principal */}
      <header className="h-18 flex items-center px-6 bg-[var(--color-blue)] text-white z-10">
        {/* Botão de toggle do sidebar */}
        <button
          onClick={toggleSidebar}
          className="mr-5 p-2.5 rounded-lg hover:bg-white/10 transition-colors duration-200"
          aria-label={isCollapsed ? "Expandir sidebar" : "Colapsar sidebar"}
        >
          <Icon
            name={isCollapsed ? "PanelLeft" : "PanelLeftClose"}
            size={22}
            className="text-white transition-transform duration-300"
          />
        </button>

        {/* Espaço flexível */}
        <div className="flex-1"></div>

        {/* Botões de ação na direita */}
        <div className="flex items-center gap-2">
          {/* Botão de notificações */}
          <NotificationButton />

          {/* Botão do usuário */}
          <UserButton />
        </div>
      </header>

      {/* Divisória */}
      <div className="border-b border-[#314e93]" />
    </>
  );
}
