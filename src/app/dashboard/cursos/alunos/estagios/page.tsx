"use client";

import { useUserRole } from "@/hooks/useUserRole";
import { UserRole } from "@/config/roles";
import { AlunoEstagiosView } from "@/theme/dashboard/components/aluno-candidato/estagios/AlunoEstagiosView";
import { Skeleton } from "@/components/ui/skeleton";
import { useMemo } from "react";

const ALLOWED_ROLES = new Set<UserRole>([UserRole.ALUNO_CANDIDATO]);

export default function AlunoEstagiosPage() {
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

    if (!ALLOWED_ROLES.has(role)) {
      return null;
    }

    return <AlunoEstagiosView />;
  }, [role]);

  return <div className="space-y-8">{content}</div>;
}
