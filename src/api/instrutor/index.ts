import { apiFetch } from "@/api/client";
import type {
  InstrutorOverviewCards,
  InstrutorOverviewData,
  InstrutorOverviewMetricasGerais,
  InstrutorOverviewResponse,
  InstrutorOverviewStatusPorCategoria,
} from "./types";

const INSTRUTOR_ROUTES = {
  OVERVIEW: "/api/v1/instrutor/overview",
} as const;

type InstrutorOverviewApiResponse = {
  success?: boolean;
  data?: Partial<InstrutorOverviewData>;
  code?: string;
  message?: string;
};

function toNumber(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeMetricasGerais(
  value?: Partial<InstrutorOverviewMetricasGerais>
): InstrutorOverviewMetricasGerais {
  return {
    totalAlunos: toNumber(value?.totalAlunos),
    totalProvas: toNumber(value?.totalProvas),
    totalNotasPendentes: toNumber(value?.totalNotasPendentes),
    totalNotasLancadas: toNumber(value?.totalNotasLancadas),
    totalCursos: toNumber(value?.totalCursos),
    totalTurmas: toNumber(value?.totalTurmas),
    totalAulas: toNumber(value?.totalAulas),
    totalEventosAgenda: toNumber(value?.totalEventosAgenda),
  };
}

function normalizeCards(value?: Partial<InstrutorOverviewCards>): InstrutorOverviewCards {
  return {
    alunos: {
      total: toNumber(value?.alunos?.total),
      ativos: toNumber(value?.alunos?.ativos),
    },
    provas: {
      total: toNumber(value?.provas?.total),
      pendentesCorrecao: toNumber(value?.provas?.pendentesCorrecao),
    },
    notas: {
      pendentes: toNumber(value?.notas?.pendentes),
      lancadas: toNumber(value?.notas?.lancadas),
    },
    cursos: {
      total: toNumber(value?.cursos?.total),
    },
    aulas: {
      total: toNumber(value?.aulas?.total),
      hoje: toNumber(value?.aulas?.hoje),
    },
    agenda: {
      eventos: toNumber(value?.agenda?.eventos),
      proximos7Dias: toNumber(value?.agenda?.proximos7Dias),
    },
  };
}

function normalizeStatusPorCategoria(
  value?: Partial<InstrutorOverviewStatusPorCategoria>
): InstrutorOverviewStatusPorCategoria {
  return {
    alunos: {
      ativos: toNumber(value?.alunos?.ativos),
      inativos: toNumber(value?.alunos?.inativos),
      total: toNumber(value?.alunos?.total),
    },
    provas: {
      abertas: toNumber(value?.provas?.abertas),
      encerradas: toNumber(value?.provas?.encerradas),
      total: toNumber(value?.provas?.total),
    },
    notas: {
      pendentes: toNumber(value?.notas?.pendentes),
      concluidas: toNumber(value?.notas?.concluidas),
      total: toNumber(value?.notas?.total),
    },
    aulas: {
      agendadas: toNumber(value?.aulas?.agendadas),
      realizadas: toNumber(value?.aulas?.realizadas),
      total: toNumber(value?.aulas?.total),
    },
  };
}

function normalizeData(payload?: Partial<InstrutorOverviewData>): InstrutorOverviewData {
  const atualizadoEm =
    typeof payload?.atualizadoEm === "string" && payload.atualizadoEm.trim()
      ? payload.atualizadoEm
      : null;

  return {
    metricasGerais: normalizeMetricasGerais(payload?.metricasGerais),
    cards: normalizeCards(payload?.cards),
    statusPorCategoria: normalizeStatusPorCategoria(payload?.statusPorCategoria),
    atualizadoEm,
  };
}

/**
 * Busca a visão geral escopada do instrutor.
 */
export async function getInstrutorOverview(
  init?: RequestInit
): Promise<InstrutorOverviewResponse> {
  const response = await apiFetch<InstrutorOverviewApiResponse>(
    INSTRUTOR_ROUTES.OVERVIEW,
    {
      init: {
        method: "GET",
        ...(init ?? {}),
      },
      cache: "no-cache",
      retries: 2,
      timeout: 15000,
    }
  );

  if (!response?.success) {
    throw new Error(
      response?.message || "Resposta inválida da API de visão geral do instrutor"
    );
  }

  return {
    success: true,
    data: normalizeData(response.data),
  };
}

export * from "./types";
