import { empresasRoutes } from "@/api/routes";
import { apiFetch } from "@/api/client";
import { authHeaders, authJsonHeaders, publicHeaders } from "@/api/shared";
import type {
  PlanoEmpresarialBackendResponse,
  CreatePlanoEmpresarialPayload,
  UpdatePlanoEmpresarialPayload,
} from "./types";

export async function listPlanosEmpresariais(
  init?: RequestInit,
): Promise<PlanoEmpresarialBackendResponse[]> {
  return apiFetch<PlanoEmpresarialBackendResponse[]>(
    empresasRoutes.planosEmpresariais.list(),
    { init: init ?? { headers: publicHeaders() } },
  );
}

export async function getPlanoEmpresarialById(
  id: string,
): Promise<PlanoEmpresarialBackendResponse> {
  return apiFetch<PlanoEmpresarialBackendResponse>(
    empresasRoutes.planosEmpresariais.get(id),
    { init: { headers: publicHeaders() } },
  );
}

export async function createPlanoEmpresarial(
  data: CreatePlanoEmpresarialPayload,
): Promise<PlanoEmpresarialBackendResponse> {
  return apiFetch<PlanoEmpresarialBackendResponse>(
    empresasRoutes.planosEmpresariais.create(),
    {
      init: {
        method: "POST",
        headers: authJsonHeaders(),
        body: JSON.stringify(data),
      },
      cache: "no-cache",
    },
  );
}

export async function updatePlanoEmpresarial(
  id: string,
  data: UpdatePlanoEmpresarialPayload,
): Promise<PlanoEmpresarialBackendResponse> {
  return apiFetch<PlanoEmpresarialBackendResponse>(
    empresasRoutes.planosEmpresariais.update(id),
    {
      init: {
        method: "PUT",
        headers: authJsonHeaders(),
        body: JSON.stringify(data),
      },
      cache: "no-cache",
    },
  );
}

export async function deletePlanoEmpresarial(id: string): Promise<void> {
  await apiFetch<void>(empresasRoutes.planosEmpresariais.delete(id), {
    init: {
      method: "DELETE",
      headers: authHeaders(),
    },
    cache: "no-cache",
  });
}
