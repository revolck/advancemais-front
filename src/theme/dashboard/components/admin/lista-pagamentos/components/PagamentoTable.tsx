"use client";

import { PagamentoRow } from "./PagamentoRow";
import { PagamentoTableSkeleton } from "./PagamentoTableSkeleton";
import { EmptyState } from "@/components/ui/custom";
import type { PagamentoTableProps } from "../types";

export function PagamentoTable({
  pagamentos,
  isLoading,
  onViewPix,
  onViewBoleto,
}: PagamentoTableProps) {
  if (isLoading) {
    return <PagamentoTableSkeleton />;
  }

  if (pagamentos.length === 0) {
    return (
      <div className="py-16">
        <EmptyState
          title="Nenhum pagamento encontrado"
          description="Não há pagamentos registrados com os filtros selecionados."
          illustration="myFiles"
        />
      </div>
    );
  }

  return (
    <table className="w-full">
      <thead>
        <tr className="border-b border-gray-200 bg-gray-50/50">
          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
            Data
          </th>
          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
            Status
          </th>
          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
            Método
          </th>
          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
            Valor
          </th>
          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
            Plano
          </th>
          <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">
          </th>
        </tr>
      </thead>
      <tbody>
        {pagamentos.map((pagamento) => (
          <PagamentoRow
            key={pagamento.id}
            pagamento={pagamento}
            onViewPix={onViewPix}
            onViewBoleto={onViewBoleto}
          />
        ))}
      </tbody>
    </table>
  );
}

