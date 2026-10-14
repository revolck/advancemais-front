"use client";

import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getTutoriais,
  registrarTutorial,
  type TutoriaisUsuario,
} from "@/api/usuarios/tutoriais";
import { useUserRole } from "@/hooks/useUserRole";

/** Estado do botão do robô, guardado junto com os tutoriais (vale em qualquer aparelho) */
export const CHAVE_ASSISTENTE = "ASSISTENTE";
/** Pede ao assistente que abra (ex.: logo depois de "Mostrar assistente") */
export const EVENTO_ABRIR_ASSISTENTE = "assistente:abrir";

export function useTutoriaisAssistente(enabled: boolean) {
  return useQuery<TutoriaisUsuario>({
    queryKey: ["usuario-tutoriais"],
    queryFn: async () => (await getTutoriais()).data,
    enabled,
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });
}

/** Ocultar/mostrar o assistente (chat e menu do avatar usam o mesmo estado) */
export function useVisibilidadeAssistente() {
  const role = useUserRole();
  const queryClient = useQueryClient();
  const { data: tutoriais } = useTutoriaisAssistente(Boolean(role));
  const oculto = tutoriais?.[CHAVE_ASSISTENTE]?.status === "OCULTO";

  const definir = useCallback(
    async (status: "OCULTO" | "VISIVEL") => {
      queryClient.setQueryData<TutoriaisUsuario>(["usuario-tutoriais"], (atual) => ({
        ...(atual ?? {}),
        [CHAVE_ASSISTENTE]: { status, em: new Date().toISOString() },
      }));
      try {
        await registrarTutorial(CHAVE_ASSISTENTE, status);
      } catch {
        // vale nesta sessão; se não salvou, volta ao estado anterior no próximo acesso
      }
    },
    [queryClient]
  );

  // O próprio chat explica como trazer de volta antes de sumir (um aviso cobriria a foto)
  const ocultar = useCallback(() => definir("OCULTO"), [definir]);

  const mostrar = useCallback(async () => {
    await definir("VISIVEL");
    window.dispatchEvent(new Event(EVENTO_ABRIR_ASSISTENTE));
  }, [definir]);

  return { oculto, carregado: Boolean(tutoriais), ocultar, mostrar };
}

/** Endereço no site público (fora do painel), a partir do domínio atual */
export function urlDoSite(caminho: string) {
  if (typeof window === "undefined") return caminho;
  const { protocol, hostname, port } = window.location;
  if (hostname === "localhost" || hostname === "127.0.0.1") return caminho;
  const site = hostname.replace(/^(app|auth|academia)\./, "");
  return `${protocol}//${site}${port ? `:${port}` : ""}${caminho}`;
}
