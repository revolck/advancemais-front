"use client";

import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/custom";
import { cn } from "@/lib/utils";
import type { AuditoriaLog } from "@/api/auditoria/types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface HistoricoRowProps {
  log: AuditoriaLog;
  isDisabled?: boolean;
}

const getCategoriaColor = (categoria?: string) => {
  if (!categoria) return "bg-gray-100 text-gray-800 border-gray-200";
  
  switch (categoria) {
    case "SISTEMA":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "USUARIO":
      return "bg-green-100 text-green-800 border-green-200";
    case "EMPRESA":
      return "bg-purple-100 text-purple-800 border-purple-200";
    case "VAGA":
      return "bg-orange-100 text-orange-800 border-orange-200";
    case "CURSO":
      return "bg-indigo-100 text-indigo-800 border-indigo-200";
    case "PAGAMENTO":
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    case "SEGURANCA":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const getCategoriaLabel = (categoria?: string) => {
  if (!categoria) return "—";
  
  switch (categoria) {
    case "SISTEMA":
      return "Sistema";
    case "USUARIO":
      return "Usuário";
    case "EMPRESA":
      return "Empresa";
    case "VAGA":
      return "Vaga";
    case "CURSO":
      return "Curso";
    case "PAGAMENTO":
      return "Pagamento";
    case "SEGURANCA":
      return "Segurança";
    default:
      return categoria;
  }
};

const formatDate = (dateString: string) => {
  try {
    return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: ptBR });
  } catch {
    return dateString;
  }
};

export function HistoricoRow({ 
  log, 
  isDisabled = false,
}: HistoricoRowProps) {
  const isRowDisabled = isDisabled;

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
        <div className="min-w-0">
          <div className="text-sm text-gray-900 font-medium truncate max-w-[300px]">
            {log.descricao || log.acao || "—"}
          </div>
          {log.tipo && (
            <div className="text-xs text-gray-500 mt-0.5 truncate max-w-[300px]">
              {log.tipo}
            </div>
          )}
        </div>
      </TableCell>
      <TableCell className="py-4">
        {log.categoria ? (
          <Badge
            variant="outline"
            className={cn(
              "text-xs font-medium",
              getCategoriaColor(log.categoria)
            )}
          >
            {getCategoriaLabel(log.categoria)}
          </Badge>
        ) : (
          <div className="text-sm text-gray-500">—</div>
        )}
      </TableCell>
      <TableCell className="py-4">
        <div className="text-sm text-gray-900">
          {log.acao || "—"}
        </div>
      </TableCell>
      <TableCell className="py-4">
        {log.usuarioId ? (
          <div className="flex items-center gap-2 max-w-[200px]">
            <Icon
              name="User"
              size={16}
              className="text-gray-400 flex-shrink-0"
            />
            <div className="text-sm text-gray-900 truncate" title={log.usuarioId}>
              {log.usuarioId.substring(0, 8)}...
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-500">—</div>
        )}
      </TableCell>
      <TableCell className="py-4">
        {log.ip ? (
          <div className="text-sm text-gray-900 font-mono">
            {log.ip}
          </div>
        ) : (
          <div className="text-sm text-gray-500">—</div>
        )}
      </TableCell>
      <TableCell className="py-4">
        <div className="text-sm text-gray-600">
          {formatDate(log.criadoEm)}
        </div>
      </TableCell>
    </TableRow>
  );
}

