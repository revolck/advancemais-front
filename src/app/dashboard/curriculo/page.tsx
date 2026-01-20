"use client";

import Link from "next/link";
import { EmptyState } from "@/components/ui/custom";
import { UserRole } from "@/config/roles";
import { useUserRole } from "@/hooks/useUserRole";
import { AlunoCurriculoView } from "@/theme/dashboard/components/aluno-candidato/curriculo/AlunoCurriculoView";

export default function CurriculoPage() {
  const role = useUserRole();

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
    <div className="space-y-8 pb-8">
      <AlunoCurriculoView />
    </div>
  );
}

