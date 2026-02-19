"use client";

import { AlertTriangle } from "lucide-react";

import type { TurmaProva } from "@/api/cursos";
import { getAvaliacaoActionRestrictions } from "../utils/validations";

interface AvaliacaoAlertasUnificadosProps {
  prova: TurmaProva;
  hasRespostas?: boolean;
}

export function AvaliacaoAlertasUnificados({
  prova,
  hasRespostas,
}: AvaliacaoAlertasUnificadosProps) {
  const restrictions = getAvaliacaoActionRestrictions(prova, { hasRespostas });
  const issues: string[] = [];

  if (prova.status !== "PUBLICADA" && !restrictions.canPublish) {
    issues.push(
      restrictions.publishReason ||
        "Não é possível publicar enquanto não houver turma vinculada."
    );
  }

  if (!restrictions.canEdit) {
    issues.push(
      restrictions.editReason ||
        "A edição está bloqueada para o momento atual da atividade/prova."
    );
  }

  if (!restrictions.canDelete && restrictions.deleteReason) {
    issues.push(restrictions.deleteReason);
  }

  if (issues.length === 0) return null;

  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100">
          <AlertTriangle className="h-4 w-4 text-red-600" />
        </div>
        <div className="space-y-2">
          <p className="mb-0! text-sm! font-bold! leading-normal! text-red-800">
            Algumas ações estão bloqueadas
          </p>
          <ul className="mb-0! ml-3 list-disc space-y-1.5 text-xs! leading-normal! text-gray-700">
            {issues.map((issue) => (
              <li key={issue} className="mb-0!">
                {issue}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
