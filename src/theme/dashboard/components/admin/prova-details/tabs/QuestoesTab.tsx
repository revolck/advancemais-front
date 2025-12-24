"use client";

import React from "react";
import { QuestoesList } from "@/theme/dashboard/components/admin/lista-atividades-provas/components/QuestoesList";

interface QuestoesTabProps {
  cursoId: number | string;
  turmaId: string;
  provaId: string;
}

export function QuestoesTab({
  cursoId,
  turmaId,
  provaId,
}: QuestoesTabProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          Questões da Prova
        </h2>
        <p className="text-sm text-gray-600">
          Gerencie as questões desta prova. Você pode criar questões de texto,
          múltipla escolha ou anexo.
        </p>
      </div>

      <QuestoesList
        cursoId={cursoId}
        turmaId={turmaId}
        provaId={provaId}
      />
    </div>
  );
}




