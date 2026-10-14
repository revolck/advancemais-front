import { apiFetch } from "@/api/client";
import { usuarioRoutes } from "@/api/routes";
import { buildAuthHeaders } from "@/lib/auth-utils";
import { apiConfig } from "@/lib/env";

/** CONCLUIDO/PULADO para tours; OCULTO/VISIVEL para a chave ASSISTENTE */
export type StatusTutorial = "CONCLUIDO" | "PULADO" | "OCULTO" | "VISIVEL";
export type TutoriaisUsuario = Record<string, { status: StatusTutorial; em: string }>;

interface Resposta<T> {
  success: boolean;
  data: T;
}

/** Tutoriais do assistente já concluídos ou pulados (fica no servidor, vale em qualquer aparelho) */
export function getTutoriais() {
  return apiFetch<Resposta<TutoriaisUsuario>>(usuarioRoutes.tutoriais.list(), {
    init: {
      method: "GET",
      headers: { Accept: apiConfig.headers.Accept, ...buildAuthHeaders() },
    },
    cache: "no-cache",
    retries: 1,
  });
}

export function registrarTutorial(chave: string, status: StatusTutorial) {
  return apiFetch<Resposta<{ chave: string; status: StatusTutorial; em: string }>>(
    usuarioRoutes.tutoriais.update(chave),
    {
      init: {
        method: "PUT",
        headers: {
          Accept: apiConfig.headers.Accept,
          "Content-Type": apiConfig.headers["Content-Type"],
          ...buildAuthHeaders(),
        },
        body: JSON.stringify({ status }),
      },
      cache: "no-cache",
      retries: 0,
    }
  );
}
