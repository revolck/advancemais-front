// src/theme/website/components/checkout/hooks/useCheckout.ts

"use client";

import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { UserRole } from "@/config/roles";
import { useUserRole } from "@/hooks/useUserRole";
import { getUserProfile } from "@/api/usuarios";
import { getPlanoEmpresarialById } from "@/api/empresas/planos-empresariais";
import { startCheckout, upgradeSubscription, downgradeSubscription } from "@/api/mercadopago";
import { 
  markSessionAsProcessing, 
  markSessionAsCompleted,
  type CheckoutSession 
} from "@/lib/checkout-session";
import type { CheckoutIntent } from "@/api/mercadopago/types";
import type {
  CheckoutPlan,
  CheckoutState,
  CheckoutAction,
  PaymentMethod,
  CheckoutResult,
} from "../types";

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
  const cleaned = priceStr
    .replace(/R\$\s*/g, "")
    .replace(/\./g, "")
    .replace(",", ".")
    .trim();
  return parseFloat(cleaned) || 0;
}

// Interface para dados do plano atual do usuário
interface CurrentPlanData {
  planosEmpresariaisId: string | null;
  valor: number;
}

interface UseCheckoutReturn {
  /** Plano sendo comprado */
  plan: CheckoutPlan | null;
  /** Estado do checkout */
  state: CheckoutState;
  /** Tipo de ação (compra, upgrade, alteração) */
  action: CheckoutAction;
  /** ID do usuário logado */
  userId: string | null;
  /** Se o usuário está autenticado */
  isAuthenticated: boolean;
  /** Se é ROLE EMPRESA */
  isCompanyRole: boolean;
  /** Seleciona método de pagamento */
  selectPaymentMethod: (method: PaymentMethod) => void;
  /** Processa o pagamento */
  processPayment: () => Promise<CheckoutResult>;
  /** Reseta o estado */
  reset: () => void;
}

export function useCheckout(
  planId: string, 
  session?: CheckoutSession | null
): UseCheckoutReturn {
  const router = useRouter();
  const role = useUserRole();
  
  // Estado para dados do plano atual do usuário (obtido via perfil)
  const [currentPlan, setCurrentPlan] = useState<CurrentPlanData>({
    planosEmpresariaisId: null,
    valor: 0,
  });
  const hasFetchedCurrentPlan = useRef(false);

  const [plan, setPlan] = useState<CheckoutPlan | null>(null);
  const [state, setState] = useState<CheckoutState>({
    step: "select_payment",
    selectedMethod: null,
    isLoading: true,
    error: null,
  });

  // Verifica autenticação
  const isAuthenticated = useMemo(() => {
    return Boolean(getCookieValue("token"));
  }, []);

  const userId = useMemo(() => {
    return getCookieValue("user_id");
  }, []);

  const isCompanyRole = useMemo(() => {
    return role === UserRole.EMPRESA;
  }, [role]);

  // Carrega dados do plano atual do usuário via perfil
  useEffect(() => {
    if (!isCompanyRole || hasFetchedCurrentPlan.current) return;

    const fetchCurrentPlan = async () => {
      try {
        hasFetchedCurrentPlan.current = true;
        const token = getCookieValue("token");
        if (!token) return;

        const profile = await getUserProfile(token);

        if (profile?.success && "usuario" in profile) {
          const usuario = profile.usuario as any;
          const plano = usuario.plano || usuario.empresaPlano || null;

          if (plano) {
            setCurrentPlan({
              planosEmpresariaisId: plano.planosEmpresariaisId || null,
              valor: plano.valor ? parsePrice(plano.valor) : 0,
            });
          }
        }
      } catch (error) {
        console.warn("[useCheckout] Erro ao carregar plano atual:", error);
      }
    };

    fetchCurrentPlan();
  }, [isCompanyRole]);

  // Determina o tipo de ação
  const action = useMemo((): CheckoutAction => {
    if (!currentPlan.planosEmpresariaisId) {
      return "compra";
    }

    const newPlanValue = plan?.valorNumerico ?? 0;

    if (newPlanValue > currentPlan.valor) {
      return "upgrade";
    }
    
    return "alteracao";
  }, [currentPlan, plan]);

  // Carrega dados do plano
  useEffect(() => {
    async function loadPlan() {
      // Se não tem planId ou session, não carrega
      if (!planId) {
        setState((s) => ({ ...s, isLoading: false, error: "Plano não encontrado" }));
        return;
      }

      try {
        setState((s) => ({ ...s, isLoading: true, error: null }));
        
        const response = await getPlanoEmpresarialById(planId);
        
        if ("nome" in response) {
          setPlan({
            id: response.id,
            nome: response.nome,
            valor: response.valor,
            valorNumerico: parsePrice(response.valor),
            descricao: response.descricao,
            icon: response.icon,
          });
        } else {
          setState((s) => ({
            ...s,
            error: "message" in response ? response.message : "Plano não encontrado",
          }));
        }
      } catch (error) {
        console.error("Erro ao carregar plano:", error);
        setState((s) => ({
          ...s,
          error: error instanceof Error ? error.message : "Erro ao carregar plano",
        }));
      } finally {
        setState((s) => ({ ...s, isLoading: false }));
      }
    }

    loadPlan();
  }, [planId]);

  // Redireciona se não autenticado
  useEffect(() => {
    if (!state.isLoading && !isAuthenticated) {
      router.push(`/auth/login?redirect=/planos`);
    }
  }, [state.isLoading, isAuthenticated, router]);

  // Seleciona método de pagamento
  const selectPaymentMethod = useCallback((method: PaymentMethod) => {
    setState((s) => ({ ...s, selectedMethod: method, error: null }));
  }, []);

  // Processa o pagamento
  const processPayment = useCallback(async (): Promise<CheckoutResult> => {
    if (!plan || !state.selectedMethod || !userId) {
      return {
        success: false,
        status: "rejected",
        message: "Dados incompletos para processamento",
      };
    }

    // Marca sessão como em processamento
    if (session?.sessionId) {
      markSessionAsProcessing(session.sessionId);
    }

    setState((s) => ({ ...s, step: "processing", isLoading: true, error: null }));

    try {
      // Mapeia método de pagamento
      const paymentMethodMap: Record<PaymentMethod, "pix" | "card" | "boleto"> = {
        pix: "pix",
        boleto: "boleto",
        cartao_credito: "card",
        cartao_debito: "card",
      };

      const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
      
      // Se é upgrade ou alteração, usa endpoints específicos
      if (action === "upgrade" && currentPlan.planosEmpresariaisId) {
        const response = await upgradeSubscription({
          usuarioId: userId,
          novoPlanosEmpresariaisId: plan.id,
        });

        if (response.success) {
          // Marca sessão como completada
          if (session?.sessionId) {
            markSessionAsCompleted(session.sessionId);
          }
          
          setState((s) => ({ ...s, step: "complete", isLoading: false }));
          return {
            success: true,
            status: "approved",
            message: "Upgrade realizado com sucesso!",
          };
        } else {
          throw new Error("Erro ao processar upgrade");
        }
      }

      if (action === "alteracao" && currentPlan.planosEmpresariaisId) {
        const response = await downgradeSubscription({
          usuarioId: userId,
          novoPlanosEmpresariaisId: plan.id,
        });

        if (response.success) {
          // Marca sessão como completada
          if (session?.sessionId) {
            markSessionAsCompleted(session.sessionId);
          }
          
          setState((s) => ({ ...s, step: "complete", isLoading: false }));
          return {
            success: true,
            status: "approved",
            message: "Plano alterado com sucesso!",
          };
        } else {
          throw new Error("Erro ao processar alteração de plano");
        }
      }

      // Nova assinatura
      const checkoutIntent: CheckoutIntent = {
        usuarioId: userId,
        planosEmpresariaisId: plan.id,
        metodo: "assinatura",
        pagamento: paymentMethodMap[state.selectedMethod],
        successUrl: `${baseUrl}/checkout/sucesso`,
        failureUrl: `${baseUrl}/checkout/falha`,
        pendingUrl: `${baseUrl}/checkout/pendente`,
      };

      const response = await startCheckout(checkoutIntent);

      if (response.success) {
        // Marca sessão como completada
        if (session?.sessionId) {
          markSessionAsCompleted(session.sessionId);
        }
        
        setState((s) => ({ ...s, step: "complete", isLoading: false }));

        // Se tem link de redirecionamento, redireciona
        if (response.link) {
          window.location.href = response.link;
          return {
            success: true,
            status: "pending",
            message: "Redirecionando para pagamento...",
            redirectUrl: response.link,
          };
        }

        return {
          success: true,
          status: response.status === "approved" ? "approved" : "pending",
          message: "Assinatura criada com sucesso!",
          preferenceId: response.preferenceId,
          paymentId: response.paymentId,
        };
      } else {
        throw new Error("Erro ao processar pagamento");
      }
    } catch (error) {
      console.error("Erro no processamento:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Erro ao processar pagamento";
      
      setState((s) => ({
        ...s,
        step: "select_payment",
        isLoading: false,
        error: errorMessage,
      }));

      return {
        success: false,
        status: "rejected",
        message: errorMessage,
      };
    }
  }, [plan, state.selectedMethod, userId, action, currentPlan, session]);

  // Reset
  const reset = useCallback(() => {
    setState({
      step: "select_payment",
      selectedMethod: null,
      isLoading: false,
      error: null,
    });
  }, []);

  return {
    plan,
    state,
    action,
    userId,
    isAuthenticated,
    isCompanyRole,
    selectPaymentMethod,
    processPayment,
    reset,
  };
}
