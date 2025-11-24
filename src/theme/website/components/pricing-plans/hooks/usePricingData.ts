// src/theme/website/components/pricing-plans/hooks/usePricingData.ts

"use client";

import { useState, useEffect, useCallback } from "react";
import type { PricingPlanData } from "../types";
import { PRICING_CONFIG } from "../constants";
import { listPlanosEmpresariais } from "@/api/empresas/planos-empresariais";
import type { PlanoEmpresarialBackendResponse } from "@/api/empresas/planos-empresariais/types";

interface UsePricingDataReturn {
  data: PricingPlanData[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Hook para buscar dados dos planos de preços da API
 */
export function usePricingData(
  fetchFromApi: boolean = true,
  staticData?: PricingPlanData[]
): UsePricingDataReturn {
  const [data, setData] = useState<PricingPlanData[]>(staticData || []);
  const [isLoading, setIsLoading] = useState(fetchFromApi);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!fetchFromApi) {
      setData(staticData || []);
      setError(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const response = await listPlanosEmpresariais();

      // Verificar se é um array (sucesso) ou objeto de erro
      if (Array.isArray(response)) {
        const mapped = mapPlanoEmpresarialToPricingData(response);
        setData(mapped);

        if (mapped.length === 0) {
          setError("Nenhum plano empresarial cadastrado no momento.");
        }
      } else {
        console.error("Erro na resposta da API:", response);
        setError(response.message || "Erro ao carregar planos empresariais");
      }
    } catch (err) {
      console.error("Erro ao buscar dados dos planos:", err);

      if (err instanceof Error) {
        if (err.name === "AbortError") {
          setError("Tempo limite excedido ao carregar os planos empresariais.");
        } else {
          setError(`Erro na API: ${err.message}`);
        }
      } else {
        setError("Erro desconhecido ao carregar os planos empresariais.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [fetchFromApi, staticData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
  };
}

function formatCurrencyValue(value: string): string {
  if (!value) return "0,00";
  const trimmed = value.trim();
  const hasComma = trimmed.includes(",");
  const hasDot = trimmed.includes(".");

  let normalized = trimmed;

  if (hasComma && hasDot) {
    normalized = trimmed.replace(/\./g, "").replace(",", ".");
  } else if (hasComma) {
    normalized = trimmed.replace(",", ".");
  }

  const amount = Number.parseFloat(normalized);
  if (Number.isNaN(amount)) {
    return trimmed;
  }

  return amount.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function buildFeatureList(plan: PlanoEmpresarialBackendResponse): string[] {
  const features: string[] = [];

  const vagas = Number(plan.quantidadeVagas) || 0;
  if (vagas > 0) {
    features.push(
      `${vagas} vaga${vagas === 1 ? "" : "s"} publicadas simultaneamente`
    );
  }

  if (plan.vagaEmDestaque) {
    const destaque = Number(plan.quantidadeVagasDestaque) || 0;
    if (destaque > 0) {
      features.push(
        `${destaque} vaga${destaque === 1 ? "" : "s"} em destaque incluíd${
          destaque === 1 ? "a" : "as"
        }`
      );
    } else {
      features.push("Destaque de vagas incluído no pacote");
    }
  } else {
    features.push("Gestão de vagas com divulgação padrão");
  }

  if (plan.desconto > 0) {
    features.push(`Desconto de ${plan.desconto}% em renovações e upgrades`);
  } else {
    features.push("Investimento fixo sem descontos adicionais");
  }

  features.push("Suporte especializado da equipe Advance+");

  return features;
}

function mapPlanoEmpresarialToPricingData(
  plans: PlanoEmpresarialBackendResponse[]
): PricingPlanData[] {
  if (!plans?.length) {
    return [];
  }

  const highestVacancyCount = Math.max(
    ...plans.map((plan) => Number(plan.quantidadeVagas) || 0)
  );

  return plans.map((plan, index) => ({
    id: plan.id,
    title: plan.nome,
    iconName: plan.icon || PRICING_CONFIG.icons.fallbackIcon,
    price: formatCurrencyValue(plan.valor),
    description: (plan.descricao && plan.descricao.trim()) || null, // Converte string vazia, null ou undefined para null
    features: buildFeatureList(plan),
    isPopular:
      (Number(plan.quantidadeVagas) || 0) === highestVacancyCount &&
      highestVacancyCount > 0,
    isActive: true,
    order: index,
    buttonText: PRICING_CONFIG.defaults.buttonText,
    buttonUrl: PRICING_CONFIG.defaults.buttonUrl,
    period: PRICING_CONFIG.defaults.period,
    currency: PRICING_CONFIG.defaults.currency,
  }));
}
