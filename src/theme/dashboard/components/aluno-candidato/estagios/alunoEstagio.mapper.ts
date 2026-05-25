import type { Estagio, EstagioStatus } from "@/api/cursos";

export interface AlunoEstagioListItem {
  id: string;
  key: string;
  cursoId: string;
  cursoNome: string;
  turmaId: string;
  turmaNome: string;
  inscricaoId: string;
  alunoId: string;
  empresaNome: string;
  empresaTelefone?: string;
  cep: string;
  rua: string;
  numero: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  dataInicioPrevista: string;
  dataFimPrevista: string;
  horarioInicio: string;
  horarioFim: string;
  status: EstagioStatus;
  observacoes?: string | null;
}

export function mapMeuEstagioToListItem(item: Estagio): AlunoEstagioListItem {
  return {
    id: item.id,
    key: item.id,
    cursoId: item.cursoId,
    cursoNome: item.cursoNome ?? "Curso",
    turmaId: item.turmaId,
    turmaNome: item.turmaNome ?? "Turma",
    inscricaoId: item.inscricaoId ?? "",
    alunoId: item.alunoId ?? "",
    empresaNome: item.empresaNome ?? "—",
    empresaTelefone: item.empresaTelefone,
    cep: item.cep ?? "—",
    rua: item.rua ?? "—",
    numero: item.numero ?? "",
    bairro: item.bairro,
    cidade: item.cidade,
    estado: item.estado,
    dataInicioPrevista: item.dataInicioPrevista ?? "",
    dataFimPrevista: item.dataFimPrevista ?? "",
    horarioInicio: item.horarioInicio ?? "—",
    horarioFim: item.horarioFim ?? "—",
    status: item.status,
    observacoes: item.observacoes,
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
