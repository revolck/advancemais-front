"use client";

import React from "react";
import { LifeBuoy } from "lucide-react";
import { ButtonCustom } from "@/components/ui/custom";
import { useRouter } from "next/navigation";

export default function CentralAjudaPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <LifeBuoy className="mb-6 h-20 w-20 text-blue-600" />
      <h1 className="mb-4 text-4xl! font-bold text-gray-900">Central de Ajuda</h1>
      <p className="mb-8 max-w-md text-lg! text-gray-600">
        Em breve, você terá acesso a uma central de ajuda completa com suporte
        e documentação.
      </p>
      <ButtonCustom
        onClick={() => router.push("/academia")}
        size="lg"
        className="bg-gray-900! hover:bg-gray-800!"
      >
        Voltar para Vídeos
      </ButtonCustom>
    </div>
  );
}

