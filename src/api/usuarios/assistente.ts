import { apiFetch } from "@/api/client";
import { usuarioRoutes } from "@/api/routes";
import { buildAuthHeaders } from "@/lib/auth-utils";
import { apiConfig } from "@/lib/env";

export interface EntrevistasProximas {
  proximos7Dias: number;
  proxima: string | null;
}

export interface ContextoEmpresa {
  plano: {
    nome: string | null;
    modo: string;
    fim: string | null;
    limiteVagas: number | null;
  } | null;
  /** Recursos premium: publica sem limite e sem plano */
  vagasIlimitadas: boolean;
  vagas: { publicadas: number; emAnalise: number; rascunhos: number };
  candidatosNovos7Dias: number;
  entrevistas: EntrevistasProximas;
}

export interface ContextoAluno {
  cursosEmAndamento: { cursoId: string; turmaId: string; curso: string; turma: string }[];
  inscricoesAguardandoPagamento: number;
  cursosConcluidos: number;
  certificados: number;
  curriculos: number;
  candidaturas: number;
  entrevistas: EntrevistasProximas;
}

/** Contagens do dia; os campos dependem da função (admin, recrutador, instrutor...) */
export interface ContextoEquipe {
  vagasEmAnalise?: number;
  usuariosPendentes?: number;
  empresasNovas7Dias?: number;
  vagasVinculadas?: number;
  entrevistasHoje?: number;
  entrevistas?: EntrevistasProximas;
  candidatosNovos7Dias?: number;
  turmas?: number;
  aulasHoje?: number;
  provasParaCorrigir?: number;
  notasPendentes?: number;
  turmasEmAndamento?: number;
  inscricoesAguardandoPagamento?: number;
  certificadosAEmitir?: number;
}

export interface ContextoAssistente {
  role: string;
  empresa?: ContextoEmpresa | null;
  aluno?: ContextoAluno | null;
  equipe?: ContextoEquipe | null;
}

/** Fatos do dia para o assistente (só contagens do usuário logado) */
export function getContextoAssistente() {
  return apiFetch<{ success: boolean; data: ContextoAssistente }>(
    usuarioRoutes.assistente.contexto(),
    {
      init: {
        method: "GET",
        headers: { Accept: apiConfig.headers.Accept, ...buildAuthHeaders() },
      },
      cache: "no-cache",
      retries: 1,
    }
  );
}
