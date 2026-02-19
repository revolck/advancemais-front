"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CalendarClock,
  Eye,
  IdCard,
  X,
} from "lucide-react";

import {
  corrigirAvaliacaoResposta,
  getAvaliacaoRespostaById,
  listAvaliacaoRespostas,
  type AvaliacaoRespostaResumo,
  type CorrigirAvaliacaoRespostaPayload,
  type StatusCorrecao,
} from "@/api/provas";
import { EmptyState, InputCustom } from "@/components/ui/custom";
import { ButtonCustom } from "@/components/ui/custom/button";
import { MultiSelectFilter } from "@/components/ui/custom/filters/MultiSelectFilter";
import { toastCustom } from "@/components/ui/custom/toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { ModalCorrecaoAtividade } from "../components/ModalCorrecaoAtividade";

interface RespostasTabProps {
  provaId: string;
  tipoAvaliacaoContext?: "PROVA" | "ATIVIDADE" | null;
}

const PAGE_SIZE = 10;

/* ── helpers ─────────────────────────────────────────── */

function formatDateTime(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatRelativeTime(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  const now = new Date();
  const diffMin = Math.floor((now.getTime() - date.getTime()) / 60_000);
  if (diffMin < 1) return "Agora";
  if (diffMin < 60) return `Há ${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `Há ${diffH}h`;
  const diffD = Math.floor(diffH / 24);
  return `Há ${diffD} dia${diffD > 1 ? "s" : ""}`;
}

function formatCpf(value?: string | null) {
  if (!value) return "—";
  const digits = value.replace(/\D/g, "");
  if (digits.length !== 11) return value;
  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

function getInitials(name?: string | null) {
  if (!name) return "--";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "--";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function parseNotaValue(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value.replace(",", "."));
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

const STATUS_META: Record<string, { label: string; className: string }> = {
  CORRIGIDA: {
    label: "Corrigida",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  PENDENTE: {
    label: "Pendente",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
};

/* ── main ────────────────────────────────────────────── */

export function RespostasTab({
  provaId,
  tipoAvaliacaoContext = null,
}: RespostasTabProps) {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [searchApplied, setSearchApplied] = useState("");
  const [statusCorrecao, setStatusCorrecao] = useState<string[]>([]);
  const [modalState, setModalState] = useState<{
    respostaId: string;
    startEditing: boolean;
    tipoAvaliacao?: "PROVA" | "ATIVIDADE" | null;
    submissionMeta?: {
      concluidoEm?: string | null;
      ipEnvio?: string | null;
    };
  } | null>(null);
  const [nota, setNota] = useState("");
  const [feedback, setFeedback] = useState("");
  const [saveVersion, setSaveVersion] = useState(0);

  const {
    data: response,
    isLoading,
    isFetching,
    error,
  } = useQuery({
    queryKey: [
      "avaliacao-respostas",
      provaId,
      page,
      searchApplied,
      statusCorrecao,
    ],
    queryFn: () =>
      listAvaliacaoRespostas(provaId, {
        page,
        pageSize: PAGE_SIZE,
        search: searchApplied || undefined,
        statusCorrecao: statusCorrecao.length === 1 ? (statusCorrecao[0] as StatusCorrecao) : undefined,
        orderBy: "concluidoEm",
        order: "desc",
      }, { cache: "no-cache" }),
    enabled: Boolean(provaId),
    staleTime: 30_000,
  });

  const respostas = useMemo<AvaliacaoRespostaResumo[]>(() => {
    if (!response?.data || !Array.isArray(response.data)) return [];
    return response.data;
  }, [response]);

  const pagination = response?.pagination;
  const total = Number(pagination?.total ?? respostas.length ?? 0);
  const totalPages = Math.max(1, Number(pagination?.totalPages ?? 1));
  const startIndex = (page - 1) * PAGE_SIZE;
  const endIndex = Math.min(startIndex + PAGE_SIZE, total);

  const applyFilters = () => {
    setPage(1);
    setSearchApplied(searchInput.trim());
  };

  const hasActiveFilters = Boolean(searchApplied || statusCorrecao.length > 0);
  const selectedRespostaId = modalState?.respostaId ?? null;
  const isModalOpen = Boolean(modalState?.respostaId);

  const clearFilters = () => {
    setPage(1);
    setSearchInput("");
    setSearchApplied("");
    setStatusCorrecao([]);
  };

  const activeChips: { key: string; label: string }[] = [];
  if (searchApplied)
    activeChips.push({ key: "search", label: `Busca: "${searchApplied}"` });
  if (statusCorrecao.length > 0) {
    const labels = statusCorrecao.map((s) => STATUS_META[s]?.label ?? s).join(", ");
    activeChips.push({ key: "status", label: `Status: ${labels}` });
  }

  const removeChip = (key: string) => {
    if (key === "search") {
      setSearchInput("");
      setSearchApplied("");
    }
    if (key === "status") setStatusCorrecao([]);
    setPage(1);
  };

  /* visible pages */
  const visiblePages = useMemo(() => {
    const pages: number[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }
    const start = Math.max(1, page - 2);
    const end = Math.min(totalPages, start + 4);
    const adjustedStart = Math.max(1, end - 4);
    for (let i = adjustedStart; i <= end; i++) pages.push(i);
    return pages;
  }, [page, totalPages]);

  const {
    data: respostaDetalhe,
    isLoading: isLoadingDetalhe,
    error: detalheError,
  } = useQuery({
    queryKey: ["avaliacao-resposta", provaId, selectedRespostaId],
    queryFn: () =>
      getAvaliacaoRespostaById(provaId, selectedRespostaId!, {
        cache: "no-cache",
      }),
    enabled: Boolean(selectedRespostaId),
    staleTime: 30_000,
    retry: false,
  });

  useEffect(() => {
    if (!respostaDetalhe) return;
    setNota(
      typeof respostaDetalhe.nota === "number" ? String(respostaDetalhe.nota) : ""
    );
    setFeedback(respostaDetalhe.feedback?.trim() ?? "");
  }, [respostaDetalhe]);

  const corrigirMutation = useMutation({
    mutationFn: (payload: CorrigirAvaliacaoRespostaPayload) =>
      corrigirAvaliacaoResposta(provaId, selectedRespostaId!, payload),
    onSuccess: async (response, variables) => {
      let notaPersistida = parseNotaValue(response?.data?.nota);
      const notaEnviada =
        typeof variables?.nota === "number" && Number.isFinite(variables.nota)
          ? variables.nota
          : null;

      if (notaEnviada !== null && selectedRespostaId) {
        if (notaPersistida === null) {
          const detalheAtualizado = await getAvaliacaoRespostaById(
            provaId,
            selectedRespostaId,
            { cache: "no-cache" },
          );
          notaPersistida = parseNotaValue(detalheAtualizado?.nota);
        }

        const notaOk =
          notaPersistida !== null &&
          Math.abs(Number(notaPersistida) - Number(notaEnviada)) < 0.11;

        if (!notaOk) {
          toastCustom.error(
            "A correção foi marcada, mas a nota não foi persistida pela API. Tente novamente.",
          );
          await Promise.all([
            queryClient.invalidateQueries({
              queryKey: ["avaliacao-respostas", provaId],
            }),
            queryClient.invalidateQueries({
              queryKey: ["avaliacao-resposta", provaId, selectedRespostaId],
            }),
          ]);
          return;
        }
      }

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["avaliacao-respostas", provaId],
        }),
        queryClient.invalidateQueries({
          queryKey: ["avaliacao-resposta", provaId, selectedRespostaId],
        }),
      ]);
      toastCustom.success("Nota aplicada com sucesso.");
      setSaveVersion((previous) => previous + 1);
    },
    onError: (err) => {
      const message =
        err instanceof Error ? err.message : "Erro ao aplicar a nota.";
      toastCustom.error(message);
    },
  });

  const handleOpenModal = (
    respostaId: string,
    startEditing = false,
    tipoAvaliacao?: "PROVA" | "ATIVIDADE" | null,
    submissionMeta?: { concluidoEm?: string | null; ipEnvio?: string | null },
  ) => {
    setModalState({ respostaId, startEditing, tipoAvaliacao, submissionMeta });
  };

  const handleCloseModal = () => {
    setModalState(null);
    setNota("");
    setFeedback("");
  };

  const submitCorrecao = () => {
    if (!selectedRespostaId) return;
    if (respostaDetalhe?.tipoAvaliacao === "PROVA") {
      toastCustom.info(
        "A nota da prova é calculada automaticamente pelo sistema.",
      );
      return;
    }

    const notaNormalizada = nota.trim().replace(",", ".");
    let notaNumber: number | undefined;

    if (notaNormalizada) {
      const formatoValido = /^(10(\.0)?|[0-9](\.[0-9])?)$/.test(
        notaNormalizada,
      );
      if (!formatoValido) {
        toastCustom.error("Informe uma nota válida entre 0 e 10 (ex.: 8.5).");
        return;
      }

      const parsed = Number(notaNormalizada);
      if (!Number.isFinite(parsed) || parsed < 0 || parsed > 10) {
        toastCustom.error("A nota deve estar entre 0 e 10.");
        return;
      }
      notaNumber = parsed;
    }

    const payload: CorrigirAvaliacaoRespostaPayload = {
      statusCorrecao: typeof notaNumber === "number" ? "CORRIGIDA" : "PENDENTE",
      feedback: feedback.trim() || undefined,
      nota: notaNumber,
    };

    corrigirMutation.mutate(payload);
  };

  /* ── loading ── */
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    );
  }

  /* ── error ── */
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Erro ao carregar respostas: {(error as Error).message}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* filtros */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr_auto]">
          <InputCustom
            label="Buscar"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                applyFilters();
              }
            }}
            placeholder="Nome, CPF ou código da inscrição"
          />

          <div className="space-y-2">
            <label className="text-sm! font-semibold! text-gray-700! block!">Status</label>
            <MultiSelectFilter
              title="Status"
              placeholder="Selecionar status"
              options={[
                { value: "PENDENTE", label: "Pendente" },
                { value: "CORRIGIDA", label: "Corrigida" },
              ]}
              selectedValues={statusCorrecao}
              onSelectionChange={(val) => {
                setPage(1);
                setStatusCorrecao(val);
              }}
              showApplyButton
              className="w-full"
            />
          </div>

          <div className="flex items-end">
            <ButtonCustom variant="primary" onClick={applyFilters} size="lg">
              Pesquisar
            </ButtonCustom>
          </div>
        </div>

        {/* chips ativos */}
        {activeChips.length > 0 && (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              {activeChips.map((chip) => (
                <span
                  key={chip.key}
                  className="inline-flex items-center gap-1 rounded-full border border-gray-300 bg-gray-50 px-3 py-1.5 text-sm! text-gray-700!"
                >
                  {chip.label}
                  <button
                    type="button"
                    onClick={() => removeChip(chip.key)}
                    className="ml-1 rounded-full p-0.5 text-gray-500 hover:text-gray-700 cursor-pointer"
                    aria-label={`Limpar ${chip.key}`}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </span>
              ))}
            </div>
            <ButtonCustom variant="outline" size="sm" onClick={clearFilters}>
              Limpar filtros
            </ButtonCustom>
          </div>
        )}
      </div>

      {/* tabela ou empty */}
      {respostas.length === 0 ? (
        <EmptyState
          illustration="books"
          illustrationAlt="Ilustração de respostas vazio"
          title="Nenhuma submissão encontrada"
          description="Ainda não existem respostas para esta atividade/prova com os filtros atuais."
          maxContentWidth="sm"
          className="rounded-2xl border border-gray-200/60 bg-white p-6"
        />
      ) : (
        <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-100 bg-gray-50/50">
                <TableHead className="font-semibold! text-gray-700!">
                  Aluno
                </TableHead>
                <TableHead className="font-semibold! text-gray-700!">
                  CPF
                </TableHead>
                <TableHead className="font-semibold! text-gray-700!">
                  Concluído em
                </TableHead>
                <TableHead className="font-semibold! text-gray-700!">
                  Status
                </TableHead>
                <TableHead className="font-semibold! text-gray-700! text-right!">
                  Nota
                </TableHead>
                <TableHead className="w-[260px] text-right! font-semibold! text-gray-700!">
                  Ações
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {respostas.map((item) => {
                const statusMeta =
                  STATUS_META[item.statusCorrecao ?? "PENDENTE"] ??
                  STATUS_META.PENDENTE;
                const tipoAvaliacao =
                  item.tipoAvaliacao ?? tipoAvaliacaoContext ?? null;
                const isProva = tipoAvaliacao === "PROVA";
                const actionLabel = isProva
                  ? "Ver resultado"
                  : item.statusCorrecao === "CORRIGIDA"
                    ? "Abrir correção"
                    : "Aplicar correção";

                return (
                  <TableRow
                    key={item.id}
                    className="border-gray-100 hover:bg-gray-50/50 transition-colors"
                  >
                    <TableCell className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-gray-100 text-gray-700 text-xs! font-semibold! flex items-center justify-center shrink-0">
                          {getInitials(item.aluno?.nomeCompleto)}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm! font-medium! text-gray-900! mb-0! truncate!">
                              {item.aluno?.nomeCompleto || "Aluno"}
                            </p>
                            {(item.codigoInscricao ?? item.aluno?.codigo) && (
                              <code className="text-xs! bg-gray-100! px-1.5! py-0.5! rounded! font-mono! text-gray-500! shrink-0!">
                                {item.codigoInscricao ?? item.aluno?.codigo}
                              </code>
                            )}
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="py-4">
                      <div className="flex items-center gap-2 text-sm! text-gray-700">
                        <IdCard className="h-4 w-4 shrink-0 text-gray-400" />
                        <span>{formatCpf(item.aluno?.cpf)}</span>
                      </div>
                    </TableCell>

                    <TableCell className="py-4">
                      <div className="flex items-center gap-2">
                        <CalendarClock className="h-4 w-4 shrink-0 text-gray-400" />
                        <div>
                          <div className="text-sm! font-medium! text-gray-900!">
                            {formatDateTime(item.concluidoEm)}
                          </div>
                          {item.concluidoEm && (
                            <div className="text-xs! text-gray-500!">
                              {formatRelativeTime(item.concluidoEm)}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="py-4">
                      <Badge className={cn("border", statusMeta.className)}>
                        {statusMeta.label}
                      </Badge>
                    </TableCell>

                    <TableCell className="py-4 text-right">
                      <span className="text-sm! font-semibold! text-gray-900!">
                        {typeof item.nota === "number"
                          ? item.nota.toLocaleString("pt-BR")
                          : "—"}
                      </span>
                    </TableCell>

                    <TableCell className="py-4">
                      <div className="flex items-center justify-end">
                        <ButtonCustom
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleOpenModal(
                              item.id,
                              !isProva && item.statusCorrecao !== "CORRIGIDA",
                              tipoAvaliacao,
                              {
                                concluidoEm: item.concluidoEm,
                                ipEnvio: item.ipEnvio,
                              },
                            )
                          }
                          className={cn(
                            "h-9 min-w-[190px] justify-center gap-1.5 px-3",
                            isProva
                              ? "!border-blue-200 !bg-blue-50 !text-blue-700 !hover:bg-blue-100"
                              : item.statusCorrecao === "CORRIGIDA"
                                ? "!border-emerald-200 !bg-emerald-50 !text-emerald-700 !hover:bg-emerald-100"
                                : "!border-amber-200 !bg-amber-50 !text-amber-700 !hover:bg-amber-100",
                          )}
                        >
                          <Eye className="h-3.5 w-3.5 shrink-0" />
                          <span className="hidden sm:inline">{actionLabel}</span>
                        </ButtonCustom>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <ModalCorrecaoAtividade
        isOpen={isModalOpen}
        startEditing={modalState?.startEditing ?? false}
        submissionMeta={modalState?.submissionMeta ?? null}
        respostaDetalhe={respostaDetalhe}
        isLoading={isLoadingDetalhe}
        error={detalheError instanceof Error ? detalheError : null}
        nota={nota}
        feedback={feedback}
        saveVersion={saveVersion}
        isSubmitting={corrigirMutation.isPending}
        onClose={handleCloseModal}
        onSubmit={submitCorrecao}
        onNotaChange={setNota}
        onFeedbackChange={setFeedback}
        allowManualCorrection={modalState?.tipoAvaliacao !== "PROVA"}
      />

      {/* paginação */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3">
          <div className="text-sm! text-gray-700!">
            Mostrando {startIndex + 1} a {endIndex} de {total} submissões
            {isFetching ? " (atualizando...)" : ""}
          </div>
          <div className="flex items-center space-x-2">
            <ButtonCustom
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="h-8 px-3"
            >
              Anterior
            </ButtonCustom>
            {visiblePages.map((p) => (
              <ButtonCustom
                key={p}
                variant={page === p ? "primary" : "outline"}
                size="sm"
                onClick={() => setPage(p)}
                className="h-8 w-8 p-0"
              >
                {p}
              </ButtonCustom>
            ))}
            <ButtonCustom
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="h-8 px-3"
            >
              Próxima
            </ButtonCustom>
          </div>
        </div>
      )}
    </div>
  );
}
