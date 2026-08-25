"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ExternalLink, Save } from "lucide-react";

import {
  corrigirAvaliacaoResposta,
  getAvaliacaoRespostaById,
  type AvaliacaoRespostaDetalhe,
  type CorrigirAvaliacaoRespostaPayload,
} from "@/api/provas";
import { type Avaliacao } from "@/api/cursos";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ButtonCustom,
  InputCustom,
  SimpleTextarea,
  toastCustom,
} from "@/components/ui/custom";
import { AvaliacaoRespostaCommentsPanel } from "./components/AvaliacaoRespostaCommentsPanel";

interface RespostaDetailsViewProps {
  avaliacaoId: string;
  respostaId: string;
  initialAvaliacao?: Avaliacao | null;
  initialData?: AvaliacaoRespostaDetalhe | null;
  initialError?: Error | null;
}

function formatDateTime(value?: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatCpf(value?: string | null) {
  if (!value) return "-";
  const digits = value.replace(/\D/g, "");
  if (digits.length !== 11) return value;
  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

function parseNotaValue(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value.replace(",", "."));
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function serializeRespostaAluno(item: NonNullable<AvaliacaoRespostaDetalhe["itens"]>[number]) {
  const resposta = item.respostaAluno;
  if (!resposta) return "Sem resposta";

  if (resposta.texto) return resposta.texto;
  if (resposta.anexoUrl) return resposta.anexoNome || resposta.anexoUrl;
  if (resposta.alternativaId) return `Alternativa ID: ${resposta.alternativaId}`;
  return "Sem resposta";
}

function serializeRespostaCorreta(item: NonNullable<AvaliacaoRespostaDetalhe["itens"]>[number]) {
  const correta = item.respostaCorreta;
  if (!correta) return "-";

  if (correta.texto) return correta.texto;
  if (correta.alternativaId) return `Alternativa ID: ${correta.alternativaId}`;
  return "-";
}

export function RespostaDetailsView({
  avaliacaoId,
  respostaId,
  initialAvaliacao,
  initialData,
  initialError,
}: RespostaDetailsViewProps) {
  const queryClient = useQueryClient();
  const responsesPath = `/dashboard/cursos/atividades-provas/${encodeURIComponent(avaliacaoId)}?tab=respostas`;

  const {
    data: respostaData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["avaliacao-resposta", avaliacaoId, respostaId],
    queryFn: () => getAvaliacaoRespostaById(avaliacaoId, respostaId),
    initialData: initialData ?? undefined,
    retry: initialError ? false : 2,
    enabled: Boolean(avaliacaoId && respostaId),
    staleTime: 30_000,
  });

  const resposta = respostaData ?? initialData ?? null;
  const isProva = resposta?.tipoAvaliacao === "PROVA";
  const isPerguntaResposta = useMemo(
    () =>
      resposta?.tipoAvaliacao === "ATIVIDADE" &&
      (resposta?.tipoAtividade === "PERGUNTA_RESPOSTA" ||
        resposta?.tipoAtividade === "TEXTO" ||
        resposta?.tipoAtividade === "ENVIO_MATERIAL"),
    [resposta?.tipoAvaliacao, resposta?.tipoAtividade]
  );

  const [nota, setNota] = useState<string>(
    typeof resposta?.nota === "number" ? String(resposta.nota) : ""
  );
  const [feedback, setFeedback] = useState(resposta?.feedback?.trim() ?? "");

  useEffect(() => {
    if (!resposta) return;
    setNota(typeof resposta.nota === "number" ? String(resposta.nota) : "");
    setFeedback(resposta.feedback?.trim() ?? "");
  }, [resposta]);

  const corrigirMutation = useMutation({
    mutationFn: (payload: CorrigirAvaliacaoRespostaPayload) =>
      corrigirAvaliacaoResposta(avaliacaoId, respostaId, payload),
    onSuccess: async (response, variables) => {
      const notaEnviada = parseNotaValue(variables.nota);
      let notaPersistida = parseNotaValue(response?.data?.nota);

      if (notaEnviada !== null) {
        if (notaPersistida === null) {
          const detalheAtualizado = await getAvaliacaoRespostaById(
            avaliacaoId,
            respostaId,
            { cache: "no-cache" },
          );
          notaPersistida = parseNotaValue(detalheAtualizado.nota);
        }

        const notaFoiPersistida =
          notaPersistida !== null &&
          Math.abs(notaPersistida - notaEnviada) < 0.11;

        if (!notaFoiPersistida) {
          await Promise.all([
            queryClient.invalidateQueries({
              queryKey: ["avaliacao-resposta", avaliacaoId, respostaId],
            }),
            queryClient.invalidateQueries({
              queryKey: ["avaliacao-respostas", avaliacaoId],
            }),
          ]);
          toastCustom.error(
            "A correção foi marcada, mas a nota não foi persistida pela API. Tente novamente.",
          );
          return;
        }
      }

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["avaliacao-resposta", avaliacaoId, respostaId],
        }),
        queryClient.invalidateQueries({
          queryKey: ["avaliacao-respostas", avaliacaoId],
        }),
      ]);

      toastCustom.success("Correção salva com sucesso");
    },
    onError: (err) => {
      const message = err instanceof Error ? err.message : "Erro ao salvar correção";
      toastCustom.error(message);
    },
  });

  const submitCorrecao = () => {
    if (isProva) {
      toastCustom.info(
        "A nota da prova é calculada automaticamente pelo sistema.",
      );
      return;
    }

    const notaNormalizada = nota.trim().replace(",", ".");
    const notaNumber = notaNormalizada === "" ? undefined : Number(notaNormalizada);
    if (
      notaNormalizada !== "" &&
      (!Number.isFinite(notaNumber) || Number(notaNumber) < 0 || Number(notaNumber) > 10)
    ) {
      toastCustom.error("A nota deve estar entre 0 e 10");
      return;
    }

    const payload: CorrigirAvaliacaoRespostaPayload = {
      statusCorrecao: "CORRIGIDA",
      feedback: feedback.trim() || undefined,
      nota: typeof notaNumber === "number" && Number.isFinite(notaNumber) ? notaNumber : undefined,
    };

    corrigirMutation.mutate(payload);
  };

  if (isLoading && !resposta) {
    return (
      <div className="space-y-8 pb-8">
        <section className="rounded-3xl bg-white px-6 py-6 sm:px-8 sm:py-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-56" />
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>
              <Skeleton className="h-4 w-80 max-w-full" />
            </div>
            <Skeleton className="h-10 w-28 rounded-full" />
          </div>
        </section>

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <section className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-7">
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }, (_, index) => (
                <div key={index} className="space-y-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-4 w-36 max-w-full" />
                </div>
              ))}
            </div>
            <div className="mt-6 space-y-3 border-t border-slate-100 pt-6">
              <Skeleton className="h-3 w-36" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="mt-5 h-28 w-full" />
            </div>
          </section>

          <aside className="rounded-3xl border border-slate-200/80 bg-white p-6">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="mt-3 h-4 w-full" />
            <Skeleton className="mt-6 h-10 w-full" />
            <Skeleton className="mt-4 h-32 w-full" />
            <Skeleton className="mt-4 h-10 w-full" />
          </aside>
        </div>
      </div>
    );
  }

  if (error || initialError) {
    const message = (error as Error | undefined)?.message || initialError?.message || "Erro ao carregar resposta";
    return (
      <Alert variant="destructive">
        <AlertDescription>{message}</AlertDescription>
      </Alert>
    );
  }

  if (!resposta) {
    return (
      <Alert>
        <AlertDescription>Resposta não encontrada.</AlertDescription>
      </Alert>
    );
  }

  const avaliacaoTitulo =
    initialAvaliacao?.titulo || initialAvaliacao?.nome || avaliacaoId;
  const statusClassName =
    resposta.statusCorrecao === "CORRIGIDA"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : "border-amber-200 bg-amber-50 text-amber-700";

  const respostaContent = (
    <div className="divide-y divide-slate-100">
      <div className="grid gap-5 pb-6 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="mb-1! text-xs! font-medium text-slate-400">Aluno</p>
          <p className="mb-0! text-sm! font-semibold text-slate-900">
            {resposta.aluno?.nomeCompleto || "Aluno não identificado"}
          </p>
        </div>
        <div>
          <p className="mb-1! text-xs! font-medium text-slate-400">CPF</p>
          <p className="mb-0! text-sm! font-semibold text-slate-900">
            {formatCpf(resposta.aluno?.cpf)}
          </p>
        </div>
        <div>
          <p className="mb-1! text-xs! font-medium text-slate-400">
            Concluído em
          </p>
          <p className="mb-0! text-sm! font-semibold text-slate-900 tabular-nums">
            {formatDateTime(resposta.concluidoEm)}
          </p>
        </div>
        <div>
          <p className="mb-1! text-xs! font-medium text-slate-400">IP</p>
          <p className="mb-0! text-sm! font-semibold text-slate-900 tabular-nums">
            {resposta.ipEnvio || "—"}
          </p>
        </div>
      </div>

      {isPerguntaResposta ? (
        <div className="space-y-6 pt-6">
          <section>
            <p className="mb-2! text-xs! font-semibold uppercase tracking-wide text-slate-400">
              Pergunta da atividade
            </p>
            <p className="mb-0! max-w-4xl whitespace-pre-wrap text-sm! leading-relaxed text-slate-700">
              {resposta.enunciado || "Pergunta não informada."}
            </p>
          </section>

          <section className="border-l-2 border-emerald-400 pl-4 sm:pl-5">
            <p className="mb-2! text-xs! font-semibold uppercase tracking-wide text-emerald-700">
              Resposta enviada pelo aluno
            </p>
            <p className="mb-0! max-w-4xl whitespace-pre-wrap break-words text-sm! leading-relaxed text-slate-900">
              {resposta.respostaAluno?.texto || "Sem resposta textual."}
            </p>
          </section>

          {Array.isArray(resposta.respostaAluno?.anexos) &&
          resposta.respostaAluno.anexos.length > 0 ? (
            <section>
              <p className="mb-3! text-xs! font-semibold uppercase tracking-wide text-slate-400">
                Materiais enviados
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {resposta.respostaAluno.anexos.map((anexo, index) => (
                  <a
                    key={`${anexo.url}-${index}`}
                    href={anexo.url}
                    target="_blank"
                    rel="noreferrer"
                    className="group flex min-w-0 cursor-pointer items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50/60 px-4 py-3 transition-colors hover:border-emerald-200 hover:bg-emerald-50/40"
                  >
                    <span className="truncate text-sm! font-medium text-slate-700 group-hover:text-emerald-800">
                      {anexo.nome || "Abrir anexo"}
                    </span>
                    <ExternalLink className="h-4 w-4 shrink-0 text-slate-400 group-hover:text-emerald-700" />
                  </a>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      ) : (
        <div className="pt-6">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
            <div>
              <p className="mb-1! text-xs! font-semibold uppercase tracking-wide text-slate-400">
                Respostas da avaliação
              </p>
              <p className="mb-0! text-sm! text-slate-600">
                Comparação entre a resposta do aluno e o gabarito.
              </p>
            </div>
            <span className="text-xs! font-medium text-slate-400">
              {(resposta.itens || []).length} itens
            </span>
          </div>

          {(resposta.itens || []).length === 0 ? (
            <p className="mb-0! py-8 text-center text-sm! text-slate-500">
              Nenhum item de resposta encontrado.
            </p>
          ) : (
            <div className="space-y-3">
              {resposta.itens?.map((item) => (
                <article
                  key={item.questaoId}
                  className="rounded-lg border border-slate-200 bg-slate-50/30 p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <p className="mb-0! min-w-0 flex-1 text-sm! font-semibold text-slate-900">
                      Questão {item.ordem ?? "—"} · {item.enunciado}
                    </p>
                    <Badge
                      className={
                        item.acertou === true
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : item.acertou === false
                            ? "border-rose-200 bg-rose-50 text-rose-700"
                            : "border-slate-200 bg-slate-100 text-slate-600"
                      }
                    >
                      {item.acertou === true
                        ? "Correta"
                        : item.acertou === false
                          ? "Incorreta"
                          : "Sem correção"}
                    </Badge>
                  </div>

                  <div className="mt-4 grid gap-4 border-t border-slate-200 pt-4 md:grid-cols-2">
                    <div>
                      <p className="mb-1! text-xs! font-medium text-slate-400">
                        Resposta do aluno
                      </p>
                      <p className="mb-0! whitespace-pre-wrap break-words text-sm! text-slate-800">
                        {serializeRespostaAluno(item)}
                      </p>
                    </div>
                    <div>
                      <p className="mb-1! text-xs! font-medium text-slate-400">
                        Gabarito
                      </p>
                      <p className="mb-0! whitespace-pre-wrap break-words text-sm! text-slate-800">
                        {serializeRespostaCorreta(item)}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );

  const correcaoSidebar = isProva ? (
    <div className="space-y-5">
      <div>
        <h2 className="mb-0! text-base! font-semibold text-slate-950">
          Resultado automático
        </h2>
        <p className="mb-0! mt-1 text-xs! leading-relaxed text-slate-500">
          O sistema calcula a nota com base no gabarito da prova.
        </p>
      </div>

      <div className="border-y border-slate-100 py-5">
        <p className="mb-1! text-xs! font-medium text-slate-400">
          Nota calculada
        </p>
        <p className="mb-0! text-3xl! font-semibold text-slate-950 tabular-nums">
          {typeof resposta.nota === "number"
            ? resposta.nota.toLocaleString("pt-BR")
            : "—"}
        </p>
      </div>

      <div className="border-l-2 border-blue-400 bg-blue-50/50 px-4 py-3">
        <p className="mb-0! text-xs! leading-relaxed text-blue-800">
          Este resultado é somente leitura e será atualizado ao concluir o
          processamento.
        </p>
      </div>

      {resposta.corrigidoEm ? (
        <div>
          <p className="mb-1! text-xs! font-medium text-slate-400">
            Processado em
          </p>
          <p className="mb-0! text-sm! font-semibold text-slate-900 tabular-nums">
            {formatDateTime(resposta.corrigidoEm)}
          </p>
        </div>
      ) : null}
    </div>
  ) : (
    <div className="space-y-5">
      <div>
        <h2 className="mb-0! text-base! font-semibold text-slate-950">
          Correção
        </h2>
        <p className="mb-0! mt-1 text-xs! leading-relaxed text-slate-500">
          Informe a nota e escreva uma orientação para o aluno.
        </p>
      </div>

      <InputCustom
        label="Nota (0 a 10)"
        type="number"
        min={0}
        max={10}
        step="0.1"
        value={nota}
        onChange={(event) => setNota(event.target.value)}
        placeholder="Ex.: 8.5"
        size="sm"
      />

      <SimpleTextarea
        label="Feedback para o aluno"
        value={feedback}
        onChange={(event) => setFeedback(event.target.value)}
        rows={6}
        maxLength={1500}
        showCharCount
        placeholder="Registre uma orientação objetiva para o aluno."
        className="text-sm!"
      />

      <ButtonCustom
        variant="primary"
        fullWidth
        onClick={submitCorrecao}
        disabled={corrigirMutation.isPending}
        isLoading={corrigirMutation.isPending}
        loadingText="Salvando..."
      >
        <Save className="h-4 w-4" />
        {resposta.statusCorrecao === "CORRIGIDA"
          ? "Atualizar correção"
          : "Salvar correção"}
      </ButtonCustom>

      {resposta.statusCorrecao === "CORRIGIDA" ? (
        <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-5">
          <div>
            <p className="mb-1! text-xs! font-medium text-slate-400">
              Corrigido por
            </p>
            <p className="mb-0! text-sm! font-semibold text-slate-900">
              {resposta.corrigidoPor?.nome || "Sistema"}
            </p>
          </div>
          <div className="text-right">
            <p className="mb-1! text-xs! font-medium text-slate-400">
              Última correção
            </p>
            <p className="mb-0! text-sm! font-semibold text-slate-900 tabular-nums">
              {formatDateTime(resposta.corrigidoEm)}
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );

  return (
    <div className="space-y-8 pb-8">
      <section className="relative overflow-hidden rounded-3xl bg-white">
        <div className="relative flex flex-col gap-6 px-6 py-6 sm:px-8 sm:py-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="mb-0! truncate text-xl! font-semibold text-slate-950">
                {resposta.aluno?.nomeCompleto || "Aluno não identificado"}
              </h3>
              <Badge
                variant="outline"
                className={`inline-flex items-center rounded-full border px-3 py-1 text-xs! font-semibold uppercase tracking-wide ${statusClassName}`}
              >
                {resposta.statusCorrecao === "CORRIGIDA"
                  ? "Corrigida"
                  : "Pendente"}
              </Badge>
            </div>
            <p className="mb-0! mt-1 truncate text-sm! text-slate-500">
              {isProva ? "Resultado da prova" : "Correção da atividade"} ·{" "}
              {avaliacaoTitulo}
            </p>
          </div>

          <ButtonCustom
            asChild
            variant="ghost"
            className="rounded-full! bg-gray-100/70! px-5! hover:bg-gray-200!"
          >
            <Link href={responsesPath}>
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Link>
          </ButtonCustom>
        </div>
      </section>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,380px)]">
        <main className="min-w-0 rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-7">
          <div className="mb-6">
            <h2 className="mb-0! text-base! font-semibold text-slate-950">
              Resposta do aluno
            </h2>
            <p className="mb-0! mt-1 text-xs! text-slate-500">
              Dados da submissão e material entregue para avaliação.
            </p>
          </div>
          {respostaContent}
        </main>

        <aside className="min-w-0">
          <section className="rounded-3xl border border-slate-200/80 bg-white p-6">
            {correcaoSidebar}
          </section>
        </aside>

        <section className="min-w-0 rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-7 lg:col-span-2">
          <AvaliacaoRespostaCommentsPanel
            avaliacaoId={avaliacaoId}
            respostaId={resposta.id}
          />
        </section>
      </div>
    </div>
  );
}
