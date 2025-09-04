import { websiteRoutes } from "@/api/routes";
import { apiFetch } from "@/api/client";
import { apiConfig, env } from "@/lib/env";
import type {
  ServiceBenefitsData,
  ServiceType,
} from "@/theme/website/components/service-benefits/types";

const serviceEndpoints: Record<ServiceType, () => string> = {
  recrutamentoSelecao: websiteRoutes.recrutamentoSelecao.list,
  treinamentoCompany: websiteRoutes.treinamentoCompany.list,
};

export async function listServiceBenefits(
  service: ServiceType,
  init?: RequestInit,
): Promise<ServiceBenefitsData[]> {
  const endpoint = serviceEndpoints[service]();
  return apiFetch<ServiceBenefitsData[]>(endpoint, {
    init: init ?? { headers: apiConfig.headers },
  });
}

export async function getServiceBenefitsData(
  service: ServiceType,
): Promise<ServiceBenefitsData[]> {
  try {
    return await listServiceBenefits(service, {
      headers: apiConfig.headers,
      ...apiConfig.cache.medium,
    });
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
    return await listServiceBenefits(service, { headers: apiConfig.headers });
  } catch (error) {
    if (env.apiFallback === "mock") {
      return [];
    }
    throw error;
  }
}

