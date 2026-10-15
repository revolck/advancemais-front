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
