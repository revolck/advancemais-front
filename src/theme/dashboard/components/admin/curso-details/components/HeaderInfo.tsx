"use client";

import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ChevronDown,
  ChevronLeft,
  Edit,
  EyeOff,
  Loader2,
  Trash2,
  Upload,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  despublicarCurso,
  excluirCursoDefinitivamente,
  type Curso,
  updateCurso,
} from "@/api/cursos";
import { useRouter } from "next/navigation";
import { toastCustom } from "@/components/ui/custom";
import { formatCursoStatus, getCursoStatusBadgeClasses } from "../utils";
import { DespublicarCursoModal, ExcluirCursoModal } from "./modal-acoes";

interface HeaderInfoProps {
  curso: Curso & {
    categoria?: { id: number | string; nome: string };
    subcategoria?: { id: number | string; nome: string };
    turmasCount?: number;
    turmas?: Array<{
      id: string;
      status?: string;
    }>;
  };
  onEditCurso?: () => void | Promise<void>;
}

export function HeaderInfo({ curso, onEditCurso }: HeaderInfoProps) {
  const router = useRouter();
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const [isPublishingActionLoading, setIsPublishingActionLoading] =
    useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleteActionLoading, setIsDeleteActionLoading] = useState(false);

  const isPublished = curso.statusPadrao === "PUBLICADO";
  const linkedTurmasCount = curso.turmasCount ?? curso.turmas?.length ?? 0;
  const hasLinkedTurmas = linkedTurmasCount > 0;
  const hasTurmasStatusLoaded = Array.isArray(curso.turmas) && curso.turmas.length > 0;
  const canDeleteCurso = !hasLinkedTurmas;
  const canDespublicarCurso =
    !isPublished ||
    !hasLinkedTurmas ||
    (hasTurmasStatusLoaded &&
      curso.turmas!.every((turma) => (turma.status ?? "").toUpperCase() === "CONCLUIDO"));
  const canShowPublicationAction = !isPublished || canDespublicarCurso;

  const handleEditClick = () => {
    router.push(`/dashboard/cursos/${curso.id}/editar`);
    setIsActionsOpen(false);
  };

  const handleChangePublicationStatus = async () => {
    if (isPublishingActionLoading) return;

    setIsActionsOpen(false);
    setIsPublishingActionLoading(true);
    try {
      if (isPublished) {
        await despublicarCurso(curso.id);
        toastCustom.success({
          title: "Curso despublicado",
          description: "O curso foi movido para rascunho com sucesso.",
        });
      } else {
        await updateCurso(curso.id, { statusPadrao: "PUBLICADO" });
        toastCustom.success({
          title: "Curso publicado",
          description: "O curso foi publicado com sucesso.",
        });
      }

      setIsActionsOpen(false);
      await onEditCurso?.();
      setIsStatusModalOpen(false);
    } catch (error) {
      const err = error as Error & {
        code?: string;
        details?: {
          code?: string;
          message?: string;
          details?: Array<{
            nome?: string;
            codigo?: string;
            status?: string;
          }>;
        };
      };
      const code = err?.details?.code || err?.code;

      if (code === "CURSO_DESPUBLICAR_TURMAS_NAO_CONCLUIDAS" && isPublished) {
        const turmasNaoConcluidas = err?.details?.details ?? [];
        const resumoTurmas =
          turmasNaoConcluidas.length > 0
            ? turmasNaoConcluidas
                .slice(0, 3)
                .map((turma) =>
                  turma.codigo
                    ? `${turma.codigo} (${turma.status ?? "SEM_STATUS"})`
                    : `${turma.nome ?? "Turma"} (${turma.status ?? "SEM_STATUS"})`
                )
                .join(", ")
            : "";

        toastCustom.error({
          title: "Não é possível despublicar o curso",
          description: resumoTurmas
            ? `${err?.details?.message || err.message}. Turmas pendentes: ${resumoTurmas}.`
            : err?.details?.message ||
              err.message ||
              "Conclua todas as turmas antes de despublicar.",
        });
      } else {
        toastCustom.error({
          title: isPublished
            ? "Erro ao despublicar curso"
            : "Erro ao publicar curso",
          description:
            err?.details?.message ||
            err.message ||
            `Não foi possível ${isPublished ? "despublicar" : "publicar"} o curso.`,
        });
      }
    } finally {
      setIsPublishingActionLoading(false);
    }
  };

  const handleDeleteCurso = async () => {
    if (isDeleteActionLoading) return;

    setIsActionsOpen(false);
    setIsDeleteActionLoading(true);

    try {
      await excluirCursoDefinitivamente(curso.id);
      toastCustom.success({
        title: "Curso excluído",
        description: "O curso foi excluído definitivamente.",
      });
      setIsDeleteModalOpen(false);
      router.push("/dashboard/cursos");
    } catch (error) {
      const err = error as Error & {
        code?: string;
        details?: {
          code?: string;
          message?: string;
          details?: Array<{
            nome?: string;
            codigo?: string;
            status?: string;
          }>;
        };
      };
      const code = err?.details?.code || err?.code;

      if (code === "CURSO_EXCLUSAO_BLOQUEADA_TURMAS_VINCULADAS") {
        const turmasVinculadas = err?.details?.details ?? [];
        const resumoTurmas =
          turmasVinculadas.length > 0
            ? turmasVinculadas
                .slice(0, 3)
                .map((turma) =>
                  turma.codigo
                    ? `${turma.codigo} (${turma.status ?? "SEM_STATUS"})`
                    : `${turma.nome ?? "Turma"} (${turma.status ?? "SEM_STATUS"})`
                )
                .join(", ")
            : "";

        toastCustom.error({
          title: "Não é possível excluir o curso",
          description: resumoTurmas
            ? `${err?.details?.message || err.message}. Turmas vinculadas: ${resumoTurmas}.`
            : err?.details?.message ||
              err.message ||
              "Não é possível excluir curso com turmas vinculadas.",
        });
      } else {
        toastCustom.error({
          title: "Erro ao excluir curso",
          description:
            err?.details?.message ||
            err.message ||
            "Não foi possível excluir o curso.",
        });
      }
    } finally {
      setIsDeleteActionLoading(false);
    }
  };

  const statusBadge = (
    <Badge
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide",
        getCursoStatusBadgeClasses(curso.statusPadrao)
      )}
    >
      {formatCursoStatus(curso.statusPadrao)}
    </Badge>
  );

  return (
    <section className="relative overflow-hidden rounded-3xl bg-white">
      <div className="relative flex flex-col gap-6 px-6 py-6 sm:px-8 sm:py-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-5">
          <div className="space-y-0">
            <div className="flex items-center gap-3">
              <h3 className="font-semibold !mb-0">{curso.nome}</h3>
              {statusBadge}
            </div>
          </div>
        </div>

        <div className="flex w-full flex-col items-stretch gap-2 sm:w-auto sm:flex-row sm:items-center">
          <DropdownMenu
            open={isActionsOpen}
            onOpenChange={setIsActionsOpen}
            modal={false}
          >
            <DropdownMenuTrigger asChild>
              <Button
                aria-expanded={isActionsOpen}
                className="flex items-center gap-2 rounded-full bg-[var(--primary-color)] px-6 py-2 text-sm font-semibold text-white hover:bg-[var(--primary-color)]/90 cursor-pointer"
              >
                Ações
                <ChevronDown
                  className={cn(
                    "h-4 w-4 transition-transform duration-200",
                    isActionsOpen ? "rotate-180" : "rotate-0"
                  )}
                  aria-hidden="true"
                />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem
                onSelect={handleEditClick}
                className="cursor-pointer"
              >
                <Edit className="h-4 w-4 text-gray-500" />
                <span>Editar</span>
              </DropdownMenuItem>
              {canShowPublicationAction ? (
                <DropdownMenuItem
                  onSelect={() => {
                    setIsActionsOpen(false);
                    window.setTimeout(() => {
                      setIsStatusModalOpen(true);
                    }, 0);
                  }}
                  disabled={isPublishingActionLoading}
                  className="cursor-pointer"
                >
                  {isPublishingActionLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                  ) : isPublished ? (
                    <EyeOff className="h-4 w-4 text-gray-500" />
                  ) : (
                    <Upload className="h-4 w-4 text-gray-500" />
                  )}
                  <span>
                    {isPublishingActionLoading
                      ? isPublished
                        ? "Despublicando..."
                        : "Publicando..."
                      : isPublished
                        ? "Despublicar"
                        : "Publicar"}
                  </span>
                </DropdownMenuItem>
              ) : null}
              {canDeleteCurso ? (
                <DropdownMenuItem
                  onSelect={() => {
                    setIsActionsOpen(false);
                    window.setTimeout(() => {
                      setIsDeleteModalOpen(true);
                    }, 0);
                  }}
                  disabled={isPublishingActionLoading || isDeleteActionLoading}
                  className="cursor-pointer text-red-600 focus:text-red-700 data-[highlighted]:text-red-700"
                >
                  {isDeleteActionLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin text-red-600" />
                  ) : (
                    <Trash2 className="h-4 w-4 text-red-600" />
                  )}
                  <span>
                    {isDeleteActionLoading ? "Excluindo..." : "Excluir"}
                  </span>
                </DropdownMenuItem>
              ) : null}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            asChild
            variant="outline"
            className="rounded-full border-none px-5 py-2 text-sm font-medium hover:bg-gray-200 bg-gray-100/70 hover:text-accent-foreground transition-all duration-200"
          >
            <Link href="/dashboard/cursos" className="flex items-center gap-2">
              <ChevronLeft className="h-4 w-4" />
              Voltar
            </Link>
          </Button>
        </div>
      </div>

      <DespublicarCursoModal
        isOpen={isStatusModalOpen && canDespublicarCurso}
        isPublished={isPublished}
        isLoading={isPublishingActionLoading}
        onClose={() => setIsStatusModalOpen(false)}
        onConfirm={() => void handleChangePublicationStatus()}
      />

      <ExcluirCursoModal
        isOpen={isDeleteModalOpen}
        isLoading={isDeleteActionLoading}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => void handleDeleteCurso()}
      />
    </section>
  );
}
