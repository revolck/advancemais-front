/**
 * API de Dashboard - Visão Geral Pedagógica
 * Agrega dados apenas de cursos e usuários (sem empresas/vagas)
 */

import { getVisaoGeral } from "@/api/cursos";
import { listAlunosDashboard, listInstrutores, listUsuarios } from "@/api/usuarios";
import type { PlataformaOverviewResponse } from "./types";

/**
 * Obtém visão geral pedagógica (apenas cursos e usuários)
 * Não inclui dados de empresas, vagas ou faturamento
 * 
 * NOTA: Alguns endpoints podem retornar 403 (Forbidden) se o backend
 * não tiver permissões configuradas para o role PEDAGOGICO.
 * Nesses casos, retorna valores padrão (zeros) para permitir que
 * a visão pedagógica funcione mesmo sem acesso completo.
 */
export async function getPlataformaOverviewPedagogico(
  init?: RequestInit
): Promise<PlataformaOverviewResponse> {
  try {
    // Busca dados apenas de cursos e usuários
    const [
      cursosVisaoGeral,
      alunosResponse,
      instrutoresResponse,
      usuariosResponse,
    ] = await Promise.allSettled([
      getVisaoGeral(),
      listAlunosDashboard({ page: 1 }),
      listInstrutores({ page: 1, limit: 1 }),
      listUsuarios({ page: 1, limit: 1 }),
    ]);

    // Helper para verificar se o erro é 403 (Forbidden)
    const is403Error = (error: any): boolean => {
      return (
        error?.status === 403 ||
        error?.message?.includes("403") ||
        error?.message?.toLowerCase().includes("forbidden")
      );
    };

    // Loga erros 403 apenas em desenvolvimento e de forma informativa
    if (process.env.NODE_ENV === "development") {
      if (cursosVisaoGeral.status === "rejected" && is403Error(cursosVisaoGeral.reason)) {
        console.warn(
          "⚠️ [Pedagógico] Endpoint /api/v1/cursos/visaogeral retornou 403. " +
          "Isso é esperado se o backend não tiver permissões configuradas para PEDAGOGICO. " +
          "Usando valores padrão (zeros)."
        );
      }
      if (alunosResponse.status === "rejected" && is403Error(alunosResponse.reason)) {
        console.warn(
          "⚠️ [Pedagógico] Endpoint /api/v1/usuarios/candidatos/dashboard retornou 403. " +
          "Isso é esperado se o backend não tiver permissões configuradas para PEDAGOGICO. " +
          "Usando valores padrão (zeros)."
        );
      }
      if (instrutoresResponse.status === "rejected" && is403Error(instrutoresResponse.reason)) {
        console.warn(
          "⚠️ [Pedagógico] Endpoint /api/v1/usuarios/instrutores retornou 403. " +
          "Isso é esperado se o backend não tiver permissões configuradas para PEDAGOGICO. " +
          "Usando valores padrão (zeros)."
        );
      }
      if (usuariosResponse.status === "rejected" && is403Error(usuariosResponse.reason)) {
        console.warn(
          "⚠️ [Pedagógico] Endpoint /api/v1/usuarios/usuarios retornou 403. " +
          "Isso é esperado se o backend não tiver permissões configuradas para PEDAGOGICO. " +
          "Usando valores padrão (zeros)."
        );
      }
    }

    // Extrai dados de cursos (ignora erros 403, trata como null)
    const cursosData =
      cursosVisaoGeral.status === "fulfilled" && cursosVisaoGeral.value.success
        ? cursosVisaoGeral.value.data
        : cursosVisaoGeral.status === "rejected" && is403Error(cursosVisaoGeral.reason)
        ? null // 403 = sem acesso, retorna null para usar valores padrão
        : null;

    // Extrai dados de alunos (ignora erros 403, trata como null)
    const alunosData =
      alunosResponse.status === "fulfilled"
        ? alunosResponse.value
        : alunosResponse.status === "rejected" && is403Error(alunosResponse.reason)
        ? null // 403 = sem acesso, retorna null para usar valores padrão
        : null;

    // Extrai dados de instrutores (ignora erros 403, trata como null)
    const instrutoresData =
      instrutoresResponse.status === "fulfilled"
        ? instrutoresResponse.value
        : instrutoresResponse.status === "rejected" && is403Error(instrutoresResponse.reason)
        ? null // 403 = sem acesso, retorna null para usar valores padrão
        : null;

    // Extrai dados de usuários (ignora erros 403, trata como null)
    const usuariosData =
      usuariosResponse.status === "fulfilled"
        ? usuariosResponse.value
        : usuariosResponse.status === "rejected" && is403Error(usuariosResponse.reason)
        ? null // 403 = sem acesso, retorna null para usar valores padrão
        : null;

    // Agrega métricas gerais (apenas cursos e usuários)
    const metricasGerais = {
      // Cursos (da visão geral de cursos)
      totalCursos: cursosData?.metricasGerais.totalCursos || 0,
      cursosPublicados: 0, // Não disponível em VisaoGeralMetricasGerais
      cursosRascunho: 0, // Não disponível em VisaoGeralMetricasGerais
      totalTurmas: cursosData?.metricasGerais.totalTurmas || 0,
      turmasAtivas: 0, // Não disponível em VisaoGeralMetricasGerais
      turmasInscricoesAbertas: 0, // Não disponível em VisaoGeralMetricasGerais

      // Alunos
      totalAlunos: alunosData?.pagination?.total || 0,
      totalAlunosAtivos: 0, // Não disponível em VisaoGeralMetricasGerais
      totalAlunosInscritos: cursosData?.metricasGerais.totalInscricoes || 0,
      totalAlunosConcluidos: 0, // Não disponível em VisaoGeralMetricasGerais

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

      // Empresas (zerado para pedagógico)
      totalEmpresas: 0,
      empresasAtivas: 0,
      empresasBloqueadas: 0,
      empresasPendentes: 0,

      // Vagas (zerado para pedagógico)
      totalVagas: 0,
      vagasPublicadas: 0,
      vagasEmAnalise: 0,
      vagasEncerradas: 0,

      // Financeiro (zerado para pedagógico)
      faturamentoMesAtual: 0,
      faturamentoMesAnterior: 0,
      totalTransacoes: 0,
      transacoesAprovadas: 0,
      transacoesPendentes: 0,
    };

    // Estatísticas de usuários
    const usuariosStats = {
      porTipo: {
        alunos: alunosData?.pagination?.total || 0,
        instrutores: instrutoresData?.pagination?.total || 0,
        empresas: 0, // Não disponível para pedagógico
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
      crescimentoMensal: [],
    };

    // Estatísticas de cursos
    const cursosStats = {
      porStatus: {
        publicados: metricasGerais.cursosPublicados,
        rascunho: metricasGerais.cursosRascunho,
        despublicados: 0,
      },
      porCategoria: [],
      crescimentoMensal: [],
    };

    // Estatísticas de empresas (vazias para pedagógico)
    const empresasStats = {
      porStatus: {
        ativas: 0,
        bloqueadas: 0,
        pendentes: 0,
        inativas: 0,
      },
      porPlano: [],
      crescimentoMensal: [],
    };

    // Estatísticas de vagas (vazias para pedagógico)
    const vagasStats = {
      porStatus: {
        publicadas: 0,
        emAnalise: 0,
        encerradas: 0,
        pausadas: 0,
      },
      crescimentoMensal: [],
    };

    // Estatísticas de faturamento (vazias para pedagógico)
    const faturamentoStats = {
      porMes: [],
      porCategoria: [],
      topCursos: [],
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
    // Se for um erro 403, não relança (já foi tratado acima)
    const is403 = (error as any)?.status === 403;
    if (is403) {
      // Retorna resposta com valores padrão (zeros) em caso de 403
      return {
        success: true,
        data: {
          metricasGerais: {
            totalCursos: 0,
            cursosPublicados: 0,
            cursosRascunho: 0,
            totalTurmas: 0,
            turmasAtivas: 0,
            turmasInscricoesAbertas: 0,
            totalAlunos: 0,
            totalAlunosAtivos: 0,
            totalAlunosInscritos: 0,
            totalAlunosConcluidos: 0,
            totalInstrutores: 0,
            totalInstrutoresAtivos: 0,
            totalUsuarios: 0,
            totalCandidatos: 0,
            totalCandidatosAtivos: 0,
            totalEmpresas: 0,
            empresasAtivas: 0,
            empresasBloqueadas: 0,
            empresasPendentes: 0,
            totalVagas: 0,
            vagasPublicadas: 0,
            vagasEmAnalise: 0,
            vagasEncerradas: 0,
            faturamentoMesAtual: 0,
            faturamentoMesAnterior: 0,
            totalTransacoes: 0,
            transacoesAprovadas: 0,
            transacoesPendentes: 0,
          },
          usuarios: {
            porTipo: {
              alunos: 0,
              instrutores: 0,
              empresas: 0,
              candidatos: 0,
              admins: 0,
              moderadores: 0,
            },
            porStatus: {
              ativos: 0,
              inativos: 0,
              bloqueados: 0,
              pendentes: 0,
            },
            crescimentoMensal: [],
          },
          cursos: {
            porStatus: {
              publicados: 0,
              rascunho: 0,
              despublicados: 0,
            },
            porCategoria: [],
            crescimentoMensal: [],
          },
          empresas: {
            porStatus: {
              ativas: 0,
              bloqueadas: 0,
              pendentes: 0,
              inativas: 0,
            },
            porPlano: [],
            crescimentoMensal: [],
          },
          vagas: {
            porStatus: {
              publicadas: 0,
              emAnalise: 0,
              encerradas: 0,
              pausadas: 0,
            },
            crescimentoMensal: [],
          },
          faturamento: {
            porMes: [],
            porCategoria: [],
            topCursos: [],
          },
        },
      };
    }
    
    // Para outros erros, loga e relança
    console.error("Erro inesperado ao buscar visão geral pedagógica:", error);
    throw error;
  }
}

