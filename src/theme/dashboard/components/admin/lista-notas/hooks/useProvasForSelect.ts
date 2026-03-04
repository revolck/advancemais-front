"use client";

import { useQuery } from "@tanstack/react-query";
import { listProvas, type TurmaProva } from "@/api/cursos";
import type { SelectOption } from "@/components/ui/custom/select/types";

export type ProvaTipo = "PROVA" | "ATIVIDADE";

function toOption(p: TurmaProva): SelectOption {
  const titulo = p.titulo || p.nome || "Sem título";
  const codigo = p.codigo?.trim() || "";
  const etiqueta = p.etiqueta?.trim() || "";
  return {
    value: p.id,
    label: titulo,
    searchKeywords: [titulo, codigo, etiqueta].filter(Boolean),
  };
}

export function useProvasForSelect(params: {
  cursoId: string | null;
  turmaId: string | null;
  tipo?: ProvaTipo | null;
}) {
  const { cursoId, turmaId, tipo } = params;

  const query = useQuery<TurmaProva[], Error>({
    queryKey: ["notas", "provas-for-select", cursoId, turmaId],
    queryFn: async () => {
      const res: unknown = await listProvas(cursoId as string, turmaId as string);
      if (Array.isArray(res) && res.length > 0) return res as TurmaProva[];
      if (res && typeof res === "object" && "data" in (res as any)) {
        const data = (res as any).data;
        if (Array.isArray(data) && data.length > 0) return data as TurmaProva[];
      }
      return [];
    },
    enabled: Boolean(cursoId && turmaId),
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  const items = Array.isArray(query.data) ? query.data : [];
  const filtered =
    tipo && items.length > 0
      ? items.filter((p) => (p.tipo ? p.tipo === tipo : true))
      : items;

  const options = filtered.map(toOption).sort((a, b) => a.label.localeCompare(b.label, "pt-BR"));
  const labelById = new Map(filtered.map((p) => [p.id, p.titulo || p.nome || null]));

  return {
    ...query,
    options,
    labelById,
  };
}
