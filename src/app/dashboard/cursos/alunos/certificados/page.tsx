"use client";

import { useUserRole } from "@/hooks/useUserRole";
import { UserRole } from "@/config/roles";
import { AlunoCertificadosView } from "@/theme/dashboard/components/aluno-candidato/certificados/AlunoCertificadosView";
import { EmptyState } from "@/components/ui/custom";
import Link from "next/link";

export default function AlunoCertificadosPage() {
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
    <div className="space-y-8">
      <AlunoCertificadosView />
    </div>
  );
}
