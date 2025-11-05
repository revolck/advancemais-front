import { apiFetch } from "@/api/client";
import { mercadoPagoRoutes } from "@/api/routes";
import { apiConfig } from "@/lib/env";

import type {
  CheckoutIntent,
  CheckoutResponse,
  CancelSubscriptionPayload,
  CancelSubscriptionResponse,
  PlanChangePayload,
  PlanChangeResponse,
  RemindPaymentPayload,
  RemindPaymentResponse,
  ReconcileResponse,
  AdminRemindPaymentPayload,
  AdminRemindResponse,
  SyncPlanPayload,
  SyncPlanResponse,
  SyncPlansResponse,
  LogsListParams,
  LogsListResponse,
  LogPagamento,
} from "./types";

const ACCEPT_HEADER = { Accept: apiConfig.headers.Accept } as const;
const JSON_HEADERS = {
  ...ACCEPT_HEADER,
  "Content-Type": apiConfig.headers["Content-Type"],
} as const;

function authHeaders(token?: string) {
  if (token) return { ...ACCEPT_HEADER, Authorization: `Bearer ${token}` };
  if (typeof document === "undefined") return ACCEPT_HEADER;
  const cookieToken = document.cookie
    .split("; ")
    .find((row) => row.startsWith("token="))
    ?.split("=")[1];
  return cookieToken
    ? { ...ACCEPT_HEADER, Authorization: `Bearer ${cookieToken}` }
    : ACCEPT_HEADER;
}

// ---------------------------------------------
// Logs
// ---------------------------------------------
export async function listPaymentLogs(
  params?: LogsListParams,
  token?: string,
): Promise<LogsListResponse> {
  const sp = new URLSearchParams();
  if (params) {
    if (params.usuarioId) sp.set("usuarioId", params.usuarioId);
    if (params.empresasPlanoId) sp.set("empresasPlanoId", params.empresasPlanoId);
    if (params.tipo) sp.set("tipo", params.tipo);
    if (params.startDate) sp.set("startDate", params.startDate);
    if (params.endDate) sp.set("endDate", params.endDate);
    if (params.page) sp.set("page", String(params.page));
    if (params.pageSize) sp.set("pageSize", String(params.pageSize));
  }
  const url = sp.toString()
    ? `${mercadoPagoRoutes.logs.list()}?${sp.toString()}`
    : mercadoPagoRoutes.logs.list();
  return apiFetch<LogsListResponse>(url, {
    init: { method: "GET", headers: authHeaders(token) },
    cache: "no-cache",
  });
}

export async function getPaymentLogById(
  id: string,
  token?: string,
): Promise<LogPagamento> {
  return apiFetch<LogPagamento>(mercadoPagoRoutes.logs.get(id), {
    init: { method: "GET", headers: authHeaders(token) },
    cache: "no-cache",
  });
}

// ---------------------------------------------
// Assinaturas
// ---------------------------------------------
export async function startCheckout(
  intent: CheckoutIntent,
  token?: string,
): Promise<CheckoutResponse> {
  return apiFetch<CheckoutResponse>(mercadoPagoRoutes.assinaturas.checkout(), {
    init: {
      method: "POST",
      headers: token
        ? { ...JSON_HEADERS, Authorization: `Bearer ${token}` }
        : JSON_HEADERS,
      body: JSON.stringify(intent),
    },
    cache: "no-cache",
  });
}

export async function cancelSubscription(
  payload: CancelSubscriptionPayload,
  token?: string,
): Promise<CancelSubscriptionResponse> {
  return apiFetch<CancelSubscriptionResponse>(
    mercadoPagoRoutes.assinaturas.cancelar(),
    {
      init: {
        method: "POST",
        headers: token
          ? { ...JSON_HEADERS, Authorization: `Bearer ${token}` }
          : JSON_HEADERS,
        body: JSON.stringify(payload),
      },
      cache: "no-cache",
    },
  );
}

export async function upgradeSubscription(
  payload: PlanChangePayload,
  token?: string,
): Promise<PlanChangeResponse> {
  return apiFetch<PlanChangeResponse>(mercadoPagoRoutes.assinaturas.upgrade(), {
    init: {
      method: "POST",
      headers: token
        ? { ...JSON_HEADERS, Authorization: `Bearer ${token}` }
        : JSON_HEADERS,
      body: JSON.stringify(payload),
    },
    cache: "no-cache",
  });
}

export async function downgradeSubscription(
  payload: PlanChangePayload,
  token?: string,
): Promise<PlanChangeResponse> {
  return apiFetch<PlanChangeResponse>(
    mercadoPagoRoutes.assinaturas.downgrade(),
    {
      init: {
        method: "POST",
        headers: token
          ? { ...JSON_HEADERS, Authorization: `Bearer ${token}` }
          : JSON_HEADERS,
        body: JSON.stringify(payload),
      },
      cache: "no-cache",
    },
  );
}

export async function remindPayment(
  payload: RemindPaymentPayload,
  token?: string,
): Promise<RemindPaymentResponse> {
  return apiFetch<RemindPaymentResponse>(
    mercadoPagoRoutes.assinaturas.remindPayment(),
    {
      init: {
        method: "POST",
        headers: token
          ? { ...JSON_HEADERS, Authorization: `Bearer ${token}` }
          : JSON_HEADERS,
        body: JSON.stringify(payload),
      },
      cache: "no-cache",
    },
  );
}

export async function reconcileSubscriptions(token?: string): Promise<ReconcileResponse> {
  return apiFetch<ReconcileResponse>(mercadoPagoRoutes.assinaturas.reconcile(), {
    init: {
      method: "POST",
      headers: authHeaders(token),
    },
    cache: "no-cache",
  });
}

// ---------------------------------------------
// Admin
// ---------------------------------------------
export async function adminRemindPayment(
  payload: AdminRemindPaymentPayload,
  token?: string,
): Promise<AdminRemindResponse> {
  return apiFetch<AdminRemindResponse>(
    mercadoPagoRoutes.assinaturas.admin.remindPayment(),
    {
      init: {
        method: "POST",
        headers: token
          ? { ...JSON_HEADERS, Authorization: `Bearer ${token}` }
          : JSON_HEADERS,
        body: JSON.stringify(payload),
      },
      cache: "no-cache",
    },
  );
}

export async function adminSyncPlan(
  payload: SyncPlanPayload,
  token?: string,
): Promise<SyncPlanResponse> {
  return apiFetch<SyncPlanResponse>(mercadoPagoRoutes.assinaturas.admin.syncPlan(), {
    init: {
      method: "POST",
      headers: token
        ? { ...JSON_HEADERS, Authorization: `Bearer ${token}` }
        : JSON_HEADERS,
      body: JSON.stringify(payload),
    },
    cache: "no-cache",
  });
}

export async function adminSyncPlans(token?: string): Promise<SyncPlansResponse> {
  return apiFetch<SyncPlansResponse>(mercadoPagoRoutes.assinaturas.admin.syncPlans(), {
    init: {
      method: "POST",
      headers: authHeaders(token),
    },
    cache: "no-cache",
  });
}

export * from "./types";

