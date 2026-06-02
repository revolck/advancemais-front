import { apiFetch } from "@/api/client";
import { configuracoesGeraisRoutes } from "@/api/routes";
import { apiConfig } from "@/lib/env";
import type {
  ConfigCategory,
  ConfiguracoesGeraisHistoricoResponse,
  ConfiguracoesGeraisListResponse,
  PublicMercadoPagoConfigResponse,
  TestConfiguracaoGeralResponse,
  UpdateConfiguracaoGeralPayload,
  UpdateConfiguracaoGeralResponse,
} from "./types";

const JSON_HEADERS = {
  ...apiConfig.headers,
  Accept: "application/json",
  "Content-Type": "application/json",
} as const;

export async function getConfiguracoesGerais() {
  return apiFetch<ConfiguracoesGeraisListResponse>(
    configuracoesGeraisRoutes.list(),
    { cache: "no-cache" },
  );
}

export async function updateConfiguracaoGeral(
  categoria: ConfigCategory,
  payload: UpdateConfiguracaoGeralPayload,
) {
  return apiFetch<UpdateConfiguracaoGeralResponse>(
    configuracoesGeraisRoutes.update(categoria),
    {
      init: {
        method: "PATCH",
        headers: JSON_HEADERS,
        body: JSON.stringify(payload),
      },
      cache: "no-cache",
      retries: 1,
    },
  );
}

export async function testarConfiguracaoGeral(categoria: ConfigCategory) {
  return apiFetch<TestConfiguracaoGeralResponse>(
    configuracoesGeraisRoutes.test(categoria),
    {
      init: {
        method: "POST",
        headers: JSON_HEADERS,
      },
      cache: "no-cache",
      retries: 1,
    },
  );
}

export async function getConfiguracoesGeraisHistorico(params = { page: 1, pageSize: 20 }) {
  const searchParams = new URLSearchParams();
  searchParams.set("page", String(params.page));
  searchParams.set("pageSize", String(params.pageSize));

  return apiFetch<ConfiguracoesGeraisHistoricoResponse>(
    configuracoesGeraisRoutes.history(searchParams.toString()),
    { cache: "no-cache" },
  );
}

export async function getPublicMercadoPagoConfig() {
  return apiFetch<PublicMercadoPagoConfigResponse>(
    configuracoesGeraisRoutes.publicMercadoPago(),
    {
      cache: "no-cache",
      skipLogoutOn401: true,
      silence403: true,
      silence404: true,
      silenceConnectionErrors: true,
      retries: 1,
    },
  );
}
