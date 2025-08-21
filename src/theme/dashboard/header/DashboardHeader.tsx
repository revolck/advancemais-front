"use client";

import React from "react";
import { motion } from "framer-motion";
import { Icon } from "@/components/ui/custom/Icons";
import { NotificationButton } from "./components/NotificationButton";
import { UserButton } from "./components/UserButton";
import { DashboardHeaderProps } from "./types/header.types";
import { cn } from "@/lib/utils";

export function DashboardHeader({
  toggleSidebar,
  isCollapsed,
}: DashboardHeaderProps) {
  return (
    <>
      {/* Header Principal */}
      <header className="h-16 flex border-l border-[#314e93] items-center justify-between px-6 bg-sidebar text-sidebar-foreground z-50">
        {/* Seção Esquerda - Toggle Sidebar */}
        <div className="flex items-center">
          <motion.button
            onClick={toggleSidebar}
            className={cn(
              "flex items-center justify-center w-10 h-10 rounded-lg",
              "hover:bg-white/10 active:bg-white/20",
              "transition-all duration-200 ease-in-out",
              "focus:outline-none focus:ring-2 focus:ring-white/20"
            )}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label={isCollapsed ? "Expandir sidebar" : "Recolher sidebar"}
          >
            <motion.div
              animate={{ rotate: isCollapsed ? 180 : 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <Icon
                name="PanelLeftClose"
                size={20}
                className="text-white transition-colors"
              />
            </motion.div>
          </motion.button>
        </div>

        {/* Seção Central - Logo/Título (Opcional) */}
        <div className="flex-1 flex items-center justify-center">
          {/* Você pode adicionar um logo ou título aqui se necessário */}
        </div>

        {/* Seção Direita - Ações do Usuário */}
        <div className="flex items-center gap-2">
          {/* Botão de Notificações */}
          <NotificationButton />

          {/* Separador */}
          <div className="w-px h-6 bg-white/20 mx-2" />

          {/* Botão do Usuário */}
          <UserButton />
        </div>
      </header>
    </>
  );
}
