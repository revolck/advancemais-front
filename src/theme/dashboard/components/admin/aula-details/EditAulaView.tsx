"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { ButtonCustom } from "@/components/ui/custom";
import type { Aula } from "@/api/aulas";
import { CreateAulaForm } from "../lista-aulas/components/CreateAulaForm";

interface EditAulaViewProps {
  aulaId: string;
  initialData: Aula;
}

export function EditAulaView({ aulaId, initialData }: EditAulaViewProps) {
  const router = useRouter();

  const handleSuccess = () => {
    // ✅ Forçar reload completo: usar router.refresh() para invalidar cache do servidor
    // e adicionar timestamp para garantir que a página de edição recarregue dados frescos
    router.refresh();
    router.push(`/dashboard/cursos/aulas/${aulaId}?refresh=${Date.now()}`);
  };

  const handleCancel = () => {
    router.push(`/dashboard/cursos/aulas/${aulaId}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-end">
        <ButtonCustom asChild variant="ghost" size="sm">
          <Link href={`/dashboard/cursos/aulas/${aulaId}`}>
            <ChevronLeft className="h-4 w-4" />
            Voltar
          </Link>
        </ButtonCustom>
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
