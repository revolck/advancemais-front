import type { TurmaProva } from "@/api/cursos";
import {
  getAvaliacaoStatusEfetivo,
  hasTurmaVinculadaAvaliacao,
} from "../../lista-atividades-provas/utils/avaliacaoStatus";
import { isInstrutorOwnerOrCreator } from "../../lista-atividades-provas/utils/instrutorScope";

export interface AvaliacaoActionRestrictions {
  canPublish: boolean;
  publishReason?: string;
  canEdit: boolean;
  editReason?: string;
  canDelete: boolean;
  deleteReason?: string;
  canManage: boolean;
  manageReason?: string;
}

const PERFIS_GESTAO_AVALIACAO = ["ADMIN", "MODERADOR", "PEDAGOGICO", "INSTRUTOR"];

function isValidDate(value: Date): boolean {
  return !Number.isNaN(value.getTime());
}

export function isInstrutorVinculadoAAvaliacao(
  prova: TurmaProva,
  userId?: string | null
): boolean {
  return isInstrutorOwnerOrCreator(prova, userId);
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

export function isAvaliacaoJaIniciadaOuRealizada(
  prova: TurmaProva,
  options?: { hasRespostas?: boolean; now?: Date }
): boolean {
  const status = getAvaliacaoStatusEfetivo(prova);
  if (status === "EM_ANDAMENTO" || status === "CONCLUIDA") return true;

  if (options?.hasRespostas) return true;

  const inicio = getInicioAvaliacaoDate(prova);
  if (!inicio) return false;

  const now = options?.now ?? new Date();
  return inicio.getTime() <= now.getTime();
}

export function validarPermissaoGestaoAvaliacao(
  prova: TurmaProva,
  userRole?: string | null,
  userId?: string | null
): { podeGerenciar: boolean; motivo?: string } {
  if (!userRole) {
    return {
      podeGerenciar: false,
      motivo: "Você não tem permissão para esta avaliação.",
    };
  }

  const role = userRole.toUpperCase();
  if (!PERFIS_GESTAO_AVALIACAO.includes(role)) {
    return {
      podeGerenciar: false,
      motivo: "Você não tem permissão para esta avaliação.",
    };
  }

  if (role === "INSTRUTOR" && !isInstrutorVinculadoAAvaliacao(prova, userId)) {
    return {
      podeGerenciar: false,
      motivo: "Você não tem permissão para esta avaliação.",
    };
  }

  return { podeGerenciar: true };
}

export function canManageQuestoes(
  prova: TurmaProva,
  options?: { hasRespostas?: boolean; userRole?: string | null; userId?: string | null }
): boolean {
  const permissao = validarPermissaoGestaoAvaliacao(
    prova,
    options?.userRole,
    options?.userId
  );
  if (!permissao.podeGerenciar) return false;

  const hasTurma = hasTurmaVinculadaAvaliacao(prova);
  const status = getAvaliacaoStatusEfetivo(prova);
  return status === "RASCUNHO" || !(status === "PUBLICADA" && hasTurma);
}

export function getAvaliacaoActionRestrictions(
  prova: TurmaProva,
  options?: {
    hasRespostas?: boolean;
    userRole?: string | null;
    userId?: string | null;
  }
): AvaliacaoActionRestrictions {
  const permissao = validarPermissaoGestaoAvaliacao(
    prova,
    options?.userRole,
    options?.userId
  );
  const jaIniciadaOuRealizada = isAvaliacaoJaIniciadaOuRealizada(prova, options);
  const hasTurma = hasTurmaVinculadaAvaliacao(prova);

  const canEdit = permissao.podeGerenciar && !jaIniciadaOuRealizada;
  const editReason = !permissao.podeGerenciar
    ? permissao.motivo
    : jaIniciadaOuRealizada
    ? "A avaliação já iniciou ou já foi realizada e não pode mais ser editada."
    : undefined;

  const status = getAvaliacaoStatusEfetivo(prova);
  const isPublicada = status === "PUBLICADA";
  const canPublish =
    permissao.podeGerenciar &&
    !jaIniciadaOuRealizada &&
    (isPublicada || hasTurma);
  const publishReason = !permissao.podeGerenciar
    ? permissao.motivo
    : jaIniciadaOuRealizada
    ? "A avaliação já iniciou ou já foi realizada e não pode ser publicada/despublicada."
    : !hasTurma && !isPublicada
    ? "Vincule uma turma antes de publicar esta avaliação."
    : undefined;

  return {
    canManage: permissao.podeGerenciar,
    manageReason: permissao.motivo,
    canPublish,
    publishReason,
    canEdit,
    editReason,
    canDelete: permissao.podeGerenciar && !jaIniciadaOuRealizada,
    deleteReason: !permissao.podeGerenciar
      ? permissao.motivo
      : jaIniciadaOuRealizada
      ? "A avaliação já iniciou ou já foi realizada e não pode ser excluída."
      : undefined,
  };
}
