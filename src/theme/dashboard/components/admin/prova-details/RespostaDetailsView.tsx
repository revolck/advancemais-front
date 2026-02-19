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
  type StatusCorrecao,
} from "@/api/provas";
import { type Avaliacao } from "@/api/cursos";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toastCustom } from "@/components/ui/custom";

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

function normalizeStatus(value?: string | null): StatusCorrecao {
  return value === "CORRIGIDA" ? "CORRIGIDA" : "PENDENTE";
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
  const isPerguntaResposta = useMemo(
    () =>
      resposta?.tipoAvaliacao === "ATIVIDADE" &&
      (resposta?.tipoAtividade === "PERGUNTA_RESPOSTA" || resposta?.tipoAtividade === "TEXTO"),
    [resposta?.tipoAvaliacao, resposta?.tipoAtividade]
  );

  const [nota, setNota] = useState<string>(
    typeof resposta?.nota === "number" ? String(resposta.nota) : ""
  );
  const [feedback, setFeedback] = useState("");
  const [statusCorrecao, setStatusCorrecao] = useState<StatusCorrecao>(
    normalizeStatus(resposta?.statusCorrecao)
  );

  useEffect(() => {
    if (!resposta) return;
    setNota(typeof resposta.nota === "number" ? String(resposta.nota) : "");
    setStatusCorrecao(normalizeStatus(resposta.statusCorrecao));
  }, [resposta]);

  const corrigirMutation = useMutation({
    mutationFn: (payload: CorrigirAvaliacaoRespostaPayload) =>
      corrigirAvaliacaoResposta(avaliacaoId, respostaId, payload),
    onSuccess: async () => {
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
    const notaNumber = nota.trim() === "" ? undefined : Number(nota);
    if (typeof notaNumber === "number" && Number.isFinite(notaNumber)) {
      if (notaNumber < 0 || notaNumber > 10) {
        toastCustom.error("A nota deve estar entre 0 e 10");
        return;
      }
    }

    const payload: CorrigirAvaliacaoRespostaPayload = {
      statusCorrecao,
      feedback: feedback.trim() || undefined,
      nota: typeof notaNumber === "number" && Number.isFinite(notaNumber) ? notaNumber : undefined,
    };

    corrigirMutation.mutate(payload);
  };

  const titlePrefix = initialAvaliacao?.tipo === "PROVA" ? "Prova" : "Atividade";

  if (isLoading && !resposta) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-56" />
        <Skeleton className="h-48 w-full" />
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

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold">Correção de Resposta</h1>
          <p className="text-sm text-gray-600">
            {titlePrefix}: {initialAvaliacao?.titulo || initialAvaliacao?.nome || avaliacaoId}
          </p>
        </div>

        <Button asChild variant="outline">
          <Link href={`/dashboard/cursos/atividades-provas/${avaliacaoId}`}>
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>
        </Button>
      </div>

      <section className="grid gap-4 lg:grid-cols-[2fr,1fr]">
        <article className="rounded-xl border border-gray-200 bg-white p-5 space-y-4">
          <h2 className="text-base font-semibold">Dados da submissão</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <p className="text-xs text-gray-500">Aluno</p>
              <p className="text-sm font-medium">{resposta.aluno?.nomeCompleto || "-"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">CPF</p>
              <p className="text-sm font-medium">{formatCpf(resposta.aluno?.cpf)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Concluído em</p>
              <p className="text-sm font-medium">{formatDateTime(resposta.concluidoEm)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">IP</p>
              <p className="text-sm font-medium">{resposta.ipEnvio || "-"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Status</p>
              <Badge
                className={
                  resposta.statusCorrecao === "CORRIGIDA"
                    ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                    : "bg-amber-100 text-amber-700 border-amber-200"
                }
              >
                {resposta.statusCorrecao === "CORRIGIDA" ? "Corrigida" : "Pendente"}
              </Badge>
            </div>
            <div>
              <p className="text-xs text-gray-500">Nota atual</p>
              <p className="text-sm font-medium">
                {typeof resposta.nota === "number" ? resposta.nota.toLocaleString("pt-BR") : "-"}
              </p>
            </div>
          </div>
        </article>

        <article className="rounded-xl border border-gray-200 bg-white p-5 space-y-4">
          <h2 className="text-base font-semibold">Correção</h2>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Status da correção</label>
            <select
              value={statusCorrecao}
              onChange={(event) => setStatusCorrecao(event.target.value as StatusCorrecao)}
              className="h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm"
            >
              <option value="PENDENTE">Pendente</option>
              <option value="CORRIGIDA">Corrigida</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Nota (0 a 10)</label>
            <Input
              type="number"
              min={0}
              max={10}
              step="0.1"
              value={nota}
              onChange={(event) => setNota(event.target.value)}
              placeholder="Ex.: 8.5"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Feedback</label>
            <Textarea
              value={feedback}
              onChange={(event) => setFeedback(event.target.value)}
              rows={4}
              placeholder="Comentário para o aluno"
            />
          </div>

          <Button onClick={submitCorrecao} disabled={corrigirMutation.isPending} className="w-full">
            <Save className="h-4 w-4" />
            {corrigirMutation.isPending ? "Salvando..." : "Salvar correção"}
          </Button>
        </article>
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-5 space-y-4">
        <h2 className="text-base font-semibold">Conteúdo respondido</h2>

        {isPerguntaResposta ? (
          <div className="space-y-4">
            <div className="rounded-lg border border-gray-200 p-4">
              <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">Pergunta</p>
              <p className="text-sm text-gray-800 whitespace-pre-wrap">{resposta.enunciado || "-"}</p>
            </div>

            <div className="rounded-lg border border-gray-200 p-4">
              <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">Resposta do aluno</p>
              <p className="text-sm text-gray-800 whitespace-pre-wrap">
                {resposta.respostaAluno?.texto || "Sem resposta textual."}
              </p>

              {Array.isArray(resposta.respostaAluno?.anexos) && resposta.respostaAluno?.anexos.length > 0 ? (
                <ul className="mt-3 space-y-2">
                  {resposta.respostaAluno?.anexos.map((anexo, index) => (
                    <li key={`${anexo.url}-${index}`}>
                      <a
                        href={anexo.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-blue-700 hover:underline"
                      >
                        {anexo.nome || "Abrir anexo"}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {(resposta.itens || []).length === 0 ? (
              <p className="text-sm text-gray-500">Nenhum item de resposta encontrado.</p>
            ) : (
              resposta.itens?.map((item) => (
                <article key={item.questaoId} className="rounded-lg border border-gray-200 p-4 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-medium text-gray-900">
                      Q{item.ordem ?? "-"} • {item.enunciado}
                    </p>
                    <Badge
                      className={
                        item.acertou === true
                          ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                          : item.acertou === false
                            ? "bg-rose-100 text-rose-700 border-rose-200"
                            : "bg-gray-100 text-gray-700 border-gray-200"
                      }
                    >
                      {item.acertou === true ? "Correta" : item.acertou === false ? "Incorreta" : "Sem correção"}
                    </Badge>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Resposta do aluno</p>
                      <p className="text-sm whitespace-pre-wrap">{serializeRespostaAluno(item)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Gabarito</p>
                      <p className="text-sm whitespace-pre-wrap">{serializeRespostaCorreta(item)}</p>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        )}
      </section>
    </div>
  );
}
