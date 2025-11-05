"use client";

import { EmptyState } from "@/components/ui/custom";

interface HistoryTabProps {
  auditoria?: any[];
  isLoading?: boolean;
}

export function HistoryTab({
  auditoria = [],
  isLoading = false,
}: HistoryTabProps) {
  // Por enquanto, apenas mostra empty state
  // Pode ser implementado futuramente quando houver suporte de auditoria para cursos

  return (
    <EmptyState
      illustration="myFiles"
      illustrationAlt="Ilustração de histórico vazio"
      title="Nenhum histórico encontrado"
      description="Não há registros de alterações para este curso no momento."
      maxContentWidth="md"
      className="rounded-2xl border border-gray-200/60 bg-white p-8"
    />
  );
}
