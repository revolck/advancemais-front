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
import { getContextoAssistente, type ContextoAssistente } from "@/api/usuarios/assistente";
import { registrarTutorial, type TutoriaisUsuario } from "@/api/usuarios/tutoriais";
import type { UsuarioProfileResponse } from "@/api/usuarios/types";
import { UserRole } from "@/config/roles";
import { useUserRole } from "@/hooks/useUserRole";
import { isProfileCompleteForOnboarding } from "@/theme/dashboard/components/profile/profile-onboarding.utils";
import { AssistenteAdvance } from "./AssistenteAdvance";
import { escolherConversaAluno } from "./assistente.aluno";
import { escolherConversaEquipe } from "./assistente.equipe";
import {
  CENTRAL_DE_AJUDA,
  TOUR_EMPRESA,
  conversaTourConcluido,
  escolherConversa,
  type BotaoAssistente,
  type Conversa,
} from "./assistente.fluxos";
import {
  EVENTO_ABRIR_ASSISTENTE,
  urlDoSite,
  useTutoriaisAssistente,
  useVisibilidadeAssistente,
} from "./assistente.visibilidade";
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

// "Agora não" em avisos importantes vale até o fim do dia (neste aparelho)
const hoje = () => new Date().toISOString().slice(0, 10);
const chaveDispensa = (chave: string) => `assistente-dispensa:${chave}`;
function lerDispensa(chave?: string) {
  if (!chave) return false;
  try {
    return window.localStorage.getItem(chaveDispensa(chave)) === hoje();
  } catch {
    return false;
  }
}
function gravarDispensa(chave: string) {
  try {
    window.localStorage.setItem(chaveDispensa(chave), hoje());
  } catch {
    // sem armazenamento: o aviso volta na próxima visita
  }
}

/**
 * Assistente Advance+ para todas as funções. Empresa: presente de inauguração, tour e
 * plano (só oferece publicar vaga se o plano permite). Aluno/candidato: cursos,
 * pagamento, currículo, vagas e entrevistas. Equipe: pendências do dia.
 * Pode ser oculto no próprio chat e mostrado de novo pelo menu do avatar.
 */
export function AssistenteController({ onConfettiChange }: AssistenteControllerProps) {
  const role = useUserRole();
  const isEmpresa = role === UserRole.EMPRESA;
  const isAluno = role === UserRole.ALUNO_CANDIDATO;
  const router = useRouter();
  const queryClient = useQueryClient();
  const { oculto, ocultar } = useVisibilidadeAssistente();
  const [aberto, setAberto] = useState(false);
  const [conversaManual, setConversaManual] = useState<Conversa | null>(null);
  const [emTour, setEmTour] = useState(false);
  const [dispensas, setDispensas] = useState(0);
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
    enabled: Boolean(role),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  // A modal "Complete seu perfil" vem primeiro
  const perfilCompleto = Boolean(
    perfil && isProfileCompleteForOnboarding(perfil.usuario, perfil.stats)
  );
  const liberado = Boolean(role) && perfilCompleto;

  const { data: situacao, status: statusSituacao } = useQuery<SituacaoBonificacao>({
    queryKey: ["empresa-bonificacao"],
    queryFn: async () => (await getMinhaBonificacao()).data,
    enabled: isEmpresa && perfilCompleto,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const { data: contexto, status: statusContexto } = useQuery<ContextoAssistente>({
    queryKey: ["assistente-contexto"],
    queryFn: async () => (await getContextoAssistente()).data,
    enabled: liberado,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const { data: tutoriais } = useTutoriaisAssistente(liberado);

  // Sem contexto (API fora do ar), segue com a ajuda genérica
  const pronto =
    liberado &&
    Boolean(tutoriais) &&
    statusContexto !== "pending" &&
    (!isEmpresa || statusSituacao !== "pending");

  const conversaAutomatica = useMemo(() => {
    if (!pronto || !perfil || !role) return null;
    const nome = perfil.usuario.nomeCompleto;
    if (isEmpresa) {
      const planoId = situacao?.gratuitoExpirado?.planoId;
      return escolherConversa({
        nomeEmpresa: nome,
        situacao: situacao ?? null,
        tutoriais: tutoriais ?? {},
        expiradoDispensadoHoje: Boolean(planoId) && lerDispensa(`plano-gratuito-expirado:${planoId}`),
        contexto: contexto?.empresa,
      });
    }
    if (isAluno) {
      return escolherConversaAluno({
        nome,
        aluno: contexto?.aluno,
        tutoriais: tutoriais ?? {},
        urlCursosDoSite: urlDoSite("/cursos"),
        dispensadaHoje: lerDispensa,
      });
    }
    return escolherConversaEquipe({
      role,
      nome,
      equipe: contexto?.equipe,
      tutoriais: tutoriais ?? {},
    });
    // dispensas: recalcula depois de um "agora não"
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pronto, perfil, role, isEmpresa, isAluno, situacao, tutoriais, contexto, dispensas]);

  const conversa = conversaManual ?? conversaAutomatica;

  // Abre sozinho uma vez por carregamento quando há algo importante
  useEffect(() => {
    if (!conversaAutomatica || abriuSozinho.current || emTour || oculto) return;
    if (!conversaAutomatica.abrirSozinho) return;
    abriuSozinho.current = true;
    const timer = setTimeout(() => setAberto(true), 600);
    return () => clearTimeout(timer);
  }, [conversaAutomatica, emTour, oculto]);

  // "Mostrar assistente" no menu do avatar
  useEffect(() => {
    const abrir = () => {
      setConversaManual(null);
      setAberto(true);
    };
    window.addEventListener(EVENTO_ABRIR_ASSISTENTE, abrir);
    return () => window.removeEventListener(EVENTO_ABRIR_ASSISTENTE, abrir);
  }, []);

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

  const salvarTutorial = useCallback(
    async (chave: string, status: "CONCLUIDO" | "PULADO") => {
      queryClient.setQueryData<TutoriaisUsuario>(["usuario-tutoriais"], (atual) => ({
        ...(atual ?? {}),
        [chave]: { status, em: new Date().toISOString() },
      }));
      try {
        await registrarTutorial(chave, status);
      } catch {
        // se falhar, a mensagem aparece de novo no próximo acesso
      }
    },
    [queryClient]
  );

  /** O que vale para qualquer saída da conversa (fechar ou clicar em um botão) */
  const registrarVisto = useCallback(
    (atual: Conversa | null) => {
      if (!atual) return;
      if (atual.motivo === "BONIFICACAO") void marcarPresenteVisto();
      // Fechar a oferta de tour vale como "agora não": não volta a abrir sozinha
      if (atual.motivo === "PRIMEIRO_ACESSO" && !tutoriais?.[TOUR_EMPRESA]) {
        void salvarTutorial(TOUR_EMPRESA, "PULADO");
      }
      if (atual.marcaTutorial) void salvarTutorial(atual.marcaTutorial, "CONCLUIDO");
      if (atual.dispensaDiaria) {
        gravarDispensa(atual.dispensaDiaria);
        setDispensas((n) => n + 1);
      }
    },
    [marcarPresenteVisto, salvarTutorial, tutoriais]
  );

  const fechar = useCallback(() => {
    setAberto(false);
    setConversaManual(null);
    onConfettiChange?.({ showConfetti: false, confettiKey: 0 });
    registrarVisto(conversa);
  }, [conversa, onConfettiChange, registrarVisto]);

  const onAcao = useCallback(
    (botao: BotaoAssistente) => {
      const motivo = conversa?.motivo;

      switch (botao.acao) {
        case "INICIAR_TOUR":
          registrarVisto(conversa);
          setAberto(false);
          setConversaManual(null);
          onConfettiChange?.({ showConfetti: false, confettiKey: 0 });
          setEmTour(true);
          iniciarTourEmpresa((concluiu) => {
            setEmTour(false);
            void salvarTutorial(TOUR_EMPRESA, concluiu ? "CONCLUIDO" : "PULADO");
            if (concluiu) {
              setConversaManual(conversaTourConcluido(contexto?.empresa));
              setAberto(true);
            }
          });
          return;
        case "PUBLICAR_VAGA":
          fechar();
          router.push(PUBLICAR_VAGA);
          return;
        case "VER_PLANOS":
          if (motivo === "PLANO_GRATUITO_EXPIRADO" && situacao?.gratuitoExpirado) {
            gravarDispensa(`plano-gratuito-expirado:${situacao.gratuitoExpirado.planoId}`);
            setDispensas((n) => n + 1);
          }
          fechar();
          router.push(PLANOS);
          return;
        case "IR":
          fechar();
          if (!botao.href) return;
          if (botao.externo) window.open(botao.href, "_blank", "noopener,noreferrer");
          else router.push(botao.href);
          return;
        case "AJUDA":
          window.open(CENTRAL_DE_AJUDA, "_blank", "noopener,noreferrer");
          fechar();
          return;
        case "AGORA_NAO":
          if (motivo === "PLANO_GRATUITO_EXPIRADO" && situacao?.gratuitoExpirado) {
            gravarDispensa(`plano-gratuito-expirado:${situacao.gratuitoExpirado.planoId}`);
            setDispensas((n) => n + 1);
          }
          if (isEmpresa && (motivo === "PRIMEIRO_ACESSO" || motivo === "BONIFICACAO")) {
            void salvarTutorial(TOUR_EMPRESA, "PULADO");
          }
          fechar();
          return;
        default:
          fechar();
      }
    },
    [contexto, conversa, fechar, isEmpresa, onConfettiChange, registrarVisto, router, salvarTutorial, situacao]
  );

  const onOcultar = useCallback(() => {
    fechar();
    void ocultar();
  }, [fechar, ocultar]);

  if (oculto || !pronto || !conversa || emTour) return null;

  const temNovidade = Boolean(
    conversaAutomatica?.abrirSozinho || conversaAutomatica?.novidade
  );

  return (
    <AssistenteAdvance
      aberto={aberto}
      conversa={conversa}
      temNovidade={temNovidade}
      onAbrir={() => setAberto(true)}
      onFechar={fechar}
      onOcultar={onOcultar}
      onAcao={onAcao}
    />
  );
}
