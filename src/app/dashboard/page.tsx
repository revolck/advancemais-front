"use client";

import { useMemo, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserRole } from "@/hooks/useUserRole";
import { UserRole } from "@/config/roles";
import {
  VisaoGeralAdmin,
  VisaoGeralModerador,
  VisaoGeralPedagogico,
} from "@/theme/dashboard/components/visao-geral";
import { useQueryClient } from "@tanstack/react-query";

export default function DashboardPage() {
  const role = useUserRole();
  const queryClient = useQueryClient();

  // Limpa cache da visão geral quando o role muda para garantir dados corretos
  useEffect(() => {
    if (role) {
      // Limpa cache de outras visões gerais para evitar dados incorretos
      queryClient.removeQueries({ queryKey: ["plataforma-overview"] });
      if (role === UserRole.PEDAGOGICO) {
        // Força refetch da visão pedagógica
        queryClient.invalidateQueries({
          queryKey: ["plataforma-overview-pedagogico"],
        });
      }
    }
  }, [role, queryClient]);

  // Debug: Log do role detectado e verificação do cookie
  useEffect(() => {
    const cookieRole = document.cookie
      .split("; ")
      .find((row) => row.startsWith("user_role="))
      ?.split("=")[1];

    console.log("🔍 [DashboardPage] Debug Info:");
    console.log("  - Role do hook:", role);
    console.log("  - Cookie user_role:", cookieRole);
    console.log("  - UserRole.PEDAGOGICO:", UserRole.PEDAGOGICO);
    console.log("  - É PEDAGOGICO?", role === UserRole.PEDAGOGICO);
    console.log("  - Comparação string:", cookieRole === "PEDAGOGICO");
    console.log("  - Comparação enum:", cookieRole === UserRole.PEDAGOGICO);

    if (role === UserRole.PEDAGOGICO) {
      console.log("✅ [DashboardPage] Renderizando VisaoGeralPedagogico");
    } else {
      console.warn(
        "⚠️ [DashboardPage] Role não é PEDAGOGICO, renderizando:",
        role
      );
      console.warn(
        "⚠️ [DashboardPage] Para testar como PEDAGOGICO, execute no console:"
      );
      console.warn(
        '   document.cookie = "user_role=PEDAGOGICO; path=/; max-age=86400";'
      );
      console.warn("   location.reload();");
    }
  }, [role]);

  const content = useMemo(() => {
    if (!role) {
      return (
        <div className="space-y-4">
          <Skeleton className="h-10 w-48" />
          <div className="rounded-3xl border border-gray-200/80 bg-white p-8">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-6 w-2/3 mt-2" />
            <Skeleton className="h-64 w-full mt-6" />
          </div>
        </div>
      );
    }

    // Renderiza componente específico por role
    // IMPORTANTE: PEDAGOGICO deve ver apenas VisaoGeralPedagogico
    if (role === UserRole.PEDAGOGICO) {
      return <VisaoGeralPedagogico />;
    }

    switch (role) {
      case UserRole.ADMIN:
        return <VisaoGeralAdmin />;
      case UserRole.MODERADOR:
        return <VisaoGeralModerador />;
      default:
        return (
          <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Acesso restrito
            </h2>
            <p className="text-sm text-gray-600">
              Você não possui permissão para visualizar a visão geral da
              plataforma.
            </p>
          </div>
        );
    }
  }, [role]);

  return <div className="space-y-8">{content}</div>;
}
