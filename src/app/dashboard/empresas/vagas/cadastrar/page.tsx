"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreateVagaForm } from "@/theme/dashboard/components/admin/lista-vagas/components/CreateVagaForm";

export default function CadastrarVagaPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSuccess = () => {
    router.push("/dashboard/empresas/vagas");
  };

  return (
    <CreateVagaForm
      onSuccess={handleSuccess}
      isSubmitting={isSubmitting}
      setIsSubmitting={setIsSubmitting}
    />
  );
}
