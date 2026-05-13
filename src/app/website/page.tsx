import { getWebsiteSiteData } from "@/api/websites";
import type { WebsiteSiteDataSection } from "@/api/websites";
import type { AboutApiResponse } from "@/api/websites/components/about/types";
import type { ConsultoriaApiResponse } from "@/api/websites/components/consultoria/types";
import type { RecrutamentoApiResponse } from "@/api/websites/components/recrutamento/types";
import type { BannerItem } from "@/theme/website/components/banners/types";
import type { SlideData } from "@/theme/website/components/slider/types";
import { mapBannerResponsesToBannerItems } from "@/api/websites/components/banner/normalization";
import { mapSliderResponsesToSlideData } from "@/api/websites/components/slider/normalization";
import Slider from "@/theme/website/components/slider/SliderBasic";
import AboutSection from "@/theme/website/components/about";
import BannersGroup from "@/theme/website/components/banners";
import ConsultoriaSection from "@/theme/website/components/consultoria-empresarial";
import RecrutamentoSection from "@/theme/website/components/recrutamento";
import LogoEnterprises from "@/theme/website/components/logo-enterprises";
import {
  hasSiteDataSection,
  hasStaticItems,
  mapWebsiteLogos,
} from "./_lib/site-data";

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

function mapConsultoria(
  records: GenericRecord[],
): ConsultoriaApiResponse | null {
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

function mapRecrutamento(
  records: GenericRecord[],
): RecrutamentoApiResponse | null {
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
  return mapBannerResponsesToBannerItems(records, {
    assumePublishedWhenStatusMissing: true,
  });
}

function mapSlides(
  records: GenericRecord[],
  orientation: "DESKTOP" | "TABLET_MOBILE",
): SlideData[] {
  return mapSliderResponsesToSlideData(records, orientation, {
    assumePublishedWhenStatusMissing: true,
  });
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
    hasSiteDataSection(payload, section);

  const aboutData = mapAbout(asRecordArray(payload.sobre));
  const consultoriaData = mapConsultoria(asRecordArray(payload.consultoria));
  const recrutamentoData = mapRecrutamento(asRecordArray(payload.recrutamento));
  const bannersData = mapBanners(asRecordArray(payload.banner));
  const logosData = mapWebsiteLogos(payload.logoEnterprises);
  const sliderSection = asRecordArray(payload.slider);
  const sliderDesktopData = mapSlides(sliderSection, "DESKTOP");
  const sliderMobileData = mapSlides(sliderSection, "TABLET_MOBILE");
  const hasStaticSliderData =
    sliderDesktopData.length > 0 || sliderMobileData.length > 0;
  const hasStaticBannerData = hasStaticItems(bannersData);
  const hasStaticLogoData = hasStaticItems(logosData);

  return (
    <div className="min-h-screen">
      <Slider
        fetchFromApi={!hasSection("slider") || !hasStaticSliderData}
        staticData={sliderDesktopData}
        staticDataMobile={sliderMobileData}
      />

      <AboutSection
        fetchFromApi={!hasSection("sobre")}
        staticData={aboutData ?? undefined}
      />

      <BannersGroup
        fetchFromApi={!hasSection("banner") || !hasStaticBannerData}
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
        fetchFromApi={!hasSection("logoEnterprises") || !hasStaticLogoData}
        staticData={logosData}
      />
    </div>
  );
}
