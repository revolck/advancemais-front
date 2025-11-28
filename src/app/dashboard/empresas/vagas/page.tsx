"use client";

import { useMemo } from "react";
import Link from "next/link";

import { EmptyState } from "@/components/ui/custom";
import { Skeleton } from "@/components/ui/skeleton";
import { UserRole } from "@/config/roles";
import { useUserRole } from "@/hooks/useUserRole";
import { VagasDashboard } from "@/theme/dashboard/components/admin";

import { EmpresaVagasDashboard } from "./empresa/EmpresaVagasDashboard";

const ADMIN_ROLES = new Set<UserRole>([UserRole.ADMIN, UserRole.MODERADOR]);
const ADMIN_AND_SETOR_DE_VAGAS = new Set<UserRole>([
  UserRole.ADMIN,
  UserRole.MODERADOR,
  UserRole.SETOR_DE_VAGAS,
]);

export default function DashboardVagasPage() {
  const role = useUserRole();

  const content = useMemo(() => {
    if (!role) {
      return (
        <div className="space-y-4">
          <Skeleton className="h-10 w-48" />
          <div className="rounded-3xl border border-gray-200/80 bg-white p-8">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-6 w-2/3 mt-2" />
            <Skeleton className="h-6 w-1/2 mt-2" />
            <Skeleton className="h-64 w-full mt-6" />
          </div>
        </div>
      );
    }

    if (ADMIN_AND_SETOR_DE_VAGAS.has(role)) {
      return (
        <div className="space-y-8">
          <VagasDashboard />
        </div>
      );
    }

    if (role === UserRole.EMPRESA) {
      return <EmpresaVagasDashboard />;
    }

    return (
      <EmptyState
        title="Acesso restrito"
        description="Você não possui permissão para visualizar o módulo de vagas."
        illustration="pass"
        actions={
          <Link
            href="/dashboard"
            className="text-sm font-semibold text-[var(--primary-color)]"
          >
            Voltar ao início
          </Link>
        }
      />
    );
  }, [role]);

  return <div className="space-y-8">{content}</div>;
}
