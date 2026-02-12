"use client";

import { useCallback, useEffect, useState } from "react";
import { listAulas } from "@/api/aulas";
import { listAvaliacoes } from "@/api/cursos";
import { extractListFromApiResponse, pickTitulo } from "./templatesForTurma.utils";

type AulaTemplate = {
  id: string;
  codigo?: string;
  titulo: string;
  modalidade?: string;
  status?: string;
  instrutorId?: string;
  cursoId?: string | null;
  dataInicio?: string;
  dataFim?: string;
  descricao?: string;
  duracaoMinutos?: number;
  obrigatoria?: boolean;
  tipoLink?: string;
  youtubeUrl?: string;
  horaInicio?: string;
  horaFim?: string;
  sala?: string;
  gravarAula?: boolean;
  materiais?: unknown;
  moduloId?: string | null;
};

type AvaliacaoTemplate = {
  id: string;
  codigo?: string;
  titulo: string;
  tipo: "ATIVIDADE" | "PROVA";
  modalidade?: string;
  status?: string;
  recuperacaoFinal?: boolean;
  instrutorId?: string;
  cursoId?: string | null;
  dataInicio?: string;
  dataFim?: string;
  horaInicio?: string;
  horaTermino?: string;
  obrigatoria?: boolean;
  valePonto?: boolean;
  duracaoMinutos?: number;
  tipoAtividade?: string | null;
  peso?: number;
  descricao?: string;
  etiqueta?: string;
  moduloId?: string | null;
};

const normalizeAvaliacaoTipo = (
  raw: unknown
): "ATIVIDADE" | "PROVA" => {
  const normalized = String(raw || "").toUpperCase();
  if (normalized.includes("ATIV")) return "ATIVIDADE";
  if (normalized.includes("PROVA")) return "PROVA";
  if (normalized.includes("AVAL")) return "PROVA";
  return "PROVA";
};

export function useTemplatesForTurma(params?: {
  cursoId?: string | null;
  turmaId?: string | null;
  includeTurma?: boolean;
}) {
  const cursoId = params?.cursoId ?? null;
  const turmaId = params?.turmaId ?? null;
  const includeTurma = Boolean(params?.includeTurma && turmaId);

  const [aulas, setAulas] = useState<AulaTemplate[]>([]);
  const [avaliacoes, setAvaliacoes] = useState<AvaliacaoTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTemplates = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const page = 1;
      // Alguns backends limitam pageSize (ex.: 100). 200 pode causar 400.
      const pageSize = 100;

      let aulasRes: Awaited<ReturnType<typeof listAulas>>;
      let avalRes: Awaited<ReturnType<typeof listAvaliacoes>>;

      // Templates para builder:
      // - sempre filtra por itens sem turma vinculada (templates)
      // - quando `cursoId` é informado, o backend pode retornar templates do curso + templates sem curso
      [aulasRes, avalRes] = await Promise.all([
        listAulas({
          semTurma: true,
          page,
          pageSize,
          ...(cursoId ? { cursoId } : {}),
        }),
        listAvaliacoes({
          semTurma: true,
          page,
          pageSize,
          ...(cursoId ? { cursoId } : {}),
        }),
      ]);

      // A API pode variar o shape:
      // - Aulas: { data: Aula[], pagination: ... }
      // - Aulas: { success, data: Aula[], pagination }
      // - Aulas: { success, data: { data: Aula[], pagination } }
      const aulasRaw: any = aulasRes as any;
      const avalRaw: any = avalRes as any;

      const aulasList: any[] = extractListFromApiResponse(aulasRaw);
      const avalList: any[] = extractListFromApiResponse(avalRaw);

      let aulasMerged = aulasList;
      let avalMerged = avalList;

      if (includeTurma && turmaId) {
        const [aulasTurmaRes, avalTurmaRes] = await Promise.all([
          listAulas({
            turmaId,
            page,
            pageSize,
          }),
          listAvaliacoes({
            turmaId,
            page,
            pageSize,
          }),
        ]);

        const aulasTurma = extractListFromApiResponse(aulasTurmaRes as any);
        const avalTurma = extractListFromApiResponse(avalTurmaRes as any);

        const aulasMap = new Map<string, any>();
        (aulasList || []).forEach((a: any) => aulasMap.set(String(a.id), a));
        (aulasTurma || []).forEach((a: any) => aulasMap.set(String(a.id), a));
        aulasMerged = Array.from(aulasMap.values());

        const avalMap = new Map<string, any>();
        (avalList || []).forEach((a: any) => avalMap.set(String(a.id), a));
        (avalTurma || []).forEach((a: any) => avalMap.set(String(a.id), a));
        avalMerged = Array.from(avalMap.values());
      }

      setAulas(
        (aulasMerged || []).map((a: any) => ({
          id: String(a.id),
          codigo: a.codigo,
          titulo: pickTitulo(a),
          modalidade: a.modalidade ?? undefined,
          status: a.status,
          instrutorId: a.instrutorId ?? a.instrutor?.id ?? undefined,
          cursoId: a.cursoId ?? null,
          dataInicio: a.dataInicio ?? undefined,
          dataFim: a.dataFim ?? undefined,
          descricao: a.descricao ?? undefined,
          duracaoMinutos:
            typeof a.duracaoMinutos === "number"
              ? a.duracaoMinutos
              : undefined,
          obrigatoria:
            typeof a.obrigatoria === "boolean" ? a.obrigatoria : undefined,
          tipoLink: a.tipoLink ?? undefined,
          youtubeUrl: a.youtubeUrl ?? undefined,
          horaInicio: a.horaInicio ?? undefined,
          horaFim: a.horaFim ?? undefined,
          sala: a.sala ?? undefined,
          gravarAula:
            typeof a.gravarAula === "boolean" ? a.gravarAula : undefined,
          materiais: a.materiais ?? undefined,
          moduloId: a.moduloId ?? a.modulo?.id ?? null,
        }))
      );

      setAvaliacoes(
        (avalMerged || []).map((x: any) => ({
          id: String(x.id),
          codigo: x.codigo,
          titulo: pickTitulo(x),
          tipo: normalizeAvaliacaoTipo(
            x.tipo ?? x.tipoAvaliacao ?? x.tipo_avaliacao ?? x.tipoAtividade
          ),
          modalidade: x.modalidade ?? undefined,
          status: x.status,
          instrutorId: x.instrutorId ?? x.instrutor?.id ?? undefined,
          recuperacaoFinal: x.recuperacaoFinal,
          cursoId: x.cursoId ?? null,
          dataInicio: x.dataInicio ?? undefined,
          dataFim: x.dataFim ?? undefined,
          horaInicio: x.horaInicio ?? undefined,
          horaTermino: x.horaTermino ?? undefined,
          obrigatoria:
            typeof x.obrigatoria === "boolean" ? x.obrigatoria : undefined,
          valePonto:
            typeof x.valePonto === "boolean" ? x.valePonto : undefined,
          duracaoMinutos:
            typeof x.duracaoMinutos === "number"
              ? x.duracaoMinutos
              : undefined,
          tipoAtividade: x.tipoAtividade ?? undefined,
          peso: typeof x.peso === "number" ? x.peso : undefined,
          descricao: x.descricao ?? undefined,
          etiqueta: x.etiqueta ?? undefined,
          moduloId: x.moduloId ?? null,
        }))
      );

      if (process.env.NODE_ENV === "development") {
        console.log("[TURMA_TEMPLATES] Carregado:", {
          aulas: aulasMerged.length,
          avaliacoes: avalMerged.length,
          aulasShape: {
            hasDataArray: Array.isArray(aulasRaw?.data),
            hasNestedDataArray: Array.isArray(aulasRaw?.data?.data),
          },
          avaliacoesShape: {
            hasDataArray: Array.isArray(avalRaw?.data),
            hasNestedDataArray: Array.isArray(avalRaw?.data?.data),
          },
        });
      }
    } catch (err) {
      const status = (err as any)?.status as number | undefined;
      const msg = err instanceof Error ? err.message : String(err);
      if (status === 404 || /não encontrado|not found/i.test(msg)) {
        setError(null);
      } else {
        console.warn("Aviso: falha ao carregar templates:", msg);
        setError(msg || "Erro ao carregar templates");
      }
      setAulas([]);
      setAvaliacoes([]);
    } finally {
      setIsLoading(false);
    }
  }, [cursoId, includeTurma, turmaId]);

  useEffect(() => {
    void fetchTemplates();
  }, [fetchTemplates]);

  return { aulas, avaliacoes, isLoading, error, refetch: fetchTemplates };
}
