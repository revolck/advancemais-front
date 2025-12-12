"use client";

import { useRouter } from "next/navigation";
import { CreateAulaForm } from "@/theme/dashboard/components/admin/lista-aulas/components/CreateAulaForm";

export default function CadastrarAulaPage() {
  const router = useRouter();
  return (
    <CreateAulaForm
      onSuccess={() => router.push("/dashboard/cursos/aulas")}
      onCancel={() => router.push("/dashboard/cursos/aulas")}
    />
  );
}
