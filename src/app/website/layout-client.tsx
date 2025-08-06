"use client";

import { ToasterCustom } from "@/components/ui/custom/toast";
import HeaderWithBackground from "@/theme/website/header";
import WebsiteFooter from "@/theme/website/footer";
import { LoadingProvider, useWebsiteLoading } from "./loading-context";
import type { ReactNode } from "react";

export default function LayoutClient({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <LoadingProvider>
      <InnerLayout>{children}</InnerLayout>
    </LoadingProvider>
  );
}

function InnerLayout({ children }: { children: ReactNode }) {
  const { isReady } = useWebsiteLoading();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className={isReady ? "opacity-100" : "opacity-0"}>
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

      {!isReady && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-100">
          <div className="animate-pulse">
            <div className="h-4 w-48 rounded bg-gray-300 mb-2"></div>
            <div className="h-4 w-36 rounded bg-gray-300"></div>
          </div>
        </div>
      )}
    </div>
  );
}

