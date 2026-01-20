"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { EmptyState } from "@/components/ui/custom";
import { UserRole } from "@/config/roles";
import { useUserRole } from "@/hooks/useUserRole";
import { CreateCurriculoForm } from "@/theme/dashboard/components/aluno-candidato/curriculo/CreateCurriculoForm";

export default function EditarCurriculoPage() {
  const router = useRouter();
  const role = useUserRole();
  const params = useParams<{ id: string }>();
  const id = String(params?.id ?? "").trim();

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

  if (!id) {
    return (
      <EmptyState
        title="Currículo não encontrado"
        description="Não foi possível identificar o currículo para edição."
        illustration="fileNotFound"
        actions={
          <Link
            href="/dashboard/curriculo"
            className="text-sm font-semibold text-[var(--primary-color)]"
          >
            Voltar para currículos
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-8 pb-8">
      <CreateCurriculoForm
        mode="edit"
        curriculoId={id}
        onSuccess={() => router.push("/dashboard/curriculo")}
        onCancel={() => router.push("/dashboard/curriculo")}
      />
    </div>
  );
}
