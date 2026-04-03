"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  BriefcaseBusiness,
  Building2,
  Link2,
  Plus,
  Trash2,
} from "lucide-react";

import {
  deleteUsuarioRecrutadorVinculo,
  getUsuarioRecrutadorVinculos,
  type UsuarioRecrutadorVinculoEscopo,
  type UsuarioRecrutadorVinculoItem,
  type UsuarioRecrutadorVinculoTipo,
} from "@/api/usuarios";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { AvatarCustom } from "@/components/ui/custom/avatar";
import { ButtonCustom, toastCustom } from "@/components/ui/custom";
import { DeleteConfirmModal } from "@/components/ui/custom/list-manager/components/DeleteConfirmModal";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { queryKeys } from "@/lib/react-query/queryKeys";
import { cn } from "@/lib/utils";
import { CreateVinculoRecrutadorModal } from "../modal-acoes";
import type { VinculosTabProps } from "../types";
import { formatDateTime } from "../utils/formatters";

type ApiError = Error & {
  code?: string;
  details?: {
    code?: string;
    message?: string;
  };
};

function getErrorMessage(error: unknown, fallback: string): string {
  const apiError = error as ApiError | undefined;
  return apiError?.details?.message || apiError?.message || fallback;
}

function formatStatusLabel(status?: string | null): string {
  if (!status) return "—";

  return status
    .split("_")
    .map((segment) => {
      const lower = segment.toLowerCase();
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(" ");
}

function formatCnpj(value?: string | null): string | null {
  if (!value) return null;

  const digits = value.replace(/\D/g, "").slice(0, 14);

  if (digits.length !== 14) return null;

  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(
    5,
    8,
  )}/${digits.slice(8, 12)}-${digits.slice(12)}`;
}

function buildTipoBadgeClasses(tipo: UsuarioRecrutadorVinculoTipo): string {
  return tipo === "EMPRESA"
    ? "border-sky-200 bg-sky-50 text-sky-700"
    : "border-amber-200 bg-amber-50 text-amber-700";
}

function buildStatusBadgeClasses(status?: string | null): string {
  switch (status) {
    case "PUBLICADA":
      return "border-sky-200 bg-sky-50 text-sky-700";
    case "DESPUBLICADA":
      return "border-amber-200 bg-amber-50 text-amber-700";
    default:
      return "border-slate-200 bg-slate-50 text-slate-600";
  }
}

function buildEscopoDescription(escopo: UsuarioRecrutadorVinculoEscopo): string {
  const parts: string[] = [];

  if (escopo.permiteVagasPublicadas) parts.push("vagas publicadas");
  if (escopo.permiteVagasDespublicadas) parts.push("vagas despublicadas");
  if (escopo.permiteCandidatos) parts.push("candidatos");

  if (parts.length === 0) return "Sem permissões adicionais.";

  return `Permite operar ${parts.join(", ")}.`;
}

export function VinculosTab({ usuario, isLoading = false }: VinculosTabProps) {
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedVinculo, setSelectedVinculo] =
    useState<UsuarioRecrutadorVinculoItem | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const vinculosQueryKey = useMemo(
    () => ["usuario-recrutador-vinculos", usuario.id] as const,
    [usuario.id],
  );

  const {
    data: vinculosResponse,
    error,
    isLoading: isLoadingVinculos,
    isFetching: isFetchingVinculos,
  } = useQuery({
    queryKey: vinculosQueryKey,
    queryFn: () => getUsuarioRecrutadorVinculos(usuario.id),
    enabled: usuario.role === "RECRUTADOR",
    staleTime: 60 * 1000,
  });

  const refreshVinculosData = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: vinculosQueryKey }),
      queryClient.invalidateQueries({
        queryKey: ["usuario-recrutador-vinculos-opcoes", usuario.id],
        exact: false,
      }),
    ]);
  };

  const deleteMutation = useMutation({
    mutationFn: (item: UsuarioRecrutadorVinculoItem) =>
      deleteUsuarioRecrutadorVinculo(usuario.id, item.id),
    onSuccess: async (response) => {
      toastCustom.success(
        response.message || "Vínculo do recrutador removido com sucesso.",
      );
      setSelectedVinculo(null);
      await refreshVinculosData();
    },
    onError: (error) => {
      toastCustom.error(
        getErrorMessage(error, "Não foi possível remover o vínculo do recrutador."),
      );
    },
  });

  const vinculos = useMemo(() => {
    const items = vinculosResponse?.data.items ?? [];
    return [...items].sort(
      (left, right) =>
        new Date(right.criadoEm).getTime() - new Date(left.criadoEm).getTime(),
    );
  }, [vinculosResponse]);

  const queryErrorMessage = useMemo(() => {
    if (!error) return null;
    return getErrorMessage(error, "Não foi possível carregar os vínculos do recrutador.");
  }, [error]);

  const totalItems = vinculos.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedVinculos = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return vinculos.slice(start, end);
  }, [currentPage, pageSize, vinculos]);

  const visiblePages = useMemo(() => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    const start = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
    const end = Math.min(totalPages, start + 4);

    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
  }, [currentPage, totalPages]);

  const showInitialSkeleton = isLoading || isLoadingVinculos;
  const showTableSkeleton =
    !queryErrorMessage && isFetchingVinculos && !showInitialSkeleton;

  if (usuario.role !== "RECRUTADOR") {
    return null;
  }

  if (showInitialSkeleton) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 rounded-xl" />
        <Skeleton className="h-28 rounded-3xl" />
        <Skeleton className="h-20 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <ButtonCustom
          type="button"
          variant="primary"
          onClick={() => setIsCreateModalOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Adicionar vínculo
        </ButtonCustom>
      </div>

      {queryErrorMessage ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{queryErrorMessage}</AlertDescription>
        </Alert>
      ) : null}

      {showTableSkeleton ? (
        <div className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-white">
          <Table className="min-w-[1020px]">
            <TableHeader>
              <TableRow className="border-slate-200 bg-slate-50/70">
                <TableHead className="py-4 font-medium text-slate-700">Tipo</TableHead>
                <TableHead className="font-medium text-slate-700">Empresa</TableHead>
                <TableHead className="font-medium text-slate-700">Vaga</TableHead>
                <TableHead className="font-medium text-slate-700">Escopo</TableHead>
                <TableHead className="font-medium text-slate-700">Criado em</TableHead>
                <TableHead className="w-[140px] text-right font-medium text-slate-700">
                  Ações
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: pageSize }, (_, index) => (
                <TableRow key={`vinculos-skeleton-${index}`} className="border-slate-100">
                  <TableCell className="py-4">
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-44" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-52" />
                      <Skeleton className="h-3 w-28" />
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-3 w-56" />
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <Skeleton className="h-4 w-28" />
                  </TableCell>
                  <TableCell className="py-4 text-right">
                    <div className="flex justify-end">
                      <Skeleton className="h-9 w-28 rounded-xl" />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : !queryErrorMessage && vinculos.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-white px-6 py-14 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
            <Link2 className="h-5 w-5" />
          </div>
          <h4 className="mt-4 text-base font-semibold text-slate-900">
            Nenhum vínculo cadastrado
          </h4>
          <p className="mx-auto mt-2 max-w-xl text-sm text-slate-500">
            Cadastre vínculos por empresa ou por vaga para definir o escopo operacional deste recrutador.
          </p>
        </div>
      ) : !queryErrorMessage ? (
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white">
          <div className="overflow-x-auto">
            <Table className="min-w-[1020px]">
              <TableHeader>
                <TableRow className="border-slate-200 bg-slate-50/70">
                  <TableHead className="py-4 font-medium text-slate-700">Tipo</TableHead>
                  <TableHead className="font-medium text-slate-700">Empresa</TableHead>
                  <TableHead className="font-medium text-slate-700">Vaga</TableHead>
                  <TableHead className="font-medium text-slate-700">Escopo</TableHead>
                  <TableHead className="font-medium text-slate-700">Criado em</TableHead>
                  <TableHead className="w-[140px] text-right font-medium text-slate-700">
                    Ações
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedVinculos.map((vinculo) => (
                  <TableRow
                    key={vinculo.id}
                    className="border-slate-100 transition-colors hover:bg-slate-50/50"
                  >
                    <TableCell className="py-4">
                      <Badge
                        variant="outline"
                        className={cn(
                          "font-medium",
                          buildTipoBadgeClasses(vinculo.tipoVinculo),
                        )}
                      >
                        {vinculo.tipoVinculo === "EMPRESA" ? "Empresa" : "Vaga"}
                      </Badge>
                    </TableCell>

                    <TableCell className="min-w-[280px] max-w-[320px] py-4">
                      <div className="flex items-center gap-3">
                        <AvatarCustom
                          name={vinculo.empresa.nomeExibicao || "Empresa"}
                          size="sm"
                          showStatus={false}
                        />
                        <div className="min-w-0 flex flex-1 flex-col">
                          <div className="flex items-center gap-2">
                            <span className="truncate font-medium text-gray-900">
                              {vinculo.empresa.nomeExibicao}
                            </span>
                            {vinculo.empresa.codigo ? (
                              <span className="inline-flex flex-shrink-0 items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                                {vinculo.empresa.codigo}
                              </span>
                            ) : null}
                          </div>
                          {formatCnpj(vinculo.empresa.cnpj) ? (
                            <div className="truncate font-mono text-sm text-gray-500">
                              {formatCnpj(vinculo.empresa.cnpj)}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="py-4">
                      {vinculo.vaga ? (
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
                            <BriefcaseBusiness className="h-4 w-4 text-slate-400" />
                            <span>{vinculo.vaga.titulo}</span>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                            <span className="font-mono">
                              {vinculo.vaga.codigo || "Sem código"}
                            </span>
                            {vinculo.vaga.status ? (
                              <Badge
                                variant="outline"
                                className={cn(
                                  "font-medium",
                                  buildStatusBadgeClasses(vinculo.vaga.status),
                                )}
                              >
                                {formatStatusLabel(vinculo.vaga.status)}
                              </Badge>
                            ) : null}
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-slate-500">Acesso amplo à empresa</span>
                      )}
                    </TableCell>

                    <TableCell className="py-4">
                      <div className="space-y-1">
                        <div className="text-sm font-medium text-slate-900">
                          {vinculo.escopo.label}
                        </div>
                        <p className="text-xs! leading-relaxed! text-slate-500!">
                          {buildEscopoDescription(vinculo.escopo)}
                        </p>
                      </div>
                    </TableCell>

                    <TableCell className="py-4">
                      <span className="text-sm text-slate-600">
                        {formatDateTime(vinculo.criadoEm)}
                      </span>
                    </TableCell>

                    <TableCell className="py-4 text-right">
                      <ButtonCustom
                        type="button"
                        variant="outline"
                        size="sm"
                        className="cursor-pointer"
                        onClick={() => setSelectedVinculo(vinculo)}
                      >
                        <Trash2 className="h-4 w-4" />
                        Remover
                      </ButtonCustom>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {totalItems > 0 ? (
            <div className="flex flex-col gap-4 border-t border-gray-200 bg-gray-50/30 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-gray-600">
                Mostrando {Math.min((currentPage - 1) * pageSize + 1, totalItems)} a{" "}
                {Math.min(currentPage * pageSize, totalItems)} de {totalItems}{" "}
                {totalItems === 1 ? "vínculo" : "vínculos"}
              </div>

              {totalPages > 1 ? (
                <div className="flex items-center gap-2">
                  <ButtonCustom
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                    disabled={currentPage === 1 || showTableSkeleton}
                    className="h-8 px-3"
                  >
                    Anterior
                  </ButtonCustom>

                  {visiblePages[0] > 1 ? (
                    <>
                      <ButtonCustom
                        variant={currentPage === 1 ? "primary" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(1)}
                        className="h-8 w-8 p-0"
                        disabled={showTableSkeleton}
                      >
                        1
                      </ButtonCustom>
                      {visiblePages[0] > 2 ? (
                        <span className="text-gray-400">...</span>
                      ) : null}
                    </>
                  ) : null}

                  {visiblePages.map((page) => (
                    <ButtonCustom
                      key={page}
                      variant={currentPage === page ? "primary" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className="h-8 w-8 p-0"
                      disabled={showTableSkeleton}
                    >
                      {page}
                    </ButtonCustom>
                  ))}

                  {visiblePages[visiblePages.length - 1] < totalPages ? (
                    <>
                      {visiblePages[visiblePages.length - 1] < totalPages - 1 ? (
                        <span className="text-gray-400">...</span>
                      ) : null}
                      <ButtonCustom
                        variant={currentPage === totalPages ? "primary" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(totalPages)}
                        className="h-8 w-8 p-0"
                        disabled={showTableSkeleton}
                      >
                        {totalPages}
                      </ButtonCustom>
                    </>
                  ) : null}

                  <ButtonCustom
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((page) => Math.min(totalPages, page + 1))
                    }
                    disabled={currentPage === totalPages || showTableSkeleton}
                    className="h-8 px-3"
                  >
                    Próxima
                  </ButtonCustom>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}

      <CreateVinculoRecrutadorModal
        userId={usuario.id}
        recrutadorNome={usuario.nomeCompleto}
        isOpen={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSuccess={refreshVinculosData}
      />

      <DeleteConfirmModal<UsuarioRecrutadorVinculoItem>
        isOpen={Boolean(selectedVinculo)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedVinculo(null);
          }
        }}
        item={selectedVinculo}
        itemName="o vínculo"
        title="Remover vínculo"
        description="Você está prestes a remover este vínculo operacional do recrutador."
        confirmButtonText="Remover vínculo"
        isDeleting={deleteMutation.isPending}
        onConfirmDelete={(item) => deleteMutation.mutate(item)}
        customDeleteContent={(item) => (
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <Badge
                  variant="outline"
                  className={cn(
                    "font-medium",
                    buildTipoBadgeClasses(item.tipoVinculo),
                  )}
                >
                  {item.tipoVinculo === "EMPRESA"
                    ? "Acesso por empresa"
                    : "Acesso por vaga"}
                </Badge>
                <p className="mb-0! text-xs! text-slate-500!">
                  A remoção é imediata.
                </p>
              </div>

              <div className="mt-4 space-y-4">
                <div className="space-y-1">
                  <p className="mb-0! text-[11px]! font-semibold! uppercase! tracking-[0.08em]! text-slate-500!">
                    Empresa
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="mb-0! text-sm! font-medium! text-slate-900!">
                      {item.empresa.nomeExibicao}
                    </p>
                    {item.empresa.codigo ? (
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                        {item.empresa.codigo}
                      </span>
                    ) : null}
                  </div>
                </div>

                {item.vaga ? (
                  <div className="space-y-1">
                    <p className="mb-0! text-[11px]! font-semibold! uppercase! tracking-[0.08em]! text-slate-500!">
                      Vaga
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="mb-0! text-sm! font-medium! text-slate-900!">
                        {item.vaga.titulo}
                      </p>
                      {item.vaga.codigo ? (
                        <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                          {item.vaga.codigo}
                        </span>
                      ) : null}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
              <p className="mb-0! text-xs! leading-6! text-amber-800!">
                Ao remover este vínculo, o recrutador perde o acesso a esse
                escopo e às operações relacionadas.
              </p>
            </div>
          </div>
        )}
      />
    </div>
  );
}
