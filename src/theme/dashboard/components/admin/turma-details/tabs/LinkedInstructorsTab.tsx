"use client";

import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { Hash, Loader2 } from "lucide-react";

import { syncTurmaInstrutores, type CursoTurma } from "@/api/cursos";
import { AvatarCustom } from "@/components/ui/custom/avatar";
import { ButtonCustom } from "@/components/ui/custom/button";
import { EmptyState } from "@/components/ui/custom";
import { SelectCustom } from "@/components/ui/custom/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toastCustom } from "@/components/ui/custom";
import { queryKeys } from "@/lib/react-query/queryKeys";
import { useInstrutoresForSelect } from "../../lista-turmas/hooks/useInstrutoresForSelect";
import { getTurmaInstrutoresVinculados } from "../../lista-turmas/utils/instrutores";

interface LinkedInstructorsTabProps {
  turma: CursoTurma;
  cursoId: number | string;
  isLoading?: boolean;
  canManage?: boolean;
}

const ITEMS_PER_PAGE = 10;

export function LinkedInstructorsTab({
  turma,
  cursoId,
  isLoading = false,
  canManage = false,
}: LinkedInstructorsTabProps) {
  const queryClient = useQueryClient();
  const instrutores = getTurmaInstrutoresVinculados(turma);
  const [currentPage, setCurrentPage] = useState(1);
  const [isManageOpen, setIsManageOpen] = useState(false);
  const [selectedInstrutorIds, setSelectedInstrutorIds] = useState<string[]>(
    []
  );
  const [isSaving, setIsSaving] = useState(false);
  const {
    instrutores: instrutorOptions,
    isLoading: isLoadingInstrutores,
  } = useInstrutoresForSelect();

  useEffect(() => {
    setSelectedInstrutorIds(instrutores.map((instrutor) => instrutor.id));
  }, [instrutores]);

  const totalItems = instrutores.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));

  useEffect(() => {
    setCurrentPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);

  const paginatedInstrutores = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return instrutores.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [currentPage, instrutores]);

  const startIndex = totalItems === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalItems);

  const visiblePages = useMemo(() => {
    const maxVisiblePages = 5;
    if (totalPages <= maxVisiblePages) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    const half = Math.floor(maxVisiblePages / 2);
    let start = Math.max(1, currentPage - half);
    const end = Math.min(totalPages, start + maxVisiblePages - 1);

    if (end - start + 1 < maxVisiblePages) {
      start = Math.max(1, end - maxVisiblePages + 1);
    }

    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
  }, [currentPage, totalPages]);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    setCurrentPage(page);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await syncTurmaInstrutores(cursoId, turma.id, {
        instrutorIds: selectedInstrutorIds,
      });

      await queryClient.invalidateQueries({
        queryKey: queryKeys.turmas.detail(cursoId, turma.id),
      });
      await queryClient.invalidateQueries({
        queryKey: ["admin-turmas-list"],
        exact: false,
      });

      toastCustom.success("Instrutores da turma atualizados com sucesso.");
      setIsManageOpen(false);
    } catch (error: any) {
      const message =
        error?.details?.message ||
        error?.message ||
        "Não foi possível atualizar os instrutores da turma.";
      toastCustom.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="overflow-hidden rounded-2xl border border-gray-200/60 bg-white">
        <div className="flex justify-end border-b border-gray-100 px-6 py-3">
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
        <div className="divide-y divide-gray-100">
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className="px-6 py-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex min-w-0 items-center gap-3">
                  <Skeleton className="h-11 w-11 rounded-full" />
                  <div className="min-w-0 space-y-2">
                    <Skeleton className="h-4 w-36" />
                    <Skeleton className="h-3 w-44" />
                  </div>
                </div>
                <Skeleton className="h-8 w-28 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (instrutores.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200/60 bg-white p-6">
        <EmptyState
          illustration="userProfiles"
          illustrationAlt="Instrutores vinculados"
          title="Nenhum instrutor vinculado"
          description="Esta turma ainda não possui instrutores vinculados."
          maxContentWidth="sm"
        />
      </div>
    );
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-gray-200/60 bg-white">
      <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-6 py-3">
        <div />
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs! font-medium! text-slate-700!">
            {instrutores.length} vinculad{instrutores.length === 1 ? "o" : "os"}
          </span>
          {canManage && (
            <ButtonCustom
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsManageOpen(true)}
              className="h-8"
            >
              Gerenciar
            </ButtonCustom>
          )}
        </div>
      </div>

      <div className="divide-y divide-gray-100">
        {paginatedInstrutores.map((instrutor) => {
          const codigo = instrutor.codUsuario || instrutor.id || "—";

          return (
            <article
              key={`${instrutor.id}-${instrutor.nome}`}
              className="px-6 py-4 transition-colors hover:bg-slate-50/50"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex min-w-0 items-center gap-3">
                  <AvatarCustom
                    name={instrutor.nome}
                    src={instrutor.avatarUrl ?? undefined}
                    size="md"
                    showStatus={false}
                  />

                  <div className="min-w-0 mt-4">
                    <h6 className="mb-0! truncate text-sm! font-semibold! text-gray-900!">
                      {instrutor.nome}
                    </h6>
                    <p className="mt-1 text-sm! text-gray-500!">
                      {instrutor.email || "Sem email cadastrado"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1 text-xs! font-medium! text-gray-600!">
                    <Hash className="h-3.5 w-3.5" />
                    <span className="max-w-[160px] truncate">{codigo}</span>
                  </span>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {totalItems > 0 && (
        <div className="flex flex-col gap-4 border-t border-gray-100 bg-gray-50/30 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm! text-gray-600!">
            Mostrando {Math.min(startIndex + 1, totalItems)} a {endIndex} de{" "}
            {totalItems} instrutor{totalItems === 1 ? "" : "es"}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <ButtonCustom
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="h-8 px-3"
              >
                Anterior
              </ButtonCustom>

              {visiblePages[0] > 1 && (
                <>
                  <ButtonCustom
                    variant={currentPage === 1 ? "primary" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(1)}
                    className="h-8 w-8 p-0"
                  >
                    1
                  </ButtonCustom>
                  {visiblePages[0] > 2 && (
                    <span className="text-gray-400">...</span>
                  )}
                </>
              )}

              {visiblePages.map((page) => (
                <ButtonCustom
                  key={page}
                  variant={currentPage === page ? "primary" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(page)}
                  className="h-8 w-8 p-0"
                >
                  {page}
                </ButtonCustom>
              ))}

              {visiblePages[visiblePages.length - 1] < totalPages && (
                <>
                  {visiblePages[visiblePages.length - 1] < totalPages - 1 && (
                    <span className="text-gray-400">...</span>
                  )}
                  <ButtonCustom
                    variant={currentPage === totalPages ? "primary" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(totalPages)}
                    className="h-8 w-8 p-0"
                  >
                    {totalPages}
                  </ButtonCustom>
                </>
              )}

              <ButtonCustom
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="h-8 px-3"
              >
                Próxima
              </ButtonCustom>
            </div>
          )}
        </div>
      )}

      <Dialog open={isManageOpen} onOpenChange={setIsManageOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Gerenciar instrutores</DialogTitle>
            <DialogDescription>
              Atualize o vínculo institucional de instrutores desta turma.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {isLoadingInstrutores ? (
              <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : (
              <SelectCustom
                mode="multiple"
                label="Instrutores vinculados"
                placeholder="Selecionar instrutores"
                options={instrutorOptions}
                value={selectedInstrutorIds}
                onChange={setSelectedInstrutorIds}
                helperText="Esse vínculo não reescreve o dono explícito de aula, prova ou atividade."
              />
            )}
          </div>

          <DialogFooter>
            <ButtonCustom
              type="button"
              variant="outline"
              onClick={() => setIsManageOpen(false)}
              disabled={isSaving}
            >
              Cancelar
            </ButtonCustom>
            <ButtonCustom
              type="button"
              onClick={handleSave}
              disabled={isSaving || isLoadingInstrutores}
            >
              {isSaving ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Salvando
                </span>
              ) : (
                "Salvar"
              )}
            </ButtonCustom>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
