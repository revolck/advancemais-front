"use client";

import { FormEvent, useEffect, useState } from "react";
import { InputCustom, ButtonCustom } from "@/components/ui/custom";
import { toastCustom } from "@/components/ui/custom/toast";
import { Checkbox } from "@/components/ui/checkbox";
import {
  listInformacoesGerais,
  createInformacoesGerais,
  updateInformacoesGerais,
} from "@/api/websites/components/informacoes-gerais";
import type { InformacoesGeraisBackendResponse } from "@/api/websites/components/informacoes-gerais/types";
import { Skeleton } from "@/components/ui/skeleton";

export default function AtendimentoForm() {
  const [id, setId] = useState<string | null>(null);
  const [weekdayFrom, setWeekdayFrom] = useState("08:00");
  const [weekdayTo, setWeekdayTo] = useState("20:00");
  const [saturdayFrom, setSaturdayFrom] = useState("09:00");
  const [saturdayTo, setSaturdayTo] = useState("13:00");
  const [closedSaturday, setClosedSaturday] = useState(false);
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
          if (first.horarioDeFuncionamento) {
            const horario = first.horarioDeFuncionamento;
            const segMatch = horario.match(/Seg-Sex\s(\d{2}:\d{2})\sàs\s(\d{2}:\d{2})/);
            const sabMatch = horario.match(/Sáb\s(\d{2}:\d{2})\sàs\s(\d{2}:\d{2})/);
            const sabFechado = /Sáb\sfechado/i.test(horario);
            if (segMatch) {
              setWeekdayFrom(segMatch[1]);
              setWeekdayTo(segMatch[2]);
            }
            if (sabMatch) {
              setSaturdayFrom(sabMatch[1]);
              setSaturdayTo(sabMatch[2]);
            }
            if (sabFechado) setClosedSaturday(true);
          }
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
    const horario = closedSaturday
      ? `Seg-Sex ${weekdayFrom} às ${weekdayTo} | Sáb fechado`
      : `Seg-Sex ${weekdayFrom} às ${weekdayTo} | Sáb ${saturdayFrom} às ${saturdayTo}`;
    try {
      const payload = { horarioDeFuncionamento: horario };
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

  if (loading) {
    return (
      <div className="space-y-4 max-w-lg">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
      <div className="flex gap-2">
        <InputCustom
          label="Seg-Sex de"
          mask="time"
          value={weekdayFrom}
          onChange={(e) => setWeekdayFrom(e.target.value)}
          required
        />
        <InputCustom
          label="Seg-Sex até"
          mask="time"
          value={weekdayTo}
          onChange={(e) => setWeekdayTo(e.target.value)}
          required
        />
      </div>
      <div className="flex items-center gap-2">
        <Checkbox
          checked={closedSaturday}
          onCheckedChange={(v) => setClosedSaturday(!!v)}
          id="saturdayClosed"
        />
        <label htmlFor="saturdayClosed" className="text-sm">
          Sábado não funciona
        </label>
      </div>
      {!closedSaturday && (
        <div className="flex gap-2">
          <InputCustom
            label="Sáb de"
            mask="time"
            value={saturdayFrom}
            onChange={(e) => setSaturdayFrom(e.target.value)}
            required
          />
          <InputCustom
            label="Sáb até"
            mask="time"
            value={saturdayTo}
            onChange={(e) => setSaturdayTo(e.target.value)}
            required
          />
        </div>
      )}
      <ButtonCustom type="submit">Salvar</ButtonCustom>
    </form>
  );
}

