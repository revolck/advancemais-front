"use client";

import { useEffect, useState, type ChangeEvent } from "react";
import {
  CheckCircle2,
  ExternalLink,
  FileText,
  PencilLine,
  Save,
  XCircle,
} from "lucide-react";

import type { AvaliacaoRespostaDetalhe, StatusCorrecao } from "@/api/provas";
import {
  AvatarCustom,
  InputCustom,
  ModalBody,
  ModalContentWrapper,
  ModalCustom,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  SimpleTextarea,
} from "@/components/ui/custom";
import { ButtonCustom } from "@/components/ui/custom/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface ModalCorrecaoAtividadeProps {
  isOpen: boolean;
  startEditing?: boolean;
  allowManualCorrection?: boolean;
  submissionMeta?: {
    concluidoEm?: string | null;
    ipEnvio?: string | null;
  } | null;
  respostaDetalhe?: AvaliacaoRespostaDetalhe;
  isLoading: boolean;
  error?: Error | null;
  nota: string;
  feedback: string;
  saveVersion: number;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: () => void;
  onNotaChange: (value: string) => void;
  onFeedbackChange: (value: string) => void;
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

function formatCpf(value?: string | null) {
  if (!value) return "—";
  const digits = value.replace(/\D/g, "");
  if (digits.length !== 11) return value;
  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

function formatRespostaTexto(texto?: string | null): string {
  if (!texto || typeof texto !== "string") return "Sem resposta";

  let cleanText = texto.trim();
  cleanText = cleanText.replace(/^(R:|Resposta:?|Res:?)\s*/i, "").trim();

  if (!cleanText) return "Sem resposta";

  const digits = cleanText.replace(/\D/g, "");
  if (digits.length === 11) return formatCpf(digits);

  return cleanText;
}

function serializeRespostaAluno(
  item: NonNullable<AvaliacaoRespostaDetalhe["itens"]>[number],
) {
  const resposta = item.respostaAluno;
  if (!resposta) return "Sem resposta";

  if (resposta.texto) return resposta.texto;
  if (resposta.anexoUrl) return resposta.anexoNome || resposta.anexoUrl;
  if (resposta.alternativaId)
    return `Alternativa ID: ${resposta.alternativaId}`;
  return "Sem resposta";
}

function serializeRespostaCorreta(
  item: NonNullable<AvaliacaoRespostaDetalhe["itens"]>[number],
) {
  const correta = item.respostaCorreta;
  if (!correta) return "-";

  if (correta.texto) return correta.texto;
  if (correta.alternativaId) return `Alternativa ID: ${correta.alternativaId}`;
  return "-";
}

function getModalTitle(tipoAvaliacao?: string) {
  if (tipoAvaliacao === "ATIVIDADE") return "Correção de Atividade";
  if (tipoAvaliacao === "PROVA") return "Correção de Prova";
  return "Correção de Avaliação";
}

export function ModalCorrecaoAtividade({
  isOpen,
  startEditing = false,
  allowManualCorrection = true,
  submissionMeta,
  respostaDetalhe,
  isLoading,
  error,
  nota,
  feedback,
  saveVersion,
  isSubmitting,
  onClose,
  onSubmit,
  onNotaChange,
  onFeedbackChange,
}: ModalCorrecaoAtividadeProps) {
  const [isEditingCorrigida, setIsEditingCorrigida] = useState(false);
  const [isEditingPendente, setIsEditingPendente] = useState(false);
  const [forceCorrigidaView, setForceCorrigidaView] = useState(false);
  const [notaInputNonce, setNotaInputNonce] = useState(0);
  const isPerguntaResposta =
    respostaDetalhe?.tipoAvaliacao === "ATIVIDADE" &&
    (respostaDetalhe?.tipoAtividade === "PERGUNTA_RESPOSTA" ||
      respostaDetalhe?.tipoAtividade === "TEXTO");
  const isProva = respostaDetalhe?.tipoAvaliacao === "PROVA";
  const isCorrigidaBackend = respostaDetalhe?.statusCorrecao === "CORRIGIDA";
  const isCorrigida = isCorrigidaBackend || forceCorrigidaView;
  const isPendente = !isCorrigida;
  const canGrade = allowManualCorrection && !isProva;
  const isEditing = isCorrigida ? isEditingCorrigida : isEditingPendente;
  const showEditButton = isCorrigida && canGrade && !isEditingCorrigida;
  const showStartCorrectionButton =
    isPendente && canGrade && !isEditingPendente;
  const showSaveButton = Boolean(respostaDetalhe) && canGrade && isEditing;
  const isFieldsDisabled = !isEditing;
  const showFeedbackSection = isPerguntaResposta;
  const isActionStateResolving = isLoading || (!error && !respostaDetalhe);
  const notaLabel =
    respostaDetalhe?.tipoAvaliacao === "ATIVIDADE"
      ? "Nota da atividade"
      : respostaDetalhe?.tipoAvaliacao === "PROVA"
        ? "Nota da prova"
        : "Nota";
  const correctionActionLabel =
    respostaDetalhe?.tipoAvaliacao === "PROVA"
      ? "Corrigir prova"
      : "Corrigir atividade";
  const showCorrectionHistory =
    respostaDetalhe?.statusCorrecao === "CORRIGIDA" &&
    (respostaDetalhe.corrigidoEm || respostaDetalhe.corrigidoPor);
  const showCorrectionSection =
    showFeedbackSection || isProva || showCorrectionHistory;
  const concluidoEmDisplay =
    submissionMeta?.concluidoEm ?? respostaDetalhe?.concluidoEm ?? null;
  const ipEnvioDisplay = submissionMeta?.ipEnvio ?? respostaDetalhe?.ipEnvio ?? null;

  const handleNotaInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    let next = event.target.value;

    if (next === "") {
      onNotaChange("");
      return;
    }

    // Aceita somente dígitos e ponto (sem vírgula/semicolon/outros caracteres)
    if (/[^0-9.]/.test(next)) {
      setNotaInputNonce((prev) => prev + 1);
      return;
    }

    if (next.startsWith(".")) {
      next = `0${next}`;
    }

    // Permite no máximo 1 casa decimal
    if (!/^\d{0,2}(\.\d{0,1})?$/.test(next)) {
      setNotaInputNonce((prev) => prev + 1);
      return;
    }

    if (next.startsWith("10.") && !/^10(\.0?)?$/.test(next)) {
      setNotaInputNonce((prev) => prev + 1);
      return;
    }

    const numericValue = Number(next);
    if (!Number.isNaN(numericValue) && numericValue > 10) {
      setNotaInputNonce((prev) => prev + 1);
      return;
    }

    onNotaChange(next);
  };

  const handleNotaBlur = () => {
    const value = nota.trim().replace(",", ".");
    if (!value) return;

    const isValidFinalFormat = /^(10(\.0)?|[0-9](\.[0-9])?)$/.test(value);
    if (!isValidFinalFormat) {
      onNotaChange("");
      setNotaInputNonce((prev) => prev + 1);
      return;
    }

    onNotaChange(value);
  };

  useEffect(() => {
    if (isOpen) {
      setIsEditingCorrigida(false);
      setIsEditingPendente(false);
      setForceCorrigidaView(false);
      if (startEditing) {
        if (isCorrigidaBackend) setIsEditingCorrigida(true);
        else setIsEditingPendente(true);
      }
    }
  }, [isOpen, startEditing, respostaDetalhe?.id, isCorrigidaBackend]);

  useEffect(() => {
    if (saveVersion > 0) {
      setIsEditingCorrigida(false);
      setIsEditingPendente(false);
      setForceCorrigidaView(true);
    }
  }, [saveVersion]);

  return (
    <ModalCustom
      isOpen={isOpen}
      onClose={onClose}
      size="5xl"
      backdrop="blur"
      scrollBehavior="inside"
      classNames={{
        base: "w-[96vw] max-w-[1100px] max-h-[92vh] p-0! gap-0! overflow-hidden",
      }}
    >
      <ModalContentWrapper>
        <ModalHeader className="border-b border-slate-200 bg-white px-6 py-5">
          <ModalTitle className="text-xl! font-semibold! text-slate-900! mb-0!">
            {getModalTitle(respostaDetalhe?.tipoAvaliacao)}
          </ModalTitle>
        </ModalHeader>

        <ModalBody className="bg-slate-50/40 p-6 overflow-y-auto max-h-[calc(92vh-188px)]">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-20 w-full rounded-xl" />
              <Skeleton className="h-56 w-full rounded-xl" />
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertDescription className="text-sm!">
                Erro ao carregar resposta: {error.message}
              </AlertDescription>
            </Alert>
          ) : !respostaDetalhe ? (
            <Alert>
              <AlertDescription className="text-sm!">
                Resposta não encontrada.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-5">
              <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-start">
                  <div className="flex w-full justify-start md:w-auto md:min-w-[84px] md:justify-center">
                    <AvatarCustom
                      name={respostaDetalhe.aluno?.nomeCompleto || "Aluno"}
                      src={respostaDetalhe.aluno?.avatarUrl || undefined}
                      size="xl"
                      withBorder
                    />
                  </div>

                  <div className="flex-1 space-y-3">
                    <div className="grid gap-3 md:grid-cols-3">
                      <div className="min-w-0">
                        <p className="text-xs! text-slate-500! mb-1!">Nome</p>
                        <p className="text-sm! font-semibold! text-slate-900! mb-0! truncate!">
                          {respostaDetalhe.aluno?.nomeCompleto ||
                            "Aluno não identificado"}
                        </p>
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs! text-slate-500! mb-1!">CPF</p>
                        <p className="text-sm! font-semibold! text-slate-900! mb-0!">
                          {formatCpf(respostaDetalhe.aluno?.cpf)}
                        </p>
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs! text-slate-500! mb-1!">
                          Status
                        </p>
                        <Badge
                          className={cn(
                            "border",
                            STATUS_META[
                              respostaDetalhe.statusCorrecao ?? "PENDENTE"
                            ]?.className ?? STATUS_META.PENDENTE.className,
                          )}
                        >
                          {STATUS_META[
                            respostaDetalhe.statusCorrecao ?? "PENDENTE"
                          ]?.label ?? "Pendente"}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid gap-3 md:grid-cols-3">
                      <div className="min-w-0">
                        <p className="text-xs! text-slate-500! mb-1!">
                          Concluído em
                        </p>
                        <p className="text-sm! font-semibold! text-slate-900! mb-0!">
                          {formatDateTime(concluidoEmDisplay)}
                        </p>
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs! text-slate-500! mb-1!">IP</p>
                        <p className="text-sm! font-semibold! text-slate-900! mb-0!">
                          {ipEnvioDisplay || "—"}
                        </p>
                      </div>
                    <div className="min-w-0">
                      <p
                        className={cn(
                          "text-xs! text-slate-500! mb-1!",
                          isEditing && "required",
                        )}
                      >
                        {notaLabel}
                      </p>
                      {isEditing ? (
                        <InputCustom
                          key={`nota-header-${notaInputNonce}`}
                          type="text"
                            value={nota}
                            onChange={handleNotaInputChange}
                            onBlur={handleNotaBlur}
                            placeholder="Ex.: 8.5"
                            inputMode="decimal"
                            maxLength={4}
                            size="sm"
                            className="space-y-1"
                          />
                        ) : (
                          <p className="text-sm! font-semibold! text-slate-900! mb-0!">
                            {typeof respostaDetalhe.nota === "number"
                              ? respostaDetalhe.nota.toLocaleString("pt-BR")
                              : nota || "—"}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section className="rounded-xl border border-slate-200 bg-white p-5 space-y-5">
                <div className="space-y-1 pb-1">
                  <h4 className="text-sm! font-semibold! text-slate-900! mb-0!">
                    {isPerguntaResposta
                      ? "Pergunta da atividade:"
                      : "Perguntas da avaliação:"}
                  </h4>
                  {isPerguntaResposta ? (
                    <p className="text-xs! text-slate-800! mb-0! break-words whitespace-pre-wrap">
                      {respostaDetalhe.enunciado || "Não informada."}
                    </p>
                  ) : (
                    <p className="text-xs! text-slate-500! mb-0!">
                      Confira abaixo a resposta do aluno e o gabarito por
                      questão.
                    </p>
                  )}
                </div>

                {isPerguntaResposta ? (
                  <div className="pt-1">
                    <article className="rounded-xl border border-emerald-200 bg-emerald-50/20 p-5">
                      <div className="flex items-center gap-2 border-b border-emerald-200/80 pb-4">
                        <FileText className="h-4 w-4 text-emerald-700" />
                        <p className="text-sm! font-semibold! text-emerald-800! mb-0!">
                          Resposta enviada pelo aluno
                        </p>
                      </div>

                      <div className="mt-4 rounded-lg border border-emerald-200 bg-white p-5">
                        <p className="text-sm! leading-relaxed break-words whitespace-pre-wrap text-slate-900! mb-0!">
                          {formatRespostaTexto(
                            respostaDetalhe.respostaAluno?.texto,
                          )}
                        </p>
                      </div>

                      {Array.isArray(respostaDetalhe.respostaAluno?.anexos) &&
                      respostaDetalhe.respostaAluno.anexos.length > 0 ? (
                        <div className="mt-4 rounded-lg border border-emerald-200/80 bg-white p-4">
                          <p className="mb-2 text-xs! font-semibold! uppercase tracking-wide text-emerald-700!">
                            Anexos enviados
                          </p>
                          <ul className="space-y-2">
                            {respostaDetalhe.respostaAluno.anexos.map(
                              (anexo, idx) => (
                                <li key={`${anexo.url}-${idx}`}>
                                  <a
                                    href={anexo.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1 text-sm! text-emerald-700 hover:underline"
                                  >
                                    {anexo.nome || "Abrir anexo"}
                                    <ExternalLink className="h-3 w-3" />
                                  </a>
                                </li>
                              ),
                            )}
                          </ul>
                        </div>
                      ) : null}
                    </article>
                  </div>
                ) : (respostaDetalhe.itens || []).length === 0 ? (
                  <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-6 text-center text-sm! text-slate-500!">
                    Nenhuma resposta detalhada encontrada.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {respostaDetalhe.itens?.map((item) => {
                      const respostaAlunoTexto = formatRespostaTexto(
                        serializeRespostaAluno(item),
                      );
                      const gabaritoTexto = serializeRespostaCorreta(item);
                      const isCorreta = item.acertou === true;
                      const isIncorreta = item.acertou === false;

                      return (
                        <article
                          key={item.questaoId}
                          className="rounded-lg border border-slate-200 bg-slate-50/40 p-4"
                        >
                          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                            <p className="text-sm! font-semibold! text-slate-900! mb-0!">
                              Questão {item.ordem ?? "-"} • {item.enunciado}
                            </p>
                            <Badge
                              className={cn(
                                "border",
                                isCorreta &&
                                  "bg-emerald-50 text-emerald-700 border-emerald-200",
                                isIncorreta &&
                                  "bg-rose-50 text-rose-700 border-rose-200",
                                !isCorreta &&
                                  !isIncorreta &&
                                  "bg-slate-50 text-slate-600 border-slate-200",
                              )}
                            >
                              {isCorreta
                                ? "Correta"
                                : isIncorreta
                                  ? "Incorreta"
                                  : "Sem correção"}
                            </Badge>
                          </div>

                          <div className="grid gap-3 lg:grid-cols-2">
                            <div
                              className={cn(
                                "rounded-md border p-3",
                                isIncorreta
                                  ? "border-rose-200 bg-rose-50/30"
                                  : "border-slate-200 bg-white",
                              )}
                            >
                              <div className="mb-1 flex items-center justify-between gap-2">
                                <p className="text-xs! font-semibold! uppercase tracking-wide text-rose-700! mb-0!">
                                  Aluno marcou
                                </p>
                                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-rose-100 text-rose-700">
                                  <XCircle className="h-3.5 w-3.5" />
                                </span>
                              </div>
                              <p className="text-sm! leading-relaxed break-words whitespace-pre-wrap text-slate-900! mb-0!">
                                {respostaAlunoTexto}
                              </p>
                            </div>
                            <div className="rounded-md border border-emerald-200 bg-emerald-50/20 p-3">
                              <div className="mb-1 flex items-center justify-between gap-2">
                                <p className="text-xs! font-semibold! uppercase tracking-wide text-emerald-700! mb-0!">
                                  Resposta correta
                                </p>
                                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                </span>
                              </div>
                              <p className="text-sm! leading-relaxed break-words whitespace-pre-wrap text-slate-700! mb-0!">
                                {gabaritoTexto}
                              </p>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </section>

              {showCorrectionSection ? (
                <section className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <h4 className="text-sm! font-semibold! text-slate-900! mb-0!">
                    {isProva ? "Resultado automático" : "Correção"}
                  </h4>
                  <span className="text-xs! text-slate-500!">
                    {isProva
                      ? isCorrigida
                        ? "Processado automaticamente"
                        : "Aguardando processamento automático"
                      : isEditing
                      ? "Edição da correção"
                      : isCorrigida
                        ? "Correção concluída"
                        : "Pendente de correção"}
                  </span>
                </div>

                {showFeedbackSection &&
                  (isEditing ? (
                    <div className="rounded-lg border border-slate-200 bg-white p-4">
                      <SimpleTextarea
                        label="Feedback para o aluno"
                        value={feedback}
                        onChange={(event) =>
                          onFeedbackChange(event.target.value)
                        }
                        rows={5}
                        maxLength={1500}
                        showCharCount
                        disabled={isFieldsDisabled}
                        placeholder="Escreva um feedback objetivo para orientar o aluno."
                        className="text-sm!"
                      />
                    </div>
                  ) : (
                    <div className="rounded-lg border border-slate-200 bg-white p-4">
                      {isPendente ? (
                        <p className="text-sm! text-slate-600! mb-0!">
                          Nenhuma correção aplicada ainda. Clique em{" "}
                          <strong>{correctionActionLabel}</strong> para lançar
                          nota e feedback.
                        </p>
                      ) : (
                        <>
                          <p className="mb-2 text-xs! font-semibold! uppercase tracking-wide text-slate-600!">
                            Feedback para o aluno
                          </p>
                          <p className="text-sm! text-slate-800! mb-0! break-words whitespace-pre-wrap">
                            {feedback?.trim() || "Nenhum feedback registrado."}
                          </p>
                        </>
                      )}
                    </div>
                  ))}

                {isProva && isPendente ? (
                  <div className="rounded-lg border border-blue-200 bg-blue-50/40 p-4">
                    <p className="text-sm! text-blue-900! mb-1! font-semibold!">
                      A correção desta prova é automática.
                    </p>
                    <p className="text-xs! text-blue-800! mb-0!">
                      A nota é calculada pelo sistema com base no gabarito e
                      será atualizada assim que o processamento for concluído.
                    </p>
                  </div>
                ) : null}

                {showCorrectionHistory ? (
                  <section className="rounded-xl border border-emerald-200 bg-emerald-50/30 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-emerald-100 text-emerald-700">
                          <CheckCircle2 className="h-4 w-4" />
                        </span>
                        <div>
                          <p className="text-xs! font-semibold! uppercase tracking-wide text-emerald-700! mb-0!">
                            Última correção
                          </p>
                          <p className="text-xs! text-emerald-700/80! mb-0!">
                            Histórico da última atualização da nota.
                          </p>
                        </div>
                      </div>
                      <Badge className="border border-emerald-200 bg-emerald-100 text-emerald-700">
                        Concluída
                      </Badge>
                    </div>

                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      <div className="rounded-lg border border-emerald-200/70 bg-white p-3">
                        <p className="text-xs! font-medium! text-slate-500! mb-1!">
                          Corrigido em
                        </p>
                        <p className="text-sm! font-semibold! text-slate-900! mb-0!">
                          {formatDateTime(respostaDetalhe.corrigidoEm)}
                        </p>
                      </div>

                      <div className="rounded-lg border border-emerald-200/70 bg-white p-3">
                        <p className="text-xs! font-medium! text-slate-500! mb-1!">
                          Corrigido por
                        </p>
                        <p className="text-sm! font-semibold! text-slate-900! mb-0!">
                          {respostaDetalhe.corrigidoPor?.nome || "Sistema"}
                        </p>
                      </div>
                    </div>
                  </section>
                ) : null}
                </section>
              ) : null}
            </div>
          )}
        </ModalBody>

        <ModalFooter className="border-t border-slate-200 bg-white px-6 py-4 flex-row! items-center! justify-end! gap-2!">
          <ButtonCustom variant="outline" onClick={onClose}>
            Fechar
          </ButtonCustom>
          {isActionStateResolving ? (
            <Skeleton className="h-10 w-44 rounded-md" />
          ) : (
            <>
              {showStartCorrectionButton ? (
                <ButtonCustom
                  variant="primary"
                  onClick={() => setIsEditingPendente(true)}
                  className="gap-2"
                >
                  <PencilLine className="h-4 w-4" />
                  {correctionActionLabel}
                </ButtonCustom>
              ) : null}
              {showEditButton ? (
                <ButtonCustom
                  variant="secondary"
                  onClick={() => setIsEditingCorrigida(true)}
                  className="gap-2"
                >
                  <PencilLine className="h-4 w-4" />
                  Editar
                </ButtonCustom>
              ) : null}
              {showSaveButton ? (
                <ButtonCustom
                  variant="primary"
                  onClick={onSubmit}
                  disabled={isSubmitting || isLoading}
                  className="gap-2"
                >
                  <Save className="h-4 w-4" />
                  {isSubmitting ? "Salvando..." : "Salvar correção"}
                </ButtonCustom>
              ) : null}
            </>
          )}
        </ModalFooter>
      </ModalContentWrapper>
    </ModalCustom>
  );
}
