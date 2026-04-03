"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  CalendarClock,
  Eye,
  MapPin,
  PlayCircle,
} from "lucide-react";

import {
  getCursoAlunoEntrevistaOpcoes,
  getCursoAlunoEntrevistas,
} from "@/api/cursos";
import type { EntrevistaOverviewItem } from "@/api/entrevistas";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ButtonCustom, EmptyState } from "@/components/ui/custom";
import { Skeleton } from "@/components/ui/skeleton";
import { UserRole } from "@/config/roles";
import { useUserRole } from "@/hooks/useUserRole";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { EntrevistaModalView } from "../../lista-entrevistas/components/EntrevistaModalView";
import { MarcarEntrevistaAlunoModal } from "../modal-acoes";
import type { AlunoDetailsData } from "../types";
import { formatDateTime } from "../utils/formatters";

interface EntrevistasTabProps {
  aluno: AlunoDetailsData;
  isLoading?: boolean;
}

const PAGE_SIZE = 10;

function buildStatusClasses(status: string): string {
  switch (status) {
    case "AGENDADA":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "CONFIRMADA":
      return "bg-cyan-100 text-cyan-800 border-cyan-200";
    case "REALIZADA":
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    case "CANCELADA":
      return "bg-red-100 text-red-800 border-red-200";
    case "REAGENDADA":
      return "bg-amber-100 text-amber-800 border-amber-200";
    case "NAO_COMPARECEU":
      return "bg-gray-100 text-gray-800 border-gray-200";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
}

function buildModalidadeClasses(modalidade?: string | null): string {
  switch (modalidade) {
    case "ONLINE":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "PRESENCIAL":
      return "border-amber-200 bg-amber-50 text-amber-700";
    default:
      return "border-gray-200 bg-gray-50 text-gray-600";
  }
}

function buildCompanyDisplayName(entrevista: EntrevistaOverviewItem): string {
  return (
    entrevista.empresa?.labelExibicao ??
    (entrevista.empresaAnonima || entrevista.empresa?.anonima
      ? "Empresa anônima"
      : entrevista.empresa?.nomeExibicao ?? "Empresa não informada")
  );
}

function buildAddressText(
  endereco?: EntrevistaOverviewItem["enderecoPresencial"],
): string | null {
  if (!endereco) return null;

  const line1 = [endereco.logradouro, endereco.numero]
    .filter(Boolean)
    .join(", ")
    .trim();
  const line2 = [endereco.bairro, endereco.cidade, endereco.estado]
    .filter(Boolean)
    .join(", ")
    .trim();
  const line3 = [endereco.cep, endereco.complemento, endereco.pontoReferencia]
    .filter(Boolean)
    .join(" · ")
    .trim();

  return [line1, line2, line3].filter(Boolean).join(" — ") || null;
}

function buildActionHref(entrevista: EntrevistaOverviewItem): string | null {
  if (entrevista.meetUrl) {
    return entrevista.meetUrl;
  }

  const locationQuery =
    entrevista.local?.trim() || buildAddressText(entrevista.enderecoPresencial);
  if (!locationQuery) {
    return null;
  }

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locationQuery)}`;
}

function buildActionLabel(entrevista: EntrevistaOverviewItem): string {
  return entrevista.modalidade === "ONLINE" ? "Começar" : "Ver local";
}

export function EntrevistasTab({
  aluno,
  isLoading = false,
}: EntrevistasTabProps) {
  const role = useUserRole();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEntrevista, setSelectedEntrevista] =
    useState<EntrevistaOverviewItem | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const canCreateFromAluno =
    role === UserRole.ADMIN ||
    role === UserRole.MODERADOR ||
    role === UserRole.RECRUTADOR;

  const {
    data: entrevistasResponse,
    isLoading: isLoadingEntrevistas,
    error,
  } = useQuery({
    queryKey: ["aluno-details-entrevistas", aluno.id, currentPage],
    queryFn: () =>
      getCursoAlunoEntrevistas(aluno.id, {
        page: currentPage,
        pageSize: PAGE_SIZE,
        sortBy: "agendadaPara",
        sortDir: "desc",
      }),
    enabled: Boolean(aluno.id),
    staleTime: 60 * 1000,
  });

  const {
    data: entrevistaOptions,
    error: optionsError,
  } = useQuery({
    queryKey: ["aluno-details-entrevistas-opcoes", aluno.id],
    queryFn: () => getCursoAlunoEntrevistaOpcoes(aluno.id),
    enabled: Boolean(aluno.id) && canCreateFromAluno,
    staleTime: 60 * 1000,
  });

  const entrevistas = entrevistasResponse?.items ?? [];
  const pagination = entrevistasResponse?.pagination ?? {
    page: currentPage,
    pageSize: PAGE_SIZE,
    total: entrevistas.length,
    totalPages: entrevistas.length > 0 ? 1 : 0,
  };

  const queryErrorMessage = useMemo(() => {
    if (!error) return null;
    return error instanceof Error
      ? error.message
      : "Não foi possível carregar as entrevistas do candidato.";
  }, [error]);

  const optionsErrorMessage = useMemo(() => {
    if (!optionsError) return null;
    return optionsError instanceof Error
      ? optionsError.message
      : "Não foi possível carregar as opções para marcar entrevista.";
  }, [optionsError]);

  const canOpenCreateModal =
    canCreateFromAluno &&
    (entrevistaOptions?.canCreate ?? true) &&
    (entrevistaOptions?.items ?? []).some((item) => !item.entrevistaAtiva);

  const createAction = canOpenCreateModal ? (
    <ButtonCustom
      type="button"
      variant="primary"
      className="cursor-pointer"
      onClick={() => setIsCreateModalOpen(true)}
    >
      Marcar entrevista
    </ButtonCustom>
  ) : null;

  if (isLoading || isLoadingEntrevistas) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 rounded-2xl" />
        <Skeleton className="h-24 rounded-2xl" />
        <Skeleton className="h-24 rounded-2xl" />
      </div>
    );
  }

  if (queryErrorMessage) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{queryErrorMessage}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-5">
      {optionsErrorMessage ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{optionsErrorMessage}</AlertDescription>
        </Alert>
      ) : null}

      {createAction ? (
        <div className="flex justify-end">{createAction}</div>
      ) : null}

      {entrevistas.length === 0 ? (
        <div className="rounded-3xl border border-slate-200/80 bg-white p-12">
          <EmptyState
            illustration="userProfiles"
            illustrationAlt="Nenhuma entrevista"
            title="Nenhuma entrevista encontrada"
            description="Este candidato ainda não possui entrevistas registradas."
            maxContentWidth="md"
          />
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-2xl border border-slate-200/80">
            <Table className="min-w-[1120px]">
              <TableHeader>
                <TableRow className="border-gray-200 bg-gray-50/50">
                  <TableHead className="py-4 font-medium text-gray-700">
                    Entrevista
                  </TableHead>
                  <TableHead className="font-medium text-gray-700">Vaga</TableHead>
                  <TableHead className="font-medium text-gray-700">Empresa</TableHead>
                  <TableHead className="font-medium text-gray-700">
                    Responsável
                  </TableHead>
                  <TableHead className="font-medium text-gray-700">
                    Modalidade
                  </TableHead>
                  <TableHead className="font-medium text-gray-700">Status</TableHead>
                  <TableHead className="w-[220px] text-right font-medium text-gray-700">
                    Ações
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entrevistas.map((entrevista) => {
                const actionHref = buildActionHref(entrevista);
                const actionLabel = buildActionLabel(entrevista);
                const actionIcon =
                  entrevista.modalidade === "ONLINE" ? PlayCircle : MapPin;

                return (
                  <TableRow
                    key={entrevista.id}
                    className="border-gray-100 transition-colors hover:bg-gray-50/40"
                  >
                    <TableCell className="py-4">
                      <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                        <CalendarClock className="h-4 w-4 text-gray-400" />
                        <span>
                          {formatDateTime(
                            entrevista.dataInicio ?? entrevista.agendadaPara,
                          )}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="py-4">
                      <div className="space-y-1">
                        <div className="font-medium text-gray-900">
                          {entrevista.vaga.titulo}
                        </div>
                        <div className="font-mono text-xs text-gray-500">
                          {entrevista.vaga.codigo || "Sem código"}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="py-4">
                      <div className="text-sm text-gray-700">
                        {buildCompanyDisplayName(entrevista)}
                      </div>
                    </TableCell>

                    <TableCell className="py-4">
                      <div className="text-sm text-gray-700">
                        {entrevista.recrutador?.nome ?? "Não informado"}
                      </div>
                    </TableCell>

                    <TableCell className="py-4">
                      {entrevista.modalidadeLabel ? (
                        <Badge
                          variant="outline"
                          className={cn(
                            "font-medium",
                            buildModalidadeClasses(entrevista.modalidade),
                          )}
                        >
                          {entrevista.modalidadeLabel}
                        </Badge>
                      ) : (
                        <span className="text-sm text-gray-500">Não informado</span>
                      )}
                    </TableCell>

                    <TableCell className="py-4">
                      <Badge
                        variant="outline"
                        className={cn(
                          "font-medium",
                          buildStatusClasses(entrevista.statusEntrevista),
                        )}
                      >
                        {entrevista.statusEntrevistaLabel || entrevista.statusEntrevista}
                      </Badge>
                    </TableCell>

                    <TableCell className="py-4">
                      <div className="flex items-center justify-end gap-2">
                        <ButtonCustom
                          type="button"
                          variant="outline"
                          size="sm"
                          className="cursor-pointer"
                          onClick={() => setSelectedEntrevista(entrevista)}
                        >
                          <Eye className="h-4 w-4" />
                          Visualizar
                        </ButtonCustom>

                        {actionHref ? (
                          <ButtonCustom
                            asChild
                            type="button"
                            variant="primary"
                            size="sm"
                            className="cursor-pointer"
                          >
                            <a href={actionHref} target="_blank" rel="noreferrer">
                              {actionIcon === PlayCircle ? (
                                <PlayCircle className="h-4 w-4" />
                              ) : (
                                <MapPin className="h-4 w-4" />
                              )}
                              {actionLabel}
                            </a>
                          </ButtonCustom>
                        ) : null}
                      </div>
                    </TableCell>
                  </TableRow>
                );
                })}
              </TableBody>
            </Table>
          </div>

          {pagination.totalPages > 1 ? (
            <div className="flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-500">
                Mostrando{" "}
                {pagination.total === 0
                  ? 0
                  : (pagination.page - 1) * pagination.pageSize + 1}{" "}
                a {Math.min(pagination.page * pagination.pageSize, pagination.total)} de{" "}
                {pagination.total}
              </p>

              <div className="flex items-center gap-2">
                <ButtonCustom
                  type="button"
                  variant="outline"
                  size="sm"
                  className="cursor-pointer"
                  onClick={() =>
                    setCurrentPage((previousPage) => Math.max(1, previousPage - 1))
                  }
                  disabled={pagination.page <= 1}
                >
                  Anterior
                </ButtonCustom>

                <span className="text-sm text-slate-500">
                  Página {pagination.page} de {pagination.totalPages}
                </span>

                <ButtonCustom
                  type="button"
                  variant="outline"
                  size="sm"
                  className="cursor-pointer"
                  onClick={() =>
                    setCurrentPage((previousPage) =>
                      Math.min(pagination.totalPages, previousPage + 1),
                    )
                  }
                  disabled={pagination.page >= pagination.totalPages}
                >
                  Próxima
                </ButtonCustom>
              </div>
            </div>
          ) : null}
        </>
      )}

      <EntrevistaModalView
        entrevista={selectedEntrevista}
        isOpen={Boolean(selectedEntrevista)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedEntrevista(null);
          }
        }}
      />

      <MarcarEntrevistaAlunoModal
        alunoId={aluno.id}
        alunoNome={aluno.nome || aluno.nomeCompleto}
        isOpen={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
      />
    </div>
  );
}
