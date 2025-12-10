"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ButtonCustom } from "@/components/ui/custom";
import { cn } from "@/lib/utils";
import type { PagamentoRowProps } from "../types";
import { STATUS_CONFIG, METODO_ICONS } from "../constants";

export function PagamentoRow({
  pagamento,
  onViewPix,
  onViewBoleto,
}: PagamentoRowProps) {
  const statusConfig = pagamento.status
    ? STATUS_CONFIG[pagamento.status]
    : null;

  const metodoIcon =
    METODO_ICONS[pagamento.metodo ?? "default"] ?? METODO_ICONS.default;

  // Normalizar descrição do método
  const getNormalizedMetodoDescricao = (descricao: string | null): string => {
    if (!descricao) return "";

    const lower = descricao.toLowerCase();

    // Normalizar boletos
    if (lower.includes("boleto")) {
      return "Boleto";
    }

    // Normalizar PIX
    if (lower.includes("pix")) {
      return "PIX";
    }

    // Retornar original para outros casos
    return descricao;
  };

  const metodoDescricao = getNormalizedMetodoDescricao(
    pagamento.metodoDescricao
  );

  const formattedDate = format(
    new Date(pagamento.criadoEm),
    "dd/MM/yyyy 'às' HH:mm",
    { locale: ptBR }
  );

  const hasPix = Boolean(pagamento.detalhes?.pix);
  const hasBoleto = Boolean(pagamento.detalhes?.boleto);

  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
      {/* Data */}
      <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
        {formattedDate}
      </td>

      {/* Status */}
      <td className="px-4 py-3">
        {statusConfig ? (
          <span
            className={cn(
              "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium",
              statusConfig.bgColor,
              statusConfig.color
            )}
          >
            {statusConfig.label}
          </span>
        ) : (
          <span className="text-sm text-gray-400">—</span>
        )}
      </td>

      {/* Método */}
      <td className="px-4 py-3">
        {metodoDescricao ? (
          <div className="flex items-center gap-2">
            <span className="text-lg">{metodoIcon}</span>
            <span className="text-sm text-gray-700">{metodoDescricao}</span>
          </div>
        ) : (
          <span className="text-sm text-gray-400">—</span>
        )}
      </td>

      {/* Valor */}
      <td className="px-4 py-3">
        {pagamento.valorFormatado ? (
          <span className="text-sm font-semibold text-gray-900">
            {pagamento.valorFormatado}
          </span>
        ) : (
          <span className="text-sm text-gray-400">—</span>
        )}
      </td>

      {/* Plano */}
      <td className="px-4 py-3">
        {pagamento.plano ? (
          <span className="text-sm text-gray-700">{pagamento.plano.nome}</span>
        ) : (
          <span className="text-sm text-gray-400">—</span>
        )}
      </td>

      {/* Ações */}
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-2">
          {hasPix && onViewPix && (
            <ButtonCustom
              variant="secondary"
              size="xs"
              onClick={() => onViewPix(pagamento)}
            >
              Visualizar
            </ButtonCustom>
          )}

          {hasBoleto && onViewBoleto && (
            <ButtonCustom
              variant="secondary"
              size="xs"
              onClick={() => onViewBoleto(pagamento)}
            >
              Visualizar
            </ButtonCustom>
          )}

          {!hasPix && !hasBoleto && (
            <span className="text-sm text-gray-400">—</span>
          )}
        </div>
      </td>
    </tr>
  );
}
