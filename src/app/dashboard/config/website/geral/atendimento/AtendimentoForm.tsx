"use client";

import { FormEvent, useEffect, useState } from "react";
import { ButtonCustom } from "@/components/ui/custom";
import { DateTimeCustom } from "@/components/ui/custom/date-time";
import { toastCustom } from "@/components/ui/custom/toast";
import { TagsSelector } from "@/components/ui/custom/tags-selector";
import {
  listInformacoesGerais,
  createInformacoesGerais,
  updateInformacoesGerais,
} from "@/api/websites/components/informacoes-gerais";
import type { InformacoesGeraisBackendResponse } from "@/api/websites/components/informacoes-gerais/types";
import { Skeleton } from "@/components/ui/skeleton";

const DAYS = [
  { value: "SEG", label: "Segunda" },
  { value: "TER", label: "Terça" },
  { value: "QUA", label: "Quarta" },
  { value: "QUI", label: "Quinta" },
  { value: "SEX", label: "Sexta" },
  { value: "SAB", label: "Sábado" },
  { value: "DOM", label: "Domingo" },
] as const;

type DayKey = typeof DAYS[number]["value"];

const API_DAY: Record<DayKey, string> = {
  SEG: "segunda",
  TER: "terca",
  QUA: "quarta",
  QUI: "quinta",
  SEX: "sexta",
  SAB: "sabado",
  DOM: "domingo",
};

const NAME_TO_KEY: Record<string, DayKey> = {
  segunda: "SEG",
  terca: "TER",
  terça: "TER",
  quarta: "QUA",
  quinta: "QUI",
  sexta: "SEX",
  sabado: "SAB",
  sábado: "SAB",
  domingo: "DOM",
};

export default function AtendimentoForm() {
  const [id, setId] = useState<string | null>(null);
  const [selectedDays, setSelectedDays] = useState<DayKey[]>([]);
  const [hours, setHours] = useState<Record<DayKey, { from: string; to: string }>>({} as any);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await listInformacoesGerais({
          headers: { Accept: "application/json" },
        });
        const first: InformacoesGeraisBackendResponse | undefined = data[0];
        if (first && mounted) {
          setId(first.id);
          const sel: DayKey[] = [];
          const hrs: Record<DayKey, { from: string; to: string }> = {} as any;

          if (Array.isArray(first.horarios) && first.horarios.length > 0) {
            for (const h of first.horarios) {
              const key = NAME_TO_KEY[(h.diaDaSemana || "").toLowerCase()];
              if (!key) continue;
              sel.push(key);
              hrs[key] = {
                from: h.horarioInicio || "",
                to: h.horarioFim || "",
              };
            }
          } else if (first.horarioDeFuncionamento) {
            // Fallback legado: "Seg 08:00 às 18:00 | Ter 09:00 às 17:00"
            const horario = first.horarioDeFuncionamento || "";
            const parts = horario
              .split("|")
              .map((p) => p.trim())
              .filter(Boolean);
            const dayMap: Record<string, DayKey> = {
              Seg: "SEG",
              Ter: "TER",
              Qua: "QUA",
              Qui: "QUI",
              Sex: "SEX",
              Sáb: "SAB",
              Dom: "DOM",
            };
            for (const part of parts) {
              const m = part.match(/^(Seg|Ter|Qua|Qui|Sex|Sáb|Dom)\s+(\d{2}:\d{2})\s*(?:às|-)\s*(\d{2}:\d{2})/);
              if (m) {
                const key = dayMap[m[1]];
                sel.push(key);
                hrs[key] = { from: m[2], to: m[3] };
              }
            }
          }

          if (sel.length) setSelectedDays(sel);
          if (Object.keys(hrs).length) setHours(hrs);
        }
      } catch {
        // ignore fetch errors
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (selectedDays.length === 0) {
      toastCustom.error("Selecione pelo menos um dia");
      return;
    }
    for (const d of selectedDays) {
      const h = hours[d];
      if (!h?.from || !h?.to) {
        toastCustom.error("Preencha horários para todos os dias selecionados");
        return;
      }
    }
    const display: Record<DayKey, string> = {
      SEG: "Seg",
      TER: "Ter",
      QUA: "Qua",
      QUI: "Qui",
      SEX: "Sex",
      SAB: "Sáb",
      DOM: "Dom",
    };
    // Novo payload: array de horários
    const horarios = selectedDays.map((d) => ({
      diaDaSemana: API_DAY[d],
      horarioInicio: hours[d].from,
      horarioFim: hours[d].to,
    }));
    try {
      const payload = { horarios } as any;
      if (id) {
        await updateInformacoesGerais(id, payload);
      } else {
        const created = await createInformacoesGerais(payload);
        setId(created.id);
      }
      toastCustom.success("Horário salvo");
    } catch {
      toastCustom.error("Erro ao salvar horário");
    }
  };

  // dias estáticos (sem memo para manter ordem de hooks estável)

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-medium required">Dias de atendimento</label>
        <TagsSelector
          options={DAYS.map((d) => ({ id: d.value, label: d.label }))}
          value={selectedDays}
          onChange={(ids) => {
            const cast = ids as DayKey[];
            // remove horas de dias que saíram
            setHours((prev) => {
              const next = { ...prev } as Record<DayKey, { from: string; to: string }>;
              (Object.keys(next) as DayKey[]).forEach((k) => {
                if (!cast.includes(k)) delete (next as any)[k];
              });
              return next;
            });
            setSelectedDays(cast);
          }}
        />
      </div>

      {selectedDays.length > 0 && (
        <div className="space-y-4">
          {/* Cabeçalho: 3 colunas fixas na mesma linha */}
          <div className="grid grid-cols-3 gap-3 text-xs font-medium text-muted-foreground px-1">
            <span>Dia</span>
            <span>De</span>
            <span>Até</span>
          </div>
          {selectedDays.map((d) => {
            const current = hours[d] || { from: "", to: "" };
            const fromM = (() => {
              const m = current.from.match(/^(\d{2}):(\d{2})$/);
              return m ? parseInt(m[1], 10) * 60 + parseInt(m[2], 10) : null;
            })();
            const toM = (() => {
              const m = current.to.match(/^(\d{2}):(\d{2})$/);
              return m ? parseInt(m[1], 10) * 60 + parseInt(m[2], 10) : null;
            })();
            const invalid = fromM !== null && toM !== null && toM <= fromM;

            return (
              <div key={d} className="grid grid-cols-3 gap-3 items-center rounded-lg border border-gray-900/20 p-3">
                <span className="text-sm font-medium text-muted-foreground">
                  {DAYS.find((x) => x.value === d)?.label}
                </span>
                <div>
                  <DateTimeCustom
                    mode="time"
                    required
                    value={current.from}
                    onChange={(val) =>
                      setHours((prev) => {
                        const next = { ...prev, [d]: { ...current, from: val } } as typeof prev;
                        if (!val) {
                          // limpa "até" quando não há início
                          (next as any)[d].to = "";
                        }
                        return next;
                      })
                    }
                  />
                </div>
                <div>
                  <DateTimeCustom
                    mode="time"
                    required
                    disabled={!current.from}
                    value={current.to}
                    onChange={(val) =>
                      setHours((prev) => ({ ...prev, [d]: { ...current, to: val } }))
                    }
                  />
                </div>
                {invalid && (
                  <div className="col-span-3">
                    <span className="mt-1 inline-flex items-center gap-1.5 rounded-full border border-red-500/15 bg-red-500/5 px-2 py-1 text-[11px] leading-4 text-red-600">
                      <svg width="12" height="12" viewBox="0 0 24 24" className="opacity-80"><path fill="currentColor" d="M12 2a10 10 0 1 0 10 10A10.011 10.011 0 0 0 12 2m1 15h-2v-2h2zm0-4h-2V7h2z"/></svg>
                      O término precisa ser posterior ao início.
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="pt-4 flex justify-end">
        <ButtonCustom type="submit" size="lg" variant="default" className="w-40" withAnimation>
          Salvar
        </ButtonCustom>
      </div>
    </form>
  );
}
