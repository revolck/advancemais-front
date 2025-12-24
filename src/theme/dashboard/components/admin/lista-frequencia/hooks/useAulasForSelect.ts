"use client";

import { useQuery } from "@tanstack/react-query";
import { listAulas, type Aula } from "@/api/aulas";
import type { SelectOption } from "@/components/ui/custom/select/types";
import { getMockAulasForTurma } from "@/mockData/notas";
import { getMockModalidadeForTurmaId } from "@/mockData/frequencia";

export interface AulaSelectItem {
  id: string;
  titulo: string;
  codigo?: string;
  modalidade: Aula["modalidade"];
  dataInicio?: string;
  dataFim?: string;
  duracaoMinutos: number;
}

function toOption(a: AulaSelectItem): SelectOption {
  const codigo = a.codigo ? ` • ${a.codigo}` : "";
  return { value: a.id, label: `${a.titulo}${codigo}` };
}

export function useAulasForSelect(params: { turmaId: string | null }) {
  const { turmaId } = params;

  const query = useQuery<AulaSelectItem[], Error>({
    queryKey: ["frequencia", "aulas-for-select", turmaId],
    queryFn: async () => {
      let data: Aula[] = [];
      try {
        const res = await listAulas({
          turmaId: turmaId as string,
          page: 1,
          pageSize: 100,
        });
        data = res.data ?? [];
      } catch {
        data = [];
      }
      const mapped = data.map((a) => ({
        id: a.id,
        titulo: a.titulo,
        codigo: a.codigo,
        modalidade: a.modalidade,
        dataInicio: a.dataInicio ?? undefined,
        dataFim: a.dataFim ?? undefined,
        duracaoMinutos: Number(a.duracaoMinutos ?? 60),
      }));
      if (mapped.length > 0) return mapped;

      // fallback: mock
      const modalidade = getMockModalidadeForTurmaId(turmaId as string);
      return getMockAulasForTurma({ turmaId: turmaId as string }).map((m) => ({
        id: m.id,
        titulo: m.titulo,
        codigo: m.codigo ?? undefined,
        modalidade,
        dataInicio: new Date(Date.now() - 2 * 86400000).toISOString(),
        dataFim: new Date(Date.now() - 2 * 86400000 + 60 * 60000).toISOString(),
        duracaoMinutos: 60,
      }));
    },
    enabled: Boolean(turmaId),
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  const items = query.data ?? [];
  const options = items
    .map(toOption)
    .sort((a, b) => a.label.localeCompare(b.label, "pt-BR"));

  return {
    ...query,
    items,
    options,
    itemById: new Map(items.map((a) => [a.id, a])),
  };
}
