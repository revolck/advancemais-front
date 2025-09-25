"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { listAdminCompanies } from "@/api/empresas";
import { apiConfig } from "@/lib/env";
import {
  COMPANY_DASHBOARD_CONFIG,
  DEFAULT_COMPANY_PAGINATION,
} from "../constants";
import type {
  Partnership,
  UseCompanyDashboardDataOptions,
  UseCompanyDashboardDataReturn,
} from "../types";
import type {
  AdminCompanyListItem,
  AdminCompanyListParams,
} from "@/api/empresas";

function mapAdminCompanyToPartnership(
  company: AdminCompanyListItem
): Partnership {
  const plan = company.plano;
  const payment = null;
  const vagasPublicadas = company.vagasPublicadas ?? 0;
  const limiteVagas = company.limiteVagasPlano ?? plan?.quantidadeVagas ?? 0;

  return {
    id: company.id,
    tipo: plan?.modo,
    inicio: plan?.inicio ?? null,
    fim: plan?.fim ?? null,
    ativo: company.ativa,
    empresa: {
      id: company.id,
      nome: company.nome,
      avatarUrl: company.avatarUrl ?? null,
      cidade: company.cidade ?? null,
      estado: company.estado ?? null,
      descricao: company.informacoes?.descricao ?? null,
      instagram: null,
      linkedin: null,
      codUsuario: company.codUsuario,
      cnpj: company.cnpj ?? null,
      ativo: company.ativa,
      status: company.ativa ? "ATIVO" : "INATIVO",
      criadoEm: company.criadoEm ?? null,
      parceira: company.parceira,
      diasTesteDisponibilizados: company.diasTesteDisponibilizados ?? null,
      banida: company.banida,
      banimentoAtivo: company.banimentoAtivo ?? null,
    },
    plano: {
      id: plan?.id ?? `${company.id}-plano`,
      nome: plan?.nome ?? "Plano não informado",
      valor: plan?.valor ?? null,
      quantidadeVagas: plan?.quantidadeVagas ?? limiteVagas,
      vagasPublicadas,
      tipo: plan?.modo,
      inicio: plan?.inicio ?? null,
      fim: plan?.fim ?? null,
      metodoPagamento: null,
      modeloPagamento: null,
      statusPagamento: null,
      duracaoEmDias: plan?.duracaoEmDias ?? null,
      diasRestantes: plan?.diasRestantes ?? null,
    },
    raw: company,
    pagamento: payment ?? null,
  };
}

function buildParams(
  base: AdminCompanyListParams | undefined,
  pageSize: number,
  override?: Partial<AdminCompanyListParams>
): AdminCompanyListParams {
  const params: AdminCompanyListParams = {
    page: override?.page ?? base?.page ?? 1,
    pageSize: override?.pageSize ?? base?.pageSize ?? pageSize,
  };

  // Lógica para search - verificar se 'search' está presente no override
  if (override && "search" in override) {
    // Se override tem a propriedade search (mesmo que seja undefined), usar ele
    if (
      override.search &&
      typeof override.search === "string" &&
      override.search.trim().length > 0
    ) {
      params.search = override.search;
    }
    // Se override.search for undefined, null ou string vazia, não incluir search (listagem completa)
  } else if (base?.search !== undefined && base.search.trim().length > 0) {
    // Só usar base.search se override não tiver a propriedade search
    params.search = base.search;
  }

  return params;
}

export function useCompanyDashboardData({
  enabled = true,
  pageSize = COMPANY_DASHBOARD_CONFIG.api.defaultPageSize,
  initialData,
  initialParams,
  onSuccess,
  onError,
  autoFetch = true,
}: UseCompanyDashboardDataOptions = {}): UseCompanyDashboardDataReturn {
  const initialPagination = initialData
    ? {
        ...DEFAULT_COMPANY_PAGINATION,
        pageSize,
        total: initialData.length,
        totalPages: Math.ceil(initialData.length / pageSize) || 0,
      }
    : null;

  const [partnerships, setPartnerships] = useState<Partnership[]>(
    initialData ?? []
  );
  const partnershipsRef = useRef(partnerships);
  const [pagination, setPagination] = useState(initialPagination);
  const [isLoading, setIsLoading] = useState(enabled && !initialData);
  const [error, setError] = useState<string | null>(null);

  const paramsRef = useRef<AdminCompanyListParams>(
    buildParams(initialParams, pageSize)
  );

  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onSuccessRef.current = onSuccess;
  }, [onSuccess]);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  const fetchData = useCallback(
    async (
      override?: Partial<AdminCompanyListParams>
    ): Promise<Partnership[]> => {
      if (!enabled) {
        return partnershipsRef.current;
      }

      const params = buildParams(paramsRef.current, pageSize, override);
      console.log("🔧 buildParams result:", params);
      paramsRef.current = params;

      const controller = new AbortController();
      const timeoutId = window.setTimeout(
        () => controller.abort(),
        COMPANY_DASHBOARD_CONFIG.api.timeout
      );

      try {
        setIsLoading(true);
        setError(null);

        const response = await listAdminCompanies(params, {
          signal: controller.signal,
          headers: { Accept: apiConfig.headers.Accept },
        });

        if (!("data" in response)) {
          throw new Error("Resposta inválida da API");
        }
        const mapped = response.data.map(mapAdminCompanyToPartnership);
        partnershipsRef.current = mapped;
        setPartnerships(mapped);
        setPagination(
          response.pagination ?? {
            ...DEFAULT_COMPANY_PAGINATION,
            page: params.page ?? 1,
            pageSize: params.pageSize ?? pageSize,
            total: mapped.length,
            totalPages:
              Math.ceil(mapped.length / (params.pageSize ?? pageSize)) || 0,
          }
        );
        onSuccessRef.current?.(mapped, response);
        return mapped;
      } catch (err) {
        let message = "Erro ao carregar empresas.";

        if (err instanceof Error) {
          if (err.name === "AbortError") {
            message = "Tempo limite excedido ao carregar empresas.";
          } else {
            message = err.message;
          }
        }

        console.error("Erro ao buscar empresas (admin):", err);
        setError(message);
        onErrorRef.current?.(message);

        throw err;
      } finally {
        window.clearTimeout(timeoutId);
        setIsLoading(false);
      }
    },
    [enabled, pageSize]
  );

  useEffect(() => {
    partnershipsRef.current = partnerships;
  }, [partnerships]);

  const initialParamsRef = useRef(initialParams);
  useEffect(() => {
    initialParamsRef.current = initialParams;
  }, [initialParams]);

  useEffect(() => {
    if (!enabled || !autoFetch) return;
    fetchData(initialParamsRef.current);
  }, [enabled, autoFetch, fetchData]);

  return {
    partnerships,
    pagination,
    isLoading,
    error,
    refetch: fetchData,
  };
}
