import { getWebsiteSiteData } from "@/api/websites";
import type { WebsiteSiteDataSection } from "@/api/websites";
import HeaderPages from "@/theme/website/components/header-pages";
import type { HeaderPageData } from "@/theme/website/components/header-pages/types";
import ServiceBenefits from "@/theme/website/components/service-benefits";
import type { ServiceBenefitsData } from "@/theme/website/components/service-benefits/types";
import TrainingResults from "@/theme/website/components/training-results";
import type { TrainingResultData } from "@/theme/website/components/training-results/types";
import CommunicationHighlights from "@/theme/website/components/communication-highlights";
import type { CommunicationData } from "@/theme/website/components/communication-highlights/types";
import LogoEnterprises from "@/theme/website/components/logo-enterprises";
import type { LogoData } from "@/theme/website/components/logo-enterprises/types";

export const metadata = {
  title: "Treinamento",
};

type GenericRecord = Record<string, unknown>;

const TREINAMENTO_SECTIONS: WebsiteSiteDataSection[] = [
  "headerPages",
  "treinamentosInCompany",
  "conexaoForte",
  "treinamentoCompany",
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
    records.find((item) => toString(item.page).toUpperCase() === "TREINAMENTO") ??
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

function mapTrainingResults(records: GenericRecord[]): TrainingResultData[] {
  const first = records[0];
  if (!first) return [];

  return [1, 2, 3, 4, 5]
    .map((idx) => ({
      id: `${toString(first.id)}-${idx}`,
      title: toString(first[`descricao${idx}`]),
      iconName: toString(first[`icone${idx}`]) || undefined,
      color: "text-red-600",
      order: idx,
      isActive: Boolean(toString(first[`descricao${idx}`])),
    }))
    .filter((item) => item.isActive);
}

function mapCommunication(records: GenericRecord[]): CommunicationData | null {
  const first = records[0];
  if (!first) return null;

  return {
    textContent: {
      id: toString(first.id),
      title: toString(first.titulo),
      paragraphs: toString(first.descricao) ? [toString(first.descricao)] : [],
      order: 1,
      isActive: true,
    },
    gallery: [1, 2, 3, 4]
      .map((idx) => ({
        id: `${toString(first.id)}-img-${idx}`,
        imageUrl: toString(first[`imagemUrl${idx}`]),
        alt: toString(first[`imagemTitulo${idx}`]),
        order: idx,
        isActive: Boolean(toString(first[`imagemUrl${idx}`])),
      }))
      .filter((item) => item.isActive),
  };
}

function mapServiceBenefits(records: GenericRecord[]): ServiceBenefitsData[] {
  const first = records[0];
  if (!first) return [];

  return [
    {
      id: toString(first.id) || "treinamento-company",
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

export default async function TreinamentoPage() {
  let payload: Record<string, unknown> = {};

  try {
    const response = await getWebsiteSiteData({
      status: "PUBLICADO",
      sections: TREINAMENTO_SECTIONS,
    });
    payload = response.data ?? {};
  } catch (error) {
    console.error("Falha ao carregar site-data de /treinamento:", error);
  }

  const hasSection = (section: WebsiteSiteDataSection): boolean =>
    Object.prototype.hasOwnProperty.call(payload, section);

  const headerData = mapHeaderForPage(
    asRecordArray(payload.headerPages),
    "/treinamento",
  );
  const trainingResultsData = mapTrainingResults(
    asRecordArray(payload.treinamentosInCompany),
  );
  const communicationData = mapCommunication(asRecordArray(payload.conexaoForte));
  const serviceBenefitsData = mapServiceBenefits(
    asRecordArray(payload.treinamentoCompany),
  );
  const logosData = mapLogos(asRecordArray(payload.logoEnterprises));

  return (
    <div className="min-h-screen">
      <HeaderPages
        fetchFromApi={!(hasSection("headerPages") && !!headerData)}
        staticData={headerData ?? undefined}
        currentPage="/treinamento"
      />
      <TrainingResults
        fetchFromApi={!hasSection("treinamentosInCompany")}
        staticData={trainingResultsData}
      />
      <CommunicationHighlights
        fetchFromApi={!(hasSection("conexaoForte") && !!communicationData)}
        staticData={communicationData ?? undefined}
      />
      <ServiceBenefits
        service="treinamentoCompany"
        fetchFromApi={!hasSection("treinamentoCompany")}
        staticData={serviceBenefitsData}
      />
      <LogoEnterprises
        fetchFromApi={!hasSection("logoEnterprises")}
        staticData={logosData}
      />
    </div>
  );
}
