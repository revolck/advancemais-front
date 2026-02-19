import type { TurmaProva } from "@/api/cursos";

export interface AvaliacaoActionRestrictions {
  canPublish: boolean;
  publishReason?: string;
  canEdit: boolean;
  editReason?: string;
  canDelete: boolean;
  deleteReason?: string;
}

function isValidDate(value: Date): boolean {
  return !Number.isNaN(value.getTime());
}

function getTurmaVinculada(prova: TurmaProva): boolean {
  if (typeof prova.turmaId === "string" && prova.turmaId.trim()) return true;
  if (typeof prova.turma === "object" && prova.turma?.id) return true;
  return false;
}

export function getInicioAvaliacaoDate(prova: TurmaProva): Date | null {
  const baseDateRaw = prova.dataInicio || prova.inicioPrevisto || prova.data;
  if (!baseDateRaw) return null;

  const baseDate = new Date(baseDateRaw);
  if (!isValidDate(baseDate)) return null;

  const hasTimeInBase = /T\d{2}:\d{2}/.test(baseDateRaw);
  if (!hasTimeInBase && prova.horaInicio) {
    const [hoursStr, minutesStr] = prova.horaInicio.split(":");
    const hours = Number(hoursStr);
    const minutes = Number(minutesStr);
    if (Number.isFinite(hours) && Number.isFinite(minutes)) {
      baseDate.setHours(hours, minutes, 0, 0);
    }
  }

  return baseDate;
}

export function canManageQuestoes(
  prova: TurmaProva,
  options?: { hasRespostas?: boolean }
): boolean {
  void options;
  const hasTurma = getTurmaVinculada(prova);
  const status = String(prova.status || "").toUpperCase();
  return status === "RASCUNHO" || !(status === "PUBLICADA" && hasTurma);
}

export function getAvaliacaoActionRestrictions(
  prova: TurmaProva,
  options?: {
    hasRespostas?: boolean;
  }
): AvaliacaoActionRestrictions {
  void options;
  const hasTurma = getTurmaVinculada(prova);
  const status = String(prova.status || "").toUpperCase();
  const canEdit = status === "RASCUNHO" || !(status === "PUBLICADA" && hasTurma);
  const editReason =
    canEdit
      ? undefined
      : "Não é possível editar uma atividade/prova publicada vinculada a turma.";

  const canPublish = hasTurma;
  const publishReason = canPublish
    ? undefined
    : "Para publicar, vincule a atividade/prova a uma turma.";

  return {
    canPublish,
    publishReason,
    canEdit,
    editReason,
    canDelete: false,
    deleteReason: "Não é possível excluir atividades/provas nesta tela.",
  };
}
