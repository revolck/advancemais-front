"use client";

import { useRouter } from "next/navigation";
import { CreateCursoForm } from "@/theme/dashboard/components/admin/lista-cursos/components/CreateCursoForm";

export default function CadastrarCursoPage() {
  const router = useRouter();
  return (
    <CreateCursoForm
      onSuccess={() => router.push("/dashboard/cursos")}
      onCancel={() => router.push("/dashboard/cursos")}
    />
  );
}
