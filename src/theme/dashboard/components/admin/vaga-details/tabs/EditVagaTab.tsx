"use client";

import React, { useEffect, useMemo, useState } from "react";
import { ButtonCustom } from "@/components/ui/custom";
import { toastCustom } from "@/components/ui/custom/toast";
import {
  Stepper,
  StepperContent,
  StepperDescription,
  StepperIndicator,
  StepperItem,
  StepperNav,
  StepperPanel,
  StepperTitle,
  StepperTrigger,
  StepperSeparator,
} from "@/components/ui/custom";
import { UnsavedChangesModal } from "@/theme/dashboard/components/admin/lista-vagas/components/modals";
import { updateVaga, type UpdateVagaPayload } from "@/api/vagas";
import { Check, Loader2 } from "lucide-react";
import {
  useEmpresasForSelect,
  useVagaCategorias,
  useEmpresaDetails,
  useUnsavedChanges,
} from "@/theme/dashboard/components/admin/lista-vagas/hooks";
import {
  isErrorResponse,
  slugify,
  parseMultiline,
  toNumericOrString,
  containsProhibitedInfo,
} from "@/theme/dashboard/components/admin/lista-vagas/utils/formUtils";
import {
  SECTION_FIELD_MAP,
  FORM_STEPS,
} from "@/theme/dashboard/components/admin/lista-vagas/constants/formConstants";
import type {
  FormState,
  FormErrors,
} from "@/theme/dashboard/components/admin/lista-vagas/types/formTypes";
import type { SectionKey } from "@/theme/dashboard/components/admin/lista-vagas/types/formTypes";
import {
  BasicInfoStep,
  LocationStep,
  ContentStep,
  CompensationStep,
} from "@/theme/dashboard/components/admin/lista-vagas/components/steps";
import type { VagaDetail } from "@/api/vagas/admin/types";

interface EditVagaTabProps {
  vaga: VagaDetail;
  onSuccess: (updatedVaga: VagaDetail) => void;
  onCancel: () => void;
}

// Função para converter VagaDetail para FormState
function vagaToFormState(vaga: VagaDetail): FormState {
  return {
    usuarioId: vaga.usuarioId || "",
    areaInteresseId: String(vaga.areaInteresseId ?? ""),
    subareaInteresseId: vaga.subareaInteresseId
      ? [String(vaga.subareaInteresseId)]
      : [],
    titulo: vaga.titulo || "",
    descricao: vaga.descricao || "",
    requisitosObrigatorios: (vaga.requisitos?.obrigatorios || []).join("\n"),
    requisitosDesejaveis: (vaga.requisitos?.desejaveis || []).join("\n"),
    atividadesPrincipais: (vaga.atividades?.principais || []).join("\n"),
    atividadesExtras: (vaga.atividades?.extras || []).join("\n"),
    beneficiosLista: (vaga.beneficios?.lista || []).join("\n"),
    beneficiosObservacoes: vaga.beneficios?.observacoes || "",
    observacoes: vaga.observacoes || "",
    modoAnonimo: !!vaga.modoAnonimo,
    paraPcd: !!vaga.paraPcd,
    vagaEmDestaque: false,
    regimeDeTrabalho: vaga.regimeDeTrabalho || "",
    modalidade: vaga.modalidade || "",
    jornada: vaga.jornada || "",
    senioridade: vaga.senioridade || "",
    numeroVagas: String(vaga.numeroVagas ?? ""),
    salarioMin: vaga.salarioMin ?? "",
    salarioMax: vaga.salarioMax ?? "",
    salarioConfidencial: !!vaga.salarioConfidencial,
    maxCandidaturasPorUsuario: String(vaga.maxCandidaturasPorUsuario ?? ""),
    limitarCandidaturas:
      (vaga.maxCandidaturasPorUsuario ?? 0) > 0 ? "SIM" : "NAO",
    inscricoesAte: vaga.inscricoesAte || "",
    localizacao: {
      logradouro: vaga.localizacao?.logradouro || "",
      numero: vaga.localizacao?.numero || "",
      bairro: vaga.localizacao?.bairro || "",
      cidade: vaga.localizacao?.cidade || "",
      estado: vaga.localizacao?.estado || "",
      cep: vaga.localizacao?.cep || "",
      complemento: vaga.localizacao?.complemento || "",
      referencia: vaga.localizacao?.referencia || "",
    },
  };
}

export function EditVagaTab({ vaga, onSuccess, onCancel }: EditVagaTabProps) {
  const [formData, setFormData] = useState<FormState>(() =>
    vagaToFormState(vaga),
  );
  const [errors, setErrors] = useState<FormErrors>({});
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    empresas,
    isLoading: isLoadingEmpresas,
    error: empresasError,
  } = useEmpresasForSelect();

  const {
    categoriaOptions,
    getSubcategoriasOptions,
    isLoading: isLoadingCategorias,
    error: categoriasError,
  } = useVagaCategorias();

  const { empresaDetails } = useEmpresaDetails(formData.usuarioId || null);

  const subcategoriaOptions = useMemo(
    () => getSubcategoriasOptions(formData.areaInteresseId || null),
    [formData.areaInteresseId, getSubcategoriasOptions],
  );

  // Hook para gerenciar mudanças não salvas
  const {
    showExitModal,
    setShowExitModal,
    handleConfirmExit,
    handleCancelExit,
  } = useUnsavedChanges({
    formData,
    initialData: vagaToFormState(vaga),
    isSubmitting,
  });

  useEffect(() => {
    if (formData.subareaInteresseId.length > 0) {
      const validIds = formData.subareaInteresseId.filter((id) =>
        subcategoriaOptions.some((option) => option.value === id),
      );

      if (validIds.length !== formData.subareaInteresseId.length) {
        setFormData((prev) => ({
          ...prev,
          subareaInteresseId: validIds,
        }));
      }
    }
  }, [subcategoriaOptions, formData.subareaInteresseId]);

  const validateSection = (sectionKey: SectionKey): FormErrors => {
    const newErrors: FormErrors = {};
    const fields = SECTION_FIELD_MAP[sectionKey];

    fields.forEach((field) => {
      // Suporte a caminhos aninhados como "localizacao.cidade"
      const segments = field.split(".");
      let value: any = formData as any;
      for (const seg of segments) {
        if (value == null) break;
        value = value[seg];
      }

      switch (field) {
        case "titulo":
          if (!value || (value as string).trim().length === 0) {
            newErrors[field] = "Título é obrigatório";
          } else if ((value as string).trim().length < 5) {
            newErrors[field] = "Título deve ter pelo menos 5 caracteres";
          } else if (containsProhibitedInfo(value as string)) {
            newErrors[field] = "Título contém informações proibidas";
          }
          break;
        case "descricao":
          if (!value || (value as string).trim().length === 0) {
            newErrors[field] = "Descrição é obrigatória";
          } else if ((value as string).trim().length < 20) {
            newErrors[field] = "Descrição deve ter pelo menos 20 caracteres";
          } else if (containsProhibitedInfo(value as string)) {
            newErrors[field] = "Descrição contém informações proibidas";
          }
          break;
        case "areaInteresseId":
          if (!value || (value as string).trim().length === 0) {
            newErrors[field] = "Área de interesse é obrigatória";
          }
          break;
        case "subareaInteresseId":
          if (!value || (value as string[]).length === 0) {
            newErrors[field] = "Pelo menos uma subárea é obrigatória";
          }
          break;
        case "usuarioId":
          if (!value || (value as string).trim().length === 0) {
            newErrors[field] = "Empresa é obrigatória";
          }
          break;
        case "modalidade":
          if (!value || (value as string).trim().length === 0) {
            newErrors[field] = "Modalidade é obrigatória";
          }
          break;
        case "localizacao.cidade":
        case "localizacao.estado":
        case "localizacao.logradouro":
        case "localizacao.numero":
        case "localizacao.bairro":
        case "localizacao.cep":
          if (!value || (value as string).trim().length === 0) {
            newErrors[field] = "Campo obrigatório";
          }
          break;
        case "salarioMin":
          if (value && !toNumericOrString(value as string)) {
            newErrors[field] = "Salário mínimo deve ser um valor válido";
          }
          break;
        case "salarioMax":
          if (value && !toNumericOrString(value as string)) {
            newErrors[field] = "Salário máximo deve ser um valor válido";
          }
          break;
        case "numeroVagas":
          const numVagas = Number(value);
          if (!numVagas || numVagas < 1) {
            newErrors[field] = "Número de vagas deve ser pelo menos 1";
          }
          break;
      }
    });

    return newErrors;
  };

  const validateSections = (section: SectionKey | "all"): boolean => {
    const newErrors: FormErrors = {};

    if (section === "all") {
      FORM_STEPS.forEach((step) => {
        const sectionErrors = validateSection(step.id as SectionKey);
        Object.assign(newErrors, sectionErrors);
      });
    } else {
      Object.assign(newErrors, validateSection(section));
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    const section = FORM_STEPS[currentStep].id as SectionKey;
    if (!validateSections(section)) {
      return;
    }
    setCurrentStep((prev) => Math.min(prev + 1, FORM_STEPS.length - 1));
  };

  const handlePreviousStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (isSubmitting) return;

    if (!validateSections("all")) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const payload: UpdateVagaPayload = {
        // básicos
        usuarioId: formData.usuarioId || undefined,
        titulo: formData.titulo.trim(),
        descricao: formData.descricao.trim(),
        observacoes: formData.observacoes.trim() || undefined,
        // taxonomias
        areaInteresseId: formData.areaInteresseId
          ? Number(formData.areaInteresseId)
          : undefined,
        subareaInteresseId:
          formData.subareaInteresseId && formData.subareaInteresseId.length > 0
            ? Number(formData.subareaInteresseId[0])
            : undefined,
        // enums
        modalidade: formData.modalidade as any,
        regimeDeTrabalho: formData.regimeDeTrabalho as any,
        jornada: formData.jornada as any,
        senioridade: formData.senioridade as any,
        // localização
        localizacao: {
          logradouro: formData.localizacao.logradouro.trim(),
          numero: formData.localizacao.numero.trim(),
          bairro: formData.localizacao.bairro.trim(),
          cidade: formData.localizacao.cidade.trim(),
          estado: formData.localizacao.estado.trim(),
          cep: formData.localizacao.cep.trim(),
          complemento: formData.localizacao.complemento.trim(),
          referencia: formData.localizacao.referencia.trim(),
        },
        // remuneração e extras
        salarioMin: formData.salarioMin
          ? (toNumericOrString(formData.salarioMin) as number)
          : undefined,
        salarioMax: formData.salarioMax
          ? (toNumericOrString(formData.salarioMax) as number)
          : undefined,
        salarioConfidencial: formData.salarioConfidencial,
        numeroVagas: Number(formData.numeroVagas),
        beneficios: {
          lista: parseMultiline(formData.beneficiosLista),
          observacoes: formData.beneficiosObservacoes?.trim() || undefined,
        },
        requisitos: {
          obrigatorios: parseMultiline(formData.requisitosObrigatorios),
          desejaveis: parseMultiline(formData.requisitosDesejaveis),
        },
        atividades: {
          principais: parseMultiline(formData.atividadesPrincipais),
          extras: parseMultiline(formData.atividadesExtras),
        },
        paraPcd: formData.paraPcd,
        inscricoesAte: formData.inscricoesAte || undefined,
        vagaEmDestaque: formData.vagaEmDestaque,
        modoAnonimo: formData.modoAnonimo,
        maxCandidaturasPorUsuario:
          formData.limitarCandidaturas === "SIM"
            ? Number(formData.maxCandidaturasPorUsuario || 0)
            : undefined,
      };

      const response = await updateVaga(vaga.id, payload);

      if (isErrorResponse(response)) {
        toastCustom.error({
          title: "Erro ao atualizar vaga",
          description: response.error || "Ocorreu um erro inesperado.",
        });
        return;
      }

      const updatedVaga =
        typeof response === "object" && response !== null && "data" in response
          ? (response.data as VagaDetail)
          : (response as VagaDetail);

      toastCustom.success({
        title: "Vaga atualizada com sucesso!",
        description: "As informações da vaga foram atualizadas.",
      });

      onSuccess(updatedVaga);
    } catch (error) {
      console.error("Erro ao atualizar vaga:", error);
      toastCustom.error({
        title: "Erro ao atualizar vaga",
        description: "Ocorreu um erro inesperado. Tente novamente.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof FormState, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Limpar erro do campo quando o usuário começar a digitar
    if (errors[field as string]) {
      setErrors((prev) => {
        const { [field as string]: _omit, ...rest } = prev as Record<
          string,
          string
        >;
        return rest as FormErrors;
      });
    }
  };

  const handleLocalizacaoChange = (
    field: keyof FormState["localizacao"],
    value: string,
  ) => {
    setFormData((prev) => ({
      ...prev,
      localizacao: { ...prev.localizacao, [field]: value },
    }));
    const key = `localizacao.${String(field)}`;
    if (errors[key]) {
      setErrors((prev) => {
        const { [key]: _omit, ...rest } = prev as Record<string, string>;
        return rest as FormErrors;
      });
    }
  };

  if (isLoadingEmpresas || isLoadingCategorias) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (empresasError || categoriasError) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">
          Erro ao carregar dados: {empresasError || categoriasError}
        </p>
      </div>
    );
  }

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === FORM_STEPS.length - 1;

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* Container para navegação dos steps */}
      <div className="bg-white rounded-3xl p-4 flex-shrink-0">
        <Stepper
          value={currentStep + 1}
          onValueChange={() => {}} // Desabilita mudança de step via clique
          variant="minimal"
          indicators={{
            completed: <Check className="h-3 w-3 text-white" />,
            loading: <Loader2 className="h-3 w-3 animate-spin text-blue-600" />,
          }}
          className="space-y-8"
        >
          <StepperNav className="items-center gap-2 md:gap-3">
            {FORM_STEPS.map((step, index) => (
              <StepperItem
                key={step.id}
                step={index + 1}
                isLast={index === FORM_STEPS.length - 1}
                disabled={true} // Desabilita interação
                className={`flex-1 ${
                  index === currentStep || index < currentStep
                    ? "opacity-100"
                    : "opacity-50"
                }`}
              >
                <StepperTrigger
                  className="flex items-center gap-2 text-left rounded-md cursor-default"
                  disabled={true}
                >
                  <StepperIndicator>
                    {index < currentStep ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </StepperIndicator>
                  <div className="flex flex-col max-w-[280px] md:max-w-[320px]">
                    <StepperTitle className="!mb-0">{step.title}</StepperTitle>
                    <StepperDescription className="!mt-0">
                      {step.description}
                    </StepperDescription>
                  </div>
                </StepperTrigger>
                <StepperSeparator hidden={index === FORM_STEPS.length - 1} />
              </StepperItem>
            ))}
          </StepperNav>
        </Stepper>
      </div>

      {/* Container para o formulário */}
      <div className="bg-white rounded-3xl p-7 flex flex-col flex-1 min-h-0">
        {/* Form */}
        <Stepper
          value={currentStep + 1}
          onValueChange={() => {}}
          variant="minimal"
          indicators={{
            completed: <Check className="h-3 w-3 text-white" />,
            loading: <Loader2 className="h-3 w-3 animate-spin text-blue-600" />,
          }}
          className="space-y-8 flex-1 flex flex-col"
        >
          <form onSubmit={handleSubmit} className="flex flex-col gap-10 flex-1">
            <StepperPanel className="space-y-6 flex-1">
              <StepperContent value={1} className="space-y-8">
                <BasicInfoStep
                  formData={formData}
                  errors={errors}
                  isSubmitting={isSubmitting}
                  isLoadingEmpresas={isLoadingEmpresas}
                  isLoadingCategorias={isLoadingCategorias}
                  empresasError={empresasError || undefined}
                  categoriasError={categoriasError || undefined}
                  empresas={empresas}
                  categoriaOptions={categoriaOptions}
                  subcategoriaOptions={subcategoriaOptions}
                  onFieldChange={handleChange}
                />
              </StepperContent>

              <StepperContent value={2} className="space-y-8">
                <LocationStep
                  formData={formData}
                  errors={errors}
                  isSubmitting={isSubmitting}
                  onLocalizacaoChange={handleLocalizacaoChange}
                />
              </StepperContent>

              <StepperContent value={3} className="space-y-8">
                <ContentStep
                  formData={formData}
                  errors={errors}
                  isSubmitting={isSubmitting}
                  onFieldChange={(field, value) =>
                    handleChange(field as keyof FormState, value)
                  }
                />
              </StepperContent>

              <StepperContent value={4} className="space-y-8">
                <CompensationStep
                  formData={formData}
                  errors={errors}
                  isSubmitting={isSubmitting}
                  onFieldChange={(field, value) =>
                    handleChange(field as keyof FormState, value)
                  }
                />
              </StepperContent>
            </StepperPanel>

            <footer className="flex flex-wrap items-center justify-end gap-3 border-t border-border pt-6 flex-shrink-0">
              <div className="flex items-center gap-3">
                {isFirstStep && (
                  <ButtonCustom
                    type="button"
                    variant="outline"
                    size="md"
                    onClick={onCancel}
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </ButtonCustom>
                )}

                {!isFirstStep && (
                  <ButtonCustom
                    type="button"
                    variant="outline"
                    size="md"
                    onClick={handlePreviousStep}
                    disabled={isSubmitting}
                  >
                    Voltar
                  </ButtonCustom>
                )}

                {!isLastStep && (
                  <ButtonCustom
                    type="button"
                    variant="primary"
                    size="md"
                    onClick={handleNextStep}
                    disabled={isSubmitting}
                    withAnimation
                  >
                    Avançar
                  </ButtonCustom>
                )}

                {isLastStep && (
                  <ButtonCustom
                    type="submit"
                    variant="primary"
                    size="md"
                    isLoading={isSubmitting}
                    disabled={isSubmitting}
                    withAnimation
                  >
                    {isSubmitting ? "Salvando..." : "Salvar alterações"}
                  </ButtonCustom>
                )}
              </div>
            </footer>
          </form>
        </Stepper>
      </div>

      {/* Modal de confirmação para sair */}
      <UnsavedChangesModal
        isOpen={showExitModal}
        onOpenChange={setShowExitModal}
        onConfirm={handleConfirmExit}
        onCancel={handleCancelExit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
