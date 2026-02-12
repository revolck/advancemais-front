import { getWebsiteSiteData } from "@/api/websites";
import type { WebsiteSiteDataSection } from "@/api/websites";
import HeaderPages from "@/theme/website/components/header-pages";
import type { HeaderPageData } from "@/theme/website/components/header-pages/types";
import ProblemSolutionSection from "@/theme/website/components/problem-solution-section";
import type { SectionData } from "@/theme/website/components/problem-solution-section/types";
import AdvanceAjuda from "@/theme/website/components/advance-ajuda";
import type { AdvanceAjudaData } from "@/theme/website/components/advance-ajuda/types";
import ProcessSteps from "@/theme/website/components/process-steps";
import ServiceBenefits from "@/theme/website/components/service-benefits";
import type { ServiceBenefitsData } from "@/theme/website/components/service-benefits/types";
import LogoEnterprises from "@/theme/website/components/logo-enterprises";
import type { LogoData } from "@/theme/website/components/logo-enterprises/types";
import PricingPlans from "@/theme/website/components/pricing-plans";

export const metadata = {
  title: "Recrutamento & Seleção",
};

type GenericRecord = Record<string, unknown>;

const RECRUTAMENTO_SECTIONS: WebsiteSiteDataSection[] = [
  "headerPages",
  "planinhas",
  "advanceAjuda",
  "recrutamentoSelecao",
  "logoEnterprises",
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
  const match =
    records.find((item) => toString(item.page).toUpperCase() === "RECRUTAMENTO") ??
    records.find((item) => toString(item.page).toUpperCase() === "SERVICOS") ??
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

function mapPlaninhas(records: GenericRecord[]): SectionData | null {
  const latest = records.length ? records[records.length - 1] : null;
  if (!latest) return null;

  return {
    id: toString(latest.id) || "planinhas",
    mainTitle: toString(latest.titulo),
    mainDescription: toString(latest.descricao),
    problems: [1, 2, 3]
      .map((idx) => ({
        id: `${toString(latest.id)}-${idx}`,
        icon: toString(latest[`icone${idx}`]) as any,
        title: toString(latest[`titulo${idx}`]),
        description: toString(latest[`descricao${idx}`]),
        order: idx,
        isActive: true,
      }))
      .filter((item) => Boolean(item.title || item.description)),
    isActive: true,
  };
}

function mapAdvanceAjuda(records: GenericRecord[]): AdvanceAjudaData[] {
  return records.map((item) => ({
    id: toString(item.id),
    title: toString(item.titulo),
    description: toString(item.descricao),
    imageUrl: toString(item.imagemUrl),
    imageAlt: toString(item.imagemTitulo),
    benefits: [1, 2, 3]
      .map((idx) => ({
        id: `${toString(item.id)}-${idx}`,
        title: toString(item[`titulo${idx}`]),
        description: toString(item[`descricao${idx}`]),
        order: idx,
      }))
      .filter((b) => Boolean(b.title || b.description)),
  }));
}

function mapServiceBenefits(records: GenericRecord[]): ServiceBenefitsData[] {
  const first = records[0];
  if (!first) return [];

  return [
    {
      id: toString(first.id) || "recrutamento-selecao",
      title: toString(first.titulo),
      subtitle: undefined,
      description: toString(first.descricao),
      imageUrl: toString(first.imagemUrl),
      imageAlt: toString(first.imagemTitulo),
      benefits: [1, 2, 3, 4]
        .map((idx) => ({
          id: `benefit-${idx}`,
          text: toString(first[`titulo${idx}`]),
          gradientType:
            idx % 2 === 0 ? ("primary" as const) : ("secondary" as const),
          order: idx,
          isActive: true,
        }))
        .filter((b) => Boolean(b.text)),
      order: 1,
      isActive: true,
    },
  ];
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

export default async function RecrutamentoPage() {
  let payload: Record<string, unknown> = {};

  try {
    const response = await getWebsiteSiteData({
      status: "PUBLICADO",
      sections: RECRUTAMENTO_SECTIONS,
    });
    payload = response.data ?? {};
  } catch (error) {
    console.error("Falha ao carregar site-data de /recrutamento:", error);
  }

  const hasSection = (section: WebsiteSiteDataSection): boolean =>
    Object.prototype.hasOwnProperty.call(payload, section);

  const headerData = mapHeaderForPage(
    asRecordArray(payload.headerPages),
    "/recrutamento",
  );
  const planinhasData = mapPlaninhas(asRecordArray(payload.planinhas));
  const advanceAjudaData = mapAdvanceAjuda(asRecordArray(payload.advanceAjuda));
  const serviceBenefitsData = mapServiceBenefits(
    asRecordArray(payload.recrutamentoSelecao),
  );
  const logosData = mapLogos(asRecordArray(payload.logoEnterprises));

  return (
    <div className="min-h-screen">
      <HeaderPages
        fetchFromApi={!(hasSection("headerPages") && !!headerData)}
        staticData={headerData ?? undefined}
        currentPage="/recrutamento"
      />
      <ProblemSolutionSection
        fetchFromApi={!(hasSection("planinhas") && !!planinhasData)}
        staticData={planinhasData ?? undefined}
      />
      <AdvanceAjuda
        fetchFromApi={!hasSection("advanceAjuda")}
        staticData={advanceAjudaData}
      />
      <ProcessSteps />
      <ServiceBenefits
        service="recrutamentoSelecao"
        fetchFromApi={!hasSection("recrutamentoSelecao")}
        staticData={serviceBenefitsData}
      />
      <PricingPlans fetchFromApi={true} />
      <LogoEnterprises
        fetchFromApi={!hasSection("logoEnterprises")}
        staticData={logosData}
      />
    </div>
  );
}
