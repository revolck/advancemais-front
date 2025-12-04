import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableRow, TableCell } from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { EyeOff, ChevronRight, Trash2, Loader2, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AdminCompanyVagaItem } from "@/api/empresas/admin/types";
import { DeleteConfirmModal } from "@/components/ui/custom/list-manager/components/DeleteConfirmModal";
import { UserAvatars } from "@/components/ui/custom/users-avatars";

interface VacancyRowProps {
  vacancy: AdminCompanyVagaItem;
  onDelete?: (vacancy: AdminCompanyVagaItem) => void;
  index?: number;
  isDeleting?: boolean;
  isLoadingCandidates?: boolean;
  candidateError?: string;
  onLoadCandidates?: (vacancyId: string) => void;
  isDisabled?: boolean;
  onNavigateStart?: () => void;
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
  onDelete,
  index = 0,
  isDeleting: externalIsDeleting = false,
  isLoadingCandidates = false,
  candidateError,
  onLoadCandidates,
  isDisabled = false,
  onNavigateStart,
}: VacancyRowProps) {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const isRowDisabled = isDisabled || isNavigating;

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    onDelete?.(vacancy);
    setShowDeleteModal(false);
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
  };

  // Conteúdo customizado para delete de vaga
  const customDeleteContent = (item: AdminCompanyVagaItem) => (
    <div className="space-y-4">
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-3">
        <div className="flex items-start gap-2">
          <div className="space-y-1">
            <p className="text-sm font-medium !text-red-800 !leading-normal">
              Esta ação é irreversível e pode impactar todo o sistema!
            </p>
            <ul className="text-xs text-gray-700 space-y-1 ml-3">
              <li>
                • Todos os candidatos que se inscreveram nesta vaga serão
                afetados
              </li>
              <li>
                • Todas as candidaturas e dados relacionados serão perdidos
              </li>
              <li>• A vaga será removida permanentemente do sistema</li>
            </ul>
          </div>
        </div>
      </div>

      <p className="!text-base text-gray-600 !leading-normal !mb-0">
        Tem certeza absoluta que deseja continuar com esta exclusão?
      </p>
    </div>
  );

  const handleNavigate = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (isRowDisabled) return;
    
    setIsNavigating(true);
    onNavigateStart?.();
    router.push(`/dashboard/empresas/vagas/${encodeURIComponent(vacancy.id)}`);
    
    setTimeout(() => {
      setIsNavigating(false);
    }, 5000);
  };

  const code = vacancy.codigo ?? vacancy.id;
  const title = vacancy.titulo ?? `Vaga ${code}`;
  const numberOfVacancies = vacancy.numeroVagas || 0;
  const candidaturas = vacancy.candidaturasResumo?.total || 0;
  const publishedDate = formatDate(vacancy.inseridaEm);
  const applicationDeadline = formatDate(vacancy.inscricoesAte);
  const statusBadge = getStatusBadge(vacancy.status);

  // Dados dos candidatos
  const candidatesData = vacancy.candidaturas || [];
  const hasCandidates = candidaturas > 0;
  const hasFullData = candidatesData.length > 0;

  return (
    <>
      <TableRow 
        className={cn(
          "border-gray-200 transition-colors",
          isRowDisabled 
            ? "opacity-50 pointer-events-none" 
            : "hover:bg-gray-50",
          isNavigating && "bg-blue-50/50"
        )}
      >
        {/* Vaga */}
        <TableCell className="py-4">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900">{title}</span>
            <code className="text-xs font-mono bg-gray-50 text-gray-600 border border-gray-200 px-2 py-0.5 rounded-md flex-shrink-0">
              {code}
            </code>
            {vacancy.modoAnonimo && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Publicado em modo anônimo</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </TableCell>

        {/* Vagas */}
        <TableCell className="py-4">
          <span className="text-sm text-gray-700">{numberOfVacancies}</span>
        </TableCell>

        {/* Candidaturas */}
        <TableCell className="py-4">
          {hasCandidates ? (
            <div className="flex items-center gap-2">
              {isLoadingCandidates ? (
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-gray-200 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-500">Carregando...</span>
                </div>
              ) : candidateError ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-red-500">
                    {candidaturas} candidato{candidaturas > 1 ? "s" : ""}
                  </span>
                  {onLoadCandidates && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onLoadCandidates(vacancy.id)}
                          className="h-6 w-6 text-gray-400 hover:text-gray-600"
                        >
                          <RefreshCw className="h-3 w-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Recarregar candidatos</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
              ) : hasFullData ? (
                <>
                  <UserAvatars
                    users={candidatesData.slice(0, 4).map((candidatura) => ({
                      id: candidatura.candidato.id,
                      name: candidatura.candidato.nomeCompleto,
                      image:
                        candidatura.candidato.avatarUrl ||
                        candidatura.candidato.informacoes?.avatarUrl ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          candidatura.candidato.nomeCompleto
                        )}&background=random`,
                    }))}
                    size={24}
                    maxVisible={4}
                    overlap={70}
                    className="flex-shrink-0"
                  />
                  <span className="text-sm text-gray-700 font-medium">
                    {candidaturas}
                  </span>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">
                    {candidaturas} candidato{candidaturas > 1 ? "s" : ""}
                  </span>
                  {onLoadCandidates && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onLoadCandidates(vacancy.id)}
                          className="h-6 w-6 text-gray-400 hover:text-gray-600"
                        >
                          <RefreshCw className="h-3 w-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Carregar avatares</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
              )}
            </div>
          ) : (
            <span className="text-sm text-gray-400">Sem candidatos</span>
          )}
        </TableCell>

        {/* Publicado em */}
        <TableCell className="py-4">
          <span className="text-sm text-gray-700">{publishedDate}</span>
        </TableCell>

        {/* Inscrições até */}
        <TableCell className="py-4">
          <span className="text-sm text-gray-700">{applicationDeadline}</span>
        </TableCell>

        {/* Status */}
        <TableCell className="py-4">{statusBadge}</TableCell>

        {/* Ações */}
        <TableCell className="text-right w-16">
          <div className="flex items-center gap-1">
            {onDelete && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleDeleteClick}
                    disabled={externalIsDeleting}
                    className="h-8 w-8 rounded-full text-gray-500 hover:text-white hover:bg-red-500 cursor-pointer"
                    aria-label="Excluir vaga"
                  >
                    {externalIsDeleting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent sideOffset={8}>
                  {externalIsDeleting ? "Excluindo..." : "Excluir vaga"}
                </TooltipContent>
              </Tooltip>
            )}

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleNavigate}
                  disabled={isRowDisabled}
                  className={cn(
                    "h-8 w-8 rounded-full cursor-pointer",
                    isNavigating 
                      ? "text-blue-600 bg-blue-100" 
                      : "text-gray-500 hover:text-white hover:bg-[var(--primary-color)]",
                    "disabled:opacity-50 disabled:cursor-wait"
                  )}
                  aria-label="Visualizar vaga"
                >
                  {isNavigating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent sideOffset={8}>
                {isNavigating ? "Carregando..." : "Visualizar vaga"}
              </TooltipContent>
            </Tooltip>
          </div>
        </TableCell>
      </TableRow>

      {/* Modal de Confirmação de Exclusão */}
      {onDelete && (
        <DeleteConfirmModal<AdminCompanyVagaItem>
          isOpen={showDeleteModal}
          onOpenChange={setShowDeleteModal}
          item={vacancy}
          itemName="a vaga"
          onConfirmDelete={handleConfirmDelete}
          isDeleting={externalIsDeleting}
          customDeleteContent={customDeleteContent}
          confirmButtonText="Sim, excluir vaga"
        />
      )}
    </>
  );
}

export default VacancyRow;
