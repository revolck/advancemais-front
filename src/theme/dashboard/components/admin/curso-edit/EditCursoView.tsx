"use client";

import { useRouter } from "next/navigation";
import { CreateCursoForm } from "../lista-cursos/components/CreateCursoForm";
import type { Curso } from "@/api/cursos";

interface EditCursoViewProps {
  curso: Curso & {
    categoria?: { id: number; nome: string };
    subcategoria?: { id: number; nome: string };
    estagioObrigatorio?: boolean;
  };
}

export function EditCursoView({ curso }: EditCursoViewProps) {
  const router = useRouter();

  const handleSuccess = () => {
    router.push(`/dashboard/cursos/${curso.id}`);
  };

  const handleCancel = () => {
    router.push(`/dashboard/cursos/${curso.id}`);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <CreateCursoForm
        mode="edit"
        cursoId={curso.id}
        initialData={curso}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </div>
  );
}
