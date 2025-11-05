"use client";

import { TableCell, TableRow } from "@/components/ui/table";

export interface ProvaRowProps {
  prova: {
    id: string;
    titulo?: string;
    nome?: string;
    descricao?: string;
    tipo?: string;
    status?: string;
    data?: string;
    dataInicio?: string;
    dataFim?: string;
    inicioPrevisto?: string;
    fimPrevisto?: string;
  };
}

function formatDate(value?: string) {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(parsed);
}

export function ProvaRow({ prova }: ProvaRowProps) {
  const title = prova.titulo || prova.nome || prova.descricao || `Prova ${prova.id}`;
  const tipo = prova.tipo || prova.status || "—";
  const inicio = formatDate(prova.dataInicio || prova.data || prova.inicioPrevisto);
  const fim = formatDate(prova.dataFim || prova.fimPrevisto);

  return (
    <TableRow className="border-gray-100 hover:bg-gray-50/50 transition-colors">
      <TableCell className="py-4">
        <div className="text-sm text-gray-900 font-medium">{title}</div>
        <div className="text-xs text-gray-500">{prova.id}</div>
      </TableCell>
      <TableCell className="py-4">{tipo}</TableCell>
      <TableCell className="py-4">{inicio}</TableCell>
      <TableCell className="py-4">{fim}</TableCell>
    </TableRow>
  );
}

