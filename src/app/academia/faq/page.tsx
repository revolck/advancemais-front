"use client";

import React from "react";
import { HelpCircle } from "lucide-react";
import { ButtonCustom } from "@/components/ui/custom";
import { useRouter } from "next/navigation";

export default function FAQPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <HelpCircle className="mb-6 h-20 w-20 text-blue-600" />
      <h1 className="mb-4 text-4xl! font-bold text-gray-900">
        Perguntas Frequentes
      </h1>
      <p className="mb-8 max-w-md text-lg! text-gray-600">
        Em breve, você encontrará respostas para as perguntas mais comuns sobre
        a plataforma Advance+.
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

