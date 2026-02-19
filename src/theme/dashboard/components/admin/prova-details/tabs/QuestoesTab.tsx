"use client";

import React from "react";
import { QuestoesList } from "@/theme/dashboard/components/admin/lista-atividades-provas/components/QuestoesList";

interface QuestoesTabProps {
  cursoId: number | string;
  turmaId: string;
  provaId: string;
  allowQuestionManagement?: boolean;
}

export function QuestoesTab({
  cursoId,
  turmaId,
  provaId,
  allowQuestionManagement = true,
}: QuestoesTabProps) {
  return (
    <QuestoesList
      cursoId={cursoId}
      turmaId={turmaId}
      provaId={provaId}
      allowQuestionManagement={allowQuestionManagement}
    />
  );
}
