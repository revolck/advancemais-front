"use client";

import { UserHistoryTabContent } from "../../shared/UserHistoryTabContent";
import type { HistoryTabProps } from "../types";

export function HistoryTab({ aluno }: HistoryTabProps) {
  return (
    <UserHistoryTabContent
      target={{ id: aluno.id }}
      emptyDescription="Não encontramos registros de auditoria para este aluno."
    />
  );
}

