"use client";

import { ToasterCustom } from "@/components/ui/custom/toast";
import HeaderWithBackground from "@/theme/website/header";
import WebsiteFooter from "@/theme/website/footer";
import type { ReactNode } from "react";
import { LoadingProvider } from "./loading-context";

/**
 * Layout Client Simplificado
 * Keep-alive e overlays gerenciados pelo LoadingProvider
 */
export default function LayoutClient({ children }: { children: ReactNode }) {
  return (
    <LoadingProvider>
      <div className="min-h-screen bg-gray-50">
        {/* Header responsivo com navegação */}
        <HeaderWithBackground />

        {/* Conteúdo principal da aplicação */}
        <main
          id="main-content"
          className="relative z-10 min-h-screen"
          role="main"
        >
          {children}
        </main>

        {/* Footer do website */}
        <WebsiteFooter />

        {/* Sistema de notificações */}
        <ToasterCustom
          position="top-right"
          theme="system"
          richColors={true}
          closeButton={false}
          maxToasts={5}
          gap={8}
          defaultDuration={5000}
        />
      </div>
    </LoadingProvider>
  );
}
