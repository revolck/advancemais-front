import { getWebsiteSiteData } from "@/api/websites";
import type { WebsiteSiteDataSection } from "@/api/websites";
import type { AboutApiResponse } from "@/api/websites/components/about/types";
import type { ConsultoriaApiResponse } from "@/api/websites/components/consultoria/types";
import type { RecrutamentoApiResponse } from "@/api/websites/components/recrutamento/types";
import type { BannerItem } from "@/theme/website/components/banners/types";
import type { LogoData } from "@/theme/website/components/logo-enterprises/types";
import type { SlideData } from "@/theme/website/components/slider/types";
import Slider from "@/theme/website/components/slider/SliderBasic";
import AboutSection from "@/theme/website/components/about";
import BannersGroup from "@/theme/website/components/banners";
import ConsultoriaSection from "@/theme/website/components/consultoria-empresarial";
import RecrutamentoSection from "@/theme/website/components/recrutamento";
import LogoEnterprises from "@/theme/website/components/logo-enterprises";

type GenericRecord = Record<string, unknown>;

const HOME_SECTIONS: WebsiteSiteDataSection[] = [
  "sobre",
  "slider",
  "banner",
  "logoEnterprises",
  "consultoria",
  "recrutamento",
];

function isRecord(value: unknown): value is GenericRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asRecordArray(value: unknown): GenericRecord[] {
  return Array.isArray(value) ? value.filter(isRecord) : [];
}

function toString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function toNumber(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function isPublished(status: unknown): boolean {
  if (typeof status === "boolean") return status;
  const normalized = toString(status).toUpperCase();
  return normalized === "PUBLICADO" || normalized === "PUBLISHED";
}

function normalizeOrientation(value: unknown): "DESKTOP" | "TABLET_MOBILE" | "" {
  const normalized = toString(value).toUpperCase();
  if (normalized.includes("DESKTOP")) return "DESKTOP";
  if (normalized.includes("MOBILE") || normalized.includes("TABLET")) {
    return "TABLET_MOBILE";
  }
  return "";
}

function lastItem(records: GenericRecord[]): GenericRecord | null {
  return records.length > 0 ? records[records.length - 1] : null;
}

function mapAbout(records: GenericRecord[]): AboutApiResponse | null {
  const item = lastItem(records);
  if (!item) return null;
  return {
    src: toString(item.imagemUrl),
    title: toString(item.titulo),
    description: toString(item.descricao),
  };
}

function mapConsultoria(records: GenericRecord[]): ConsultoriaApiResponse | null {
  const item = lastItem(records);
  if (!item) return null;
  return {
    src: toString(item.imagemUrl),
    title: toString(item.titulo),
    description: toString(item.descricao),
    buttonUrl: toString(item.buttonUrl),
    buttonLabel: toString(item.buttonLabel),
  };
}

function mapRecrutamento(records: GenericRecord[]): RecrutamentoApiResponse | null {
  const item = lastItem(records);
  if (!item) return null;
  return {
    src: toString(item.imagemUrl),
    title: toString(item.titulo),
    description: toString(item.descricao),
    buttonUrl: toString(item.buttonUrl),
    buttonLabel: toString(item.buttonLabel),
  };
}

function mapBanners(records: GenericRecord[]): BannerItem[] {
  return records
    .filter((item) => isPublished(item.status))
    .sort((a, b) => toNumber(a.ordem) - toNumber(b.ordem))
    .map((item) => ({
      id: toString(item.id),
      imagemUrl: toString(item.imagemUrl),
      linkUrl: toString(item.link) || "#",
      position: toNumber(item.ordem),
      alt: toString(item.imagemTitulo),
    }));
}

function mapLogos(records: GenericRecord[]): LogoData[] {
  return records
    .filter((item) => isPublished(item.status))
    .sort((a, b) => toNumber(a.ordem) - toNumber(b.ordem))
    .map((item) => ({
      id: toString(item.id),
      name: toString(item.nome),
      src: toString(item.imagemUrl),
      alt: toString(item.imagemAlt),
      website: toString(item.website) || undefined,
      order: toNumber(item.ordem),
    }));
}

function mapSlides(
  records: GenericRecord[],
  orientation: "DESKTOP" | "TABLET_MOBILE",
): SlideData[] {
  return records
    .filter(
      (item) =>
        isPublished(item.status) &&
        normalizeOrientation(item.orientacao) === orientation,
    )
    .sort((a, b) => toNumber(a.ordem) - toNumber(b.ordem))
    .map((item) => ({
      id: toNumber(item.ordem),
      image: toString(item.imagemUrl),
      alt: toString(item.imagemTitulo),
      link: toString(item.link) || undefined,
      overlay: false,
    }));
}

export default async function WebsiteHomePage() {
  let payload: Record<string, unknown> = {};

  try {
    const response = await getWebsiteSiteData({
      status: "PUBLICADO",
      sections: HOME_SECTIONS,
    });
    payload = response.data ?? {};
  } catch (error) {
    // fallback para os componentes manterem o fetch individual
    console.error("Falha ao carregar site-data agregado:", error);
  }

  const hasSection = (section: WebsiteSiteDataSection): boolean =>
    Object.prototype.hasOwnProperty.call(payload, section);

  const aboutData = mapAbout(asRecordArray(payload.sobre));
  const consultoriaData = mapConsultoria(asRecordArray(payload.consultoria));
  const recrutamentoData = mapRecrutamento(asRecordArray(payload.recrutamento));
  const bannersData = mapBanners(asRecordArray(payload.banner));
  const logosData = mapLogos(asRecordArray(payload.logoEnterprises));
  const sliderSection = asRecordArray(payload.slider);
  const sliderDesktopData = mapSlides(sliderSection, "DESKTOP");
  const sliderMobileData = mapSlides(sliderSection, "TABLET_MOBILE");

  return (
    <div className="min-h-screen">
      <Slider
        fetchFromApi={!hasSection("slider")}
        staticData={sliderDesktopData}
        staticDataMobile={sliderMobileData}
      />

      <AboutSection
        fetchFromApi={!hasSection("sobre")}
        staticData={aboutData ?? undefined}
      />

      <BannersGroup
        fetchFromApi={!hasSection("banner")}
        staticData={bannersData}
      />

      <ConsultoriaSection
        fetchFromApi={!hasSection("consultoria")}
        staticData={consultoriaData ?? undefined}
      />

      <RecrutamentoSection
        fetchFromApi={!hasSection("recrutamento")}
        staticData={recrutamentoData ?? undefined}
      />

      <LogoEnterprises
        fetchFromApi={!hasSection("logoEnterprises")}
        staticData={logosData}
      />
    </div>
  );
}
