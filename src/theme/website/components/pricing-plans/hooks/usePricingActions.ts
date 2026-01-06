// src/theme/website/components/pricing-plans/hooks/usePricingActions.ts

"use client";

import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { UserRole } from "@/config/roles";
import { useUserRole } from "@/hooks/useUserRole";
import { listInformacoesGerais } from "@/api/websites/components/informacoes-gerais";
import { getUserProfile } from "@/api/usuarios";
import { env } from "@/lib/env";
import { createCheckoutAndGetUrl } from "@/lib/checkout-session";
import type { PricingPlanData } from "../types";

export type PlanButtonAction =
  | "comprar"
  | "upgrade"
  | "alterar_plano"
  | "plano_atual"
  | "contato";

export interface PlanButtonState {
  action: PlanButtonAction;
  text: string;
  disabled: boolean;
  href?: string;
  onClick?: () => void;
}

export interface UsePricingActionsReturn {
  /** Verifica se o usuário está autenticado */
  isAuthenticated: boolean;
  /** Verifica se é role EMPRESA */
  isCompanyRole: boolean;
  /** Plano atual da empresa (se houver) */
  currentPlanId: string | null;
  /** Valor do plano atual */
  currentPlanValue: number;
  /** ID do plano empresarial atual */
  currentPlanosEmpresariaisId: string | null;
  /** WhatsApp para contato */
  whatsappLink: string | null;
  /** Loading state */
  isLoading: boolean;
  /** Obtém o estado do botão para um plano específico */
  getButtonState: (plan: PricingPlanData) => PlanButtonState;
  /** Handler para clique no botão */
  handlePlanClick: (plan: PricingPlanData) => void;
}

function getCookieValue(name: string): string | null {
  if (typeof document === "undefined") return null;
  const cookie = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));
  if (!cookie) return null;
  return cookie.split("=")[1] || null;
}

function parsePrice(priceStr: string): number {
  if (!priceStr) return 0;
  // Remove R$, espaços e converte vírgula para ponto
  const cleaned = priceStr
    .replace(/R\$\s*/g, "")
    .replace(/\./g, "")
    .replace(",", ".")
    .trim();
  return parseFloat(cleaned) || 0;
}

// Interface para dados do plano do usuário (obtido via perfil)
interface UserPlanData {
  id: string | null;
  planosEmpresariaisId: string | null;
  valor: number;
}

export function usePricingActions(): UsePricingActionsReturn {
  const router = useRouter();
  const role = useUserRole();

  const [whatsappNumber, setWhatsappNumber] = useState<string | null>(null);
  const [isLoadingWhatsapp, setIsLoadingWhatsapp] = useState(true);
  const [userPlan, setUserPlan] = useState<UserPlanData>({
    id: null,
    planosEmpresariaisId: null,
    valor: 0,
  });
  const [isLoadingPlan, setIsLoadingPlan] = useState(false);

  // Ref para evitar chamadas duplicadas
  const hasFetchedPlan = useRef(false);

  // Verifica autenticação via cookie de token
  const isAuthenticated = useMemo(() => {
    return Boolean(getCookieValue("token"));
  }, []);

  // Verifica se é role EMPRESA
  const isCompanyRole = useMemo(() => {
    return role === UserRole.EMPRESA;
  }, [role]);

  // Carrega dados do plano do usuário via perfil (não usa endpoint administrativo)
  useEffect(() => {
    if (!isCompanyRole || hasFetchedPlan.current) return;

    const fetchUserPlan = async () => {
      try {
        setIsLoadingPlan(true);
        hasFetchedPlan.current = true;

        const token = getCookieValue("token");
        if (!token) return;

        const profile = await getUserProfile(token);

        if (profile?.success && "usuario" in profile) {
          const usuario = profile.usuario as any;
          // O perfil pode conter dados do plano da empresa
          // Esses campos dependem do que a API retorna
          const plano = usuario.plano || usuario.empresaPlano || null;

          if (plano) {
            setUserPlan({
              id: plano.id || null,
              planosEmpresariaisId: plano.planosEmpresariaisId || null,
              valor: plano.valor ? parsePrice(plano.valor) : 0,
            });
          }
        }
      } catch (error) {
        // Erro silenciado - não bloqueia a funcionalidade
        console.warn(
          "[usePricingActions] Erro ao carregar plano do usuário:",
          error
        );
      } finally {
        setIsLoadingPlan(false);
      }
    };

    fetchUserPlan();
  }, [isCompanyRole]);

  // Dados do plano atual da empresa
  const currentPlanId = userPlan.id;
  const currentPlanosEmpresariaisId = userPlan.planosEmpresariaisId;
  const currentPlanValue = userPlan.valor;

  // Carrega informações gerais para obter o WhatsApp
  useEffect(() => {
    async function loadWhatsapp() {
      try {
        setIsLoadingWhatsapp(true);
        const infos = await listInformacoesGerais();
        if (Array.isArray(infos) && infos.length > 0 && infos[0].whatsapp) {
          // Remove caracteres não numéricos e adiciona código do país se necessário
          let phone = infos[0].whatsapp.replace(/\D/g, "");
          if (phone.length === 11 && !phone.startsWith("55")) {
            phone = `55${phone}`;
          }
          setWhatsappNumber(phone);
        }
      } catch (error) {
        // Erro silenciado - não bloqueia a funcionalidade
      } finally {
        setIsLoadingWhatsapp(false);
      }
    }
    loadWhatsapp();
  }, []);

  // Função auxiliar para gerar link do WhatsApp com mensagem personalizada
  const generateWhatsAppLink = useCallback(
    (planName?: string) => {
      if (!whatsappNumber) {
        return null;
      }

      let message =
        "Olá! Gostaria de saber mais sobre os planos empresariais da Advance+.";
      if (planName) {
        message = `Olá! Tenho interesse no plano "${planName}" da Advance+. Gostaria de mais informações sobre valores e condições.`;
      }

      const encodedMessage = encodeURIComponent(message);
      const link = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
      return link;
    },
    [whatsappNumber]
  );

  // Link genérico (sem nome de plano específico) - mantido para compatibilidade
  const whatsappLink = useMemo(() => {
    return generateWhatsAppLink();
  }, [generateWhatsAppLink]);

  // Determina o estado do botão para cada plano
  const getButtonState = useCallback(
    (plan: PricingPlanData): PlanButtonState => {
      const planValue = parsePrice(plan.price);

      // Se não for EMPRESA, sempre mostra "Falar com especialista"
      if (!isCompanyRole) {
        // Gera link específico com o nome do plano
        const planLink = generateWhatsAppLink(plan.title);
        return {
          action: "contato" as const,
          text: "Falar com um especialista",
          disabled: false,
          href: planLink ?? undefined,
        };
      }

      // Se for EMPRESA mas não tem plano, mostra "Contratar plano"
      if (!currentPlanosEmpresariaisId) {
        return {
          action: "comprar",
          text: "Contratar plano",
          disabled: false,
        };
      }

      // Se é o plano atual, desabilita
      if (plan.id === currentPlanosEmpresariaisId) {
        return {
          action: "plano_atual",
          text: "Seu plano atual",
          disabled: true,
        };
      }

      // Se o plano é mais caro, é upgrade
      if (planValue > currentPlanValue) {
        return {
          action: "upgrade",
          text: "Fazer upgrade",
          disabled: false,
        };
      }

      // Se o plano é mais barato, permite alterar (sem usar "downgrade")
      return {
        action: "alterar_plano",
        text: "Alterar para este plano",
        disabled: false,
      };
    },
    [
      isCompanyRole,
      currentPlanosEmpresariaisId,
      currentPlanValue,
      generateWhatsAppLink,
    ]
  );

  // Handler para clique no botão
  const handlePlanClick = useCallback(
    (plan: PricingPlanData) => {
      const buttonState = getButtonState(plan);

      // Se está desabilitado, não faz nada
      if (buttonState.disabled) {
        return;
      }

      // Se é contato, abre WhatsApp (sempre, mesmo sem href ainda)
      if (buttonState.action === "contato") {
        // Tenta usar o href do buttonState primeiro (já tem o nome do plano)
        let link = buttonState.href;

        // Se não tem href, gera link com o nome do plano
        if (!link) {
          link = generateWhatsAppLink(plan.title) || whatsappLink || undefined;
        }

        if (link) {
          window.open(link, "_blank", "noopener,noreferrer");
        } else {
          // Se não tem link ainda, usa número padrão do env com nome do plano
          const defaultPhone = env.supportPhone;
          const message = plan.title
            ? `Olá! Tenho interesse no plano "${plan.title}" da Advance+. Gostaria de mais informações sobre valores e condições.`
            : "Olá! Gostaria de saber mais sobre os planos empresariais da Advance+.";
          const defaultMessage = encodeURIComponent(message);
          const phoneWithCountry = defaultPhone.startsWith("55")
            ? defaultPhone
            : `55${defaultPhone}`;
          const fallbackLink = `https://wa.me/${phoneWithCountry}?text=${defaultMessage}`;
          window.open(fallbackLink, "_blank", "noopener,noreferrer");
        }
        return; // IMPORTANTE: retorna aqui para não continuar com outras ações
      }

      // Para ações de compra/upgrade/alteração, verifica autenticação
      if (!isAuthenticated) {
        // Salva o plano desejado em sessionStorage para redirecionar após login
        sessionStorage.setItem("pendingPlanId", plan.id);
        sessionStorage.setItem("pendingPlanName", plan.title);
        sessionStorage.setItem("pendingPlanPrice", plan.price);
        const redirect =
          typeof window !== "undefined"
            ? `${window.location.pathname}${window.location.search}`
            : "/planos";
        router.push(`/auth/login?redirect=${encodeURIComponent(redirect)}`);
        return;
      }

      // Cria sessão de checkout segura e redireciona
      const priceValue = parsePrice(plan.price);
      const currentUrl =
        typeof window !== "undefined"
          ? window.location.pathname
          : "/recrutamento";
      const { url } = createCheckoutAndGetUrl({
        productType: "plano",
        productId: plan.id,
        productName: plan.title,
        productPrice: priceValue,
        currency: plan.currency || "BRL",
        originUrl: currentUrl,
        metadata: {
          planDescription: plan.description,
          features: plan.features,
        },
      });

      router.push(url);
    },
    [
      getButtonState,
      isAuthenticated,
      router,
      generateWhatsAppLink,
      whatsappLink,
    ]
  );

  const isLoading = isLoadingPlan || isLoadingWhatsapp;

  return {
    isAuthenticated,
    isCompanyRole,
    currentPlanId,
    currentPlanValue,
    currentPlanosEmpresariaisId,
    whatsappLink,
    isLoading,
    getButtonState,
    handlePlanClick,
  };
}
