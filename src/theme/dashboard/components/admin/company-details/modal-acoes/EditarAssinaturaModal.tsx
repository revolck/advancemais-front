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

  const handleInputChange = useCallback(
    (field: keyof Omit<SubscriptionFormState, "planId" | "planType">) =>
      (event: ChangeEvent<HTMLInputElement>) => {
        setFormState((prev) => ({
          ...prev,
          [field]: event.target.value,
        }));
      },
    []
  );

  const planSelectOptions = useMemo(() => {
    const options = [
      { value: "", label: "Sem assinatura" },
      ...planOptions.map((plan) => ({
        value: plan.id,
        label: plan.nome,
      })),
    ];

    // Adicionar o plano atual se não estiver na lista
    if (
      formState.planId &&
      !planOptions.some((plan) => plan.id === formState.planId)
    ) {
      options.push({
        value: formState.planId,
        label: company.plano?.nome ?? "Plano atual",
      });
    }

    return options;
  }, [planOptions, formState.planId, company.plano?.nome]);

  const handleSave = useCallback(async () => {
    if (isSaving) return;

    if (!formState.planId) {
      toastCustom.error({
        title: "Selecione um plano",
        description: "Escolha uma assinatura para continuar.",
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
    };

    setIsSaving(true);

    try {
      await updateAdminCompany(company.id, payload);

      const selectedPlan = planOptions.find(
        (plan) => plan.id === formState.planId
      );

      const nextPlan: AdminCompanyPlano = {
        id: formState.planId,
        nome: selectedPlan?.nome ?? company.plano?.nome ?? "Plano empresarial",
        modo: formState.planType,
        status: "ATIVO",
        inicio: company.plano?.inicio ?? null,
        fim: company.plano?.fim ?? null,
        modeloPagamento: "ASSINATURA",
        metodoPagamento: "PIX",
        statusPagamento: "APROVADO",
        quantidadeVagas:
          selectedPlan?.quantidadeVagas ?? company.plano?.quantidadeVagas ?? 0,
        valor: selectedPlan?.valor ?? company.plano?.valor ?? null,
        duracaoEmDias: company.plano?.duracaoEmDias ?? null,
        diasRestantes: company.plano?.diasRestantes ?? null,
      };

      const nextPayment: AdminCompanyPagamento = {
        metodo: "PIX",
        status: "APROVADO",
        modelo: "ASSINATURA",
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

        <ModalBody className="space-y-6">
          <div className="space-y-3">
            <label className="text-sm font-semibold text-foreground">
              Plano empresarial
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
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-semibold text-foreground">
              Tipo de plano
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
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <InputCustom
              label="Modelo de pagamento"
              value={formState.modeloPagamento}
              onChange={handleInputChange("modeloPagamento")}
              disabled={isSaving}
              placeholder="Recorrente, pontual..."
              size="sm"
            />
            <InputCustom
              label="Método de pagamento"
              value={formState.metodoPagamento}
              onChange={handleInputChange("metodoPagamento")}
              disabled={isSaving}
              placeholder="Pix, boleto..."
              size="sm"
            />
          </div>

          <InputCustom
            label="Status do pagamento"
            value={formState.statusPagamento}
            onChange={handleInputChange("statusPagamento")}
            disabled={isSaving}
            placeholder="APROVADO, PENDENTE..."
            size="sm"
          />
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
