import { apiFetch } from "@/api/client";
import { websiteRoutes } from "@/api/routes";
import { apiConfig } from "@/lib/env";
import type {
  ActivePopupsParams,
  CreatePopupLeadInterestPayload,
  CreatePopupLeadNotePayload,
  CreatePopupLeadOpportunityPayload,
  CreatePopupContactPayload,
  CreatePopupPayload,
  ListPopupContactsParams,
  ListPopupContactsResponse,
  ListPopupsParams,
  ListPopupsResponse,
  PopupLeadDetail,
  PopupLeadInterest,
  PopupLeadNote,
  PopupLeadOpportunity,
  PopupContactHistoryResponse,
  PopupLeadActivityItem,
  PopupLeadActivityResponse,
  PopupLeadResponse,
  PopupResponse,
  UpdatePopupLeadNotePayload,
  UpdatePopupLeadOpportunityPayload,
  UpdatePopupContactPayload,
  UpdatePopupPayload,
  WebsitePopup,
} from "./types";

function getAuthHeader(): Record<string, string> {
  if (typeof document === "undefined") return {};
  const token = document.cookie
    .split("; ")
    .find((row) => row.startsWith("token="))
    ?.split("=")[1];
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function jsonHeaders(auth = true): Record<string, string> {
  return {
    Accept: apiConfig.headers.Accept,
    "Content-Type": apiConfig.headers["Content-Type"],
    ...(auth ? getAuthHeader() : {}),
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

export async function listPopups(
  params: ListPopupsParams = {},
): Promise<ListPopupsResponse> {
  return apiFetch<ListPopupsResponse>(
    `${websiteRoutes.popups.list()}${buildQuery(params as Record<string, string | number | undefined>)}`,
    {
      init: { headers: jsonHeaders() },
      cache: "no-cache",
    },
  );
}

export async function getPopupById(id: string): Promise<WebsitePopup> {
  const response = await apiFetch<PopupResponse>(websiteRoutes.popups.get(id), {
    init: { headers: jsonHeaders() },
    cache: "no-cache",
  });
  return response.data;
}

export async function createPopup(
  payload: CreatePopupPayload,
): Promise<WebsitePopup> {
  const response = await apiFetch<PopupResponse>(
    websiteRoutes.popups.create(),
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

export async function updatePopup(
  id: string,
  payload: UpdatePopupPayload,
): Promise<WebsitePopup> {
  const response = await apiFetch<PopupResponse>(
    websiteRoutes.popups.update(id),
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

export async function deletePopup(id: string): Promise<void> {
  await apiFetch<void>(websiteRoutes.popups.delete(id), {
    init: {
      method: "DELETE",
      headers: jsonHeaders(),
    },
    cache: "no-cache",
  });
}

export async function listActivePopups(
  params: ActivePopupsParams,
): Promise<WebsitePopup[]> {
  return apiFetch<WebsitePopup[]>(
    `${websiteRoutes.popups.active()}${buildQuery({
      scope: params.scope,
      path: params.path,
      device: params.device,
    })}`,
    {
      init: { headers: jsonHeaders(false) },
      cache: "no-cache",
      skipLogoutOn401: true,
      silence403: true,
      silence404: true,
      silenceConnectionErrors: true,
      retries: 1,
    },
  );
}

export async function createPopupContact(
  popupId: string,
  payload: CreatePopupContactPayload,
): Promise<void> {
  await apiFetch(websiteRoutes.popups.createContact(popupId), {
    init: {
      method: "POST",
      headers: jsonHeaders(false),
      body: JSON.stringify(payload),
    },
    cache: "no-cache",
    skipLogoutOn401: true,
  });
}

export async function listPopupContacts(
  params: ListPopupContactsParams = {},
): Promise<ListPopupContactsResponse> {
  return apiFetch<ListPopupContactsResponse>(
    `${websiteRoutes.popups.contacts()}${buildQuery(params as Record<string, string | number | undefined>)}`,
    {
      init: { headers: jsonHeaders() },
      cache: "no-cache",
    },
  );
}

export async function getPopupContact(id: string): Promise<PopupLeadDetail> {
  const response = await apiFetch<PopupLeadResponse>(
    websiteRoutes.popups.contact(id),
    {
      init: { headers: jsonHeaders() },
      cache: "no-cache",
    },
  );

  return response.data;
}

export async function getPopupContactHistory(id: string) {
  const response = await apiFetch<PopupContactHistoryResponse>(
    websiteRoutes.popups.contactHistory(id),
    {
      init: { headers: jsonHeaders() },
      cache: "no-cache",
    },
  );

  return response.history;
}

export async function getPopupContactActivity(
  id: string,
): Promise<PopupLeadActivityItem[]> {
  const response = await apiFetch<PopupLeadActivityResponse>(
    websiteRoutes.popups.contactActivity(id),
    {
      init: { headers: jsonHeaders() },
      cache: "no-cache",
    },
  );

  return response.data;
}

export async function updatePopupContact(
  id: string,
  payload: UpdatePopupContactPayload,
): Promise<PopupLeadDetail> {
  const response = await apiFetch<PopupLeadResponse>(
    websiteRoutes.popups.contact(id),
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

export async function deletePopupContact(id: string): Promise<void> {
  await apiFetch<void>(websiteRoutes.popups.contact(id), {
    init: {
      method: "DELETE",
      headers: jsonHeaders(),
    },
    cache: "no-cache",
  });
}

export async function createPopupLeadNote(
  id: string,
  payload: CreatePopupLeadNotePayload,
): Promise<PopupLeadNote> {
  const response = await apiFetch<{ success: boolean; data: PopupLeadNote }>(
    websiteRoutes.popups.contactNotes(id),
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

export async function updatePopupLeadNote(
  id: string,
  noteId: string,
  payload: UpdatePopupLeadNotePayload,
): Promise<PopupLeadNote> {
  const response = await apiFetch<{ success: boolean; data: PopupLeadNote }>(
    websiteRoutes.popups.contactNote(id, noteId),
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

export async function deletePopupLeadNote(
  id: string,
  noteId: string,
): Promise<void> {
  await apiFetch<void>(websiteRoutes.popups.contactNote(id, noteId), {
    init: {
      method: "DELETE",
      headers: jsonHeaders(),
    },
    cache: "no-cache",
  });
}

export async function createPopupLeadInterest(
  id: string,
  payload: CreatePopupLeadInterestPayload,
): Promise<PopupLeadInterest> {
  const response = await apiFetch<{ success: boolean; data: PopupLeadInterest }>(
    websiteRoutes.popups.contactInterests(id),
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

export async function deletePopupLeadInterest(
  id: string,
  interestId: string,
): Promise<void> {
  await apiFetch<void>(websiteRoutes.popups.contactInterest(id, interestId), {
    init: {
      method: "DELETE",
      headers: jsonHeaders(),
    },
    cache: "no-cache",
  });
}

export async function createPopupLeadOpportunity(
  id: string,
  payload: CreatePopupLeadOpportunityPayload,
): Promise<PopupLeadOpportunity> {
  const response = await apiFetch<{
    success: boolean;
    data: PopupLeadOpportunity;
  }>(websiteRoutes.popups.contactOpportunities(id), {
    init: {
      method: "POST",
      headers: jsonHeaders(),
      body: JSON.stringify(payload),
    },
    cache: "no-cache",
  });

  return response.data;
}

export async function updatePopupLeadOpportunity(
  id: string,
  opportunityId: string,
  payload: UpdatePopupLeadOpportunityPayload,
): Promise<PopupLeadOpportunity> {
  const response = await apiFetch<{
    success: boolean;
    data: PopupLeadOpportunity;
  }>(websiteRoutes.popups.contactOpportunity(id, opportunityId), {
    init: {
      method: "PUT",
      headers: jsonHeaders(),
      body: JSON.stringify(payload),
    },
    cache: "no-cache",
  });

  return response.data;
}

export async function deletePopupLeadOpportunity(
  id: string,
  opportunityId: string,
): Promise<void> {
  await apiFetch<void>(
    websiteRoutes.popups.contactOpportunity(id, opportunityId),
    {
      init: {
        method: "DELETE",
        headers: jsonHeaders(),
      },
      cache: "no-cache",
    },
  );
}

export type * from "./types";
