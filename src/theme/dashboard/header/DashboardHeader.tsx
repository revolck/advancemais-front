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
      <motion.header
        className="h-16 flex items-center justify-between px-6 bg-white border-b border-gray-200/80 shadow-sm backdrop-blur-md z-50"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        {/* Seção Esquerda - Toggle Sidebar */}
        <div className="flex items-center">
          <motion.button
            onClick={toggleSidebar}
            className={cn(
              "flex items-center justify-center w-10 h-10 rounded-lg",
              "hover:bg-gray-100 active:bg-gray-200",
              "transition-all duration-200 ease-in-out",
              "focus:outline-none focus:ring-2 focus:ring-blue-500/20"
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
                className="text-gray-600 hover:text-gray-800 transition-colors"
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
          {/* Botão de Busca Rápida */}
          <motion.button
            className={cn(
              "flex items-center justify-center w-10 h-10 rounded-lg",
              "hover:bg-gray-100 active:bg-gray-200",
              "transition-all duration-200 ease-in-out",
              "focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            )}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Busca rápida"
          >
            <Icon
              name="Search"
              size={18}
              className="text-gray-600 hover:text-gray-800 transition-colors"
            />
          </motion.button>

          {/* Botão de Notificações */}
          <NotificationButton />

          {/* Separador */}
          <div className="w-px h-6 bg-gray-200 mx-2" />

          {/* Botão do Usuário */}
          <UserButton />
        </div>
      </motion.header>
    </>
  );
}

