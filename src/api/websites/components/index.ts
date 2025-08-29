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
  getSliderData,
  getSliderDataClient,
  listSliders,
  getSliderById,
  createSlider,
  updateSlider,
  deleteSlider,
  updateSliderOrder,
} from "./slider";
export { getBannerData, getBannerDataClient } from "./banner";
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

export type { BannerBackendResponse, BannerApiResponse } from "./banner/types";
