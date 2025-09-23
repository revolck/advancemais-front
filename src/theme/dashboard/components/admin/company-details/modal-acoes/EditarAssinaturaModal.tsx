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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateAdminCompany, listPlanosEmpresariais } from "@/api/empresas";
import type {
  AdminCompanyDetail,
  AdminCompanyPlanSummary,
  AdminCompanyPlanType,
  AdminCompanyPaymentInfo,
  UpdateAdminCompanyPayload,
} from "@/api/empresas/admin/types";
import type { PlanoEmpresarialBackendResponse } from "@/api/empresas/planos-empresariais/types";

const PLAN_TYPE_OPTIONS: { value: AdminCompanyPlanType; label: string }[] = [
  { value: "parceiro", label: "Parceiro" },
  { value: "7_dias", label: "Teste 7 dias" },
  { value: "15_dias", label: "Teste 15 dias" },
  { value: "30_dias", label: "Teste 30 dias" },
  { value: "60_dias", label: "Plano 60 dias" },
  { value: "90_dias", label: "Plano 90 dias" },
  { value: "120_dias", label: "Plano 120 dias" },
];

interface EditarAssinaturaModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  company: AdminCompanyDetail;
  onSubscriptionUpdated: (
    plan: AdminCompanyPlanSummary,
    payment: AdminCompanyPaymentInfo,
  ) => void;
}

type SubscriptionFormState = {
  planId: string;
  planType: AdminCompanyPlanType;
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
      planType: company.plano?.tipo ?? "parceiro",
      modeloPagamento:
        company.plano?.modeloPagamento ?? company.pagamento?.modelo ?? "",
      metodoPagamento:
        company.plano?.metodoPagamento ?? company.pagamento?.metodo ?? "",
      statusPagamento:
        company.plano?.statusPagamento ?? company.pagamento?.status ?? "",
    }),
    [company]
  );

  const [formState, setFormState] = useState<SubscriptionFormState>(initialState);
  const [planOptions, setPlanOptions] = useState<PlanoEmpresarialBackendResponse[]>([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormState(initialState);
      setIsSaving(false);

      if (planOptions.length === 0) {
        setIsLoadingPlans(true);
        listPlanosEmpresariais()
          .then(setPlanOptions)
          .catch((error) => {
            console.error("Erro ao carregar planos empresariais", error);
            toastCustom.error({
              title: "Erro ao carregar planos",
              description: "Não foi possível listar os planos disponíveis agora.",
            });
          })
          .finally(() => setIsLoadingPlans(false));
      }
    }
  }, [initialState, isOpen, planOptions.length]);

  const handleClose = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  const handleSelectPlan = useCallback((value: string) => {
    setFormState((prev) => ({ ...prev, planId: value }));
  }, []);

  const handleSelectPlanType = useCallback((value: string) => {
    setFormState((prev) => ({
      ...prev,
      planType: value as AdminCompanyPlanType,
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

  const hasSelectedPlanInOptions = useMemo(
    () =>
      formState.planId
        ? planOptions.some((plan) => plan.id === formState.planId)
        : true,
    [formState.planId, planOptions]
  );

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
        planoEmpresarialId: formState.planId,
        tipo: formState.planType,
        modeloPagamento: sanitize(formState.modeloPagamento),
        metodoPagamento: sanitize(formState.metodoPagamento),
        statusPagamento: sanitize(formState.statusPagamento)?.toUpperCase() ?? null,
      },
    };

    setIsSaving(true);

    try {
      await updateAdminCompany(company.id, payload);

      const selectedPlan = planOptions.find((plan) => plan.id === formState.planId);

      const nextPlan: AdminCompanyPlanSummary = {
        id: formState.planId,
        nome: selectedPlan?.nome ?? company.plano?.nome ?? "Plano empresarial",
        tipo: formState.planType,
        inicio: company.plano?.inicio ?? null,
        fim: company.plano?.fim ?? null,
        modeloPagamento: payload.plano?.modeloPagamento ?? null,
        metodoPagamento: payload.plano?.metodoPagamento ?? null,
        statusPagamento: payload.plano?.statusPagamento ?? null,
        quantidadeVagas:
          selectedPlan?.quantidadeVagas ?? company.plano?.quantidadeVagas ?? 0,
        valor: selectedPlan?.valor ?? company.plano?.valor ?? null,
        duracaoEmDias: company.plano?.duracaoEmDias ?? null,
        diasRestantes: company.plano?.diasRestantes ?? null,
        vagasPublicadas: company.plano?.vagasPublicadas ?? null,
      };

      const nextPayment: AdminCompanyPaymentInfo = {
        metodo: payload.plano?.metodoPagamento ?? null,
        status: payload.plano?.statusPagamento ?? null,
        modelo: payload.plano?.modeloPagamento ?? null,
        ultimoPagamentoEm: company.pagamento?.ultimoPagamentoEm ?? null,
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
          <ModalDescription>
            Selecione o plano ativo e ajuste os dados de pagamento associados à assinatura da empresa.
          </ModalDescription>
        </ModalHeader>

        <ModalBody className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Plano empresarial</label>
            <Select
              value={formState.planId}
              onValueChange={handleSelectPlan}
              disabled={isSaving || isLoadingPlans}
            >
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Selecione um plano" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Sem assinatura</SelectItem>
                {planOptions.map((plan) => (
                  <SelectItem key={plan.id} value={plan.id}>
                    {plan.nome}
                  </SelectItem>
                ))}
                {!hasSelectedPlanInOptions && formState.planId && (
                  <SelectItem value={formState.planId}>
                    {company.plano?.nome ?? "Plano atual"}
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Tipo de plano</label>
            <Select
              value={formState.planType}
              onValueChange={handleSelectPlanType}
              disabled={isSaving}
            >
              <SelectTrigger className="h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PLAN_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <InputCustom
              label="Modelo de pagamento"
              value={formState.modeloPagamento}
              onChange={handleInputChange("modeloPagamento")}
              disabled={isSaving}
              placeholder="Recorrente, pontual..."
            />
            <InputCustom
              label="Método de pagamento"
              value={formState.metodoPagamento}
              onChange={handleInputChange("metodoPagamento")}
              disabled={isSaving}
              placeholder="Pix, boleto..."
            />
          </div>

          <InputCustom
            label="Status do pagamento"
            value={formState.statusPagamento}
            onChange={handleInputChange("statusPagamento")}
            disabled={isSaving}
            placeholder="APROVADO, PENDENTE..."
          />
        </ModalBody>

        <ModalFooter className="pt-4">
          <ButtonCustom
            variant="ghost"
            onClick={handleClose}
            disabled={isSaving}
          >
            Cancelar
          </ButtonCustom>
          <ButtonCustom
            variant="primary"
            onClick={handleSave}
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
