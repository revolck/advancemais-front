import { apiFetch } from "@/api/client";
import { apiConfig } from "@/lib/env";
import { usuarioRoutes } from "@/api/routes";

function getAuthHeader(): Record<string, string> {
  if (typeof document === "undefined") return {};

  const token = document.cookie
    .split("; ")
    .find((row) => row.startsWith("token="))
    ?.split("=")[1];

  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function requestUserPasswordReset(
  email: string,
): Promise<void> {
  await apiFetch<void>(usuarioRoutes.recovery.request(), {
    init: {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: apiConfig.headers.Accept,
        ...getAuthHeader(),
      },
      body: JSON.stringify({ email }),
    },
    cache: "no-cache",
  });
}
