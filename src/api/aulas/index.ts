/**
 * Exportações do módulo de Aulas
 */

// Core functions
export {
  listAulas,
  getAulaById,
  createAula,
  updateAula,
  deleteAula,
  publicarAula,
  getAulaHistorico,
  getAulaProgresso,
  updateAulaProgresso,
  getAulaPresencas,
  registrarPresenca,
  getAgenda,
  getGoogleOAuthStatus,
  connectGoogle,
  disconnectGoogle,
  // Materiais
  createMaterialArquivoFromUrl,
  createMaterialLink,
  createMaterialTexto,
} from "./core";

// Types
export type {
  Modalidade,
  TipoLink,
  AulaStatus,
  Aula,
  AulaProgresso,
  AulaPresenca,
  AulaHistorico,
  CreateAulaPayload,
  UpdateAulaPayload,
  UpdateProgressoPayload,
  RegistrarPresencaPayload,
  AulasListParams,
  AulasListResponse,
  AgendaEvento,
  AgendaListParams,
  AgendaListResponse,
  GoogleOAuthStatus,
  GoogleConnectResponse,
  // Materiais
  TipoMaterial,
  AulaMaterial,
  CreateMaterialArquivoUrlPayload,
  CreateMaterialLinkPayload,
  CreateMaterialTextoPayload,
} from "./types";

// Constants
export { MATERIAIS_CONFIG } from "./types";

