"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getTutoriais,
  registrarTutorial,
  type TutoriaisUsuario,
} from "@/api/usuarios/tutoriais";
import { useUserRole } from "@/hooks/useUserRole";
import { contaDoToken, lerCookie } from "@/lib/auth-cookies";

/** Estado do botão do robô, guardado junto com os tutoriais (vale em qualquer aparelho) */
export const CHAVE_ASSISTENTE = "ASSISTENTE";
/** Pede ao assistente que abra (ex.: logo depois de "Mostrar assistente") */
export const EVENTO_ABRIR_ASSISTENTE = "assistente:abrir";

export type Visibilidade = "OCULTO" | "VISIVEL";
interface Registro {
  status: Visibilidade;
  em: string;
}

const chaveLocal = (usuarioId: string) => `assistente-visibilidade:${usuarioId}`;

function lerLocal(usuarioId: string | null): Registro | null {
  if (!usuarioId) return null;
  try {
    const valor = JSON.parse(window.localStorage.getItem(chaveLocal(usuarioId)) ?? "null");
    return valor?.status === "OCULTO" || valor?.status === "VISIVEL" ? valor : null;
  } catch {
    return null;
  }
}

function gravarLocal(usuarioId: string | null, registro: Registro) {
  if (!usuarioId) return;
  try {
    window.localStorage.setItem(chaveLocal(usuarioId), JSON.stringify(registro));
  } catch {
    // sem armazenamento: fica só o que o servidor guardar
  }
}

/**
 * Vale a escolha mais recente entre o servidor (outros aparelhos) e este navegador
 * (garante o F5 mesmo se o servidor não salvou). Sem escolha: visível.
 */
export function escolherVisibilidade(
  servidor: { status: string; em: string } | undefined,
  local: Registro | null
): Visibilidade {
  const doServidor =
    servidor && (servidor.status === "OCULTO" || servidor.status === "VISIVEL")
      ? (servidor as Registro)
      : null;
  if (doServidor && local) {
    return Date.parse(local.em) > Date.parse(doServidor.em) ? local.status : doServidor.status;
  }
  return (local ?? doServidor)?.status ?? "VISIVEL";
}

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
  const usuarioId = useMemo(() => contaDoToken(lerCookie("token")), []);
  const { data: tutoriais } = useTutoriaisAssistente(Boolean(role));
  const [local, setLocal] = useState<Registro | null>(() => lerLocal(usuarioId));
  const servidor = tutoriais?.[CHAVE_ASSISTENTE];
  const oculto = escolherVisibilidade(servidor, local) === "OCULTO";

  const salvarNoServidor = useCallback(async (registro: Registro) => {
    try {
      await registrarTutorial(CHAVE_ASSISTENTE, registro.status);
    } catch {
      // continua valendo neste navegador; reenvia no próximo acesso
    }
  }, []);

  const definir = useCallback(
    async (status: Visibilidade) => {
      const registro = { status, em: new Date().toISOString() };
      gravarLocal(usuarioId, registro);
      setLocal(registro);
      queryClient.setQueryData<TutoriaisUsuario>(["usuario-tutoriais"], (atual) => ({
        ...(atual ?? {}),
        [CHAVE_ASSISTENTE]: registro,
      }));
      await salvarNoServidor(registro);
    },
    [queryClient, salvarNoServidor, usuarioId]
  );

  // O servidor ficou para trás (ex.: falhou ao salvar): reenvia a escolha deste navegador
  const reenviado = useRef(false);
  useEffect(() => {
    if (!tutoriais || !local || reenviado.current) return;
    const atrasado = !servidor || Date.parse(local.em) > Date.parse(servidor.em);
    if (atrasado && servidor?.status !== local.status) {
      reenviado.current = true;
      void salvarNoServidor(local);
    }
  }, [local, salvarNoServidor, servidor, tutoriais]);

  const ocultar = useCallback(() => definir("OCULTO"), [definir]);

  const mostrar = useCallback(async () => {
    await definir("VISIVEL");
    window.dispatchEvent(new Event(EVENTO_ABRIR_ASSISTENTE));
  }, [definir]);

  return { oculto, carregado: Boolean(tutoriais) || Boolean(local), ocultar, mostrar };
}

/** Endereço no site público (fora do painel), a partir do domínio atual */
export function urlDoSite(caminho: string) {
  if (typeof window === "undefined") return caminho;
  const { protocol, hostname, port } = window.location;
  if (hostname === "localhost" || hostname === "127.0.0.1") return caminho;
  const site = hostname.replace(/^(app|auth|academia)\./, "");
  return `${protocol}//${site}${port ? `:${port}` : ""}${caminho}`;
}
