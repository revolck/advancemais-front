"use client";

import { useRouter } from "next/navigation";
import { useUserRole } from "@/hooks/useUserRole";
import { UserRole } from "@/config/roles";
import { EmptyState } from "@/components/ui/custom";
import Link from "next/link";
import { CreateCurriculoForm } from "@/theme/dashboard/components/aluno-candidato/curriculo/CreateCurriculoForm";

export default function CadastrarCurriculoPage() {
  const router = useRouter();
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
      <CreateCurriculoForm
        onSuccess={() => router.push("/dashboard/curriculo")}
        onCancel={() => router.push("/dashboard/curriculo")}
      />
    </div>
  );
}



