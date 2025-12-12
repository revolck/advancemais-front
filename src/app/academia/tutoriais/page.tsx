"use client";

import React from "react";
import { BookOpen } from "lucide-react";
import { ButtonCustom } from "@/components/ui/custom";
import { useRouter } from "next/navigation";

export default function TutoriaisPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <BookOpen className="mb-6 h-20 w-20 text-blue-600" />
      <h1 className="mb-4 text-4xl! font-bold text-gray-900">Tutoriais</h1>
      <p className="mb-8 max-w-md text-lg! text-gray-600">
        Em breve, você encontrará tutoriais passo a passo sobre funcionalidades
        da plataforma Advance+.
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

