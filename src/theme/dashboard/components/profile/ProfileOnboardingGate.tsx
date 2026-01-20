"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ModalCustom,
  ModalContentWrapper,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalBody,
  ModalFooter,
  ButtonCustom,
  InputCustom,
  SelectCustom,
  SimpleTextarea,
  DatePickerCustom,
  type SelectOption,
} from "@/components/ui/custom";
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
} from "@/components/ui/custom/steps";
import { toastCustom } from "@/components/ui/custom/toast";
import { getUserProfile, updateUserProfile } from "@/api/usuarios";
import type { UsuarioProfileResponse } from "@/api/usuarios/types";
import { lookupCep, normalizeCep, isValidCep } from "@/lib/cep";
import { MaskService } from "@/services";

const GENERO_OPTIONS: SelectOption[] = [
  { value: "MASCULINO", label: "Masculino" },
  { value: "FEMININO", label: "Feminino" },
  { value: "OUTRO", label: "Outro" },
  { value: "PREFIRO_NAO_INFORMAR", label: "Prefiro não informar" },
];

function normalizeGeneroValue(value?: string | null): string {
  const normalized = value ? String(value).trim() : "";
  if (!normalized) return "";
  return normalized === "NAO_INFORMADO" ? "PREFIRO_NAO_INFORMAR" : normalized;
}

const onboardingSchema = z.object({
  genero: z.string().min(1, "Gênero é obrigatório"),
  telefone: z.string().min(1, "Telefone é obrigatório"),
  dataNasc: z.date({ required_error: "Data de nascimento é obrigatória" }),
  descricao: z.string().optional(),
  endereco: z.object({
    cep: z
      .string()
      .min(1, "CEP é obrigatório")
      .refine((v) => isValidCep(v), "CEP inválido"),
    logradouro: z.string().min(1, "Logradouro é obrigatório"),
    numero: z.string().min(1, "Número é obrigatório"),
    bairro: z.string().min(1, "Bairro é obrigatório"),
    cidade: z.string().min(1, "Cidade é obrigatória"),
    estado: z
      .string()
      .min(2, "UF é obrigatória")
      .max(2, "UF deve ter 2 letras"),
  }),
});

type OnboardingFormData = z.infer<typeof onboardingSchema>;

function parseDate(value?: string | null): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function getPrimaryEndereco(
  usuario?: UsuarioProfileResponse["usuario"]
): any | null {
  const enderecos = usuario?.enderecos ?? [];
  return enderecos.length > 0 ? enderecos[0] : null;
}

function isProfileCompleteForOnboarding(
  usuario?: UsuarioProfileResponse["usuario"],
  stats?: UsuarioProfileResponse["stats"]
): boolean {
  if (!usuario || !stats) return true;

  const telefoneDigits = (usuario.telefone ?? "").replace(/\D/g, "");
  const hasTelefone = telefoneDigits.length > 0;
  const hasDataNasc = Boolean(usuario.dataNasc);
  const hasGenero = Boolean(usuario.genero && String(usuario.genero).trim());

  const endereco = getPrimaryEndereco(usuario);
  const hasEndereco =
    stats.hasAddress &&
    Boolean(endereco?.cep) &&
    Boolean(endereco?.logradouro) &&
    Boolean(endereco?.numero) &&
    Boolean(endereco?.bairro) &&
    Boolean(endereco?.cidade) &&
    Boolean(endereco?.estado);

  return hasTelefone && hasDataNasc && hasGenero && hasEndereco;
}

export function ProfileOnboardingGate() {
  const queryClient = useQueryClient();
  const [isCepLoading, setIsCepLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const [hasCompletedStep1, setHasCompletedStep1] = useState(false);
  const maskService = useMemo(() => MaskService.getInstance(), []);
  const minBirthDate = useMemo(() => {
    const today = new Date();
    return new Date(
      today.getFullYear() - 70,
      today.getMonth(),
      today.getDate()
    );
  }, []);

  const {
    data: profileResponse,
    isLoading: isLoadingProfile,
    isFetching: isFetchingProfile,
  } = useQuery<UsuarioProfileResponse>({
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
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const usuario = useMemo(() => profileResponse?.usuario, [profileResponse]);
  const stats = useMemo(() => profileResponse?.stats, [profileResponse]);

  const shouldShowModal = useMemo(() => {
    if (!usuario || !stats) return false;
    if (isLoadingProfile) return false;
    return !isProfileCompleteForOnboarding(usuario, stats);
  }, [usuario, stats, isLoadingProfile]);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      genero: "",
      telefone: "",
      dataNasc: null as any,
      descricao: "",
      endereco: {
        cep: "",
        logradouro: "",
        numero: "",
        bairro: "",
        cidade: "",
        estado: "",
      },
    },
  });

  useEffect(() => {
    if (!usuario || !stats) return;
    if (isProfileCompleteForOnboarding(usuario, stats)) return;

    const endereco = getPrimaryEndereco(usuario);

    reset({
      genero: normalizeGeneroValue(usuario.genero),
      telefone: maskService.processInput(usuario.telefone ?? "", "phone"),
      dataNasc: parseDate(usuario.dataNasc) as any,
      descricao: usuario.descricao ?? "",
      endereco: {
        cep: endereco?.cep ? normalizeCep(endereco.cep) : "",
        logradouro: endereco?.logradouro ?? "",
        numero: endereco?.numero ?? "",
        bairro: endereco?.bairro ?? "",
        cidade: endereco?.cidade ?? "",
        estado: endereco?.estado ?? "",
      },
    });
    setActiveStep(1);
    setHasCompletedStep1(false);
  }, [reset, usuario, stats, maskService]);

  const updateMutation = useMutation({
    mutationFn: async (data: OnboardingFormData) => {
      const telefoneDigits = data.telefone.replace(/\D/g, "");
      const cepDigits = data.endereco.cep.replace(/\D/g, "");
      const payload = {
        telefone: telefoneDigits,
        genero: normalizeGeneroValue(data.genero),
        dataNasc: data.dataNasc.toISOString(),
        descricao: data.descricao?.trim() ?? "",
        endereco: {
          cep: cepDigits || null,
          logradouro: data.endereco.logradouro.trim() || null,
          bairro: data.endereco.bairro.trim() || null,
          numero: data.endereco.numero.trim() || null,
          cidade: data.endereco.cidade.trim() || null,
          estado: data.endereco.estado.trim().toUpperCase() || null,
        },
      };

      const response = await updateUserProfile(payload as any);
      if (response && "success" in response && response.success !== true) {
        throw new Error("Erro ao atualizar perfil");
      }
      return response;
    },
    onSuccess: async () => {
      toastCustom.success({
        title: "Perfil atualizado",
        description: "Obrigado! Suas informações foram salvas com sucesso.",
      });
      await queryClient.invalidateQueries({ queryKey: ["user-profile"] });
    },
    onError: (error: any) => {
      toastCustom.error({
        title: "Erro ao salvar",
        description: error?.message || "Não foi possível salvar agora.",
      });
    },
  });

  const handleCepSearch = useCallback(
    async (cep: string) => {
      const digits = cep.replace(/\D/g, "");
      if (digits.length !== 8 || isCepLoading) return;

      setIsCepLoading(true);
      try {
        const result = await lookupCep(cep);
        if ("error" in result) {
          toastCustom.error({
            title: "Não foi possível buscar o CEP",
            description: result.error,
          });
          return;
        }

        setValue("endereco.logradouro", result.street || "");
        setValue("endereco.bairro", result.neighborhood || "");
        setValue("endereco.cidade", result.city || "");
        setValue("endereco.estado", (result.state || "").toUpperCase());
        setValue("endereco.cep", result.cep);
      } catch (error) {
        console.error("Erro ao buscar CEP:", error);
        toastCustom.error({
          title: "Erro de consulta",
          description: "Falha ao consultar o CEP informado.",
        });
      } finally {
        setIsCepLoading(false);
      }
    },
    [isCepLoading, setValue]
  );

  const handleCepChange = useCallback(
    (value: string) => {
      const normalized = normalizeCep(value);
      setValue("endereco.cep", normalized, { shouldValidate: true });

      const digits = normalized.replace(/\D/g, "");
      if (digits.length === 8) {
        handleCepSearch(normalized);
      }
    },
    [handleCepSearch, setValue]
  );

  const onSubmit = async (data: OnboardingFormData) => {
    await updateMutation.mutateAsync(data);
  };

  const validateStep1 = useCallback(async () => {
    const ok = await trigger(["genero", "telefone", "dataNasc"] as any, {
      shouldFocus: true,
    });
    if (!ok) {
      toastCustom.error({
        title: "Complete os campos obrigatórios",
        description:
          "Preencha gênero, telefone e data de nascimento antes de continuar.",
      });
      return false;
    }
    setHasCompletedStep1(true);
    return true;
  }, [trigger]);

  const handleNext = useCallback(async () => {
    if (activeStep === 1) {
      const ok = await validateStep1();
      if (!ok) return;
      setActiveStep(2);
    }
  }, [activeStep, validateStep1]);

  const handleBack = useCallback(() => {
    setActiveStep((prev) => Math.max(1, prev - 1));
  }, []);

  const isBusy = isSubmitting || updateMutation.isPending || isFetchingProfile;
  const isStep2Enabled = hasCompletedStep1 || activeStep > 1;

  if (!shouldShowModal) return null;

  return (
    <ModalCustom
      isOpen={shouldShowModal}
      size="5xl"
      backdrop="blur"
      isDismissable={false}
      isKeyboardDismissDisabled
      hideCloseButton
      scrollBehavior="inside"
      shouldBlockScroll
    >
      <ModalContentWrapper
        hideCloseButton
        isDismissable={false}
        isKeyboardDismissDisabled
      >
        <ModalHeader className="pb-4">
          <ModalTitle className="mb-0!">Complete seu perfil</ModalTitle>
          <ModalDescription className="text-sm! text-gray-600!">
            Para continuar, atualize suas informações obrigatórias.
          </ModalDescription>
        </ModalHeader>
        <ModalBody className="pt-0">
          <div className="space-y-6">
            <Stepper
              value={activeStep}
              onValueChange={(next) => setActiveStep(next)}
              variant="minimal"
              orientation="vertical"
              className="space-y-6"
            >
              <div className="grid gap-2 md:grid-cols-[200px_1fr]">
                <StepperNav className="gap-1 rounded-xl border border-transparent bg-white p-0 [&_[aria-hidden='true']]:bg-[var(--primary-color)]/20">
                  <StepperItem step={1} completed={hasCompletedStep1}>
                    <StepperTrigger className="w-full rounded-lg border border-transparent px-3 py-3 text-center transition-all data-[state=active]:border-transparent0 data-[state=active]:bg-white flex flex-col items-center gap-2">
                      <StepperIndicator className="data-[state=active]:border-[var(--primary-color)] data-[state=active]:bg-[var(--primary-color)] data-[state=active]:text-white data-[state=completed]:border-[var(--primary-color)] data-[state=completed]:bg-[var(--primary-color)] data-[state=completed]:text-white">
                        1
                      </StepperIndicator>
                      <div className="min-w-0 text-center">
                        <StepperTitle className="pt-0 text-sm font-medium text-center">
                          Informações
                        </StepperTitle>
                        <StepperDescription className="text-xs text-gray-500 mt-0.5 text-center">
                          Preencha suas informações básicas para continuar.
                        </StepperDescription>
                      </div>
                    </StepperTrigger>
                  </StepperItem>

                  <StepperItem
                    step={2}
                    completed={false}
                    disabled={!isStep2Enabled}
                    loading={updateMutation.isPending}
                    isLast
                  >
                    <StepperTrigger className="w-full rounded-lg border border-transparent px-3 py-3 text-center transition-all flex flex-col items-center gap-2">
                      <StepperIndicator className="data-[state=active]:border-[var(--primary-color)] data-[state=active]:bg-[var(--primary-color)] data-[state=active]:text-white data-[state=completed]:border-[var(--primary-color)] data-[state=completed]:bg-[var(--primary-color)] data-[state=completed]:text-white">
                        2
                      </StepperIndicator>
                      <div className="min-w-0 text-center">
                        <StepperTitle className="pt-0 text-sm font-medium text-center">
                          Endereço
                        </StepperTitle>
                        <StepperDescription className="text-xs text-gray-500 mt-0.5 text-center">
                          Preencha seu endereço para continuar.
                        </StepperDescription>
                      </div>
                    </StepperTrigger>
                  </StepperItem>
                </StepperNav>

                <StepperPanel className="rounded-xl border border-gray-100 bg-white p-5 sm:p-6">
                  <StepperContent
                    value={1}
                    className="space-y-6 animate-in fade-in-0 slide-in-from-right-2 duration-200"
                  >
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                      <Controller
                        control={control}
                        name="genero"
                        render={({ field }) => (
                          <SelectCustom
                            mode="single"
                            label="Gênero"
                            required
                            placeholder="Selecione..."
                            options={GENERO_OPTIONS}
                            value={(field.value || null) as any}
                            onChange={(val) => field.onChange(val ?? "")}
                            error={errors.genero?.message}
                          />
                        )}
                      />

                      <Controller
                        control={control}
                        name="telefone"
                        render={({ field }) => (
                          <InputCustom
                            ref={field.ref}
                            name={field.name}
                            label="Telefone/Whatsapp"
                            required
                            type="tel"
                            value={field.value ?? ""}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            error={errors.telefone?.message}
                            icon="Phone"
                            mask="phone"
                            disabled={isBusy}
                          />
                        )}
                      />

                      <Controller
                        control={control}
                        name="dataNasc"
                        render={({ field }) => (
                          <DatePickerCustom
                            label="Data de nascimento"
                            required
                            years="old"
                            maxDate={new Date()}
                            minDate={minBirthDate}
                            value={field.value ?? null}
                            onChange={(d) => field.onChange(d)}
                            placeholder="Selecione a data"
                            error={errors.dataNasc?.message as any}
                            disabled={isBusy}
                          />
                        )}
                      />
                    </div>

                    <Controller
                      control={control}
                      name="descricao"
                      render={({ field }) => (
                        <SimpleTextarea
                          label="Descrição"
                          value={field.value ?? ""}
                          onChange={(e) => field.onChange(e.target.value)}
                          disabled={isBusy}
                          error={errors.descricao?.message}
                          placeholder="Conte um pouco sobre você..."
                          maxLength={500}
                          rows={7}
                          className="min-h-[200px]!"
                        />
                      )}
                    />
                  </StepperContent>

                  <StepperContent
                    value={2}
                    className="space-y-6 animate-in fade-in-0 slide-in-from-right-2 duration-200"
                  >
                    <div className="grid gap-5 sm:grid-cols-2">
                      <Controller
                        control={control}
                        name="endereco.cep"
                        render={({ field }) => (
                          <InputCustom
                            ref={field.ref}
                            name={field.name}
                            label="CEP"
                            required
                            value={field.value ?? ""}
                            onChange={(e) => {
                              field.onChange(e);
                              handleCepChange(e.target.value);
                            }}
                            onBlur={field.onBlur}
                            disabled={isBusy || isCepLoading}
                            mask="cep"
                            maxLength={9}
                            rightIcon={isCepLoading ? "Loader2" : undefined}
                            error={errors.endereco?.cep?.message}
                          />
                        )}
                      />

                      <Controller
                        control={control}
                        name="endereco.numero"
                        render={({ field }) => (
                          <InputCustom
                            ref={field.ref}
                            name={field.name}
                            label="Número"
                            required
                            value={field.value ?? ""}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            disabled={isBusy}
                            error={errors.endereco?.numero?.message}
                          />
                        )}
                      />
                    </div>

                    <Controller
                      control={control}
                      name="endereco.logradouro"
                      render={({ field }) => (
                        <InputCustom
                          ref={field.ref}
                          name={field.name}
                          label="Logradouro"
                          required
                          value={field.value ?? ""}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          disabled={isBusy}
                          error={errors.endereco?.logradouro?.message}
                        />
                      )}
                    />

                    <div className="grid gap-5 sm:grid-cols-3">
                      <Controller
                        control={control}
                        name="endereco.bairro"
                        render={({ field }) => (
                          <InputCustom
                            ref={field.ref}
                            name={field.name}
                            label="Bairro"
                            required
                            value={field.value ?? ""}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            disabled={isBusy}
                            error={errors.endereco?.bairro?.message}
                          />
                        )}
                      />

                      <Controller
                        control={control}
                        name="endereco.cidade"
                        render={({ field }) => (
                          <InputCustom
                            ref={field.ref}
                            name={field.name}
                            label="Cidade"
                            required
                            value={field.value ?? ""}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            disabled={isBusy}
                            error={errors.endereco?.cidade?.message}
                          />
                        )}
                      />

                      <Controller
                        control={control}
                        name="endereco.estado"
                        render={({ field }) => (
                          <InputCustom
                            ref={field.ref}
                            name={field.name}
                            label="UF"
                            required
                            value={field.value ?? ""}
                            onChange={(e) =>
                              field.onChange(e.target.value.toUpperCase())
                            }
                            onBlur={field.onBlur}
                            disabled={isBusy}
                            error={errors.endereco?.estado?.message}
                            maxLength={2}
                            placeholder="Ex: RJ"
                          />
                        )}
                      />
                    </div>
                  </StepperContent>
                </StepperPanel>
              </div>
            </Stepper>
          </div>
        </ModalBody>
        <ModalFooter className="border-t border-gray-100 pt-6 mt-6">
          <div
            className={`flex w-full items-center gap-4 ${
              activeStep > 1 ? "justify-between" : "justify-end"
            }`}
          >
            {activeStep > 1 && (
              <ButtonCustom
                variant="outline"
                size="md"
                onClick={handleBack}
                disabled={isBusy}
                className="min-w-[100px] transition-opacity"
              >
                Voltar
              </ButtonCustom>
            )}

            {activeStep === 1 ? (
              <ButtonCustom
                variant="primary"
                size="md"
                onClick={handleNext}
                disabled={isBusy}
                isLoading={isBusy}
                className="min-w-[120px]"
              >
                Próximo
              </ButtonCustom>
            ) : (
              <ButtonCustom
                variant="primary"
                size="md"
                onClick={handleSubmit(onSubmit)}
                disabled={isBusy}
                isLoading={isBusy}
                className="min-w-[160px]"
              >
                {isBusy ? "Salvando..." : "Salvar e continuar"}
              </ButtonCustom>
            )}
          </div>
        </ModalFooter>
      </ModalContentWrapper>
    </ModalCustom>
  );
}
