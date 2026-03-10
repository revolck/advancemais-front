"use client";

import { AlertTriangle } from "lucide-react";

import type { TurmaProva } from "@/api/cursos";
import { getAvaliacaoActionRestrictions } from "../utils/validations";
import { getAvaliacaoStatusEfetivo } from "../../lista-atividades-provas/utils/avaliacaoStatus";

interface AvaliacaoAlertasUnificadosProps {
  prova: TurmaProva;
  hasRespostas?: boolean;
  userRole?: string | null;
  userId?: string | null;
}

export function AvaliacaoAlertasUnificados({
  prova,
  hasRespostas,
  userRole,
  userId,
}: AvaliacaoAlertasUnificadosProps) {
  const restrictions = getAvaliacaoActionRestrictions(prova, {
    hasRespostas,
    userRole,
    userId,
  });
  const statusEfetivo = getAvaliacaoStatusEfetivo(prova);
  const issues: string[] = [];

  if (!restrictions.canManage && restrictions.manageReason) {
    issues.push(restrictions.manageReason);
  }

  if (statusEfetivo !== "PUBLICADA" && !restrictions.canPublish) {
    issues.push(
      restrictions.publishReason ||
        "Não é possível publicar esta avaliação no momento."
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

  const uniqueIssues = Array.from(new Set(issues.filter(Boolean)));
  const isMesmoBloqueioPorInicioOuRealizacao =
    uniqueIssues.length >= 2 &&
    uniqueIssues.every((issue) =>
      issue.includes("já iniciou ou já foi realizada")
    );

  if (uniqueIssues.length === 0) return null;

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
          {isMesmoBloqueioPorInicioOuRealizacao ? (
            <p className="mb-0! text-xs! leading-normal! text-gray-700">
              A avaliação já iniciou ou já foi realizada e, por isso, não pode
              mais ser publicada/despublicada, editada ou excluída.
            </p>
          ) : (
            <ul className="mb-0! ml-3 list-disc space-y-1.5 text-xs! leading-normal! text-gray-700">
              {uniqueIssues.map((issue) => (
                <li key={issue} className="mb-0!">
                  {issue}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
