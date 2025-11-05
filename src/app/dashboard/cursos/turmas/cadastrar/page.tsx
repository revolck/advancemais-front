"use client";

import { useRouter } from "next/navigation";
import { CreateTurmaForm } from "@/theme/dashboard/components/admin/lista-turmas/components/CreateTurmaForm";

export default function CadastrarTurmaPage() {
  const router = useRouter();

  return (
    <div className="space-y-8">
      <CreateTurmaForm onSuccess={() => router.push("/dashboard/cursos/turmas")} />
    </div>
  );
}
