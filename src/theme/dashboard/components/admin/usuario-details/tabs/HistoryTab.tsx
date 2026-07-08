"use client";

import { UserHistoryTabContent } from "../../shared/UserHistoryTabContent";
import type { HistoryTabProps } from "../types";

export function HistoryTab({ usuario }: HistoryTabProps) {
  return (
    <UserHistoryTabContent
      target={{ id: usuario.id }}
      emptyDescription="Não encontramos registros de auditoria para este usuário."
    />
  );
}

