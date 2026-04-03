"use client";

import { useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserRole } from "@/hooks/useUserRole";
import { UserRole } from "@/config/roles";
import {
  AgendaCursosCalendar,
  FullCalendarStyles,
} from "@/theme/dashboard/components/admin/agenda-cursos";

const ALLOWED_ROLES = new Set<UserRole>([
  UserRole.ADMIN,
  UserRole.MODERADOR,
  UserRole.PEDAGOGICO,
  UserRole.INSTRUTOR,
  UserRole.ALUNO_CANDIDATO,
  UserRole.EMPRESA,
  UserRole.SETOR_DE_VAGAS,
  UserRole.RECRUTADOR,
]);

export default function DashboardAgendaPage() {
  const role = useUserRole();

  const content = useMemo(() => {
    if (!role) {
      return (
        <div className="space-y-4">
          <Skeleton className="h-10 w-48" />
          <div className="rounded-3xl border border-gray-200/80 bg-white p-8">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="mt-2 h-6 w-2/3" />
            <Skeleton className="mt-6 h-64 w-full" />
          </div>
        </div>
      );
    }

    if (!ALLOWED_ROLES.has(role)) {
      return null;
    }

    return (
      <>
        <FullCalendarStyles />
        <div className="space-y-8">
          <AgendaCursosCalendar />
        </div>
      </>
    );
  }, [role]);

  return <div className="space-y-8">{content}</div>;
}
