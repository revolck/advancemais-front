"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/custom";
import { useUserRole } from "@/hooks/useUserRole";
import { UserRole } from "@/config/roles";
import { EstagioDetailsView } from "@/theme/dashboard/components/admin/lista-estagios/EstagioDetailsView";

const ALLOWED_ROLES = new Set<UserRole>([
  UserRole.ADMIN,
  UserRole.MODERADOR,
  UserRole.PEDAGOGICO,
  UserRole.INSTRUTOR,
]);

export default function EstagioDetailsPage() {
  const role = useUserRole();
  const params = useParams<{ estagioId: string }>();
  const estagioId = params?.estagioId;

  const content = useMemo(() => {
    if (!role) {
      return (
        <div className="space-y-4">
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-16 rounded-xl" />
          <Skeleton className="h-72 rounded-xl" />
        </div>
      );
    }

    if (!ALLOWED_ROLES.has(role)) {
      return (
        <EmptyState
          title="Acesso restrito"
          description="Você não possui permissão para visualizar detalhes do estágio."
          illustration="pass"
          actions={
            <Link
              href="/dashboard/cursos/estagios"
              className="text-sm font-semibold text-[var(--primary-color)]"
            >
              Voltar para estágios
            </Link>
          }
        />
      );
    }

    if (!estagioId) {
      return (
        <EmptyState
          title="Estágio inválido"
          description="Não foi possível identificar o estágio solicitado."
          illustration="books"
        />
      );
    }

    return <EstagioDetailsView estagioId={estagioId} />;
  }, [estagioId, role]);

  return <div className="space-y-8">{content}</div>;
}

