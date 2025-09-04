import { websiteRoutes } from "@/api/routes";
import { apiFetch } from "@/api/client";
import { apiConfig, env } from "@/lib/env";
import type {
  ServiceBenefitsData,
  ServiceType,
} from "@/theme/website/components/service-benefits/types";
import type { RecrutamentoSelecaoBackendResponse } from "../recrutamento-selecao/types";

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
      gradientType: (idx % 2 === 0 ? "secondary" : "primary") as const,
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

async function fetchTreinamentoCompany(): Promise<ServiceBenefitsData[]> {
  // Caso a API de treinamento-company já entregue no formato final,
  // apenas retornamos os dados. Se não, faremos um mapeamento similar ao acima
  // quando o contrato estiver definido.
  const res = await apiFetch<any[]>(websiteRoutes.treinamentoCompany.list(), {
    init: { headers: apiConfig.headers },
  });

  // Se já vier no formato esperado, valide superficialmente
  if (Array.isArray(res) && res.length > 0 && "benefits" in (res[0] || {})) {
    return res as ServiceBenefitsData[];
  }

  // Sem dados ou contrato diferente -> lista vazia (hook fará fallback)
  return [];
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
