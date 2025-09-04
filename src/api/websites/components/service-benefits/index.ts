import { websiteRoutes } from "@/api/routes";
import { apiFetch } from "@/api/client";
import { apiConfig, env } from "@/lib/env";
import type {
  ServiceBenefitsData,
  ServiceType,
  ServiceBenefit,
} from "@/theme/website/components/service-benefits/types";
import type { RecrutamentoSelecaoBackendResponse } from "../recrutamento-selecao/types";
import type { TreinamentoCompanyBackendResponse } from "../treinamento-company/types";

function mapRecrutamentoSelecao(
  items: RecrutamentoSelecaoBackendResponse[],
): ServiceBenefitsData[] {
  const first = items?.[0];
  if (!first) return [];

  const benefits = [first.titulo1, first.titulo2, first.titulo3, first.titulo4]
    .filter(Boolean)
    .map((text, idx) => ({
      id: `benefit-${idx + 1}`,
      text: text as string,
      gradientType: (idx % 2 === 0
        ? "secondary"
        : "primary") as ServiceBenefit["gradientType"],
      order: idx + 1,
      isActive: true,
    }));

  const data: ServiceBenefitsData = {
    id: first.id || "recrutamento-selecao",
    title: first.titulo,
    subtitle: undefined,
    description: first.descricao,
    imageUrl: first.imagemUrl || "/images/home/banner_site_3.webp",
    imageAlt: first.imagemTitulo || "Equipe trabalhando em recrutamento e seleção",
    benefits,
    order: 1,
    isActive: true,
  };
  return [data];
}

async function fetchRecrutamentoSelecao(): Promise<ServiceBenefitsData[]> {
  const res = await apiFetch<RecrutamentoSelecaoBackendResponse[]>(
    websiteRoutes.recrutamentoSelecao.list(),
    { init: { headers: apiConfig.headers } },
  );
  return mapRecrutamentoSelecao(res);
}

function mapTreinamentoCompany(
  items: TreinamentoCompanyBackendResponse[],
): ServiceBenefitsData[] {
  const first = items?.[0];
  if (!first) return [];

  const benefits = [first.titulo1, first.titulo2, first.titulo3, first.titulo4]
    .filter(Boolean)
    .map((text, idx) => ({
      id: `benefit-${idx + 1}`,
      text: text as string,
      gradientType: (idx % 2 === 0
        ? "secondary"
        : "primary") as ServiceBenefit["gradientType"],
      order: idx + 1,
      isActive: true,
    }));

  const data: ServiceBenefitsData = {
    id: first.id || "treinamento-company",
    title: first.titulo,
    subtitle: undefined,
    description: first.descricao,
    imageUrl: first.imagemUrl || "/images/home/banner_site_3.webp",
    imageAlt:
      first.imagemTitulo || "Profissionais participando de treinamento in company",
    benefits,
    order: 1,
    isActive: true,
  };
  return [data];
}

async function fetchTreinamentoCompany(): Promise<ServiceBenefitsData[]> {
  const res = await apiFetch<TreinamentoCompanyBackendResponse[]>(
    websiteRoutes.treinamentoCompany.list(),
    { init: { headers: apiConfig.headers } },
  );
  return mapTreinamentoCompany(res);
}

export async function listServiceBenefits(
  service: ServiceType,
  init?: RequestInit,
): Promise<ServiceBenefitsData[]> {
  // init é mantido por compatibilidade; usamos apiConfig internamente
  switch (service) {
    case "recrutamentoSelecao":
      return fetchRecrutamentoSelecao();
    case "treinamentoCompany":
      return fetchTreinamentoCompany();
    default:
      return [];
  }
}

export async function getServiceBenefitsData(
  service: ServiceType,
): Promise<ServiceBenefitsData[]> {
  try {
    const data = await listServiceBenefits(service, {
      headers: apiConfig.headers,
      ...apiConfig.cache.medium,
    } as any);
    return data;
  } catch (error) {
    if (env.apiFallback === "mock") {
      return [];
    }
    throw error;
  }
}

export async function getServiceBenefitsDataClient(
  service: ServiceType,
): Promise<ServiceBenefitsData[]> {
  try {
    const data = await listServiceBenefits(service, { headers: apiConfig.headers });
    return data;
  } catch (error) {
    if (env.apiFallback === "mock") {
      return [];
    }
    throw error;
  }
}
