/**
 * API de Dashboard - Visão Geral da Plataforma
 * Agrega dados de múltiplas APIs para criar uma visão geral completa
 */

import { getVisaoGeral } from "@/api/cursos";
import { listAlunosDashboard, listInstrutores, listUsuarios } from "@/api/usuarios";
import { getAdminCompanyDashboard } from "@/api/empresas/admin";
import { listVagas } from "@/api/vagas/admin";
import type { PlataformaOverviewResponse } from "./types";

/**
 * Obtém visão geral completa da plataforma
 * Agrega dados de cursos, usuários, empresas e vagas
 */
export async function getPlataformaOverview(
  init?: RequestInit
): Promise<PlataformaOverviewResponse> {
  try {
    // Busca dados de múltiplas APIs em paralelo
    const [
      cursosVisaoGeral,
      alunosResponse,
      instrutoresResponse,
      usuariosResponse,
      empresasResponse,
      vagasResponse,
    ] = await Promise.allSettled([
      getVisaoGeral(),
      listAlunosDashboard({ page: 1 }),
      listInstrutores({ page: 1, limit: 1 }),
      listUsuarios({ page: 1, limit: 1 }),
      getAdminCompanyDashboard({ page: 1 }),
      listVagas({ page: 1, pageSize: 1 }),
    ]);

    // Extrai dados de cursos
    const cursosData =
      cursosVisaoGeral.status === "fulfilled" && cursosVisaoGeral.value.success
        ? cursosVisaoGeral.value.data
        : null;

    // Extrai dados de alunos
    const alunosData =
      alunosResponse.status === "fulfilled"
        ? alunosResponse.value
        : null;

    // Extrai dados de instrutores
    const instrutoresData =
      instrutoresResponse.status === "fulfilled"
        ? instrutoresResponse.value
        : null;

    // Extrai dados de usuários
    const usuariosData =
      usuariosResponse.status === "fulfilled"
        ? usuariosResponse.value
        : null;

    // Extrai dados de empresas
    const empresasData =
      empresasResponse.status === "fulfilled"
        ? empresasResponse.value
        : null;

    // Extrai dados de vagas
    const vagasData =
      vagasResponse.status === "fulfilled"
        ? vagasResponse.value
        : null;

    // Agrega métricas gerais
    const metricasGerais = {
      // Cursos (da visão geral de cursos)
      totalCursos: cursosData?.metricasGerais.totalCursos || 0,
      cursosPublicados: cursosData?.metricasGerais.cursosPublicados || 0,
      cursosRascunho: cursosData?.metricasGerais.cursosRascunho || 0,
      totalTurmas: cursosData?.metricasGerais.totalTurmas || 0,
      turmasAtivas: cursosData?.metricasGerais.turmasAtivas || 0,
      turmasInscricoesAbertas: cursosData?.metricasGerais.turmasInscricoesAbertas || 0,

      // Alunos
      totalAlunos: alunosData?.pagination?.total || 0,
      totalAlunosAtivos: cursosData?.metricasGerais.totalAlunosAtivos || 0,
      totalAlunosInscritos: cursosData?.metricasGerais.totalAlunosInscritos || 0,
      totalAlunosConcluidos: cursosData?.metricasGerais.totalAlunosConcluidos || 0,

      // Instrutores
      totalInstrutores: instrutoresData?.pagination?.total || 0,
      totalInstrutoresAtivos:
        instrutoresData?.data?.filter((i) => i.status === "ATIVO").length || 0,

      // Candidatos (via usuários com role ALUNO_CANDIDATO)
      totalCandidatos: usuariosData?.usuarios?.filter((u: any) => u.role === "ALUNO_CANDIDATO").length || 0,
      totalCandidatosAtivos:
        usuariosData?.usuarios?.filter(
          (u: any) => u.role === "ALUNO_CANDIDATO" && u.status === "ATIVO"
        ).length || 0,

      // Usuários totais
      totalUsuarios: usuariosData?.pagination?.total || 0,

      // Empresas
      totalEmpresas:
        empresasResponse.status === "fulfilled" &&
        empresasData !== null &&
        !Array.isArray(empresasData) &&
        "pagination" in empresasData
          ? empresasData.pagination.total
          : Array.isArray(empresasData)
          ? empresasData.length
          : empresasData?.data?.length || 0,
      empresasAtivas:
        (empresasResponse.status === "fulfilled" &&
        empresasData !== null &&
        !Array.isArray(empresasData) &&
        "data" in empresasData
          ? empresasData.data
          : Array.isArray(empresasData)
          ? empresasData
          : []
        ).filter((e: any) => e.status === "ATIVO").length || 0,
      empresasBloqueadas:
        (empresasResponse.status === "fulfilled" &&
        empresasData !== null &&
        !Array.isArray(empresasData) &&
        "data" in empresasData
          ? empresasData.data
          : Array.isArray(empresasData)
          ? empresasData
          : []
        ).filter((e: any) => e.status === "BLOQUEADO").length || 0,
      empresasPendentes:
        (empresasResponse.status === "fulfilled" &&
        empresasData !== null &&
        !Array.isArray(empresasData) &&
        "data" in empresasData
          ? empresasData.data
          : Array.isArray(empresasData)
          ? empresasData
          : []
        ).filter((e: any) => e.status === "PENDENTE").length || 0,

      // Vagas
      totalVagas: Array.isArray(vagasData)
        ? vagasData.length
        : vagasData?.pagination?.total || vagasData?.data?.length || 0,
      vagasPublicadas:
        (Array.isArray(vagasData)
          ? vagasData
          : vagasData?.data || []
        ).filter((v: any) => v.status === "PUBLICADO").length || 0,
      vagasEmAnalise:
        (Array.isArray(vagasData)
          ? vagasData
          : vagasData?.data || []
        ).filter((v: any) => v.status === "EM_ANALISE").length || 0,
      vagasEncerradas:
        (Array.isArray(vagasData)
          ? vagasData
          : vagasData?.data || []
        ).filter((v: any) => v.status === "ENCERRADA").length || 0,

      // Financeiro (da visão geral de cursos)
      faturamentoMesAtual: cursosData?.faturamento.faturamentoMesAtual || 0,
      faturamentoMesAnterior: cursosData?.faturamento.faturamentoMesAnterior || 0,
      totalTransacoes:
        cursosData?.faturamento.cursoMaiorFaturamento?.totalTransacoes || 0,
      transacoesAprovadas:
        cursosData?.faturamento.cursoMaiorFaturamento?.transacoesAprovadas || 0,
      transacoesPendentes:
        cursosData?.faturamento.cursoMaiorFaturamento?.transacoesPendentes || 0,
    };

    // Estatísticas de usuários (simplificado)
    const usuariosStats = {
      porTipo: {
        alunos: alunosData?.pagination?.total || 0,
        instrutores: instrutoresData?.pagination?.total || 0,
        empresas:
          empresasData !== null &&
          !Array.isArray(empresasData) &&
          "pagination" in empresasData
            ? empresasData.pagination.total
            : Array.isArray(empresasData)
            ? empresasData.length
            : empresasData?.data?.length || 0,
        candidatos:
          usuariosData?.usuarios?.filter((u: any) => u.role === "ALUNO_CANDIDATO").length || 0,
        admins:
          usuariosData?.usuarios?.filter((u: any) => u.role === "ADMIN").length || 0,
        moderadores:
          usuariosData?.usuarios?.filter((u: any) => u.role === "MODERADOR").length || 0,
      },
      porStatus: {
        ativos:
          usuariosData?.usuarios?.filter((u: any) => u.status === "ATIVO").length || 0,
        inativos:
          usuariosData?.usuarios?.filter((u: any) => u.status === "INATIVO").length || 0,
        bloqueados:
          usuariosData?.usuarios?.filter((u: any) => u.status === "BLOQUEADO").length || 0,
        pendentes:
          usuariosData?.usuarios?.filter((u: any) => u.status === "PENDENTE").length || 0,
      },
      crescimentoMensal: [], // TODO: Buscar dados históricos quando disponível
    };

    // Estatísticas de cursos (simplificado)
    const cursosStats = {
      porStatus: {
        publicados: metricasGerais.cursosPublicados,
        rascunho: metricasGerais.cursosRascunho,
        despublicados: 0, // TODO: Buscar quando disponível
      },
      porCategoria: [], // TODO: Buscar categorias quando disponível
      crescimentoMensal: [], // TODO: Buscar dados históricos quando disponível
    };

    // Estatísticas de empresas (simplificado)
    const empresasStats = {
      porStatus: {
        ativas: metricasGerais.empresasAtivas,
        bloqueadas: metricasGerais.empresasBloqueadas,
        pendentes: metricasGerais.empresasPendentes,
        inativas:
          (empresasResponse.status === "fulfilled" &&
          empresasData !== null &&
          !Array.isArray(empresasData) &&
          "data" in empresasData
            ? empresasData.data
            : Array.isArray(empresasData)
            ? empresasData
            : []
          ).filter((e: any) => e.status === "INATIVO").length || 0,
      },
      porPlano: [], // TODO: Buscar planos quando disponível
      crescimentoMensal: [], // TODO: Buscar dados históricos quando disponível
    };

    // Estatísticas de vagas (simplificado)
    const vagasStats = {
      porStatus: {
        publicadas: metricasGerais.vagasPublicadas,
        emAnalise: metricasGerais.vagasEmAnalise,
        encerradas: metricasGerais.vagasEncerradas,
        pausadas:
          (Array.isArray(vagasData)
            ? vagasData
            : vagasData?.data || []
          ).filter((v: any) => v.status === "PAUSADA").length || 0,
      },
      crescimentoMensal: [], // TODO: Buscar dados históricos quando disponível
    };

    // Estatísticas de faturamento (da visão geral de cursos)
    const faturamentoStats = {
      porMes: [], // TODO: Buscar dados históricos quando disponível
      porCategoria: [], // TODO: Buscar por categoria quando disponível
      topCursos:
        cursosData?.faturamento.topCursosFaturamento.map((c) => ({
          cursoId: c.cursoId,
          cursoNome: c.cursoNome,
          cursoCodigo: c.cursoCodigo,
          faturamento: c.totalFaturamento,
        })) || [],
    };

    const response: PlataformaOverviewResponse = {
      success: true,
      data: {
        metricasGerais,
        usuarios: usuariosStats,
        cursos: cursosStats,
        empresas: empresasStats,
        vagas: vagasStats,
        faturamento: faturamentoStats,
      },
    };

    return response;
  } catch (error) {
    console.error("Erro ao buscar visão geral da plataforma:", error);
    throw error;
  }
}

export type * from "./types";
