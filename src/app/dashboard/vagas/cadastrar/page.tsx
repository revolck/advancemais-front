"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreateVagaForm } from "@/theme/dashboard/components/admin/lista-vagas/components/CreateVagaForm";

export default function CadastrarVagaPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSuccess = () => {
    router.push("/dashboard/vagas");
  };

  const handleCancel = () => {
    router.push("/dashboard/vagas");
  };

  return (
    <div className="bg-white rounded-3xl p-5 h-full min-h-[calc(100vh-8rem)] flex flex-col">
      {/* Form */}
      <div className="flex-1 min-h-0">
        <CreateVagaForm
          onSuccess={handleSuccess}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
          setIsSubmitting={setIsSubmitting}
        />
      </div>
    </div>
  );
}
