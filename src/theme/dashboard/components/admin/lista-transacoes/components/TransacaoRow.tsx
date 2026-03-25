"use client";

import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { AuditoriaTransacao } from "@/api/auditoria/types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface TransacaoRowProps {
  transacao: AuditoriaTransacao;
  isDisabled?: boolean;
}

const getTipoColor = (tipo?: string) => {
  if (!tipo) return "bg-gray-100 text-gray-800 border-gray-200";
  
  switch (tipo) {
    case "PAGAMENTO":
      return "bg-green-100 text-green-800 border-green-200";
    case "REEMBOLSO":
      return "bg-orange-100 text-orange-800 border-orange-200";
    case "ESTORNO":
      return "bg-red-100 text-red-800 border-red-200";
    case "ASSINATURA":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "CUPOM":
      return "bg-purple-100 text-purple-800 border-purple-200";
    case "TAXA":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const getTipoLabel = (tipo?: string, tipoLabel?: string | null) => {
  if (tipoLabel) return tipoLabel;
  if (!tipo) return "—";
  
  switch (tipo) {
    case "PAGAMENTO":
      return "Pagamento";
    case "REEMBOLSO":
      return "Reembolso";
    case "ESTORNO":
      return "Estorno";
    case "ASSINATURA":
      return "Assinatura";
    case "CUPOM":
      return "Cupom";
    case "TAXA":
      return "Taxa";
    default:
      return tipo;
  }
};

const getStatusColor = (status?: string) => {
  if (!status) return "bg-gray-100 text-gray-800 border-gray-200";
  
  switch (status) {
    case "PENDENTE":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "PROCESSANDO":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "APROVADA":
      return "bg-green-100 text-green-800 border-green-200";
    case "RECUSADA":
      return "bg-red-100 text-red-800 border-red-200";
    case "CANCELADA":
      return "bg-gray-100 text-gray-800 border-gray-200";
    case "ESTORNADA":
      return "bg-orange-100 text-orange-800 border-orange-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const getStatusLabel = (status?: string, statusLabel?: string | null) => {
  if (statusLabel) return statusLabel;
  if (!status) return "—";
  
  switch (status) {
    case "PENDENTE":
      return "Pendente";
    case "PROCESSANDO":
      return "Processando";
    case "APROVADA":
      return "Aprovada";
    case "RECUSADA":
      return "Recusada";
    case "CANCELADA":
      return "Cancelada";
    case "ESTORNADA":
      return "Estornada";
    default:
      return status;
  }
};

const formatCurrency = (value: number, moeda: string = "BRL") => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: moeda,
  }).format(value);
};

const formatDate = (dateString: string) => {
  try {
    return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: ptBR });
  } catch {
    return dateString;
  }
};

export function TransacaoRow({ 
  transacao, 
  isDisabled = false,
}: TransacaoRowProps) {
  const isRowDisabled = isDisabled;
  const codigoExibicao = transacao.codigoExibicao?.trim() || "—";
  const tipoLabel = getTipoLabel(transacao.tipo, transacao.tipoLabel);
  const statusLabel = getStatusLabel(transacao.status, transacao.statusLabel);
  const gatewayLabel = transacao.gatewayLabel?.trim() || transacao.gateway?.trim() || "—";
  const valorExibicao =
    transacao.valorFormatado?.trim() ||
    formatCurrency(transacao.valor, transacao.moeda);

  return (
    <TableRow 
      className={cn(
        "border-gray-100 transition-colors",
        isRowDisabled 
          ? "opacity-50 pointer-events-none" 
          : "hover:bg-gray-50/50"
      )}
    >
      <TableCell className="py-4">
        <div className="text-sm text-gray-900 font-medium">
          {codigoExibicao}
        </div>
      </TableCell>
      <TableCell className="py-4">
        {transacao.tipo ? (
          <Badge
            variant="outline"
            className={cn(
              "text-xs font-medium",
              getTipoColor(transacao.tipo)
            )}
          >
            {tipoLabel}
          </Badge>
        ) : (
          <div className="text-sm text-gray-500">—</div>
        )}
      </TableCell>
      <TableCell className="py-4">
        {transacao.status ? (
          <Badge
            variant="outline"
            className={cn(
              "text-xs font-medium",
              getStatusColor(transacao.status)
            )}
          >
            {statusLabel}
          </Badge>
        ) : (
          <div className="text-sm text-gray-500">—</div>
        )}
      </TableCell>
      <TableCell className="py-4">
        <div className="text-sm text-gray-900 font-semibold">
          {valorExibicao}
        </div>
      </TableCell>
      <TableCell className="py-4">
        <div className="text-sm text-gray-900">{gatewayLabel}</div>
      </TableCell>
      <TableCell className="py-4">
        {transacao.descricao ? (
          <div className="text-sm text-gray-900 truncate max-w-[200px]" title={transacao.descricao}>
            {transacao.descricao}
          </div>
        ) : (
          <div className="text-sm text-gray-500">—</div>
        )}
      </TableCell>
      <TableCell className="py-4">
        <div className="text-sm text-gray-600">
          {formatDate(transacao.criadoEm)}
        </div>
      </TableCell>
    </TableRow>
  );
}
