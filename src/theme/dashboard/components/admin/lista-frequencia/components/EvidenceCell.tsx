"use client";

import React, { useMemo } from "react";
import { formatDistanceToNowStrict } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { AulaSelectItem } from "../hooks/useAulasForSelect";
import type { FrequenciaListItem } from "../hooks/useFrequenciaDashboardQuery";

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
  aula: AulaSelectItem;
  item: FrequenciaListItem;
}) {
  const { aula, item } = props;

  const modalidade = aula.modalidade;
  const duracao = Math.max(1, Number(aula.duracaoMinutos ?? 60));
  const end = useMemo(() => getAulaEndDate(aula), [aula]);

  const watched = Number(item.evidence?.tempoAoVivoMin ?? 0);
  const ultimoLogin = item.evidence?.ultimoLogin ?? null;
  const ultimoLoginDate = useMemo(() => {
    if (!ultimoLogin) return null;
    const d = new Date(ultimoLogin);
    return Number.isNaN(d.getTime()) ? null : d;
  }, [ultimoLogin]);

  if (modalidade === "PRESENCIAL") {
    return (
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm text-gray-900">Sem evidência automática</div>
          <div className="text-xs text-gray-500">Aula presencial • lançamento manual</div>
        </div>
        <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
          Manual
        </Badge>
      </div>
    );
  }

  if (modalidade === "AO_VIVO") {
    const required = Math.min(Math.round(duracao * 0.7), 45);
    const pct = Math.max(0, Math.min(100, Math.round((watched / duracao) * 100)));
    const ok = watched >= required;

    return (
      <Tooltip disableHoverableContent>
        <TooltipTrigger asChild>
          <div className="cursor-default space-y-1.5">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-sm text-gray-900">
                  Assistiu{" "}
                  <span className="font-medium tabular-nums">{watched} min</span>{" "}
                  <span className="text-xs text-gray-500 tabular-nums">de {duracao} min</span>
                </div>
                <div className="text-xs text-gray-500 tabular-nums">
                  Mínimo sugerido: {required} min
                </div>
              </div>
              <Badge
                variant="outline"
                className={cn(
                  "shrink-0 px-2 py-0.5 text-[11px]",
                  ok
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-red-50 text-red-700 border-red-200"
                )}
              >
                {ok ? "Suficiente" : "Insuficiente"}
              </Badge>
            </div>
            <Progress value={pct} className="h-1.5 w-40" />
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
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-sm text-gray-900">
                {relative ? (
                  <>
                    Último acesso: <span className="font-medium">{relative}</span>
                  </>
                ) : (
                  <span className="font-medium text-gray-700">Sem acesso registrado</span>
                )}
              </div>
              <div className="text-xs text-gray-500">
                {windowEnd ? `Prazo: ${formatShortDateFromDate(windowEnd)}` : "Prazo indisponível"}
              </div>
            </div>
            <Badge
              variant="outline"
              className={cn("shrink-0 px-2 py-0.5 text-[11px]", badgeClass)}
            >
              {badgeLabel}
            </Badge>
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
