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
import { UnsavedChangesModal } from "./modals";
import { createVaga, type CreateVagaPayload } from "@/api/vagas";
import { Check, Loader2, Briefcase } from "lucide-react";
import { FormLoadingModal } from "@/components/ui/custom/form-loading-modal";
import {
  useEmpresasForSelect,
  useVagaCategorias,
  useEmpresaDetails,
  useUnsavedChanges,
  getInitialFormState,
} from "../hooks";
import { useUserRole } from "@/hooks/useUserRole";
import { useTenantCompany } from "@/hooks/useTenantCompany";
import { UserRole } from "@/config/roles";
import {
  isErrorResponse,
  slugify,
  parseMultiline,
  containsProhibitedInfo,
} from "../utils/formUtils";
import { SECTION_FIELD_MAP, FORM_STEPS } from "../constants/formConstants";
import type {
  CreateVagaFormProps,
  FormState,
  FormErrors,
} from "../types/formTypes";
import type { SectionKey } from "../types/formTypes";
import {
  BasicInfoStep,
  LocationStep,
  ContentStep,
  CompensationStep,
} from "./steps";

export function CreateVagaForm({
  onSuccess,
  isSubmitting,
  setIsSubmitting,
}: CreateVagaFormProps) {
  const [formData, setFormData] = useState<FormState>(getInitialFormState);
  const [errors, setErrors] = useState<FormErrors>({});
  const [currentStep, setCurrentStep] = useState(0);
  const [loadingStep, setLoadingStep] = useState<string>("");

  // Verificar role do usuário
  const role = useUserRole();
  const isEmpresaRole = role === UserRole.EMPRESA;
  
  // Buscar dados da empresa logada (apenas para role EMPRESA)
  const { company: empresaLogada } = useTenantCompany(isEmpresaRole);

  // Só buscar lista de empresas se NÃO for role EMPRESA
  const {
    empresas,
    isLoading: isLoadingEmpresas,
    error: empresasError,
  } = useEmpresasForSelect(!isEmpresaRole);

  const {
    categoriaOptions,
    getSubcategoriasOptions,
    isLoading: isLoadingCategorias,
    error: categoriasError,
  } = useVagaCategorias();

  // Para role EMPRESA, usar dados diretos do useTenantCompany
  // Para outras roles, buscar detalhes quando selecionarem uma empresa
  const { empresaDetails: empresaDetailsFetched } = useEmpresaDetails(
    !isEmpresaRole && formData.usuarioId ? formData.usuarioId : null
  );
  
  // Unificar fonte de dados: EMPRESA usa empresaLogada, outras roles usam empresaDetailsFetched
  const empresaDetails = isEmpresaRole ? empresaLogada : empresaDetailsFetched;
  
  // Atualizar formData com o ID da empresa quando for role EMPRESA
  useEffect(() => {
    if (isEmpresaRole && empresaLogada?.id && !formData.usuarioId) {
      setFormData((prev) => ({
        ...prev,
        usuarioId: empresaLogada.id,
      }));
    }
  }, [isEmpresaRole, empresaLogada?.id, formData.usuarioId]);

  const subcategoriaOptions = useMemo(
    () => getSubcategoriasOptions(formData.areaInteresseId || null),
    [formData.areaInteresseId, getSubcategoriasOptions]
  );

  // Hook para gerenciar mudanças não salvas
  const {
    showExitModal,
    setShowExitModal,
    handleConfirmExit,
    handleCancelExit,
  } = useUnsavedChanges({
    formData,
    initialData: getInitialFormState(),
    isSubmitting,
  });

  useEffect(() => {
    if (formData.subareaInteresseId.length > 0) {
      const validIds = formData.subareaInteresseId.filter((id) =>
        subcategoriaOptions.some((option) => option.value === id)
      );

      if (validIds.length !== formData.subareaInteresseId.length) {
        setFormData((prev) => ({
          ...prev,
          subareaInteresseId: validIds,
        }));
      }
    }
  }, [formData.subareaInteresseId, subcategoriaOptions]);

  // Preenche dados de localização quando empresa é selecionada
  useEffect(() => {
    if (empresaDetails) {
      // Usa o primeiro endereço da empresa se existir
      const primeiroEndereco = empresaDetails.enderecos?.[0];

      if (primeiroEndereco) {
        setFormData((prev) => ({
          ...prev,
          localizacao: {
            ...prev.localizacao,
            logradouro: primeiroEndereco.logradouro || "",
            numero: primeiroEndereco.numero || "",
            bairro: primeiroEndereco.bairro || "",
            cidade: primeiroEndereco.cidade || "",
            estado: primeiroEndereco.estado || "",
            cep: primeiroEndereco.cep || "",
          },
        }));
      } else {
        // Se não tem endereço específico, usa cidade e estado da empresa
        setFormData((prev) => ({
          ...prev,
          localizacao: {
            ...prev.localizacao,
            cidade: empresaDetails.cidade || "",
            estado: empresaDetails.estado || "",
          },
        }));
      }
    }
  }, [empresaDetails]);

  const handleChange = (field: keyof FormState, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => {
        const clone = { ...prev };
        delete clone[field];
        return clone;
      });
    }
  };

  const handleLocalizacaoChange = (
    field: keyof FormState["localizacao"],
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      localizacao: {
        ...prev.localizacao,
        [field]: value,
      },
    }));

    const errorKey = `localizacao.${field}`;
    if (errors[errorKey]) {
      setErrors((prev) => {
        const clone = { ...prev };
        delete clone[errorKey];
        return clone;
      });
    }
  };

  // Atualiza múltiplos campos de localização de uma vez (usado na busca de CEP)
  const handleLocalizacaoBatchChange = (
    updates: Partial<FormState["localizacao"]>
  ) => {
    setFormData((prev) => ({
      ...prev,
      localizacao: {
        ...prev.localizacao,
        ...updates,
      },
    }));

    // Limpa erros dos campos atualizados
    const errorKeys = Object.keys(updates).map((key) => `localizacao.${key}`);
    setErrors((prev) => {
      const clone = { ...prev };
      errorKeys.forEach((key) => delete clone[key]);
      return clone;
    });
  };

  const validateSections = (
    scope: SectionKey | "all" = "all",
    { showToast = true }: { showToast?: boolean } = {}
  ): boolean => {
    const sectionsToValidate: SectionKey[] =
      scope === "all"
        ? (Object.keys(SECTION_FIELD_MAP) as SectionKey[])
        : [scope];

    const sectionErrors: FormErrors = {};

    sectionsToValidate.forEach((section) => {
      if (section === "core") {
        if (!formData.usuarioId) {
          sectionErrors.usuarioId = "Selecione a empresa responsável";
        }
        if (!formData.titulo.trim()) {
          sectionErrors.titulo = "Título é obrigatório";
        }
        if (!formData.modalidade) {
          sectionErrors.modalidade = "Selecione a modalidade";
        }
        if (!formData.regimeDeTrabalho) {
          sectionErrors.regimeDeTrabalho = "Selecione o regime de trabalho";
        }
        if (!formData.jornada) {
          sectionErrors.jornada = "Selecione a jornada";
        }
        // Senioridade é opcional, não valida
        if (!formData.areaInteresseId) {
          sectionErrors.areaInteresseId = "Selecione a categoria";
        }
        // Subcategoria é opcional, não valida
        const numeroVagasValor = Number(formData.numeroVagas);
        if (
          Number.isNaN(numeroVagasValor) ||
          numeroVagasValor < 1 ||
          numeroVagasValor > 9999
        ) {
          sectionErrors.numeroVagas = "Número de vagas deve ser entre 1 e 9999";
        }
        if (!formData.inscricoesAte) {
          sectionErrors.inscricoesAte = "Informe a data limite de inscrições";
        }
        if (formData.limitarCandidaturas === "SIM") {
          const maxCands = Number(formData.maxCandidaturasPorUsuario);
          if (Number.isNaN(maxCands) || maxCands < 1 || maxCands > 9999) {
            sectionErrors.maxCandidaturasPorUsuario =
              "Quantidade deve ser entre 1 e 9999";
          }
        }
      }

      if (section === "location") {
        const { localizacao } = formData;
        if (!localizacao.logradouro.trim())
          sectionErrors["localizacao.logradouro"] = "Logradouro é obrigatório";
        if (!localizacao.numero.trim())
          sectionErrors["localizacao.numero"] = "Número é obrigatório";
        if (!localizacao.bairro.trim())
          sectionErrors["localizacao.bairro"] = "Bairro é obrigatório";
        if (!localizacao.cidade.trim())
          sectionErrors["localizacao.cidade"] = "Cidade é obrigatória";
        if (!localizacao.estado.trim())
          sectionErrors["localizacao.estado"] = "Estado é obrigatório";
        if (!localizacao.cep.trim())
          sectionErrors["localizacao.cep"] = "CEP é obrigatório";
      }

      if (section === "content") {
        // Validação de descrição (obrigatória)
        if (!formData.descricao.trim()) {
          sectionErrors.descricao = "Informe a descrição da vaga";
        } else if (containsProhibitedInfo(formData.descricao)) {
          sectionErrors.descricao =
            "Remova links, e-mails ou telefones do texto.";
        }

        // Validação de requisitos obrigatórios (pelo menos 1)
        const requisitosObrigatorios = parseMultiline(
          formData.requisitosObrigatorios
        );
        if (requisitosObrigatorios.length === 0) {
          sectionErrors.requisitosObrigatorios =
            "Informe pelo menos um requisito obrigatório";
        } else if (containsProhibitedInfo(formData.requisitosObrigatorios)) {
          sectionErrors.requisitosObrigatorios =
            "Remova links, e-mails ou telefones do texto.";
        }

        // Validação de atividades principais (pelo menos 1)
        const atividadesPrincipais = parseMultiline(
          formData.atividadesPrincipais
        );
        if (atividadesPrincipais.length === 0) {
          sectionErrors.atividadesPrincipais =
            "Informe pelo menos uma atividade principal";
        } else if (containsProhibitedInfo(formData.atividadesPrincipais)) {
          sectionErrors.atividadesPrincipais =
            "Remova links, e-mails ou telefones do texto.";
        }

        // Validação de benefícios (opcional, apenas verifica info proibida)
        if (
          formData.beneficiosLista &&
          containsProhibitedInfo(formData.beneficiosLista)
        ) {
          sectionErrors.beneficiosLista =
            "Remova links, e-mails ou telefones do texto.";
        }

        // Validação de campos opcionais (apenas proibição de info sensível)
        const optionalTextFields = [
          { key: "atividadesExtras", label: "atividades extras" },
          { key: "requisitosDesejaveis", label: "requisitos desejáveis" },
          { key: "beneficiosObservacoes", label: "observações de benefícios" },
          { key: "observacoes", label: "observações gerais" },
        ];

        optionalTextFields.forEach(({ key }) => {
          const raw = (formData as unknown as Record<string, unknown>)[key];
          const value = typeof raw === "string" ? raw : String(raw ?? "");
          if (value && containsProhibitedInfo(value)) {
            sectionErrors[key] =
              "Remova links, e-mails ou telefones do texto.";
          }
        });
      }

      if (section === "compensation") {
        // Se salário NÃO é confidencial, salário mínimo é obrigatório
        if (!formData.salarioConfidencial) {
          if (!formData.salarioMin || formData.salarioMin.trim() === "") {
            sectionErrors.salarioMin =
              "Salário mínimo é obrigatório quando não confidencial";
          }
        }

        const salarioMin = formData.salarioMin
          ? Number(formData.salarioMin.replace(",", "."))
          : null;
        const salarioMax = formData.salarioMax
          ? Number(formData.salarioMax.replace(",", "."))
          : null;
        if (
          salarioMin !== null &&
          salarioMax !== null &&
          salarioMin > salarioMax
        ) {
          sectionErrors.salarioMax =
            "Salário máximo deve ser maior que o mínimo";
        }
      }
    });

    setErrors((prev) => {
      const updated = { ...prev };
      const keysToClear = sectionsToValidate.flatMap(
        (section) => SECTION_FIELD_MAP[section]
      );
      keysToClear.forEach((key) => delete updated[key]);
      return { ...updated, ...sectionErrors };
    });

    if (Object.keys(sectionErrors).length > 0) {
      if (showToast) {
        toastCustom.error(
          "Por favor, corrija os campos destacados antes de continuar."
        );
      }
      return false;
    }

    return true;
  };

  const buildPayload = (): CreateVagaPayload => {
    const salarioMin = formData.salarioMin.trim();
    const salarioMax = formData.salarioMax.trim();
    const maxCandidaturas = formData.maxCandidaturasPorUsuario.trim();

    // categoriaVagaId é o UUID da categoria
    const categoriaVagaValue = formData.areaInteresseId;
    // subcategoriaVagaId é opcional - só envia se tiver valor
    const subcategoriaVagaFinal =
      formData.subareaInteresseId.length > 0
        ? formData.subareaInteresseId[0]
        : undefined;

    const maxCandidaturasNumber = Number(maxCandidaturas);
    const maxCandidaturasValue =
      formData.limitarCandidaturas === "SIM"
        ? maxCandidaturas && !Number.isNaN(maxCandidaturasNumber)
          ? Math.min(9999, Math.max(1, maxCandidaturasNumber))
          : null
        : null;

    const numeroVagasNumber = Number(formData.numeroVagas);
    const numeroVagasValue = Number.isNaN(numeroVagasNumber)
      ? 1
      : Math.min(9999, Math.max(1, numeroVagasNumber));

    const payload: CreateVagaPayload = {
      usuarioId: formData.usuarioId,
      categoriaVagaId: categoriaVagaValue,
      subcategoriaVagaId: subcategoriaVagaFinal,
      slug: slugify(formData.titulo).trim(),
      modoAnonimo: formData.modoAnonimo,
      regimeDeTrabalho:
        formData.regimeDeTrabalho as CreateVagaPayload["regimeDeTrabalho"],
      modalidade: formData.modalidade as CreateVagaPayload["modalidade"],
      titulo: formData.titulo.trim(),
      paraPcd: formData.paraPcd,
      vagaEmDestaque: formData.vagaEmDestaque,
      numeroVagas: numeroVagasValue,
      descricao: formData.descricao.trim(),
      requisitos: {
        obrigatorios: parseMultiline(formData.requisitosObrigatorios),
        desejaveis: parseMultiline(formData.requisitosDesejaveis),
      },
      atividades: {
        principais: parseMultiline(formData.atividadesPrincipais),
        extras: parseMultiline(formData.atividadesExtras),
      },
      beneficios: {
        lista: parseMultiline(formData.beneficiosLista),
        observacoes: formData.beneficiosObservacoes.trim() || undefined,
      },
      observacoes: formData.observacoes.trim() || undefined,
      jornada: formData.jornada as CreateVagaPayload["jornada"],
      // senioridade é opcional - só envia se tiver valor
      senioridade: formData.senioridade
        ? (formData.senioridade as CreateVagaPayload["senioridade"])
        : undefined,
      localizacao: {
        logradouro: formData.localizacao.logradouro.trim(),
        numero: formData.localizacao.numero.trim(),
        bairro: formData.localizacao.bairro.trim(),
        cidade: formData.localizacao.cidade.trim(),
        estado: formData.localizacao.estado.trim(),
        cep: formData.localizacao.cep.trim(),
        complemento: formData.localizacao.complemento.trim() || undefined,
        referencia: formData.localizacao.referencia.trim() || undefined,
      },
      inscricoesAte: formData.inscricoesAte
        ? new Date(formData.inscricoesAte).toISOString()
        : undefined,
      inseridaEm: new Date().toISOString(),
      salarioMin: salarioMin ? salarioMin.replace(",", ".") : undefined,
      salarioMax: salarioMax ? salarioMax.replace(",", ".") : undefined,
      salarioConfidencial: formData.salarioConfidencial,
      maxCandidaturasPorUsuario: maxCandidaturasValue,
    };

    return payload;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (isSubmitting) return;

    if (!validateSections("all")) {
      return;
    }

    setIsSubmitting(true);
    setLoadingStep("Criando vaga...");

    try {
      const payload = buildPayload();
      setLoadingStep("Salvando vaga...");
      const response = await createVaga(payload);

      if (isErrorResponse(response)) {
        const apiErrors = "issues" in response ? response.issues ?? {} : {};

        if (Object.keys(apiErrors).length > 0) {
          setErrors((prev) => {
            const merged = { ...prev };
            Object.entries(apiErrors).forEach(([key, value]) => {
              if (Array.isArray(value) && value.length > 0) {
                merged[key] = value[0];
              }
            });
            return merged;
          });
        }

        toastCustom.error(response.message || "Não foi possível criar a vaga.");
        return;
      }

      setLoadingStep("Finalizando...");
      toastCustom.success("Vaga criada com sucesso!");
      onSuccess();

      setFormData(getInitialFormState());
      setErrors({});
      setCurrentStep(0);
    } catch (error) {
      console.error("Erro ao criar vaga:", error);
      toastCustom.error("Erro inesperado ao criar a vaga. Tente novamente.");
    } finally {
      setIsSubmitting(false);
      setLoadingStep("");
    }
  };

  const handleNextStep = () => {
    const section = FORM_STEPS[currentStep].id;
    if (!validateSections(section)) {
      return;
    }
    setCurrentStep((prev) => Math.min(prev + 1, FORM_STEPS.length - 1));
  };

  const handlePreviousStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === FORM_STEPS.length - 1;

  return (
    <div className="space-y-6 relative">
      <FormLoadingModal
        isLoading={isSubmitting}
        title="Criando vaga..."
        loadingStep={loadingStep}
        icon={Briefcase}
      />
      {/* Container para navegação dos steps */}
      <div className="bg-white rounded-3xl p-4 h-full flex flex-col">
        <div className="flex-1 min-h-0">
          <Stepper
            value={currentStep + 1}
            onValueChange={() => {}} // Desabilita mudança de step via clique
            variant="minimal"
            indicators={{
              completed: <Check className="h-3 w-3 text-white" />,
              loading: (
                <Loader2 className="h-3 w-3 animate-spin text-blue-600" />
              ),
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
                      <StepperTitle className="!mb-0">
                        {step.title}
                      </StepperTitle>
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
      </div>

      {/* Container para o formulário */}
      <div className="bg-white rounded-3xl p-7 flex flex-col">
        {/* Form */}
        <div className="flex-1 min-h-0">
          <Stepper
            value={currentStep + 1}
            onValueChange={() => {}}
            variant="minimal"
            indicators={{
              completed: <Check className="h-3 w-3 text-white" />,
              loading: (
                <Loader2 className="h-3 w-3 animate-spin text-blue-600" />
              ),
            }}
            className="space-y-8"
          >
            <form onSubmit={handleSubmit} className="flex flex-col gap-10">
              <StepperPanel className="space-y-6">
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
                    isEmpresaRole={isEmpresaRole}
                  />
                </StepperContent>

                <StepperContent value={2} className="space-y-8">
                  <LocationStep
                    formData={formData}
                    errors={errors}
                    isSubmitting={isSubmitting}
                    onLocalizacaoChange={handleLocalizacaoChange}
                    onLocalizacaoBatchChange={handleLocalizacaoBatchChange}
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
                    isEmpresaRole={isEmpresaRole}
                    planoDestaque={
                      empresaDetails?.plano
                        ? {
                            permiteDestaque: empresaDetails.plano.permiteDestaque ?? false,
                            destaquesDisponiveis: empresaDetails.plano.destaquesDisponiveis ?? 0,
                          }
                        : null
                    }
                  />
                </StepperContent>
              </StepperPanel>

              <footer className="flex flex-wrap items-center justify-end gap-3 border-t border-border pt-6">
                <div className="flex items-center gap-3">
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
                      {isSubmitting ? "Enviando..." : "Criar vaga"}
                    </ButtonCustom>
                  )}
                </div>
              </footer>
            </form>
          </Stepper>
        </div>
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
