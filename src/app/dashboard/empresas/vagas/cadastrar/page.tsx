"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { CreateVagaForm } from "@/theme/dashboard/components/admin/lista-vagas/components/CreateVagaForm";
import type { VagaCriada } from "@/theme/dashboard/components/admin/lista-vagas/types/formTypes";

export default function CadastrarVagaPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Depois de criar, abre a página da vaga (ali ela acompanha a aprovação)
  const handleSuccess = (vaga: VagaCriada) => {
    void queryClient.invalidateQueries({ queryKey: ["admin-vagas-list"] });
    router.push(`/dashboard/empresas/vagas/${vaga.id}`);
  };

  return (
    <CreateVagaForm
      onSuccess={handleSuccess}
      isSubmitting={isSubmitting}
      setIsSubmitting={setIsSubmitting}
    />
  );
}
