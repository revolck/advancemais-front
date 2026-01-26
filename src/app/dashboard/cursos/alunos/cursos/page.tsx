"use client";

import { useEffect, useState } from "react";
import { useUserRole } from "@/hooks/useUserRole";
import { UserRole } from "@/config/roles";
import { AlunoCursosView } from "@/theme/dashboard/components/aluno-candidato/cursos/AlunoCursosView";
import { EmptyState } from "@/components/ui/custom";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

function AlunoCursosPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-4">
        {Array.from({ length: 5 }).map((_, idx) => (
          <Skeleton key={idx} className="h-9 w-28 rounded-md" />
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-96 w-full rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

export default function AlunoCursosPage() {
  const [mounted, setMounted] = useState(false);
  const role = useUserRole();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <AlunoCursosPageSkeleton />;
  }

  if (role !== UserRole.ALUNO_CANDIDATO) {
    return (
      <EmptyState
        title="Acesso restrito"
        description="Esta página é exclusiva para alunos e candidatos."
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
  }

  return (
    <div className="space-y-8">
      <AlunoCursosView />
    </div>
  );
}
