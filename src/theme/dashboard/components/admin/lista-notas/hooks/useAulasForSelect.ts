"use client";

import { useQuery } from "@tanstack/react-query";
import { listAulas, type Aula } from "@/api/aulas";
import type { SelectOption } from "@/components/ui/custom/select/types";
import { getMockAulasForTurma } from "@/mockData/notas";

type AulaLite = Pick<Aula, "id" | "titulo" | "codigo">;

function toOption(a: AulaLite): SelectOption {
  const codigo = a.codigo ? ` • ${a.codigo}` : "";
  return { value: a.id, label: `${a.titulo}${codigo}` };
}

export function useAulasForSelect(params: { turmaId: string | null }) {
  const { turmaId } = params;

  const query = useQuery<AulaLite[], Error>({
    queryKey: ["notas", "aulas-for-select", turmaId],
    queryFn: async () => {
      const res = await listAulas({ turmaId: turmaId as string, page: 1, pageSize: 100 });
      const items = (res.data ?? []).map((a) => ({
        id: a.id,
        titulo: a.titulo,
        codigo: a.codigo,
      }));
      if (items.length > 0) return items;
      // Fallback: mock
      return getMockAulasForTurma({ turmaId: turmaId as string }).map((m) => ({
        id: m.id,
        titulo: m.titulo,
        codigo: m.codigo,
      }));
    },
    enabled: Boolean(turmaId),
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  const items = query.data ?? [];
  const options = items.map(toOption).sort((a, b) => a.label.localeCompare(b.label, "pt-BR"));
  const labelById = new Map(items.map((a) => [a.id, a.titulo]));

  return {
    ...query,
    options,
    labelById,
  };
}
