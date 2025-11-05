"use client";

import { TableCell, TableRow } from "@/components/ui/table";

export interface CertificadoRowProps {
  certificado: {
    id: string;
    codigo?: string;
    numero?: string;
    emitidoEm?: string;
    status?: string;
    aluno?: {
      id: string;
      nome?: string;
      email?: string;
    };
  };
}

function formatDate(value?: string) {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(parsed);
}

export function CertificadoRow({ certificado }: CertificadoRowProps) {
  const alunoNome = certificado.aluno?.nome || certificado.aluno?.email || certificado.aluno?.id || "—";
  const codigo = certificado.codigo || certificado.numero || "—";
  const emitido = formatDate(certificado.emitidoEm);

  return (
    <TableRow className="border-gray-100 hover:bg-gray-50/50 transition-colors">
      <TableCell className="py-4">
        <div className="text-sm text-gray-900 font-medium">{alunoNome}</div>
        {certificado.aluno?.id && <div className="text-xs text-gray-500">{certificado.aluno.id}</div>}
      </TableCell>
      <TableCell className="py-4">{codigo}</TableCell>
      <TableCell className="py-4">{emitido}</TableCell>
    </TableRow>
  );
}

