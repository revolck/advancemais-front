import { apiFetch } from "@/api/client";
import { websiteRoutes } from "@/api/routes";
import { apiConfig } from "@/lib/env";
import type {
  CreateMarketingEmailPayload,
  MarketingEmailFilterOptions,
  MarketingEmailFilterOptionsResponse,
  ListMarketingEmailsParams,
  ListMarketingEmailsResponse,
  MarketingEmail,
  MarketingEmailDetail,
  MarketingEmailRecipientOptions,
  MarketingEmailRecipientOptionsResponse,
  MarketingEmailResponse,
  UpdateMarketingEmailPayload,
} from "./types";

function getAuthHeader(): Record<string, string> {
  if (typeof document === "undefined") return {};
  const token = document.cookie
    .split("; ")
    .find((row) => row.startsWith("token="))
    ?.split("=")[1];
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function jsonHeaders(): Record<string, string> {
  return {
    Accept: apiConfig.headers.Accept,
    "Content-Type": apiConfig.headers["Content-Type"],
    ...getAuthHeader(),
  };
}

function buildQuery(params: Record<string, string | number | undefined>) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      searchParams.set(key, String(value));
    }
  });
  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

export async function listMarketingEmails(
  params: ListMarketingEmailsParams = {},
): Promise<ListMarketingEmailsResponse> {
  return apiFetch<ListMarketingEmailsResponse>(
    `${websiteRoutes.emailsMarketing.list()}${buildQuery(params as Record<string, string | number | undefined>)}`,
    {
      init: { headers: jsonHeaders() },
      cache: "no-cache",
    },
  );
}

export async function getMarketingEmailById(
  id: string,
): Promise<MarketingEmailDetail> {
  const response = await apiFetch<MarketingEmailResponse>(
    websiteRoutes.emailsMarketing.get(id),
    {
      init: { headers: jsonHeaders() },
      cache: "no-cache",
    },
  );

  return response.data;
}

export async function getMarketingEmailRecipientOptions(): Promise<MarketingEmailRecipientOptions> {
  const response = await apiFetch<MarketingEmailRecipientOptionsResponse>(
    websiteRoutes.emailsMarketing.recipientOptions(),
    {
      init: { headers: jsonHeaders() },
      cache: "no-cache",
    },
  );

  return response.data;
}

export async function getMarketingEmailFilterOptions(): Promise<MarketingEmailFilterOptions> {
  const response = await apiFetch<MarketingEmailFilterOptionsResponse>(
    websiteRoutes.emailsMarketing.filterOptions(),
    {
      init: { headers: jsonHeaders() },
      cache: "no-cache",
    },
  );

  return response.data;
}

export async function createMarketingEmail(
  payload: CreateMarketingEmailPayload,
): Promise<MarketingEmail> {
  const response = await apiFetch<MarketingEmailResponse>(
    websiteRoutes.emailsMarketing.create(),
    {
      init: {
        method: "POST",
        headers: jsonHeaders(),
        body: JSON.stringify(payload),
      },
      cache: "no-cache",
    },
  );

  return response.data;
}

export async function updateMarketingEmail(
  id: string,
  payload: UpdateMarketingEmailPayload,
): Promise<MarketingEmail> {
  const response = await apiFetch<MarketingEmailResponse>(
    websiteRoutes.emailsMarketing.update(id),
    {
      init: {
        method: "PUT",
        headers: jsonHeaders(),
        body: JSON.stringify(payload),
      },
      cache: "no-cache",
    },
  );

  return response.data;
}

export async function deleteMarketingEmail(id: string): Promise<void> {
  await apiFetch<void>(websiteRoutes.emailsMarketing.delete(id), {
    init: {
      method: "DELETE",
      headers: jsonHeaders(),
    },
    cache: "no-cache",
  });
}

export type {
  CreateMarketingEmailPayload,
  ListMarketingEmailsParams,
  ListMarketingEmailsResponse,
  MarketingEmail,
  MarketingEmailBuilderConfig,
  MarketingEmailContentConfig,
  MarketingEmailDetail,
  MarketingEmailFilterOptions,
  MarketingEmailListItem,
  MarketingEmailPagination,
  MarketingEmailRecipientOption,
  MarketingEmailRecipientOptions,
  MarketingEmailMode,
  MarketingEmailSenderConfig,
  MarketingEmailSettingsConfig,
  MarketingEmailStatus,
  MarketingEmailTargetConfig,
  MarketingEmailTemplate,
  MarketingEmailType,
  MarketingEmailWorkflowStatus,
  UpdateMarketingEmailPayload,
} from "./types";
