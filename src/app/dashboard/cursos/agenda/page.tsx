"use client";

import { useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserRole } from "@/hooks/useUserRole";
import { UserRole } from "@/config/roles";
import { AgendaCursosCalendar, FullCalendarStyles } from "@/theme/dashboard/components/admin/agenda-cursos";

const ALLOWED_ROLES = new Set<UserRole>([
  UserRole.ADMIN,
  UserRole.MODERADOR,
  UserRole.PEDAGOGICO,
  UserRole.ALUNO_CANDIDATO,
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
            <Skeleton className="h-6 w-2/3 mt-2" />
            <Skeleton className="h-64 w-full mt-6" />
          </div>
        </div>
      );
    }

    if (ALLOWED_ROLES.has(role)) {
  return (
    <>
      <FullCalendarStyles />
      <div className="space-y-8">
        <AgendaCursosCalendar />
      </div>
    </>
  );
    }

    return null;
  }, [role]);

  return <div className="space-y-8">{content}</div>;
}

