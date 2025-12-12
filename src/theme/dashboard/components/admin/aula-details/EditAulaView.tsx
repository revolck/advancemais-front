"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Aula } from "@/api/aulas";
import { CreateAulaForm } from "../lista-aulas/components/CreateAulaForm";

interface EditAulaViewProps {
  aulaId: string;
  initialData: Aula;
}

export function EditAulaView({ aulaId, initialData }: EditAulaViewProps) {
  const router = useRouter();

  const handleSuccess = () => {
    router.push(`/dashboard/cursos/aulas/${aulaId}`);
  };

  const handleCancel = () => {
    router.push(`/dashboard/cursos/aulas/${aulaId}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-gray-900">Editar Aula</h1>
          <p className="text-sm text-gray-500">
            Atualize as informações da aula
          </p>
        </div>
        <Button
          asChild
          variant="outline"
          className="rounded-full border-none px-5 py-2 text-sm font-medium hover:bg-gray-200 bg-gray-100/70"
        >
          <Link
            href={`/dashboard/cursos/aulas/${aulaId}`}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Voltar
          </Link>
        </Button>
      </div>

      {/* Form */}
      <CreateAulaForm
        mode="edit"
        aulaId={aulaId}
        initialData={initialData}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </div>
  );
}

