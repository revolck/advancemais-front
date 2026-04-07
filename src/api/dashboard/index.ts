/**
 * API de Dashboard - Visão Geral da Plataforma
 * Consome o endpoint backend consolidado e normaliza o payload
 * para o contrato usado pelos componentes atuais.
 */

import { apiFetch } from "@/api/client";
import { dashboardRoutes } from "@/api/routes";
import type {
  PlataformaOverviewData,
  PlataformaOverviewResponse,
} from "./types";

type OverviewRoleItem = {
  role?: string;
  total?: number;
};

type OverviewApiResponse = {
  success?: boolean;
  data?: {
    metricasGerais?: {
      totalUsuarios?: number;
      totalCursos?: number;
      totalEmpresas?: number;
      totalVagas?: number;
    };
    cards?: {
      cursos?: { total?: number; publicados?: number; turmasAtivas?: number };
      alunos?: { total?: number; concluidos?: number };
      instrutores?: { total?: number; ativos?: number };
      empresas?: { total?: number; ativas?: number };
      vagas?: { publicadas?: number; emAnalise?: number; encerradas?: number };
    };
    usuariosPorTipo?: {
      total?: number;
      items?: OverviewRoleItem[];
    };
    statusPorCategoria?: {
      usuarios?: {
        ativo?: number;
        bloqueado?: number;
        inativo?: number;
        pendente?: number;
        suspenso?: number;
        total?: number;
        // Compat com contratos antigos
        ativos?: number;
        bloqueados?: number;
        inativos?: number;
        pendentes?: number;
      };
      cursos?: { publicado?: number; encerrado?: number };
      empresas?: { ativo?: number; bloqueado?: number };
      vagas?: { publicado?: number; encerrado?: number };
    };
  };
  message?: string;
};

function mapRolesToPorTipo(items?: OverviewRoleItem[]) {
  const seed = {
    alunos: 0,
    instrutores: 0,
    empresas: 0,
    candidatos: 0,
    admins: 0,
    moderadores: 0,
  };

  if (!Array.isArray(items)) return seed;

  return items.reduce((acc, item) => {
    const role = item.role ?? "";
    const value = Number(item.total ?? 0);
    switch (role) {
      case "ALUNO":
        acc.alunos += value;
        break;
      case "INSTRUTOR":
        acc.instrutores += value;
        break;
      case "EMPRESA":
        acc.empresas += value;
        break;
      case "ALUNO_CANDIDATO":
        acc.candidatos += value;
        break;
      case "ADMIN":
        acc.admins += value;
        break;
      case "MODERADOR":
        acc.moderadores += value;
        break;
      default:
        break;
    }
    return acc;
  }, seed);
}

function normalizeOverviewData(payload: OverviewApiResponse["data"]): PlataformaOverviewData {
  const metricas = payload?.metricasGerais ?? {};
  const cards = payload?.cards ?? {};
  const status = payload?.statusPorCategoria ?? {};
  const usuariosPorTipo = mapRolesToPorTipo(payload?.usuariosPorTipo?.items);

  const usuariosStatus = status.usuarios ?? {};
  const totalUsuarios =
    Number(
      metricas.totalUsuarios ??
        usuariosStatus.total ??
        payload?.usuariosPorTipo?.total ??
        0
    ) || 0;

  return {
    metricasGerais: {
      totalCursos: Number(metricas.totalCursos ?? cards.cursos?.total ?? 0),
      cursosPublicados: Number(cards.cursos?.publicados ?? 0),
      cursosRascunho: 0,
      totalTurmas: 0,
      turmasAtivas: Number(cards.cursos?.turmasAtivas ?? 0),
      turmasInscricoesAbertas: 0,
      totalUsuarios,
      totalAlunos: Number(cards.alunos?.total ?? usuariosPorTipo.alunos),
      totalAlunosAtivos: 0,
      totalAlunosInscritos: 0,
      totalAlunosConcluidos: Number(cards.alunos?.concluidos ?? 0),
      totalInstrutores: Number(cards.instrutores?.total ?? usuariosPorTipo.instrutores),
      totalInstrutoresAtivos: Number(cards.instrutores?.ativos ?? 0),
      totalCandidatos: Number(usuariosPorTipo.candidatos),
      totalCandidatosAtivos: 0,
      totalEmpresas: Number(metricas.totalEmpresas ?? cards.empresas?.total ?? 0),
      empresasAtivas: Number(cards.empresas?.ativas ?? status.empresas?.ativo ?? 0),
      empresasBloqueadas: Number(status.empresas?.bloqueado ?? 0),
      empresasPendentes: 0,
      totalVagas: Number(metricas.totalVagas ?? 0),
      vagasPublicadas: Number(cards.vagas?.publicadas ?? status.vagas?.publicado ?? 0),
      vagasEmAnalise: Number(cards.vagas?.emAnalise ?? 0),
      vagasEncerradas: Number(cards.vagas?.encerradas ?? status.vagas?.encerrado ?? 0),
      faturamentoMesAtual: 0,
      faturamentoMesAnterior: 0,
      totalTransacoes: 0,
      transacoesAprovadas: 0,
      transacoesPendentes: 0,
    },
      usuarios: {
      porTipo: usuariosPorTipo,
      porStatus: {
        ativos: Number(usuariosStatus.ativo ?? usuariosStatus.ativos ?? 0),
        inativos: Number(usuariosStatus.inativo ?? usuariosStatus.inativos ?? 0),
        bloqueados: Number(
          usuariosStatus.bloqueado ?? usuariosStatus.bloqueados ?? 0
        ),
        pendentes: Number(
          usuariosStatus.pendente ?? usuariosStatus.pendentes ?? 0
        ),
      },
      crescimentoMensal: [],
    },
    cursos: {
      porStatus: {
        publicados: Number(cards.cursos?.publicados ?? status.cursos?.publicado ?? 0),
        rascunho: 0,
        despublicados: Number(status.cursos?.encerrado ?? 0),
      },
      porCategoria: [],
      crescimentoMensal: [],
    },
    empresas: {
      porStatus: {
        ativas: Number(cards.empresas?.ativas ?? status.empresas?.ativo ?? 0),
        bloqueadas: Number(status.empresas?.bloqueado ?? 0),
        pendentes: 0,
        inativas: 0,
      },
      porPlano: [],
      crescimentoMensal: [],
    },
    vagas: {
      porStatus: {
        publicadas: Number(cards.vagas?.publicadas ?? status.vagas?.publicado ?? 0),
        emAnalise: Number(cards.vagas?.emAnalise ?? 0),
        encerradas: Number(cards.vagas?.encerradas ?? status.vagas?.encerrado ?? 0),
        pausadas: 0,
      },
      crescimentoMensal: [],
    },
    faturamento: {
      porMes: [],
      porCategoria: [],
      topCursos: [],
    },
  };
}

/**
 * Obtém visão geral completa da plataforma a partir do endpoint consolidado.
 */
export async function getPlataformaOverview(
  init?: RequestInit
): Promise<PlataformaOverviewResponse> {
  const response = await apiFetch<OverviewApiResponse>(dashboardRoutes.overview(), {
    init: {
      method: "GET",
      ...(init ?? {}),
    },
    cache: "no-cache",
  });

  if (!response?.success || !response.data) {
    throw new Error(response?.message || "Resposta inválida da API de overview");
  }

  return {
    success: true,
    data: normalizeOverviewData(response.data),
  };
}

export * from "./financeiro";
export type * from "./types";
