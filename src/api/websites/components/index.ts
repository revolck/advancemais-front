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

export type { BannerBackendResponse, BannerApiResponse } from "./banner/types";
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
