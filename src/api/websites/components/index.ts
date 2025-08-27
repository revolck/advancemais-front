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
export { getSliderData, getSliderDataClient } from "./slide";
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
export type { SlideBackendResponse, SlideApiResponse } from "./slide/types";
export type { BannerBackendResponse, BannerApiResponse } from "./banner/types";
