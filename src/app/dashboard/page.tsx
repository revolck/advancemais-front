"use client";

import { useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserRole } from "@/hooks/useUserRole";
import { UserRole } from "@/config/roles";
import {
  VisaoGeralAdmin,
  VisaoGeralModerador,
  VisaoGeralPedagogico,
} from "@/theme/dashboard/components/visao-geral";

export default function DashboardPage() {
  const role = useUserRole();

  const content = useMemo(() => {
    // Se não há role ainda, mostra skeleton
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
    // ADMIN e MODERADOR: visão completa (todos os dados)
    // PEDAGOGICO: apenas cursos e usuários (alunos_candidatos e instrutores)
    switch (role) {
      case UserRole.ADMIN:
        return <VisaoGeralAdmin />;
      case UserRole.MODERADOR:
        return <VisaoGeralModerador />;
      case UserRole.PEDAGOGICO:
        return <VisaoGeralPedagogico />;
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
