"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { apiFetch } from "@/api/client";
import { buildAuthHeaders } from "@/lib/auth-utils";

interface BlockedUserData {
  isBlocked: boolean;
  reason?: string;
  blockedUntil?: string;
  loading: boolean;
}

export const useBlockedUser = () => {
  const [blockedData, setBlockedData] = useState<BlockedUserData>({
    isBlocked: false,
    loading: true,
  });
  const [showModal, setShowModal] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [checkboxChecked, setCheckboxChecked] = useState(false);

  const { user, loading, logout } = useAuth();
  const router = useRouter();

  const checkUserBlockStatus = useCallback(async () => {
    if (!user?.id) {
      setBlockedData({ isBlocked: false, loading: false });
      return;
    }

    try {
      setBlockedData((prev) => ({ ...prev, loading: true }));

      // Verificar se o usuário está bloqueado através da rota de perfil
      await apiFetch(`/api/v1/usuarios/perfil`, {
        init: {
          method: "GET",
          headers: buildAuthHeaders(),
        },
        cache: "no-cache",
      });

      // Se chegou até aqui, o usuário não está bloqueado
      setBlockedData({
        isBlocked: false,
        loading: false,
      });
      setShowModal(false);
    } catch (error: any) {
      // Verificar se o erro é de usuário bloqueado
      if (
        error?.message?.includes("usuário está bloqueado") ||
        error?.status === 403
      ) {
        setBlockedData({
          isBlocked: true,
          reason: "Acesso negado: usuário está bloqueado",
          blockedUntil: undefined, // A API não retorna data de bloqueio
          loading: false,
        });
        setShowModal(true);
      } else {
        console.error("Erro ao verificar perfil do usuário:", error);
        setBlockedData({
          isBlocked: false,
          loading: false,
        });
        setShowModal(false);
      }
    }
  }, [user?.id]);

  const handleAcceptTerms = useCallback(async () => {
    if (!checkboxChecked) {
      return; // Não permite aceitar sem marcar o checkbox
    }

    setTermsAccepted(true);

    // Fazer logout do usuário
    await logout();

    // Redirecionar para a página de login
    router.push("/auth/login");
  }, [checkboxChecked, logout, router]);

  const handleLogout = useCallback(async () => {
    await logout();
    router.push("/auth/login");
  }, [logout, router]);

  useEffect(() => {
    // Só verificar se o usuário estiver carregado
    if (user && !loading) {
      checkUserBlockStatus();
    }
  }, [user, loading, checkUserBlockStatus]);

  // Verificar novamente quando a página for recarregada
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (blockedData.isBlocked && !termsAccepted) {
        // Forçar o usuário a aceitar os termos antes de sair
        return "Você deve aceitar os termos antes de sair do sistema.";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [blockedData.isBlocked, termsAccepted]);

  return {
    ...blockedData,
    showModal,
    termsAccepted,
    checkboxChecked,
    setCheckboxChecked,
    handleAcceptTerms,
    handleLogout,
    checkUserBlockStatus,
  };
};
