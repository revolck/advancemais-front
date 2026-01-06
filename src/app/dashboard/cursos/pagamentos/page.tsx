"use client";

import { useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserRole } from "@/hooks/useUserRole";
import { UserRole } from "@/config/roles";
import { PagamentosCursosDashboard } from "@/theme/dashboard/components/admin/pagamentos-cursos";

const ALLOWED_ROLES = new Set<UserRole>([
  UserRole.ALUNO_CANDIDATO,
  UserRole.ADMIN,
  UserRole.MODERADOR,
  UserRole.PEDAGOGICO,
  UserRole.FINANCEIRO,
]);

export default function PagamentosCursosPage() {
  const role = useUserRole();

  const content = useMemo(() => {
    if (!role) {
      return (
        <div className="space-y-4">
          <Skeleton className="h-10 w-56" />
          <div className="rounded-3xl border border-gray-200/80 bg-white p-8">
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-6 w-1/2 mt-2" />
            <Skeleton className="h-64 w-full mt-6" />
          </div>
        </div>
      );
    }

    if (ALLOWED_ROLES.has(role)) {
      return <PagamentosCursosDashboard />;
    }

    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          Acesso restrito
        </h2>
        <p className="text-sm text-gray-600">
          Você não possui permissão para acessar esta página.
        </p>
      </div>
    );
  }, [role]);

  return <div className="space-y-8">{content}</div>;
}

