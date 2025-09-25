"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
} from "react";
import {
  ModalCustom,
  ModalContentWrapper,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalTitle,
  ModalDescription,
} from "@/components/ui/custom/modal";
import { ButtonCustom } from "@/components/ui/custom/button";
import { InputCustom } from "@/components/ui/custom/input";
import { toastCustom } from "@/components/ui/custom/toast";
import { SelectCustom } from "@/components/ui/custom/select";
import { updateAdminCompany, listPlanosEmpresariais } from "@/api/empresas";
import type {
  AdminCompanyDetail,
  AdminCompanyPlano,
  AdminCompanyPlanMode,
  AdminCompanyPagamento,
  UpdateAdminCompanyPayload,
} from "@/api/empresas/admin/types";
import type {
  PlanoEmpresarialBackendResponse,
  PlanoEmpresarialListApiResponse,
} from "@/api/empresas/planos-empresariais/types";

const PLAN_TYPE_OPTIONS = [
  { value: "parceiro", label: "Parceiro" },
  { value: "teste", label: "Teste" },
  { value: "ASSINATURA", label: "Assinatura" },
];

const MODELO_PAGAMENTO_OPTIONS = [
  { value: "ASSINATURA", label: "Assinatura" },
  { value: "PAGAMENTO_UNICO", label: "Pagamento Único" },
  { value: "PAGAMENTO_PARCELADO", label: "Pagamento Parcelado" },
];

const METODO_PAGAMENTO_OPTIONS = [
  { value: "CARTAO_CREDITO", label: "Cartão de Crédito" },
  { value: "CARTAO_DEBITO", label: "Cartão de Débito" },
  { value: "PIX", label: "PIX" },
  { value: "BOLETO", label: "Boleto" },
  { value: "TRANSFERENCIA", label: "Transferência" },
  { value: "DINHEIRO", label: "Dinheiro" },
];

const STATUS_PAGAMENTO_OPTIONS = [
  { value: "PENDENTE", label: "Pendente" },
  { value: "EM_PROCESSAMENTO", label: "Em Processamento" },
  { value: "APROVADO", label: "Aprovado" },
  { value: "CONCLUIDO", label: "Concluído" },
  { value: "RECUSADO", label: "Recusado" },
  { value: "ESTORNADO", label: "Estornado" },
  { value: "CANCELADO", label: "Cancelado" },
];

const STATUS_PLANO_OPTIONS = [
  { value: "ATIVO", label: "Ativo" },
  { value: "SUSPENSO", label: "Suspenso" },
  { value: "EXPIRADO", label: "Expirado" },
  { value: "CANCELADO", label: "Cancelado" },
];

interface EditarAssinaturaModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  company: AdminCompanyDetail;
  onSubscriptionUpdated: (
    plan: AdminCompanyPlano,
    payment: AdminCompanyPagamento
  ) => void;
}

type SubscriptionFormState = {
  planId: string;
  planType: AdminCompanyPlanMode;
  modeloPagamento: string;
  metodoPagamento: string;
  statusPagamento: string;
  statusPlano: string;
};

export function EditarAssinaturaModal({
  isOpen,
  onOpenChange,
  company,
  onSubscriptionUpdated,
}: EditarAssinaturaModalProps) {
  const initialState = useMemo<SubscriptionFormState>(
    () => ({
      planId: company.plano?.id ?? "",
      planType: company.plano?.modo ?? "parceiro",
      modeloPagamento:
        company.plano?.modeloPagamento ?? company.pagamento?.modelo ?? "",
      metodoPagamento:
        company.plano?.metodoPagamento ?? company.pagamento?.metodo ?? "",
      statusPagamento:
        company.plano?.statusPagamento ?? company.pagamento?.status ?? "",
      statusPlano: company.plano?.status ?? "ATIVO",
    }),
    [company]
  );

  const [formState, setFormState] =
    useState<SubscriptionFormState>(initialState);
  const [planOptions, setPlanOptions] = useState<
    PlanoEmpresarialBackendResponse[]
  >([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormState(initialState);
      setIsSaving(false);

      if (planOptions.length === 0) {
        setIsLoadingPlans(true);
        listPlanosEmpresariais()
          .then((response) => {
            // Verificar se é um array (sucesso) ou objeto de erro
            if (Array.isArray(response)) {
              setPlanOptions(response);
            } else {
              console.error("Erro na resposta da API:", response);
              toastCustom.error({
                title: "Erro ao carregar planos",
                description:
                  response.message ||
                  "Não foi possível listar os planos disponíveis.",
              });
            }
          })
          .catch((error) => {
            console.error("Erro ao carregar planos empresariais", error);
            toastCustom.error({
              title: "Erro ao carregar planos",
              description:
                "Não foi possível listar os planos disponíveis agora.",
            });
          })
          .finally(() => setIsLoadingPlans(false));
      }
    }
  }, [initialState, isOpen, planOptions.length]);

  const handleClose = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  const handleSelectPlan = useCallback((value: string | null) => {
    setFormState((prev) => ({ ...prev, planId: value || "" }));
  }, []);

  const handleSelectPlanType = useCallback((value: string | null) => {
    setFormState((prev) => ({
      ...prev,
      planType: (value as AdminCompanyPlanMode) || "parceiro",
    }));
  }, []);

  const handleSelectModeloPagamento = useCallback((value: string | null) => {
    setFormState((prev) => ({
      ...prev,
      modeloPagamento: value || "",
    }));
  }, []);

  const handleSelectMetodoPagamento = useCallback((value: string | null) => {
    setFormState((prev) => ({
      ...prev,
      metodoPagamento: value || "",
    }));
  }, []);

  const handleSelectStatusPagamento = useCallback((value: string | null) => {
    setFormState((prev) => ({
      ...prev,
      statusPagamento: value || "",
    }));
  }, []);

  const handleSelectStatusPlano = useCallback((value: string | null) => {
    setFormState((prev) => ({
      ...prev,
      statusPlano: value || "",
    }));
  }, []);

  const planSelectOptions = useMemo(() => {
    // Usar Set para garantir unicidade dos IDs
    const uniquePlanIds = new Set<string>();
    const options: Array<{ value: string; label: string }> = [];

    // Adicionar "Sem assinatura" sempre primeiro
    options.push({ value: "", label: "Sem assinatura" });
    uniquePlanIds.add("");

    // Adicionar planos da API
    planOptions.forEach((plan) => {
      if (plan.id && !uniquePlanIds.has(plan.id)) {
        options.push({
          value: plan.id,
          label: plan.nome,
        });
        uniquePlanIds.add(plan.id);
      }
    });

    // Adicionar plano atual apenas se não estiver na lista da API
    if (
      formState.planId &&
      company.plano?.nome &&
      !uniquePlanIds.has(formState.planId)
    ) {
      options.push({
        value: formState.planId,
        label: company.plano.nome,
      });
      uniquePlanIds.add(formState.planId);
    }

    return options;
  }, [planOptions, formState.planId, company.plano?.nome]);

  const handleSave = useCallback(async () => {
    if (isSaving) return;

    // Validação de campos obrigatórios
    if (!formState.planId) {
      toastCustom.error({
        title: "Plano obrigatório",
        description: "Selecione um plano empresarial.",
      });
      return;
    }

    if (!formState.modeloPagamento) {
      toastCustom.error({
        title: "Modelo de pagamento obrigatório",
        description: "Selecione um modelo de pagamento.",
      });
      return;
    }

    if (!formState.metodoPagamento) {
      toastCustom.error({
        title: "Método de pagamento obrigatório",
        description: "Selecione um método de pagamento.",
      });
      return;
    }

    if (!formState.statusPagamento) {
      toastCustom.error({
        title: "Status de pagamento obrigatório",
        description: "Selecione um status de pagamento.",
      });
      return;
    }

    if (!formState.statusPlano) {
      toastCustom.error({
        title: "Status do plano obrigatório",
        description: "Selecione um status do plano.",
      });
      return;
    }

    const sanitize = (value: string): string | null => {
      const trimmed = value.trim();
      return trimmed.length ? trimmed : null;
    };

    const payload: UpdateAdminCompanyPayload = {
      plano: {
        planosEmpresariaisId: formState.planId,
        modo: formState.planType,
        diasTeste: formState.planType === "teste" ? 30 : undefined,
        resetPeriodo: false,
      },
      status: formState.statusPlano as any,
    };

    // Adicionar campos adicionais no body da requisição (fora do tipo)
    const extendedPayload = {
      ...payload,
      modeloPagamento: formState.modeloPagamento,
      metodoPagamento: formState.metodoPagamento,
      statusPagamento: formState.statusPagamento,
      origen: "ADMIN", // Campo origem sempre como ADMIN
    };

    setIsSaving(true);

    try {
      await updateAdminCompany(company.id, extendedPayload as any);

      const selectedPlan = planOptions.find(
        (plan) => plan.id === formState.planId
      );

      const nextPlan: AdminCompanyPlano = {
        id: formState.planId,
        nome: selectedPlan?.nome ?? company.plano?.nome ?? "Plano empresarial",
        modo: formState.planType,
        status: formState.statusPlano as any,
        inicio: company.plano?.inicio ?? null,
        fim: company.plano?.fim ?? null,
        modeloPagamento: formState.modeloPagamento as any,
        metodoPagamento: formState.metodoPagamento as any,
        statusPagamento: formState.statusPagamento as any,
        quantidadeVagas:
          selectedPlan?.quantidadeVagas ?? company.plano?.quantidadeVagas ?? 0,
        valor: selectedPlan?.valor ?? company.plano?.valor ?? null,
        duracaoEmDias: company.plano?.duracaoEmDias ?? null,
        diasRestantes: company.plano?.diasRestantes ?? null,
      };

      const nextPayment: AdminCompanyPagamento = {
        metodo: formState.metodoPagamento as any,
        status: formState.statusPagamento as any,
        modelo: formState.modeloPagamento as any,
        ultimoPagamentoEm:
          company.pagamento?.ultimoPagamentoEm ?? new Date().toISOString(),
      };

      onSubscriptionUpdated(nextPlan, nextPayment);

      toastCustom.success({
        title: "Assinatura atualizada",
        description: "As informações de assinatura foram salvas com sucesso.",
      });

      handleClose();
    } catch (error) {
      console.error("Erro ao atualizar assinatura", error);
      toastCustom.error({
        title: "Erro ao salvar assinatura",
        description: "Não foi possível atualizar a assinatura agora.",
      });
    } finally {
      setIsSaving(false);
    }
  }, [
    company.id,
    company.pagamento,
    company.plano,
    formState,
    handleClose,
    isSaving,
    onSubscriptionUpdated,
    planOptions,
  ]);

  return (
    <ModalCustom
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="xl"
      backdrop="blur"
      scrollBehavior="inside"
    >
      <ModalContentWrapper>
        <ModalHeader>
          <ModalTitle>Editar assinatura</ModalTitle>
        </ModalHeader>

        <ModalBody className="space-y-6 p-1">
          <div className="space-y-3">
            <label className="text-sm font-semibold text-foreground">
              Plano empresarial *
            </label>
            <SelectCustom
              mode="single"
              options={planSelectOptions}
              value={formState.planId || null}
              onChange={handleSelectPlan}
              placeholder="Selecione um plano"
              disabled={isSaving || isLoadingPlans}
              size="sm"
              fullWidth
              required
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-semibold text-foreground">
              Tipo de plano *
            </label>
            <SelectCustom
              mode="single"
              options={PLAN_TYPE_OPTIONS}
              value={formState.planType}
              onChange={handleSelectPlanType}
              placeholder="Selecione o tipo"
              disabled={isSaving}
              size="sm"
              fullWidth
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-3">
              <label className="text-sm font-semibold text-foreground">
                Modelo de pagamento *
              </label>
              <SelectCustom
                mode="single"
                options={MODELO_PAGAMENTO_OPTIONS}
                value={formState.modeloPagamento || null}
                onChange={handleSelectModeloPagamento}
                placeholder="Selecione o modelo"
                disabled={isSaving}
                size="sm"
                fullWidth
                required
              />
            </div>
            <div className="space-y-3">
              <label className="text-sm font-semibold text-foreground">
                Método de pagamento *
              </label>
              <SelectCustom
                mode="single"
                options={METODO_PAGAMENTO_OPTIONS}
                value={formState.metodoPagamento || null}
                onChange={handleSelectMetodoPagamento}
                placeholder="Selecione o método"
                disabled={isSaving}
                size="sm"
                fullWidth
                required
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-3">
              <label className="text-sm font-semibold text-foreground">
                Status do pagamento *
              </label>
              <SelectCustom
                mode="single"
                options={STATUS_PAGAMENTO_OPTIONS}
                value={formState.statusPagamento || null}
                onChange={handleSelectStatusPagamento}
                placeholder="Selecione o status"
                disabled={isSaving}
                size="sm"
                fullWidth
                required
              />
            </div>
            <div className="space-y-3">
              <label className="text-sm font-semibold text-foreground">
                Status do plano *
              </label>
              <SelectCustom
                mode="single"
                options={STATUS_PLANO_OPTIONS}
                value={formState.statusPlano || null}
                onChange={handleSelectStatusPlano}
                placeholder="Selecione o status"
                disabled={isSaving}
                size="sm"
                fullWidth
                required
              />
            </div>
          </div>
        </ModalBody>

        <ModalFooter className="pt-4">
          <ButtonCustom
            variant="ghost"
            onClick={handleClose}
            disabled={isSaving}
            size="md"
          >
            Cancelar
          </ButtonCustom>
          <ButtonCustom
            variant="primary"
            onClick={handleSave}
            size="md"
            isLoading={isSaving}
            loadingText="Salvando..."
          >
            Salvar assinatura
          </ButtonCustom>
        </ModalFooter>
      </ModalContentWrapper>
    </ModalCustom>
  );
}
