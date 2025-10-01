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
import {
  updateAdminCompanyPlano,
  listPlanosEmpresariais,
} from "@/api/empresas";
import type {
  AdminCompanyDetail,
  AdminCompanyPlano,
  AdminCompanyPlanMode,
  AdminCompanyPagamento,
  UpdateAdminCompanyPlanoPayload,
} from "@/api/empresas/admin/types";
import type {
  PlanoEmpresarialBackendResponse,
  PlanoEmpresarialListApiResponse,
} from "@/api/empresas/planos-empresariais/types";

const PLAN_TYPE_OPTIONS = [
  { value: "CLIENTE", label: "Cliente" },
  { value: "TESTE", label: "Avaliação" },
  { value: "PARCEIRO", label: "Empresa Parceira" },
];

const MODELO_PAGAMENTO_OPTIONS = [
  { value: "ASSINATURA", label: "Assinatura" },
  { value: "PAGAMENTO_UNICO", label: "Pagamento Único" },
  { value: "PAGAMENTO_PARCELADO", label: "Pagamento Parcelado" },
];

const METODO_PAGAMENTO_OPTIONS = [
  { value: "PIX", label: "PIX" },
  { value: "CARTAO_CREDITO", label: "Cartão de Crédito" },
  { value: "CARTAO_DEBITO", label: "Cartão de Débito" },
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

type AdminCompanyPlanoWithReference = AdminCompanyPlano & {
  planoEmpresarialId?: string;
  planosEmpresarialId?: string;
  planoId?: string;
};

const getPlanReferenceId = (plan?: AdminCompanyPlano | null): string => {
  if (!plan) return "";

  const planWithReference = plan as AdminCompanyPlanoWithReference;

  return (
    planWithReference.planosEmpresariaisId ??
    planWithReference.planoEmpresarialId ??
    planWithReference.planosEmpresarialId ??
    planWithReference.planoId ??
    plan.id ??
    ""
  );
};

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
  diasTeste: string;
  metodoPagamento: string;
  statusPagamento: string;
};

export function EditarAssinaturaModal({
  isOpen,
  onOpenChange,
  company,
  onSubscriptionUpdated,
}: EditarAssinaturaModalProps) {
  const initialState = useMemo<SubscriptionFormState>(
    () => ({
      planId: getPlanReferenceId(company.plano),
      planType: company.plano?.modo ?? "CLIENTE",
      diasTeste:
        company.plano?.modo === "TESTE"
          ? company.diasTesteDisponibilizados?.toString() ?? ""
          : "",
      metodoPagamento:
        company.plano?.metodoPagamento ?? company.pagamento?.metodo ?? "",
      statusPagamento:
        company.plano?.statusPagamento ?? company.pagamento?.status ?? "",
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
      planType: (value as AdminCompanyPlanMode) || "CLIENTE",
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

  const handleInputChange = useCallback(
    (field: keyof SubscriptionFormState) =>
      (e: ChangeEvent<HTMLInputElement>) => {
        setFormState((prev) => ({
          ...prev,
          [field]: e.target.value,
        }));
      },
    []
  );

  // Função para calcular a próxima cobrança (próximo mês)
  const getNextBillingDate = useCallback(() => {
    const now = new Date();
    const nextMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      now.getDate()
    );
    return nextMonth.toISOString();
  }, []);

  const currentPlanReference = useMemo(
    () => getPlanReferenceId(company.plano),
    [company.plano]
  );

  const planSelectOptions = useMemo(() => {
    const uniquePlanIds = new Set<string>([""]);
    const options: Array<{ value: string; label: string }> = [
      { value: "", label: "Sem assinatura" },
    ];

    planOptions.forEach((plan) => {
      if (plan.id && !uniquePlanIds.has(plan.id)) {
        options.push({ value: plan.id, label: plan.nome });
        uniquePlanIds.add(plan.id);
      }
    });

    const hasSelectedPlanInOptions = planOptions.some(
      (plan) => plan.id === formState.planId
    );

    const hasCurrentPlanOption =
      currentPlanReference && uniquePlanIds.has(currentPlanReference);

    if (
      !hasSelectedPlanInOptions &&
      currentPlanReference &&
      !hasCurrentPlanOption &&
      company.plano?.nome
    ) {
      options.push({
        value: currentPlanReference,
        label: company.plano.nome,
      });
      uniquePlanIds.add(currentPlanReference);
    }

    return options;
  }, [
    company.plano?.nome,
    currentPlanReference,
    formState.planId,
    planOptions,
  ]);

  useEffect(() => {
    if (!isOpen) return;

    setFormState((prev) => {
      const planExists = planOptions.some((plan) => plan.id === prev.planId);

      if (planExists) {
        return prev;
      }

      if (currentPlanReference && currentPlanReference !== prev.planId) {
        return {
          ...prev,
          planId: currentPlanReference,
        };
      }

      if (!company.plano?.nome) {
        return prev;
      }

      const matchedPlanByName = planOptions.find(
        (plan) => plan.nome === company.plano?.nome
      );

      if (matchedPlanByName && matchedPlanByName.id !== prev.planId) {
        return {
          ...prev,
          planId: matchedPlanByName.id,
        };
      }

      return prev;
    });
  }, [company.plano?.nome, currentPlanReference, isOpen, planOptions]);

  const handleSave = useCallback(async () => {
    if (isSaving) return;

    // Validação de campos obrigatórios
    if (!formState.planId) {
      toastCustom.error({
        title: "Plano obrigatório",
        description: "Selecione um plano de assinatura.",
      });
      return;
    }

    if (!planOptions.some((plan) => plan.id === formState.planId)) {
      toastCustom.error({
        title: "Plano inválido",
        description: "Selecione um plano válido na lista disponível.",
      });
      return;
    }

    if (formState.planType !== "TESTE") {
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
    }

    // Validação específica para modo TESTE
    if (formState.planType === "TESTE" && !formState.diasTeste) {
      toastCustom.error({
        title: "Dias para o período de avaliação obrigatório",
        description:
          "Informe a quantidade de dias para o período de avaliação.",
      });
      return;
    }

    if (
      formState.planType === "TESTE" &&
      formState.diasTeste &&
      (parseInt(formState.diasTeste) <= 0 ||
        parseInt(formState.diasTeste) > 999)
    ) {
      toastCustom.error({
        title: "Dias para o período de avaliação inválido",
        description: "A quantidade de dias deve ser entre 1 e 999.",
      });
      return;
    }

    const payload: UpdateAdminCompanyPlanoPayload = {
      planosEmpresariaisId: formState.planId,
      modo: formState.planType,
      iniciarEm: new Date().toISOString(),
      diasTeste:
        formState.planType === "TESTE"
          ? parseInt(formState.diasTeste)
          : undefined,
      modeloPagamento:
        formState.planType === "TESTE" ? undefined : "ASSINATURA",
      metodoPagamento:
        formState.planType === "TESTE"
          ? undefined
          : (formState.metodoPagamento as any),
      statusPagamento:
        formState.planType === "TESTE"
          ? undefined
          : (formState.statusPagamento as any),
      proximaCobranca:
        formState.planType === "TESTE" ? undefined : getNextBillingDate(),
    };

    setIsSaving(true);

    try {
      const response = await updateAdminCompanyPlano(company.id, payload);

      if (!response || typeof response !== "object") {
        throw new Error("Resposta inválida da API ao atualizar assinatura.");
      }

      if ("empresa" in response) {
        const updatedPlan = response.empresa.plano;
        const updatedPayment = response.empresa.pagamento;

        onSubscriptionUpdated(updatedPlan, updatedPayment);

        toastCustom.success({
          title: "Assinatura atualizada",
          description:
            "As informações de assinatura foram salvas com sucesso.",
        });

        handleClose();
        return;
      }

      const errorMessage =
        "message" in response && response.message
          ? response.message
          : "Não foi possível atualizar a assinatura.";

      console.error(
        "Erro na resposta da API ao atualizar assinatura",
        response
      );
      toastCustom.error({
        title: "Erro ao salvar assinatura",
        description: errorMessage,
      });
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
    formState,
    handleClose,
    isSaving,
    onSubscriptionUpdated,
    planOptions,
    getNextBillingDate,
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
          <SelectCustom
            mode="single"
            options={planSelectOptions}
            value={formState.planId ? formState.planId : null}
            onChange={handleSelectPlan}
            placeholder="Selecione um plano"
            disabled={isSaving || isLoadingPlans}
            size="sm"
            fullWidth
            required
            label="Plano de assinatura"
          />

          <SelectCustom
            mode="single"
            options={PLAN_TYPE_OPTIONS}
            value={formState.planType}
            onChange={handleSelectPlanType}
            placeholder="Selecione o tipo de empresa"
            disabled={isSaving}
            size="sm"
            fullWidth
            required
            label="Vincular o plano"
          />

          {formState.planType === "TESTE" && (
            <InputCustom
              type="number"
              value={formState.diasTeste}
              onChange={(e) => {
                let value = e.target.value.replace(/[^\d]/g, "");

                // Limita a 3 caracteres
                if (value.length > 3) {
                  value = value.slice(0, 3);
                }

                setFormState((prev) => ({
                  ...prev,
                  diasTeste: value,
                }));
              }}
              onBlur={(e) => {
                // Garante que sempre tenha um valor válido ao sair do campo
                const value = e.target.value.replace(/[^\d]/g, "");
                const numValue = parseInt(value) || 0;

                if (numValue < 1) {
                  setFormState((prev) => ({
                    ...prev,
                    diasTeste: "1",
                  }));
                } else if (numValue > 999) {
                  setFormState((prev) => ({
                    ...prev,
                    diasTeste: "999",
                  }));
                } else {
                  setFormState((prev) => ({
                    ...prev,
                    diasTeste: numValue.toString(),
                  }));
                }
              }}
              onKeyDown={(e) => {
                // Previne digitação de caracteres inválidos
                if (
                  !/[0-9]/.test(e.key) &&
                  e.key !== "Backspace" &&
                  e.key !== "Delete" &&
                  e.key !== "ArrowLeft" &&
                  e.key !== "ArrowRight" &&
                  e.key !== "Tab" &&
                  e.key !== "Enter"
                ) {
                  e.preventDefault();
                  return;
                }

                // Bloqueia digitação se já tiver 3 caracteres
                if (/[0-9]/.test(e.key) && formState.diasTeste.length >= 3) {
                  e.preventDefault();
                }
              }}
              disabled={isSaving}
              size="sm"
              fullWidth
              label="Dias para o período de avaliação"
              placeholder="30"
              maxLength={3}
              required
            />
          )}

          {formState.planType !== "TESTE" && (
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
              label="Método de pagamento"
            />
          )}

          {formState.planType !== "TESTE" && (
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
              label="Status do pagamento"
            />
          )}
        </ModalBody>

        <ModalFooter className="pt-4">
          <ButtonCustom
            variant="outline"
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
