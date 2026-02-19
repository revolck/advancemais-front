/**
 * Módulo de API para Provas - Questões e Respostas
 */

// Questões
export {
  listQuestoes,
  getQuestaoById,
  createQuestao,
  updateQuestao,
  deleteQuestao,
  responderQuestao,
  corrigirResposta,
} from "./questoes";

// Respostas
export {
  listRespostas,
  listAvaliacaoHistorico,
  listAvaliacaoRespostas,
  getAvaliacaoRespostaById,
  corrigirAvaliacaoResposta,
} from "./respostas";

// Rotas
export { provasRoutes } from "./routes";

// Enum (deve ser exportado como valor, não como tipo)
export { CursosTipoQuestao } from "./types";

// Types
export type {
  Alternativa,
  Questao,
  Resposta,
  RespostaComQuestao,
  CreateAlternativaPayload,
  UpdateAlternativaPayload,
  CreateQuestaoPayload,
  UpdateQuestaoPayload,
  ResponderQuestaoPayload,
  CorrigirRespostaPayload,
  ListRespostasParams,
  QuestoesListResponse,
  QuestaoResponse,
  RespostasListResponse,
  RespostaResponse,
  StatusCorrecao,
  AvaliacaoHistoricoActor,
  AvaliacaoHistoricoItem,
  ListAvaliacaoHistoricoResponse,
  AvaliacaoRespostaAlunoResumo,
  AvaliacaoRespostaResumo,
  ListAvaliacaoRespostasParams,
  ListAvaliacaoRespostasResponse,
  AvaliacaoRespostaDetalheQuestaoItem,
  AvaliacaoRespostaDetalhe,
  AvaliacaoRespostaDetalheResponse,
  CorrigirAvaliacaoRespostaPayload,
  CorrigirAvaliacaoRespostaResponse,
} from "./types";
