"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getMinhaBonificacao,
  marcarBonificacaoExibida,
  type SituacaoBonificacao,
} from "@/api/empresas/bonificacao";
import { getUserProfile } from "@/api/usuarios";
import { getTutoriais, registrarTutorial, type TutoriaisUsuario } from "@/api/usuarios/tutoriais";
import type { UsuarioProfileResponse } from "@/api/usuarios/types";
import { UserRole } from "@/config/roles";
import { useUserRole } from "@/hooks/useUserRole";
import { isProfileCompleteForOnboarding } from "@/theme/dashboard/components/profile/profile-onboarding.utils";
import { AssistenteAdvance } from "./AssistenteAdvance";
import {
  TOUR_EMPRESA,
  conversaTourConcluido,
  escolherConversa,
  type AcaoAssistente,
  type Conversa,
} from "./assistente.fluxos";
import { iniciarTourEmpresa } from "./tourEmpresa";

interface ConfettiConfig {
  showConfetti: boolean;
  confettiKey: number;
}

interface AssistenteControllerProps {
  onConfettiChange?: (config: ConfettiConfig) => void;
}

const PUBLICAR_VAGA = "/dashboard/empresas/vagas/cadastrar";
const PLANOS = "/dashboard/upgrade";

const hoje = () => new Date().toISOString().slice(0, 10);
const chaveDispensa = (planoId: string) => `plano-gratuito-expirado:${planoId}`;
function lerDispensa(planoId?: string) {
  if (!planoId) return false;
  try {
    return window.localStorage.getItem(chaveDispensa(planoId)) === hoje();
  } catch {
    return false;
  }
}
function gravarDispensa(planoId: string) {
  try {
    window.localStorage.setItem(chaveDispensa(planoId), hoje());
  } catch {
    // sem armazenamento: o aviso volta na próxima visita
  }
}

/**
 * Assistente das empresas: depois do onboarding, dá as boas-vindas, apresenta o mês
 * grátis da inauguração (com a animação de compra aprovada), oferece o tour de primeiro
 * acesso e avisa quando o plano gratuito termina. Fica disponível no canto da tela.
 */
export function AssistenteController({ onConfettiChange }: AssistenteControllerProps) {
  const role = useUserRole();
  const isEmpresa = role === UserRole.EMPRESA;
  const router = useRouter();
  const queryClient = useQueryClient();
  const [aberto, setAberto] = useState(false);
  const [conversaManual, setConversaManual] = useState<Conversa | null>(null);
  const [emTour, setEmTour] = useState(false);
  const [expiradoDispensado, setExpiradoDispensado] = useState(false);
  const abriuSozinho = useRef(false);

  const { data: perfil } = useQuery<UsuarioProfileResponse>({
    queryKey: ["user-profile"],
    queryFn: async () => {
      const response = await getUserProfile();
      if (
        !response ||
        !("success" in response) ||
        response.success !== true ||
        !("usuario" in response) ||
        !("stats" in response)
      ) {
        throw new Error("Erro ao carregar perfil");
      }
      return response as UsuarioProfileResponse;
    },
    enabled: isEmpresa,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  // A modal "Complete seu perfil" vem primeiro
  const perfilCompleto = Boolean(
    perfil && isProfileCompleteForOnboarding(perfil.usuario, perfil.stats)
  );

  const { data: situacao } = useQuery<SituacaoBonificacao>({
    queryKey: ["empresa-bonificacao"],
    queryFn: async () => (await getMinhaBonificacao()).data,
    enabled: isEmpresa && perfilCompleto,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const { data: tutoriais } = useQuery<TutoriaisUsuario>({
    queryKey: ["usuario-tutoriais"],
    queryFn: async () => (await getTutoriais()).data,
    enabled: isEmpresa && perfilCompleto,
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });

  const pronto = isEmpresa && perfilCompleto && Boolean(situacao) && Boolean(tutoriais);

  const conversaAutomatica = useMemo(() => {
    if (!pronto || !perfil) return null;
    return escolherConversa({
      nomeEmpresa: perfil.usuario.nomeCompleto,
      situacao: situacao ?? null,
      tutoriais: tutoriais ?? {},
      expiradoDispensadoHoje:
        expiradoDispensado || lerDispensa(situacao?.gratuitoExpirado?.planoId),
    });
  }, [pronto, perfil, situacao, tutoriais, expiradoDispensado]);

  const conversa = conversaManual ?? conversaAutomatica;

  // Abre sozinho uma vez por carregamento quando há algo para a empresa
  useEffect(() => {
    if (!conversaAutomatica || abriuSozinho.current || emTour) return;
    if (!conversaAutomatica.abrirSozinho) return;
    abriuSozinho.current = true;
    const timer = setTimeout(() => setAberto(true), 600);
    return () => clearTimeout(timer);
  }, [conversaAutomatica, emTour]);

  // Animação de compra aprovada junto com o presente
  useEffect(() => {
    if (!aberto || !conversa?.comemorar) return;
    onConfettiChange?.({ showConfetti: false, confettiKey: 0 });
    const timer = setTimeout(() => {
      onConfettiChange?.({ showConfetti: true, confettiKey: Date.now() });
    }, 200);
    return () => clearTimeout(timer);
  }, [aberto, conversa, onConfettiChange]);

  const marcarPresenteVisto = useCallback(async () => {
    if (!situacao?.bonificacao?.exibir) return;
    queryClient.setQueryData<SituacaoBonificacao>(["empresa-bonificacao"], (atual) =>
      atual?.bonificacao
        ? { ...atual, bonificacao: { ...atual.bonificacao, exibir: false } }
        : atual
    );
    try {
      await marcarBonificacaoExibida();
    } catch {
      // se falhar, o presente aparece de novo no próximo acesso
    }
  }, [queryClient, situacao]);

  const salvarTour = useCallback(
    async (status: "CONCLUIDO" | "PULADO") => {
      queryClient.setQueryData<TutoriaisUsuario>(["usuario-tutoriais"], (atual) => ({
        ...(atual ?? {}),
        [TOUR_EMPRESA]: { status, em: new Date().toISOString() },
      }));
      try {
        await registrarTutorial(TOUR_EMPRESA, status);
      } catch {
        // se falhar, o tour é oferecido de novo no próximo acesso
      }
    },
    [queryClient]
  );

  const fechar = useCallback(() => {
    setAberto(false);
    setConversaManual(null);
    onConfettiChange?.({ showConfetti: false, confettiKey: 0 });
    if (conversa?.motivo === "BONIFICACAO") void marcarPresenteVisto();
  }, [conversa, marcarPresenteVisto, onConfettiChange]);

  const onAcao = useCallback(
    (acao: AcaoAssistente) => {
      const motivo = conversa?.motivo;
      if (motivo === "BONIFICACAO") void marcarPresenteVisto();

      switch (acao) {
        case "INICIAR_TOUR":
          setAberto(false);
          setConversaManual(null);
          onConfettiChange?.({ showConfetti: false, confettiKey: 0 });
          setEmTour(true);
          iniciarTourEmpresa((concluiu) => {
            setEmTour(false);
            void salvarTour(concluiu ? "CONCLUIDO" : "PULADO");
            if (concluiu) {
              setConversaManual(conversaTourConcluido());
              setAberto(true);
            }
          });
          return;
        case "PUBLICAR_VAGA":
          fechar();
          router.push(PUBLICAR_VAGA);
          return;
        case "VER_PLANOS":
          if (situacao?.gratuitoExpirado) gravarDispensa(situacao.gratuitoExpirado.planoId);
          setExpiradoDispensado(true);
          fechar();
          router.push(PLANOS);
          return;
        case "AGORA_NAO":
          if (motivo === "PLANO_GRATUITO_EXPIRADO" && situacao?.gratuitoExpirado) {
            gravarDispensa(situacao.gratuitoExpirado.planoId);
            setExpiradoDispensado(true);
          }
          if (motivo === "PRIMEIRO_ACESSO" || motivo === "BONIFICACAO") void salvarTour("PULADO");
          fechar();
          return;
        default:
          fechar();
      }
    },
    [conversa, fechar, marcarPresenteVisto, onConfettiChange, router, salvarTour, situacao]
  );

  if (!pronto || !conversa || emTour) return null;

  const temNovidade = Boolean(conversaAutomatica?.abrirSozinho);

  return (
    <AssistenteAdvance
      aberto={aberto}
      conversa={conversa}
      temNovidade={temNovidade}
      onAbrir={() => setAberto(true)}
      onFechar={fechar}
      onAcao={onAcao}
    />
  );
}
