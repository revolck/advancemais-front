"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AvatarCustom } from "@/components/ui/custom";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Award, BookOpen, Calendar, Download, Eye, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { getCursoAlunoDetalhes } from "@/api/cursos";

export interface CertificadoRowProps {
  certificado: {
    id: string;
    codigo?: string;
    numero?: string;
    emitidoEm?: string;
    status?: string;
    previewUrl?: string | null;
    pdfUrl?: string | null;
    alunoNome?: string;
    alunoEmail?: string;
    alunoCpf?: string;
    alunoCodigoMatricula?: string;
    matricula?: string;
    alunoAvatarUrl?: string;
    avatarUrl?: string;
    codigoMatricula?: string;
    alunoCodigo?: string;
    cursoNome?: string;
    turmaNome?: string;
    turmaCodigo?: string;
    aluno?: {
      id: string;
      nome?: string;
      email?: string;
      avatarUrl?: string;
      codigoMatricula?: string;
      cpf?: string;
    };
    curso?: {
      id: string;
      nome?: string;
    } | null;
    turma?: {
      id: string;
      nome?: string;
      codigo?: string;
    } | null;
  };
}

function formatDate(value?: string) {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsed);
}

function formatCpf(value?: string | null) {
  if (!value) return "CPF não informado";
  const digits = value.replace(/\D/g, "");
  if (digits.length !== 11) return value;
  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

function isUuidLike(value?: string | null) {
  if (!value) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}

const getStatusColor = (status?: string) => {
  const statusUpper = (status || "").toUpperCase();
  switch (statusUpper) {
    case "EMITIDO":
    case "ATIVO":
    case "VALIDO":
      return "bg-green-100 text-green-800 border-green-200";
    case "PENDENTE":
    case "AGUARDANDO":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "CANCELADO":
    case "REVOGADO":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const getStatusLabel = (status?: string) => {
  if (!status) return "—";
  const statusUpper = status.toUpperCase();
  switch (statusUpper) {
    case "EMITIDO":
      return "Emitido";
    case "ATIVO":
      return "Ativo";
    case "VALIDO":
      return "Válido";
    case "PENDENTE":
      return "Pendente";
    case "AGUARDANDO":
      return "Aguardando";
    case "CANCELADO":
      return "Cancelado";
    case "REVOGADO":
      return "Revogado";
    default:
      return status;
  }
};

export function CertificadoRow({ certificado }: CertificadoRowProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const alunoId = certificado.aluno?.id || (certificado as any)?.alunoId || null;
  const alunoNomeBase =
    certificado.aluno?.nome ||
    certificado.alunoNome ||
    certificado.aluno?.email ||
    certificado.alunoEmail ||
    "—";
  const codigoMatriculaBase =
    certificado.aluno?.codigoMatricula ||
    certificado.alunoCodigoMatricula ||
    certificado.matricula ||
    certificado.codigoMatricula ||
    certificado.alunoCodigo ||
    null;
  const cpfBase = certificado.aluno?.cpf || certificado.alunoCpf || null;
  const avatarUrlBase =
    certificado.aluno?.avatarUrl ||
    certificado.alunoAvatarUrl ||
    certificado.avatarUrl ||
    undefined;

  const shouldFetchAlunoDetails = Boolean(
    alunoId &&
      (!codigoMatriculaBase ||
        !cpfBase ||
        !avatarUrlBase ||
        alunoNomeBase === "—" ||
        isUuidLike(codigoMatriculaBase))
  );

  const detalhesAlunoQuery = useQuery({
    queryKey: ["certificados", "aluno-row", alunoId],
    queryFn: async () => {
      if (!alunoId) return null;
      const response = await getCursoAlunoDetalhes(alunoId);
      return response?.data ?? null;
    },
    enabled: shouldFetchAlunoDetails,
    staleTime: 5 * 60 * 1000,
  });

  const alunoNome =
    alunoNomeBase !== "—"
      ? alunoNomeBase
      : detalhesAlunoQuery.data?.nomeCompleto ||
        detalhesAlunoQuery.data?.nome ||
        "—";

  const codigoMatriculaRaw =
    codigoMatriculaBase || detalhesAlunoQuery.data?.codigo || null;
  const codigoMatricula =
    codigoMatriculaRaw && !isUuidLike(codigoMatriculaRaw)
      ? codigoMatriculaRaw
      : null;
  const cpf = cpfBase || detalhesAlunoQuery.data?.cpf || null;
  const avatarUrl = avatarUrlBase || detalhesAlunoQuery.data?.avatarUrl || undefined;
  const cursoNome = certificado.curso?.nome || certificado.cursoNome || "—";
  const turmaNome = certificado.turma?.nome || certificado.turmaNome || "—";
  const turmaCodigo = certificado.turma?.codigo || certificado.turmaCodigo || null;
  const codigo = certificado.codigo || certificado.numero || "—";
  const emitido = formatDate(certificado.emitidoEm);
  const pdfUrl = `/api/certificados/${certificado.id}/pdf`;

  const handleOpenPreview = (e: React.MouseEvent) => {
    e.preventDefault();
    window.open(
      `/certificados/${certificado.id}/visualizar`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const handleDownload = (e?: React.MouseEvent) => {
    e?.preventDefault();
    if (isDownloading) return;

    setIsDownloading(true);
    window.open(pdfUrl, "_blank", "noopener,noreferrer");
    setTimeout(() => setIsDownloading(false), 400);
  };

  return (
      <TableRow className="border-gray-100 hover:bg-gray-50/50 transition-colors">
      <TableCell className="py-4 px-3">
        <div className="flex items-center gap-3">
          <AvatarCustom
            name={alunoNome}
            src={avatarUrl}
            size="sm"
            showStatus={false}
          />
          <div className="min-w-0">
            <div className="mb-1 flex items-center gap-2">
              <div className="max-w-[240px] truncate text-sm font-medium text-gray-900">
                {alunoNome}
              </div>
              {codigoMatricula && (
                <code className="shrink-0 rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs text-gray-500">
                  {codigoMatricula}
                </code>
              )}
            </div>
            <div className="max-w-[320px] truncate font-mono text-xs text-gray-500">
              {formatCpf(cpf)}
            </div>
          </div>
        </div>
      </TableCell>

      <TableCell className="py-4 px-3">
        <div className="flex min-w-0 items-start gap-2">
          <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
          <div className="min-w-0 space-y-1">
            <div className="flex min-w-0 items-center gap-2">
              <span className="shrink-0 text-[11px] text-gray-500">Curso</span>
              <span className="min-w-0 truncate text-sm text-gray-700">
                {cursoNome}
              </span>
            </div>
            <div className="flex min-w-0 items-center gap-2">
              <span className="shrink-0 text-[11px] text-gray-500">Turma</span>
              <span className="min-w-0 truncate text-sm text-gray-700">
                {turmaNome}
              </span>
              {turmaCodigo && (
                <code className="shrink-0 rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs text-gray-500">
                  {turmaCodigo}
                </code>
              )}
            </div>
          </div>
        </div>
      </TableCell>

      <TableCell className="py-4">
        <div className="flex items-center gap-2">
          <Award className="h-4 w-4 text-gray-400 flex-shrink-0" />
          <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded font-mono text-gray-600">
            {codigo}
          </code>
        </div>
      </TableCell>

      <TableCell className="py-4">
        {certificado.status ? (
          <Badge
            variant="outline"
            className={cn("text-xs font-medium", getStatusColor(certificado.status))}
          >
            {getStatusLabel(certificado.status)}
          </Badge>
        ) : (
          <Badge
            variant="outline"
            className="text-xs font-medium bg-green-100 text-green-800 border-green-200"
          >
            Emitido
          </Badge>
        )}
      </TableCell>

      <TableCell className="py-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="h-4 w-4 flex-shrink-0 text-gray-400" />
          <span>{emitido}</span>
        </div>
      </TableCell>

        <TableCell className="py-4">
          <div className="flex items-center justify-end gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleOpenPreview}
                  className="h-8 w-8 rounded-full text-gray-500 hover:text-white hover:bg-[var(--primary-color)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  aria-label="Visualizar certificado"
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent sideOffset={8}>Visualizar certificado</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className="h-8 w-8 rounded-full text-gray-500 hover:text-white hover:bg-[var(--primary-color)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  aria-label="Baixar certificado"
                >
                  {isDownloading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent sideOffset={8}>Baixar PDF</TooltipContent>
            </Tooltip>
          </div>
        </TableCell>
      </TableRow>
  );
}
