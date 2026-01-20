"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ButtonCustom } from "@/components/ui/custom";
import { cn } from "@/lib/utils";
import type { PagamentoCursoRowProps } from "../types";
import { STATUS_CONFIG, METODO_ICONS } from "@/theme/dashboard/components/admin/lista-pagamentos/constants";

export function PagamentoCursoRow({
  pagamento,
  showActions = true,
  onViewPix,
  onViewBoleto,
  onPayRecuperacao,
}: PagamentoCursoRowProps) {
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

    // Normalizar cartões
    if (lower.includes("credit_card") || lower.includes("debit_card")) {
      return "Cartão";
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
  const isPendente = pagamento.status === "PENDENTE" || pagamento.status === "EM_PROCESSAMENTO";
  const isRecuperacaoFinal = pagamento.tipoPagamento === "recuperacao-final";
  const canPay = isPendente && isRecuperacaoFinal && !hasPix && !hasBoleto && onPayRecuperacao;

  // Descrição do curso/turma/prova
  const descricao = pagamento.prova?.titulo || 
    (pagamento.curso && pagamento.turma
      ? `${pagamento.curso.nome} - ${pagamento.turma.nome}`
      : pagamento.curso?.nome || pagamento.turma?.nome || "—");

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

      {/* Curso/Turma/Prova */}
      <td className="px-4 py-3">
        <div className="text-sm text-gray-700">
          <div className="font-medium">{descricao}</div>
          {pagamento.tipoPagamento === "recuperacao-final" && (
            <div className="text-xs text-gray-500 mt-0.5">
              Recuperação Final
            </div>
          )}
        </div>
      </td>

      {/* Ações */}
      {showActions && (
        <td className="px-4 py-3">
          <div className="flex items-center justify-end gap-2">
            {canPay && (
              <ButtonCustom
                variant="primary"
                size="xs"
                onClick={() => onPayRecuperacao?.(pagamento)}
              >
                Pagar
              </ButtonCustom>
            )}

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

            {!canPay && !hasPix && !hasBoleto && (
              <span className="text-sm text-gray-400">—</span>
            )}
          </div>
        </td>
      )}
    </tr>
  );
}

