export {
  getAboutData,
  getAboutDataClient,
  listAbout,
  getAboutById,
  createAbout,
  updateAbout,
  deleteAbout,
} from "./about";
export {
  getConsultoriaData,
  getConsultoriaDataClient,
  listConsultoria,
  getConsultoriaById,
  createConsultoria,
  updateConsultoria,
  deleteConsultoria,
} from "./consultoria";
export {
  getRecrutamentoData,
  getRecrutamentoDataClient,
  listRecrutamento,
  getRecrutamentoById,
  createRecrutamento,
  updateRecrutamento,
  deleteRecrutamento,
} from "./recrutamento";
export {
  getSobreEmpresaDataClient,
  listSobreEmpresa,
  getSobreEmpresaById,
  createSobreEmpresa,
  updateSobreEmpresa,
  deleteSobreEmpresa,
} from "./sobre-empresa";
export {
  listDiferenciais,
  getDiferenciaisById,
  createDiferenciais,
  updateDiferenciais,
  deleteDiferenciais,
} from "./diferenciais";

export {
  listPlaninhas,
  getPlaninhasById,
  createPlaninhas,
  updatePlaninhas,
  deletePlaninhas,
  getPlaninhasSectionData,
  getPlaninhasSectionDataClient,
} from "./planinhas";

export {
  getAdvanceAjudaData,
  getAdvanceAjudaDataClient,
  listAdvanceAjuda,
  getAdvanceAjudaById,
  createAdvanceAjuda,
  updateAdvanceAjuda,
  deleteAdvanceAjuda,
} from "./advance-ajuda";

export {
  listSistema,
  getSistemaById,
  createSistema,
  updateSistema,
  deleteSistema,
} from "./sistema";

export {
  getServiceBenefitsData,
  getServiceBenefitsDataClient,
  listServiceBenefits,
} from "./service-benefits";

export {
  listRecrutamentoSelecao,
  getRecrutamentoSelecaoById,
  createRecrutamentoSelecao,
  updateRecrutamentoSelecao,
  deleteRecrutamentoSelecao,
} from "./recrutamento-selecao";
export {
  listTreinamentosInCompany,
  getTreinamentosInCompanyById,
  createTreinamentosInCompany,
  updateTreinamentosInCompany,
  deleteTreinamentosInCompany,
} from "./treinamentos-in-company";
export {
  listTreinamentoCompany,
  getTreinamentoCompanyById,
  createTreinamentoCompany,
  updateTreinamentoCompany,
  deleteTreinamentoCompany,
} from "./treinamento-company";
export {
  listConexaoForte,
  getConexaoForteById,
  createConexaoForte,
  updateConexaoForte,
  deleteConexaoForte,
} from "./conexao-forte";

export {
  getSliderData,
  getSliderDataClient,
  listSliders,
  getSliderById,
  createSlider,
  updateSlider,
  deleteSlider,
  updateSliderOrder,
  updateSliderStatus,
} from "./slider";
export { getBannerData, getBannerDataClient } from "./banner";
export {
  listBanners,
  getBannerById,
  createBanner,
  updateBanner,
  deleteBanner,
  updateBannerOrder,
  updateBannerStatus,
} from "./banner";
export {
  listLogoEnterprises,
  getLogoEnterpriseById,
  createLogoEnterprise,
  updateLogoEnterprise,
  deleteLogoEnterprise,
  updateLogoEnterpriseOrder,
} from "./logo-enterprises";
export {
  listDepoimentos,
  getDepoimentoById,
  createDepoimento,
  updateDepoimento,
  deleteDepoimento,
  updateDepoimentoOrder,
  updateDepoimentoStatus,
} from "./depoimentos";
export {
  listHeaderPages,
  getHeaderPageById,
  createHeaderPage,
  updateHeaderPage,
  deleteHeaderPage,
  getHeaderForPage,
} from "./header-pages";
export type {
  AboutApiResponse,
  AboutImageProps,
  AboutContentProps,
  AboutBackendResponse,
  CreateAboutPayload,
  UpdateAboutPayload,
} from "./about/types";
export type {
  ConsultoriaApiResponse,
  ConsultoriaImageProps,
  ConsultoriaContentProps,
  ConsultoriaBackendResponse,
  CreateConsultoriaPayload,
  UpdateConsultoriaPayload,
} from "./consultoria/types";
export type {
  SlideBackendResponse,
  SlideApiResponse,
  CreateSliderPayload,
  UpdateSliderPayload,
} from "./slider/types";
export type {
  RecrutamentoApiResponse,
  RecrutamentoImageProps,
  RecrutamentoContentProps,
  RecrutamentoBackendResponse,
  CreateRecrutamentoPayload,
  UpdateRecrutamentoPayload,
} from "./recrutamento/types";

export type {
  SobreEmpresaBackendResponse,
  CreateSobreEmpresaPayload,
  UpdateSobreEmpresaPayload,
  AccordionSectionData,
  AccordionItemData,
} from "./sobre-empresa/types";
export type {
  DiferenciaisBackendResponse,
  CreateDiferenciaisPayload,
  UpdateDiferenciaisPayload,
} from "./diferenciais/types";

export type {
  PlaninhasBackendResponse,
  CreatePlaninhasPayload,
  UpdatePlaninhasPayload,
} from "./planinhas/types";

export type {
  AdvanceAjudaBackendResponse,
  CreateAdvanceAjudaPayload,
  UpdateAdvanceAjudaPayload,
} from "./advance-ajuda/types";

export type {
  SistemaBackendResponse,
  CreateSistemaPayload,
  UpdateSistemaPayload,
} from "./sistema/types";

export type {
  RecrutamentoSelecaoBackendResponse,
  CreateRecrutamentoSelecaoPayload,
  UpdateRecrutamentoSelecaoPayload,
} from "./recrutamento-selecao/types";
export type {
  TreinamentosInCompanyBackendResponse,
  CreateTreinamentosInCompanyPayload,
  UpdateTreinamentosInCompanyPayload,
} from "./treinamentos-in-company/types";
export type {
  TreinamentoCompanyBackendResponse,
  CreateTreinamentoCompanyPayload,
  UpdateTreinamentoCompanyPayload,
} from "./treinamento-company/types";
export type {
  ConexaoForteBackendResponse,
  CreateConexaoFortePayload,
  UpdateConexaoFortePayload,
} from "./conexao-forte/types";

export type { BannerBackendResponse, BannerApiResponse } from "./banner/types";
export type {
  LogoEnterpriseBackendResponse,
  CreateLogoEnterprisePayload,
  UpdateLogoEnterprisePayload,
} from "./logo-enterprises/types";
export type {
  DepoimentoBackendResponse,
  CreateDepoimentoPayload,
  UpdateDepoimentoPayload,
} from "./depoimentos/types";
export {
  listTeam,
  getTeamById,
  createTeam,
  updateTeam,
  deleteTeam,
  updateTeamOrder,
} from "./team";
export type { TeamBackendResponse, CreateTeamPayload, UpdateTeamPayload } from "./team/types";
export type {
  HeaderPageBackendResponse,
  CreateHeaderPagePayload,
  UpdateHeaderPagePayload,
  HeaderPage,
} from "./header-pages/types";
