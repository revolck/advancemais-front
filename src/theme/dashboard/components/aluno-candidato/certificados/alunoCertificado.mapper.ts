import type { TurmaCertificado } from "@/api/cursos";

export interface AlunoCertificadoListItem {
  id: string;
  key: string;
  codigo: string;
  cursoId: string;
  cursoNome: string;
  turmaId: string;
  turmaNome: string;
  inscricaoId: string;
  alunoId: string;
  emitidoEm: string;
  pdfUrl?: string | null;
  previewUrl?: string | null;
  templateId?: string;
}

export function mapMeuCertificadoToListItem(
  item: TurmaCertificado
): AlunoCertificadoListItem {
  return {
    id: item.id,
    key: item.id,
    codigo: item.codigo || item.numero || "—",
    cursoId: item.curso?.id || item.cursoId || "",
    cursoNome: item.curso?.nome || "Curso",
    turmaId: item.turma?.id || item.turmaId || "",
    turmaNome: item.turma?.nome || "Turma",
    inscricaoId: item.inscricaoId || "",
    alunoId: item.aluno?.id || item.alunoId || "",
    emitidoEm: item.emitidoEm,
    pdfUrl: item.pdfUrl || null,
    previewUrl: item.previewUrl || null,
    templateId: item.modelo?.id || item.templateId,
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
