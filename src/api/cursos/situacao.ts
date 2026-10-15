import { apiFetch } from "@/api/client";
import { buildAuthHeaders } from "@/lib/auth-utils";
import { apiConfig } from "@/lib/env";
import { cursosRoutes } from "./routes";

/** O que a equipe escolhe para o aluno na turma */
export type SituacaoInscricao =
  | "CONCLUIU"
  | "NAO_CONCLUIU"
  | "REPROVADO"
  | "TRANCADO"
  | "CURSANDO";

export interface AlterarSituacaoPayload {
  inscricaoIds?: string[];
  cpfs?: string[];
  /** Aplica a todos da turma que NÃO estão na lista */
  aplicarAosDemais?: boolean;
  situacao: SituacaoInscricao;
  motivo: string;
  simular?: boolean;
  /** Quantos a prévia mostrou (a API recusa se a turma mudou) */
  totalEsperado?: number;
  /** Notificação no painel para quem teve a situação alterada */
  avisar?: boolean;
}

export interface ResumoSituacao {
  aplicado: boolean;
  selecionados: number;
  naoEncontrados: string[];
  cpfsInvalidos: string[];
  atingidos: number;
  mudam: number;
  jaNaSituacao: number;
  certificadosARevogar: number;
  certificadosARestaurar: number;
  concluintesSemCertificado: number;
}

export interface ResultadoEmissaoConcluintes {
  pendentes: number;
  emitidos: number;
  falhas: { inscricaoId: string; codigo: string; motivo: string }[];
  restantes: number;
}

const headers = () => ({
  Accept: apiConfig.headers.Accept,
  "Content-Type": "application/json",
  ...buildAuthHeaders(),
});

/** Muda a situação de várias inscrições da turma (ou só mostra a prévia, com `simular`) */
export async function alterarSituacaoInscricoes(
  cursoId: number | string,
  turmaId: string,
  payload: AlterarSituacaoPayload
): Promise<ResumoSituacao> {
  const resposta = await apiFetch<{ success: boolean; data: ResumoSituacao }>(
    cursosRoutes.cursos.turmas.inscricoes.situacao(cursoId, turmaId),
    {
      init: { method: "POST", headers: headers(), body: JSON.stringify(payload) },
      cache: "no-cache",
      retries: 0,
    }
  );
  return resposta.data;
}

/** Emite certificados para quem concluiu e ainda não tem (até `limite` por chamada) */
export async function emitirCertificadosConcluintes(
  cursoId: number | string,
  turmaId: string,
  payload: { simular?: boolean; limite?: number } = {}
): Promise<ResultadoEmissaoConcluintes> {
  const resposta = await apiFetch<{ success: boolean; data: ResultadoEmissaoConcluintes }>(
    cursosRoutes.cursos.turmas.certificados.concluintes(cursoId, turmaId),
    {
      init: { method: "POST", headers: headers(), body: JSON.stringify(payload) },
      cache: "no-cache",
      retries: 0,
      timeout: 120000,
    }
  );
  return resposta.data;
}

// ---------------------------------------------------------------------------
// Matrícula pela equipe
// ---------------------------------------------------------------------------

/** Concedido pela equipe (acesso liberado) ou cobrança pendente (aluno paga pelo site) */
export type PagamentoMatricula = "CONCEDIDO" | "COBRANCA_PENDENTE";

export interface AlunoDaAcao {
  alunoId: string;
  nome: string | null;
}

export interface ResultadoAdicao {
  aplicado: boolean;
  adicionar: AlunoDaAcao[];
  reativar: AlunoDaAcao[];
  jaNaTurma: AlunoDaAcao[];
  recusados: (AlunoDaAcao & { motivo: string })[];
  avisos: {
    turmaConcluida: boolean;
    turmaIniciada: boolean;
    prazoDeInscricaoEncerrado: boolean;
    excedeVagas: boolean;
    outrasTurmasDoCurso: { alunoId: string; nome: string; turma: string }[];
  };
  vagas: { ocupadas: number; limite: number | null; depois: number };
}

export interface ResultadoRemocao {
  aplicado: boolean;
  remover: { inscricaoId: string; alunoId: string; nome: string }[];
  jaRemovidas: number;
  naoEncontradas: number;
  certificadosARevogar: number;
  cobrancasACancelar: number;
}

export interface EntradaHistoricoInscricao {
  id: string;
  inscricaoId: string | null;
  /** INSCRICAO_ADICIONADA_PELA_EQUIPE, INSCRICAO_REATIVADA, INSCRICAO_REMOVIDA, INSCRICAO_SITUACAO_ALTERADA… */
  acao: string;
  descricao: string;
  criadoEm: string;
  aluno: { id: string | null; nome: string | null };
  motivo: string | null;
  origem: string | null;
  /** Ao adicionar: CONCEDIDO ou COBRANCA_PENDENTE */
  pagamento: PagamentoMatricula | null;
  antes: Record<string, unknown> | null;
  depois: Record<string, unknown> | null;
  ator: { id: string; nome: string; role: string } | null;
}

/** Adiciona ou reativa alunos na turma (ou só mostra a prévia, com `simular`) */
export async function adicionarAlunosTurma(
  cursoId: number | string,
  turmaId: string,
  payload: {
    alunoIds: string[];
    motivo: string;
    pagamento: PagamentoMatricula;
    avisar?: boolean;
    simular?: boolean;
    origem?: "TURMA" | "ALUNO";
  }
): Promise<ResultadoAdicao> {
  const resposta = await apiFetch<{ success: boolean; data: ResultadoAdicao }>(
    cursosRoutes.cursos.turmas.inscricoes.equipe(cursoId, turmaId),
    {
      init: { method: "POST", headers: headers(), body: JSON.stringify(payload) },
      cache: "no-cache",
      retries: 0,
    }
  );
  return resposta.data;
}

/** Remove alunos da turma sem apagar o histórico (ou só mostra a prévia) */
export async function removerAlunosTurma(
  cursoId: number | string,
  turmaId: string,
  payload: {
    inscricaoIds: string[];
    motivo: string;
    avisar?: boolean;
    simular?: boolean;
    totalEsperado?: number;
  }
): Promise<ResultadoRemocao> {
  const resposta = await apiFetch<{ success: boolean; data: ResultadoRemocao }>(
    cursosRoutes.cursos.turmas.inscricoes.remover(cursoId, turmaId),
    {
      init: { method: "POST", headers: headers(), body: JSON.stringify(payload) },
      cache: "no-cache",
      retries: 0,
    }
  );
  return resposta.data;
}

/** Entradas, saídas e mudanças de situação registradas na turma */
export async function historicoInscricoesTurma(
  cursoId: number | string,
  turmaId: string
): Promise<EntradaHistoricoInscricao[]> {
  const resposta = await apiFetch<{ success: boolean; data: EntradaHistoricoInscricao[] }>(
    cursosRoutes.cursos.turmas.inscricoes.historico(cursoId, turmaId),
    { init: { method: "GET", headers: headers() }, cache: "no-cache" }
  );
  return resposta.data ?? [];
}

