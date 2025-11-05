"use client";

import { TableCell, TableRow } from "@/components/ui/table";

export interface EstagioRowProps {
  estagio: {
    id: string;
    status?: string;
    empresa?: string;
    cargo?: string;
    criadoEm?: string;
    atualizadoEm?: string;
    inicioPrevisto?: string;
    fimPrevisto?: string;
    aluno?: {
      id: string;
      nome?: string;
      email?: string;
      telefone?: string;
    };
  };
}

function formatDate(value?: string) {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(parsed);
}

export function EstagioRow({ estagio }: EstagioRowProps) {
  const alunoNome = estagio.aluno?.nome || estagio.aluno?.email || estagio.aluno?.id || "—";
  const empresa = estagio.empresa || estagio.cargo || "—";
  const status = estagio.status || "—";
  const atualizado = formatDate(estagio.atualizadoEm || estagio.fimPrevisto || estagio.criadoEm);

  return (
    <TableRow className="border-gray-100 hover:bg-gray-50/50 transition-colors">
      <TableCell className="py-4">
        <div className="text-sm text-gray-900 font-medium">{alunoNome}</div>
        {estagio.aluno?.id && <div className="text-xs text-gray-500">{estagio.aluno.id}</div>}
      </TableCell>
      <TableCell className="py-4">{empresa}</TableCell>
      <TableCell className="py-4">{status}</TableCell>
      <TableCell className="py-4">{atualizado}</TableCell>
    </TableRow>
  );
}
