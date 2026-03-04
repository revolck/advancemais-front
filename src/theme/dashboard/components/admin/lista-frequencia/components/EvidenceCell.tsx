"use client";

import React, { useMemo } from "react";
import { formatDistanceToNowStrict } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { AulaSelectItem } from "../hooks/useAulasForSelect";
import type { FrequenciaListItem } from "../hooks/useFrequenciaDashboardQuery";

function suggestionLabel(status?: FrequenciaListItem["statusAtual"]): string {
  switch (status) {
    case "PRESENTE":
      return "Presente";
    case "AUSENTE":
      return "Ausente";
    case "ATRASADO":
      return "Atrasado";
    case "JUSTIFICADO":
      return "Justificado";
    default:
      return "Pendente";
  }
}

function suggestionClass(status?: FrequenciaListItem["statusAtual"]): string {
  switch (status) {
    case "PRESENTE":
      return "text-emerald-700";
    case "AUSENTE":
      return "text-red-700";
    case "ATRASADO":
    case "JUSTIFICADO":
      return "text-amber-700";
    default:
      return "text-gray-600";
  }
}

function formatShortDateFromDate(d: Date): string {
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatShortDateTimeFromDate(d: Date): string {
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getAulaEndDate(aula: Pick<AulaSelectItem, "dataFim" | "dataInicio" | "duracaoMinutos">): Date | null {
  const end = aula.dataFim ? new Date(aula.dataFim) : null;
  if (end && !Number.isNaN(end.getTime())) return end;
  if (aula.dataInicio) {
    const start = new Date(aula.dataInicio);
    if (Number.isNaN(start.getTime())) return null;
    const dur = Number(aula.duracaoMinutos ?? 0);
    if (Number.isFinite(dur) && dur > 0) {
      return new Date(start.getTime() + dur * 60000);
    }
    return start;
  }
  return null;
}

export function EvidenceCell(props: {
  aula?: AulaSelectItem | null;
  item: FrequenciaListItem;
}) {
  const { aula, item } = props;

  const modalidade = aula?.modalidade;
  const duracao = Math.max(1, Number(aula?.duracaoMinutos ?? 60));
  const end = useMemo(
    () => (aula ? getAulaEndDate(aula) : null),
    [aula]
  );

  const watched = Number(
    item.evidence?.minutosEngajados ?? item.minutosPresenca ?? 0
  );
  const ultimoLogin =
    item.evidence?.ultimoAcessoEm ??
    item.evidence?.primeiroAcessoEm ??
    null;
  const ultimoLoginDate = useMemo(() => {
    if (!ultimoLogin) return null;
    const d = new Date(ultimoLogin);
    return Number.isNaN(d.getTime()) ? null : d;
  }, [ultimoLogin]);

  if (item.tipoOrigem === "PROVA" || item.tipoOrigem === "ATIVIDADE") {
    const sugestao = item.evidence?.statusSugerido ?? "PENDENTE";
    const hasEvidence =
      Boolean(item.evidence?.respondeu) ||
      Boolean(item.evidence?.acessou) ||
      watched > 0;

    return (
      <Tooltip disableHoverableContent>
        <TooltipTrigger asChild>
          <div className="cursor-default space-y-1">
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={cn(
                  "text-[11px]",
                  hasEvidence
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-gray-50 text-gray-600 border-gray-200"
                )}
              >
                {hasEvidence ? "Com evidência" : "Sem evidência"}
              </Badge>
              <span className={cn("text-[11px] font-medium", suggestionClass(sugestao))}>
                Sugestão: {suggestionLabel(sugestao)}
              </span>
            </div>
            <div className="text-xs text-gray-500 tabular-nums">
              {item.evidence?.respondeu ? "Resposta enviada" : "Sem resposta"} • {watched} min
              {typeof item.minimoMinutosParaPresenca === "number"
                ? ` • ref. ${item.minimoMinutosParaPresenca}`
                : ""}
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent sideOffset={8} className="max-w-sm">
          <div className="space-y-1 text-xs leading-relaxed">
            <div>
              Origem: <b>{item.origemTitulo ?? "Não informada"}</b>
            </div>
            <div>
              Evidência: <b>{hasEvidence ? "Detectada" : "Não detectada"}</b>
            </div>
            <div>
              Resposta: <b>{item.evidence?.respondeu ? "Enviada" : "Não enviada"}</b>
            </div>
            <div>
              Sugestão automática: <b>{suggestionLabel(sugestao)}</b>
            </div>
            <div>
              Engajamento: <b>{watched} min</b>
              {typeof item.minimoMinutosParaPresenca === "number"
                ? ` • Referência: ${item.minimoMinutosParaPresenca} min`
                : ""}
            </div>
            {item.evidence?.primeiroAcessoEm && (
              <div>
                Primeiro acesso:{" "}
                <b>{formatShortDateTimeFromDate(new Date(item.evidence.primeiroAcessoEm))}</b>
              </div>
            )}
            {item.evidence?.ultimoAcessoEm && (
              <div>
                Último acesso:{" "}
                <b>{formatShortDateTimeFromDate(new Date(item.evidence.ultimoAcessoEm))}</b>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    );
  }

  if (!aula || !modalidade) {
    const sugestao = item.evidence?.statusSugerido;
    const hasEvidence = Boolean(item.evidence?.acessou) || watched > 0;

    return (
      <Tooltip disableHoverableContent>
        <TooltipTrigger asChild>
          <div className="cursor-default space-y-1">
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={cn(
                  "text-[11px]",
                  hasEvidence
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-gray-50 text-gray-600 border-gray-200"
                )}
              >
                {hasEvidence ? "Com evidência" : "Sem evidência"}
              </Badge>
              {sugestao && (
                <span className={cn("text-[11px] font-medium", suggestionClass(sugestao))}>
                  Sugestão: {suggestionLabel(sugestao)}
                </span>
              )}
            </div>
            <div className="text-xs text-gray-500 tabular-nums">
              Engajamento: {watched} min
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent sideOffset={8} className="max-w-sm">
          <div className="space-y-1 text-xs leading-relaxed">
            <div>
              Origem: <b>{item.origemTitulo ?? "Não informada"}</b>
            </div>
            <div>
              Evidência: <b>{hasEvidence ? "Detectada" : "Não detectada"}</b>
            </div>
            {sugestao && (
              <div>
                Sugestão automática: <b>{suggestionLabel(sugestao)}</b>
              </div>
            )}
            <div>
              Engajamento: <b>{watched} min</b>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    );
  }

  if (modalidade === "PRESENCIAL") {
    return (
      <Tooltip disableHoverableContent>
        <TooltipTrigger asChild>
          <div className="cursor-default space-y-1">
            <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 text-[11px]">
              Manual
            </Badge>
            <div className="text-xs text-gray-500">Aula presencial (sem rastreio automático)</div>
          </div>
        </TooltipTrigger>
        <TooltipContent sideOffset={8} className="max-w-sm">
          <div className="space-y-1 text-xs leading-relaxed">
            <div>
              Modalidade: <b>Presencial</b>
            </div>
            <div>
              Evidência automática: <b>Não aplicável</b>
            </div>
            <div>
              Lançamento recomendado: <b>Manual pelo instrutor</b>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    );
  }

  if (modalidade === "AO_VIVO") {
    const required = Math.min(Math.round(duracao * 0.7), 45);
    const ok = watched >= required;

    return (
      <Tooltip disableHoverableContent>
        <TooltipTrigger asChild>
          <div className="cursor-default space-y-1">
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={cn(
                  "text-[11px]",
                  ok
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-red-50 text-red-700 border-red-200"
                )}
              >
                {ok ? "Dentro do mínimo" : "Abaixo do mínimo"}
              </Badge>
            </div>
            <div className="text-xs text-gray-500 tabular-nums">
              Engajamento: {watched}/{duracao} min • ref. {required} min
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent sideOffset={8} className="max-w-sm">
          <div className="space-y-1 text-xs leading-relaxed">
            <div>
              Ao vivo: referência de presença a partir de <b>{required} min</b> assistidos.
            </div>
            <div>
              Assistido: <b>{watched} min</b> • Duração: <b>{duracao} min</b>
            </div>
            {ultimoLoginDate && (
              <div>
                Último login: <b>{formatShortDateTimeFromDate(ultimoLoginDate)}</b>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    );
  }

  // ONLINE / SEMIPRESENCIAL
  const windowDays = 7;
  const windowEnd = end ? new Date(end.getTime() + windowDays * 86400000) : null;
  const within =
    Boolean(end && windowEnd && ultimoLoginDate) &&
    (ultimoLoginDate as Date).getTime() >= (end as Date).getTime() &&
    (ultimoLoginDate as Date).getTime() <= (windowEnd as Date).getTime();

  const relative = ultimoLoginDate
    ? formatDistanceToNowStrict(ultimoLoginDate, { locale: ptBR, addSuffix: true })
    : null;

  const badgeLabel = !ultimoLoginDate ? "Sem acesso" : within ? "No prazo" : "Fora do prazo";
  const badgeClass = !ultimoLoginDate
    ? "bg-gray-50 text-gray-700 border-gray-200"
    : within
    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
    : "bg-red-50 text-red-700 border-red-200";

  return (
    <Tooltip disableHoverableContent>
      <TooltipTrigger asChild>
        <div className="cursor-default space-y-1">
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={cn("px-2 py-0.5 text-[11px]", badgeClass)}
            >
              {badgeLabel}
            </Badge>
            <span className={cn("text-[11px] font-medium", suggestionClass(within ? "PRESENTE" : "PENDENTE"))}>
              Sugestão: {within ? "Presente" : "Pendente"}
            </span>
          </div>
          <div className="text-xs text-gray-500">
            {relative ? `Último acesso ${relative}` : "Sem acesso registrado"}
            {windowEnd ? ` • prazo ${formatShortDateFromDate(windowEnd)}` : ""}
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent sideOffset={8} className="max-w-sm">
        <div className="space-y-1 text-xs leading-relaxed">
          <div>
            Em cursos online, o acesso dentro do prazo ajuda a orientar o lançamento de presença.
          </div>
          <div>
            Prazo: até <b>{windowDays} dias</b> após o fim da aula.
          </div>
          {end && (
            <div>
              Fim da aula: <b>{formatShortDateTimeFromDate(end)}</b>
            </div>
          )}
          {windowEnd && (
            <div>
              Prazo final: <b>{formatShortDateTimeFromDate(windowEnd)}</b>
            </div>
          )}
          {ultimoLoginDate && (
            <div>
              Último acesso: <b>{formatShortDateTimeFromDate(ultimoLoginDate)}</b>
            </div>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
