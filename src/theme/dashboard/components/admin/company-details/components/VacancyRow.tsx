import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableRow, TableCell } from "@/components/ui/table";
import { AvatarCircles } from "@/components/ui/avatar-circles";
import type { AdminCompanyVagaItem } from "@/api/empresas/admin/types";

interface VacancyRowProps {
  vacancy: AdminCompanyVagaItem;
  onView: (vacancy: AdminCompanyVagaItem) => void;
  onEdit: (vacancy: AdminCompanyVagaItem) => void;
  candidateAvatars?: string[];
}

function formatDate(value?: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function getStatusBadge(status?: string | null) {
  if (!status) return null;
  const s = status.toUpperCase();
  const classes =
    s === "PUBLICADO"
      ? "bg-emerald-100 text-emerald-800 border-emerald-200"
      : s === "EM_ANALISE"
      ? "bg-sky-100 text-sky-800 border-sky-200"
      : s === "EXPIRADO"
      ? "bg-rose-100 text-rose-800 border-rose-200"
      : "bg-slate-100 text-slate-700 border-slate-200";
  const labelMap: Record<string, string> = {
    PUBLICADO: "Publicado",
    EM_ANALISE: "Em análise",
    RASCUNHO: "Rascunho",
    EXPIRADO: "Expirado",
  };
  const label = labelMap[s] ?? status;
  return (
    <Badge className={`${classes} uppercase tracking-wide text-[10px]`}>
      {label}
    </Badge>
  );
}

export function VacancyRow({
  vacancy,
  onView,
  onEdit,
  candidateAvatars = [],
}: VacancyRowProps) {
  const code = vacancy.codigo ?? vacancy.id;
  const shortCode = (code ?? "").replace(/^#/, "").slice(0, 8);
  const title = vacancy.titulo ?? `Vaga ${shortCode}`;
  const regime = "—";
  const modalidade = "—";
  const candidatos = 0;
  const inscricoes = 0;
  const publicadoEm = formatDate(vacancy.inseridaEm);
  const inscricoesAte = "—";
  const statusBadge = getStatusBadge(vacancy.status);

  const hasCandidates = typeof candidatos === "number" && candidatos > 0;

  return (
    <TableRow className="border-gray-200">
      <TableCell className="py-4 align-top">
        <div className="flex flex-col">
          <span className="font-medium text-gray-900">{title}</span>
          <span className="text-xs text-gray-500">
            #{(code ?? "").slice(0, 12)}
          </span>
        </div>
      </TableCell>
      <TableCell className="align-top text-sm text-gray-700">
        <div className="flex flex-col">
          <span>Regime: {regime}</span>
          <span className="text-xs text-gray-500">
            Modalidade: {modalidade}
          </span>
        </div>
      </TableCell>
      <TableCell className="align-top text-sm text-gray-700">
        {hasCandidates ? (
          <div className="flex flex-col gap-1">
            <AvatarCircles
              avatarUrls={candidateAvatars}
              numPeople={candidatos}
            />
            <span className="text-xs text-gray-500">
              Candidatos: {candidatos}
              {typeof inscricoes === "number"
                ? ` · Inscrições: ${inscricoes}`
                : ""}
            </span>
          </div>
        ) : (
          <span className="text-xs text-gray-500">
            Nenhum candidato aplicado.
          </span>
        )}
      </TableCell>
      <TableCell className="align-top text-sm text-gray-700">
        <div className="flex flex-col">
          <span>Publicado: {publicadoEm}</span>
          <span className="text-xs text-gray-500">
            Inscrições até: {inscricoesAte}
          </span>
        </div>
      </TableCell>
      <TableCell className="align-top">{statusBadge}</TableCell>
      <TableCell className="w-40 align-top">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="text-xs"
            onClick={() => onView(vacancy)}
          >
            Ver
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-xs"
            onClick={() => onEdit(vacancy)}
          >
            Editar
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

export default VacancyRow;
