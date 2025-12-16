"use client";

import { useRouter } from "next/navigation";
import { CreateAulaForm } from "@/theme/dashboard/components/admin/lista-aulas/components/CreateAulaForm";

export default function CadastrarAulaPage() {
  const router = useRouter();
  return (
    <CreateAulaForm
      onSuccess={() => {
        // Redireciona para a página 1 da lista de aulas
        router.push("/dashboard/cursos/aulas?page=1");
      }}
      onCancel={() => router.push("/dashboard/cursos/aulas")}
    />
  );
}
