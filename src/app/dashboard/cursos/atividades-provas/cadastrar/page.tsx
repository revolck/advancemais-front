"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { CreateProvaForm } from "@/theme/dashboard/components/admin/lista-atividades-provas/components/CreateProvaForm";

export default function CadastrarAtividadeProvaPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tipoParam = (searchParams.get("tipo") || "").toUpperCase();
  const defaultTipo =
    tipoParam === "PROVA"
      ? "PROVA"
      : tipoParam === "ATIVIDADE"
      ? "ATIVIDADE"
      : undefined;
  return (
    <CreateProvaForm
      defaultTipo={defaultTipo}
      onSuccess={() => {
        // Redireciona para a página 1 da lista de atividades/provas
        router.push("/dashboard/cursos/atividades-provas?page=1");
      }}
      onCancel={() => router.push("/dashboard/cursos/atividades-provas")}
    />
  );
}
