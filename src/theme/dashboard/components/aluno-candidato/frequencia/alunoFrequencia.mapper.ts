import type { Frequencia } from "@/api/cursos";

export type AlunoFrequenciaStatus = "PRESENTE" | "AUSENTE";

export interface AlunoFrequenciaListItem {
  id: string;
  key: string;
  cursoId: string;
  cursoNome: string;
  turmaId: string;
  turmaNome: string;
  aulaId: string;
  aulaNome: string;
  inscricaoId: string;
  alunoId: string;
  statusAtual: AlunoFrequenciaStatus;
  justificativa?: string | null;
  observacoes?: string | null;
  dataReferencia: string;
  evidence?: {
    ultimoLogin?: string | null;
    tempoAoVivoMin?: number | null;
  } | null;
}

export function mapMinhaFrequenciaToListItem(
  item: Frequencia
): AlunoFrequenciaListItem {
  const id = item.id ?? item.syntheticId ?? item.naturalKey?.origemId ?? "";
  return {
    id,
    key: id,
    cursoId: item.cursoId,
    cursoNome: (item as Frequencia & { cursoNome?: string }).cursoNome ?? "Curso",
    turmaId: item.turmaId,
    turmaNome: (item as Frequencia & { turmaNome?: string }).turmaNome ?? "Turma",
    aulaId: item.aulaId ?? item.origemId ?? "",
    aulaNome: item.origemTitulo ?? "Aula",
    inscricaoId: item.inscricaoId,
    alunoId: item.alunoId ?? "",
    statusAtual: item.status === "PRESENTE" ? "PRESENTE" : "AUSENTE",
    justificativa: item.justificativa,
    observacoes: item.observacoes,
    dataReferencia: item.dataReferencia ?? item.criadoEm,
    evidence: item.evidencia
      ? {
          ultimoLogin: item.evidencia.ultimoAcessoEm,
          tempoAoVivoMin: item.evidencia.minutosEngajados,
        }
      : null,
  };
}

export function toApiDate(value: Date | string | null | undefined) {
  if (!value) return null;
  if (typeof value === "string") return value.slice(0, 10);
  return Number.isNaN(value.getTime()) ? null : value.toISOString().slice(0, 10);
}

export function shouldShowAlunoDataAsEmptyState(error: unknown) {
  const status = (error as { status?: number } | null)?.status;
  return status === 403 || status === 404;
}
