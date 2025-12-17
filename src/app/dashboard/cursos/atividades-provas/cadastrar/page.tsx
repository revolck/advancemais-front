"use client";

import { useRouter } from "next/navigation";
import { CreateProvaForm } from "@/theme/dashboard/components/admin/lista-atividades-provas/components/CreateProvaForm";

export default function CadastrarAtividadeProvaPage() {
  const router = useRouter();
  return (
    <CreateProvaForm
      onSuccess={() => {
        // Redireciona para a página 1 da lista de atividades/provas
        router.push("/dashboard/cursos/atividades-provas?page=1");
      }}
      onCancel={() => router.push("/dashboard/cursos/atividades-provas")}
    />
  );
}

