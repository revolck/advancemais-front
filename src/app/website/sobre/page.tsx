import { getWebsiteSiteData } from "@/api/websites";
import type { WebsiteSiteDataSection } from "@/api/websites";
import HeaderPages from "@/theme/website/components/header-pages";
import type { HeaderPageData } from "@/theme/website/components/header-pages/types";
import AccordionGroupInformation from "@/theme/website/components/accordion-group-information";
import type { AccordionSectionData } from "@/theme/website/components/accordion-group-information/types";
import TeamShowcase from "@/theme/website/components/team-showcase/TeamShowcase";
import type { TeamMemberData } from "@/theme/website/components/team-showcase/types";
import AboutAdvantages from "@/theme/website/components/about-advantages";
import type { AboutAdvantagesApiData } from "@/theme/website/components/about-advantages/types";
import LogoEnterprises from "@/theme/website/components/logo-enterprises";
import type { LogoData } from "@/theme/website/components/logo-enterprises/types";
import TestimonialsCarousel from "@/theme/website/components/testimonials-carousel/TestimonialsCarousel";
import type { TestimonialData } from "@/theme/website/components/testimonials-carousel/types";

export const metadata = {
  title: "Sobre nós",
};

type GenericRecord = Record<string, unknown>;

const SOBRE_SECTIONS: WebsiteSiteDataSection[] = [
  "headerPages",
  "sobreEmpresa",
  "diferenciais",
  "team",
  "logoEnterprises",
  "depoimentos",
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

function mapHeaderForPage(
  records: GenericRecord[],
  currentPage: string,
): HeaderPageData | null {
  if (!records.length) return null;
  const expectedCode = currentPage.includes("sobre") ? "SOBRE" : "SOBRE";
  const match =
    records.find((item) => toString(item.page).toUpperCase() === expectedCode) ??
    records[0];

  if (!match) return null;

  return {
    id: toString(match.id),
    title: toString(match.titulo),
    subtitle: toString(match.subtitulo),
    description: toString(match.descricao),
    buttonText: toString(match.buttonLabel) || "Saiba mais",
    buttonUrl: toString(match.buttonLink) || "#",
    imageUrl:
      toString(match.imagemUrl) || "/images/headers/default-header.webp",
    imageAlt: toString(match.titulo) || "header",
    isActive: true,
    targetPages: [currentPage],
  };
}

function mapSobreEmpresa(records: GenericRecord[]): AccordionSectionData[] {
  const latest = records.length ? records[records.length - 1] : null;
  if (!latest) return [];

  const videoUrl = toString(latest.videoUrl);
  const videoType: AccordionSectionData["videoType"] =
    videoUrl.includes("youtube")
      ? "youtube"
      : videoUrl.includes("vimeo")
      ? "vimeo"
      : videoUrl.endsWith(".mp4")
      ? "mp4"
      : "url";

  return [
    {
      id: toString(latest.id),
      title: toString(latest.titulo),
      description: toString(latest.descricao),
      videoUrl,
      videoType,
      items: [
        {
          id: `${toString(latest.id)}-missao`,
          value: "missao",
          trigger: "Missão",
          content: toString(latest.descricaoMissao),
          order: 1,
          isActive: true,
        },
        {
          id: `${toString(latest.id)}-visao`,
          value: "visao",
          trigger: "Visão",
          content: toString(latest.descricaoVisao),
          order: 2,
          isActive: true,
        },
        {
          id: `${toString(latest.id)}-valores`,
          value: "valores",
          trigger: "Valores",
          content: toString(latest.descricaoValores),
          order: 3,
          isActive: true,
        },
      ],
      order: 1,
      isActive: true,
    },
  ];
}

function mapDiferenciais(records: GenericRecord[]): AboutAdvantagesApiData | null {
  const first = records[0];
  if (!first) return null;

  return {
    whyChoose: {
      id: toString(first.id),
      title: toString(first.titulo),
      description: toString(first.descricao),
      buttonText: toString(first.botaoLabel),
      buttonUrl: toString(first.botaoUrl),
      isActive: true,
    },
    advantageCards: [1, 2, 3, 4].map((idx) => ({
      id: `${toString(first.id)}-card-${idx}`,
      icon: toString(first[`icone${idx}`]),
      title: toString(first[`titulo${idx}`]),
      description: toString(first[`descricao${idx}`]),
      order: idx,
      isActive: true,
    })),
  };
}

function mapTeam(records: GenericRecord[]): TeamMemberData[] {
  return records
    .filter((item) => isPublished(item.status))
    .sort((a, b) => toNumber(a.ordem) - toNumber(b.ordem))
    .map((item) => ({
      id: toString(item.id),
      name: toString(item.nome),
      position: toString(item.cargo),
      imageUrl: toString(item.photoUrl),
      imageAlt: toString(item.nome),
      order: toNumber(item.ordem),
      isActive: true,
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

function mapTestimonials(records: GenericRecord[]): TestimonialData[] {
  return records
    .filter((item) => isPublished(item.status))
    .sort((a, b) => toNumber(a.ordem) - toNumber(b.ordem))
    .map((item) => ({
      id: toString(item.depoimentoId) || toString(item.id),
      name: toString(item.nome),
      position: toString(item.cargo),
      company: undefined,
      testimonial: toString(item.depoimento),
      imageUrl: toString(item.fotoUrl),
      rating: 5,
      order: toNumber(item.ordem),
      isActive: true,
    }));
}

export default async function SobrePage() {
  let payload: Record<string, unknown> = {};

  try {
    const response = await getWebsiteSiteData({
      status: "PUBLICADO",
      sections: SOBRE_SECTIONS,
    });
    payload = response.data ?? {};
  } catch (error) {
    console.error("Falha ao carregar site-data de /sobre:", error);
  }

  const hasSection = (section: WebsiteSiteDataSection): boolean =>
    Object.prototype.hasOwnProperty.call(payload, section);

  const headerData = mapHeaderForPage(asRecordArray(payload.headerPages), "/sobre");
  const accordionData = mapSobreEmpresa(asRecordArray(payload.sobreEmpresa));
  const advantagesData = mapDiferenciais(asRecordArray(payload.diferenciais));
  const teamData = mapTeam(asRecordArray(payload.team));
  const logosData = mapLogos(asRecordArray(payload.logoEnterprises));
  const testimonialsData = mapTestimonials(asRecordArray(payload.depoimentos));

  return (
    <div className="min-h-screen">
      <HeaderPages
        fetchFromApi={!(hasSection("headerPages") && !!headerData)}
        staticData={headerData ?? undefined}
        currentPage="/sobre"
      />
      <AccordionGroupInformation
        fetchFromApi={!hasSection("sobreEmpresa")}
        staticData={accordionData}
      />
      <AboutAdvantages
        fetchFromApi={!(hasSection("diferenciais") && !!advantagesData)}
        staticData={advantagesData ?? undefined}
      />
      <TeamShowcase
        fetchFromApi={!hasSection("team")}
        staticData={teamData}
        title="Conheça nossa Equipe"
      />
      <LogoEnterprises
        fetchFromApi={!hasSection("logoEnterprises")}
        staticData={logosData}
      />
      <TestimonialsCarousel
        fetchFromApi={!hasSection("depoimentos")}
        staticData={testimonialsData}
      />
    </div>
  );
}
