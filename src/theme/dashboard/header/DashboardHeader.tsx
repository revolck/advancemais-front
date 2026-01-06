"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Icon } from "@/components/ui/custom/Icons";
import { NotificationButton } from "./components/NotificationButton";
import { UserMenuSimple } from "@/components/ui/custom/user-button";
import { DashboardHeaderProps } from "./types/header.types";
import { cn } from "@/lib/utils";
import { connectGoogle, getGoogleOAuthStatus, type GoogleOAuthStatus } from "@/api/aulas";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function DashboardHeader({
  toggleSidebar,
  isCollapsed,
}: DashboardHeaderProps) {
  const { data: googleStatus, isLoading: isLoadingGoogle, isFetching: isFetchingGoogle } =
    useQuery<GoogleOAuthStatus>({
      queryKey: ["google-oauth-status"],
      queryFn: () => getGoogleOAuthStatus(),
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    });

  const isGoogleConnected = Boolean(googleStatus?.conectado);
  const shouldShowGoogleButton = !isGoogleConnected && !isLoadingGoogle;
  const isGoogleBusy = isLoadingGoogle || isFetchingGoogle;

  const handleConnectGoogle = async () => {
    if (isGoogleBusy) return;
    const res = await connectGoogle();
    if (res?.authUrl) {
      window.open(res.authUrl, "_blank", "noopener,noreferrer");
    }
  };

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
          {shouldShowGoogleButton && (
            <Tooltip open>
              <TooltipTrigger asChild>
                <motion.button
                  type="button"
                  onClick={handleConnectGoogle}
                  disabled={isGoogleBusy}
                  className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-lg relative",
                    "bg-red-500 text-white shadow-sm",
                    "hover:bg-red-600 active:bg-red-700",
                    "transition-all duration-200 ease-in-out",
                    "focus:outline-none focus:ring-2 focus:ring-white/20",
                    "cursor-pointer",
                    isGoogleBusy && "cursor-not-allowed opacity-70"
                  )}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Conectar Google Agenda"
                >
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 rounded-lg ring-2 ring-red-300/80 animate-ping pointer-events-none"
                  />
                  <span
                    aria-hidden="true"
                    className="absolute -inset-1 rounded-xl bg-red-400/35 animate-pulse pointer-events-none"
                  />
                  <Icon
                    name={isGoogleBusy ? "Loader2" : "Calendar"}
                    size={18}
                    className={cn(
                      "text-white transition-colors relative z-10",
                      isGoogleBusy && "animate-spin"
                    )}
                  />
                </motion.button>
              </TooltipTrigger>
              <TooltipContent side="bottom" sideOffset={8} className="text-white">
                Conectar Google Agenda
              </TooltipContent>
            </Tooltip>
          )}

          {/* Botão de Ajuda */}
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.a
                href="https://ajuda.advancemais.com"
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-lg",
                  "hover:bg-white/10 active:bg-white/20",
                  "transition-all duration-200 ease-in-out",
                  "focus:outline-none focus:ring-2 focus:ring-white/20"
                )}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Ajuda"
              >
                <Icon
                  name="HelpCircle"
                  size={18}
                  className="text-white transition-colors"
                />
              </motion.a>
            </TooltipTrigger>
            <TooltipContent side="bottom" sideOffset={8} className="text-white">
              Ajuda
            </TooltipContent>
          </Tooltip>

          {/* Botão de Vídeos - Academia */}
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.a
                href="https://academia.advancemais.com/"
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-lg",
                  "hover:bg-white/10 active:bg-white/20",
                  "transition-all duration-200 ease-in-out",
                  "focus:outline-none focus:ring-2 focus:ring-white/20"
                )}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Videos"
              >
                <Icon
                  name="Video"
                  size={18}
                  className="text-white transition-colors"
                />
              </motion.a>
            </TooltipTrigger>
            <TooltipContent side="bottom" sideOffset={8} className="text-white">
              Videos
            </TooltipContent>
          </Tooltip>

          {/* Botão de Notificações */}
          <NotificationButton />

          {/* Separador */}
          <div className="w-px h-6 bg-white/20 mx-2" />

          {/* Botão do Usuário */}
          <UserMenuSimple />
        </div>
      </header>
    </>
  );
}
