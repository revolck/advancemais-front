import { apiFetch } from "@/api/client";
import { websiteRoutes } from "@/api/routes";
import { apiConfig } from "@/lib/env";
import type {
  CreateRecipientListFolderPayload,
  CreateRecipientListPayload,
  ListRecipientListsParams,
  ListRecipientListsResponse,
  RecipientList,
  RecipientListFolder,
  RecipientListFolderResponse,
  RecipientListFoldersResponse,
  RecipientListRecipientsOptions,
  RecipientListRecipientsOptionsParams,
  RecipientListRecipientsOptionsResponse,
  RecipientListResponse,
  RecipientListStatusSnapshot,
  RecipientListStatusesParams,
  RecipientListStatusesResponse,
  RecipientListsRuleOptions,
  RecipientListsRuleOptionsResponse,
  UpdateRecipientListFolderPayload,
  UpdateRecipientListPayload,
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

export async function listRecipientLists(
  params: ListRecipientListsParams = {},
): Promise<ListRecipientListsResponse> {
  return apiFetch<ListRecipientListsResponse>(
    `${websiteRoutes.recipientLists.list()}${buildQuery(params as Record<string, string | number | undefined>)}`,
    {
      init: { headers: jsonHeaders() },
      cache: "no-cache",
    },
  );
}

export async function getRecipientListById(id: string): Promise<RecipientList> {
  const response = await apiFetch<RecipientListResponse>(
    websiteRoutes.recipientLists.get(id),
    {
      init: { headers: jsonHeaders() },
      cache: "no-cache",
    },
  );

  return response.data;
}

export async function createRecipientList(
  payload: CreateRecipientListPayload,
): Promise<RecipientList> {
  const response = await apiFetch<RecipientListResponse>(
    websiteRoutes.recipientLists.create(),
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

export async function updateRecipientList(
  id: string,
  payload: UpdateRecipientListPayload,
): Promise<RecipientList> {
  const response = await apiFetch<RecipientListResponse>(
    websiteRoutes.recipientLists.update(id),
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

export async function deleteRecipientList(id: string): Promise<void> {
  await apiFetch<void>(websiteRoutes.recipientLists.delete(id), {
    init: {
      method: "DELETE",
      headers: jsonHeaders(),
    },
    cache: "no-cache",
  });
}

export async function recalculateRecipientList(
  id: string,
): Promise<RecipientList> {
  const response = await apiFetch<RecipientListResponse>(
    websiteRoutes.recipientLists.recalculate(id),
    {
      init: {
        method: "POST",
        headers: jsonHeaders(),
      },
      cache: "no-cache",
    },
  );

  return response.data;
}

export async function getRecipientListStatuses(
  params: RecipientListStatusesParams,
): Promise<RecipientListStatusSnapshot[]> {
  const response = await apiFetch<RecipientListStatusesResponse>(
    `${websiteRoutes.recipientLists.statuses()}${buildQuery({
      listIds: params.listIds.join(","),
    })}`,
    {
      init: { headers: jsonHeaders() },
      cache: "no-cache",
    },
  );

  return response.data;
}

export async function listRecipientListFolders(): Promise<RecipientListFolder[]> {
  const response = await apiFetch<RecipientListFoldersResponse>(
    websiteRoutes.recipientListFolders.list(),
    {
      init: { headers: jsonHeaders() },
      cache: "no-cache",
    },
  );

  return response.folders;
}

export async function createRecipientListFolder(
  payload: CreateRecipientListFolderPayload,
): Promise<RecipientListFolder> {
  const response = await apiFetch<RecipientListFolderResponse>(
    websiteRoutes.recipientListFolders.create(),
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

export async function updateRecipientListFolder(
  id: string,
  payload: UpdateRecipientListFolderPayload,
): Promise<RecipientListFolder> {
  const response = await apiFetch<RecipientListFolderResponse>(
    websiteRoutes.recipientListFolders.update(id),
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

export async function deleteRecipientListFolder(id: string): Promise<void> {
  await apiFetch<void>(websiteRoutes.recipientListFolders.delete(id), {
    init: {
      method: "DELETE",
      headers: jsonHeaders(),
    },
    cache: "no-cache",
  });
}

export async function getRecipientListRuleOptions(): Promise<RecipientListsRuleOptions> {
  const response = await apiFetch<RecipientListsRuleOptionsResponse>(
    websiteRoutes.recipientLists.rulesOptions(),
    {
      init: { headers: jsonHeaders() },
      cache: "no-cache",
    },
  );

  return response.data;
}

export async function getRecipientListRecipientsOptions(
  params: RecipientListRecipientsOptionsParams = {},
): Promise<RecipientListRecipientsOptions> {
  const response = await apiFetch<RecipientListRecipientsOptionsResponse>(
    `${websiteRoutes.recipientLists.recipientsOptions()}${buildQuery(params as Record<string, string | number | undefined>)}`,
    {
      init: { headers: jsonHeaders() },
      cache: "no-cache",
    },
  );

  return response.data;
}

export type {
  CreateRecipientListFolderPayload,
  CreateRecipientListPayload,
  ListRecipientListsParams,
  ListRecipientListsResponse,
  RecipientKind,
  RecipientList,
  RecipientListCondition,
  RecipientListConditionField,
  RecipientListConditionOperator,
  RecipientListFolder,
  RecipientListListItem,
  RecipientListLogicOperator,
  RecipientListMembershipMode,
  RecipientListPagination,
  RecipientListRecipientsOptions,
  RecipientListRecipientsOptionsParams,
  RecipientListRuleFieldMeta,
  RecipientListRuleCategory,
  RecipientListRuleRoutine,
  RecipientListRulesGroup,
  RecipientListStatusSnapshot,
  RecipientListStatus,
  RecipientOptionItem,
  RecipientReference,
  RecipientListsRuleOptions,
  UpdateRecipientListFolderPayload,
  UpdateRecipientListPayload,
} from "./types";
