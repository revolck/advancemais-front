"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getMinhaBonificacao,
  marcarBonificacaoExibida,
  type SituacaoBonificacao,
} from "@/api/empresas/bonificacao";
import { getUserProfile } from "@/api/usuarios";
import type { UsuarioProfileResponse } from "@/api/usuarios/types";
import { UserRole } from "@/config/roles";
import { useUserRole } from "@/hooks/useUserRole";
import { isProfileCompleteForOnboarding } from "@/theme/dashboard/components/profile/ProfileOnboardingGate";
import { BonificacaoInauguracaoModal } from "./BonificacaoInauguracaoModal";
import { PlanoGratuitoExpiradoModal } from "./PlanoGratuitoExpiradoModal";

interface ConfettiConfig {
  showConfetti: boolean;
  confettiKey: number;
}

interface BonificacaoEmpresaModalControllerProps {
  onConfettiChange?: (config: ConfettiConfig) => void;
}

const CHAVE_SITUACAO = ["empresa-bonificacao"];
const PUBLICAR_VAGA = "/dashboard/empresas/vagas/cadastrar";
const PLANOS = "/dashboard/upgrade";

/** O aviso de fim do plano aparece no máximo uma vez por dia */
const chaveDispensa = (planoId: string) => `plano-gratuito-expirado:${planoId}`;
const hoje = () => new Date().toISOString().slice(0, 10);

function dispensadoHoje(planoId: string) {
  try {
    return window.localStorage.getItem(chaveDispensa(planoId)) === hoje();
  } catch {
    return false;
  }
}

function dispensarHoje(planoId: string) {
  try {
    window.localStorage.setItem(chaveDispensa(planoId), hoje());
  } catch {
    // sem armazenamento: o aviso volta na próxima visita, sem problema
  }
}

/**
 * Empresas:
 * - depois de completar o cadastro (modal de onboarding), mostra uma única vez o
 *   presente de inauguração com a mesma animação de compra aprovada;
 * - quando o plano gratuito termina, avisa e leva para os planos.
 */
export function BonificacaoEmpresaModalController({
  onConfettiChange,
}: BonificacaoEmpresaModalControllerProps) {
  const role = useUserRole();
  const isEmpresa = role === UserRole.EMPRESA;
  const router = useRouter();
  const queryClient = useQueryClient();
  const [bonusAberto, setBonusAberto] = useState(false);
  const [expiradoAberto, setExpiradoAberto] = useState(false);

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

  // Só depois do onboarding: a modal de cadastro vem primeiro
  const perfilCompleto = Boolean(
    perfil && isProfileCompleteForOnboarding(perfil.usuario, perfil.stats)
  );

  const { data: situacao } = useQuery<SituacaoBonificacao>({
    queryKey: CHAVE_SITUACAO,
    queryFn: async () => (await getMinhaBonificacao()).data,
    enabled: isEmpresa && perfilCompleto,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  useEffect(() => {
    if (!situacao) return;
    if (situacao.bonificacao?.exibir) {
      setBonusAberto(true);
      return;
    }
    if (
      situacao.gratuitoExpirado &&
      !dispensadoHoje(situacao.gratuitoExpirado.planoId)
    ) {
      setExpiradoAberto(true);
    }
  }, [situacao]);

  // Mesma animação da compra aprovada
  useEffect(() => {
    if (!bonusAberto) return;
    onConfettiChange?.({ showConfetti: false, confettiKey: 0 });
    const timer = setTimeout(() => {
      onConfettiChange?.({ showConfetti: true, confettiKey: Date.now() });
    }, 200);
    return () => clearTimeout(timer);
  }, [bonusAberto, onConfettiChange]);

  const fecharBonus = useCallback(
    async (destino?: string) => {
      setBonusAberto(false);
      onConfettiChange?.({ showConfetti: false, confettiKey: 0 });
      queryClient.setQueryData<SituacaoBonificacao>(CHAVE_SITUACAO, (atual) =>
        atual?.bonificacao
          ? { ...atual, bonificacao: { ...atual.bonificacao, exibir: false } }
          : atual
      );
      try {
        await marcarBonificacaoExibida();
      } catch {
        // se falhar, a modal volta no próximo acesso
      }
      if (destino) router.push(destino);
    },
    [onConfettiChange, queryClient, router]
  );

  const fecharExpirado = useCallback(
    (destino?: string) => {
      if (situacao?.gratuitoExpirado) {
        dispensarHoje(situacao.gratuitoExpirado.planoId);
      }
      setExpiradoAberto(false);
      if (destino) router.push(destino);
    },
    [router, situacao]
  );

  if (!isEmpresa || !situacao) return null;

  return (
    <>
      {situacao.bonificacao && perfil && (
        <BonificacaoInauguracaoModal
          isOpen={bonusAberto}
          nomeEmpresa={perfil.usuario.nomeCompleto}
          planoNome={situacao.bonificacao.planoNome}
          quantidadeVagas={situacao.bonificacao.quantidadeVagas}
          validoAte={situacao.bonificacao.validoAte}
          onPublicarVaga={() => void fecharBonus(PUBLICAR_VAGA)}
          onClose={() => void fecharBonus()}
        />
      )}
      {situacao.gratuitoExpirado && (
        <PlanoGratuitoExpiradoModal
          isOpen={expiradoAberto}
          inauguracao={situacao.gratuitoExpirado.inauguracao}
          onVerPlanos={() => fecharExpirado(PLANOS)}
          onClose={() => fecharExpirado()}
        />
      )}
    </>
  );
}
