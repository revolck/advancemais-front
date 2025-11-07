"use client";

import { useBreadcrumb } from "@/config/breadcrumb";
import { DashboardBreadcrumb } from "./dashboard-breadcrumb";
import { DashboardDateTime } from "./dashboard-datetime";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { useUserName } from "@/hooks/useUserName";

interface DashboardHeaderProps {
  title?: string;
  className?: string;
  children?: React.ReactNode;
  showBreadcrumb?: boolean; // permite ocultar o breadcrumb
}

export function DashboardHeader({
  title: customTitle,
  className,
  children,
  showBreadcrumb = true,
}: DashboardHeaderProps) {
  const { title, items } = useBreadcrumb();
  const pathname = usePathname();
  const { userName, userGender } = useUserName();
  const displayTitle = customTitle || title;

  // Não mostrar breadcrumb se houver apenas 1 item (página raiz)
  const shouldShowBreadcrumb = showBreadcrumb && items.length > 1;

  // Verifica se está na página principal do dashboard
  const isDashboardPage =
    pathname === "/" ||
    pathname === "/dashboard" ||
    (title === "Dashboard" && items.length === 1);

  // Monta o título com saudação personalizada por gênero
  const finalTitle = (() => {
    if (!isDashboardPage || !userName) {
      return displayTitle;
    }

    const greeting = userGender === "feminino" ? "bem vinda" : "bem vindo";
    return `Olá ${userName}, ${greeting}`;
  })();

  return (
    <header className={cn("flex items-center justify-between pb-6", className)}>
      {/* Lado esquerdo - Título */}
      <div className="flex items-center">
        <h1 className="!text-2xl font-semibold text-gray-800 tracking-tight">
          {finalTitle}
        </h1>
      </div>

      {/* Lado direito - Data/Hora, Breadcrumb e conteúdo customizável */}
      <div className="flex items-center gap-6">
        {/* Data e Hora */}
        <DashboardDateTime />

        {/* Separador e Breadcrumb */}
        {shouldShowBreadcrumb && (
          <>
            <div className="h-6 w-px bg-gray-300" />
            <DashboardBreadcrumb items={items} />
          </>
        )}

        {/* Separador e Conteúdo customizável */}
        {children && (
          <>
            <div className="h-6 w-px bg-gray-300" />
            <div className="flex items-center gap-4">{children}</div>
          </>
        )}
      </div>
    </header>
  );
}
