import type {
  MinhasNotasCursoFilter,
  NotaHistoryEvent,
  NotaLancamento,
  NotaOrigem,
} from "@/api/cursos";

export interface AlunoNotaListItem {
  key: string;
  notaId?: string | null;
  historicoNotaId?: string | null;
  historicoDisponivel?: boolean;
  cursoId: string;
  cursoNome: string;
  turmaId: string;
  turmaNome: string;
  inscricaoId?: string;
  alunoId: string;
  nota: number | null;
  atualizadoEm: string;
  motivo?: string | null;
  origem?: NotaOrigem | null;
  isManual: boolean;
  history: NotaHistoryEvent[];
}

export function mapMinhaNotaToListItem(nota: NotaLancamento): AlunoNotaListItem {
  const notaWithLegacy = nota as NotaLancamento & {
    cursoNome?: string | null;
    turmaNome?: string | null;
    notaId?: string | null;
    historicoNotaId?: string | null;
    historicoDisponivel?: boolean;
  };

  return {
    key: `${nota.cursoId}::${nota.turmaId}::${nota.inscricaoId}`,
    notaId: notaWithLegacy.notaId ?? notaWithLegacy.id ?? null,
    historicoNotaId:
      notaWithLegacy.historicoNotaId ??
      notaWithLegacy.notaId ??
      notaWithLegacy.id ??
      null,
    historicoDisponivel:
      notaWithLegacy.historicoDisponivel ??
      (Boolean(
        notaWithLegacy.historicoNotaId ??
          notaWithLegacy.notaId ??
          notaWithLegacy.id
      ) ||
        (nota.history?.length ?? 0) > 0),
    cursoId: nota.cursoId,
    cursoNome: notaWithLegacy.cursoNome || nota.cursoId,
    turmaId: nota.turmaId,
    turmaNome: notaWithLegacy.turmaNome || nota.turmaId,
    inscricaoId: nota.inscricaoId,
    alunoId: nota.alunoId,
    nota: nota.nota,
    atualizadoEm: nota.atualizadoEm,
    motivo: nota.motivo,
    origem: nota.origem,
    isManual: nota.isManual,
    history: nota.history ?? [],
  };
}

export function mapMinhasNotasCursosToOptions(cursos: MinhasNotasCursoFilter[]) {
  return cursos.map((curso) => ({
    value: curso.id,
    label: curso.codigo ? `${curso.nome} • ${curso.codigo}` : curso.nome,
  }));
}

export function toApiDate(value: Date | string | null | undefined) {
  if (!value) return null;
  if (typeof value === "string") {
    return value.slice(0, 10);
  }
  if (Number.isNaN(value.getTime())) return null;
  return value.toISOString().slice(0, 10);
}

export function shouldShowNotasAsEmptyState(error: unknown) {
  const status = (error as { status?: number } | null)?.status;
  return status === 403 || status === 404;
}
