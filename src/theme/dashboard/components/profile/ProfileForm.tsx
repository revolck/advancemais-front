"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import type React from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ButtonCustom,
  HorizontalTabs,
  InputCustom,
  SelectCustom,
  SimpleTextarea,
  DatePickerCustom,
  type SelectOption,
} from "@/components/ui/custom";
import { toastCustom } from "@/components/ui/custom/toast";
// Removendo imports de ícones do lucide-react - InputCustom usa IconName
import type { UsuarioProfileResponse } from "@/api/usuarios/types";
import { changeUserPassword } from "@/api/usuarios";
import { lookupCep, normalizeCep, isValidCep } from "@/lib/cep";
import {
  BRASIL_ESTADO_OPTIONS,
  fetchCidadesByUf,
  normalizeEstadoUf,
} from "@/lib/brasil-localidades";
import { MaskService } from "@/services";

// Schema de validação
const profileSchema = z.object({
  nomeCompleto: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  telefone: z.string().min(1, "Telefone é obrigatório"),
  dataNasc: z.string().min(1, "Data de nascimento é obrigatória"),
  genero: z.string().optional(),
  descricao: z.string().optional(),
  socialLinks: z.record(z.string()),
});

// Schema de validação para endereço
const addressSchema = z.object({
  cep: z
    .string()
    .min(1, "CEP é obrigatório")
    .refine((value) => isValidCep(value), "CEP inválido"),
  logradouro: z.string().min(1, "Logradouro é obrigatório"),
  numero: z.string().min(1, "Número é obrigatório"),
  bairro: z.string().min(1, "Bairro é obrigatório"),
  cidade: z.string().min(1, "Cidade é obrigatória"),
  estado: z
    .string()
    .min(2, "Estado é obrigatório")
    .max(2, "Estado deve ter 2 caracteres"),
});

type ProfileFormData = z.infer<typeof profileSchema>;
type AddressFormData = z.infer<typeof addressSchema>;

interface ProfileFormProps {
  profile: UsuarioProfileResponse["usuario"];
  isLoading: boolean;
  onSubmit: (data: Partial<ProfileFormData>) => Promise<void>;
  renderActions?: (props: {
    onCancel: () => void;
    onSave: () => void;
    isDirty: boolean;
    isSubmitting: boolean;
  }) => React.ReactNode;
  onActionsChange?: (actions: {
    onCancel: () => void;
    onSave: () => void;
    isDirty: boolean;
    isSubmitting: boolean;
  }) => void;
}

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

// Schema de validação para senha
const passwordSchema = z
  .object({
    senhaAntiga: z.string().min(1, "Senha antiga é obrigatória"),
    senhaNova: z.string().min(1, "Nova senha é obrigatória"),
    confirmarSenha: z.string().min(1, "Confirmação de senha é obrigatória"),
  })
  .refine((data) => data.senhaNova === data.confirmarSenha, {
    message: "As senhas não coincidem",
    path: ["confirmarSenha"],
  });

type PasswordFormData = z.infer<typeof passwordSchema>;

// Requisitos de senha
const PASSWORD_REQUIREMENTS = [
  {
    id: "length",
    label: "Pelo menos 8 caracteres",
    validate: (value: string) => value.length >= 8,
  },
  {
    id: "case",
    label: "Letras maiúsculas e minúsculas",
    validate: (value: string) => /[A-Z]/.test(value) && /[a-z]/.test(value),
  },
  {
    id: "number",
    label: "Número (0-9)",
    validate: (value: string) => /[0-9]/.test(value),
  },
  {
    id: "special",
    label: "Caractere especial (ex.: !@#$%)",
    validate: (value: string) => /[^A-Za-z0-9]/.test(value),
  },
];

const isPasswordStrong = (value: string): boolean =>
  PASSWORD_REQUIREMENTS.every((requirement) => requirement.validate(value));

function toIsoDateString(value: unknown): string {
  if (!value) return "";
  if (value instanceof Date && !isNaN(value.getTime())) {
    return value.toISOString();
  }
  if (typeof value !== "string") return "";
  const trimmed = value.trim();
  if (!trimmed) return "";

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const date = new Date(`${trimmed}T00:00:00`);
    return !isNaN(date.getTime()) ? date.toISOString() : "";
  }

  const date = new Date(trimmed);
  return !isNaN(date.getTime()) ? date.toISOString() : "";
}

export function ProfileForm({
  profile,
  isLoading,
  onSubmit,
  renderActions,
  onActionsChange,
}: ProfileFormProps) {
  const minBirthDate = useMemo(() => {
    const today = new Date();
    return new Date(today.getFullYear() - 70, today.getMonth(), today.getDate());
  }, []);
  const maskService = useMemo(() => MaskService.getInstance(), []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);
  const [isSubmittingAddress, setIsSubmittingAddress] = useState(false);
  const [isCepLoading, setIsCepLoading] = useState(false);
  const [cidadeOptions, setCidadeOptions] = useState<SelectOption[]>([]);
  const [isLoadingCidades, setIsLoadingCidades] = useState(false);
  const prevIsDirtyRef = useRef<boolean>(false);
  const prevIsSubmittingRef = useRef<boolean>(false);
  const cidadesCacheRef = useRef<Record<string, SelectOption[]>>({});

  // Formulário de senha
  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors },
    reset: resetPassword,
    watch: watchPassword,
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      senhaAntiga: "",
      senhaNova: "",
      confirmarSenha: "",
    },
  });

  // Formulário de endereço
  const {
    control: addressControl,
    handleSubmit: handleSubmitAddress,
    formState: { errors: addressErrors },
    reset: resetAddress,
    setValue: setAddressValue,
    watch: watchAddress,
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      cep: "",
      logradouro: "",
      numero: "",
      bairro: "",
      cidade: "",
      estado: "",
    },
  });
  const selectedEstado = watchAddress("estado");

  const fetchCidades = useCallback(
    async (uf: string, cidadeToSelect?: string | null) => {
      const normalizedUf = normalizeEstadoUf(uf);
      if (!normalizedUf) {
        setCidadeOptions([]);
        if (cidadeToSelect !== undefined) {
          setAddressValue("cidade", "", { shouldValidate: true });
        }
        return;
      }

      const cached = cidadesCacheRef.current[normalizedUf];
      if (cached) {
        setCidadeOptions(cached);
        if (cidadeToSelect !== undefined) {
          const option = cached.find(
            (item) =>
              String(item.value).toLowerCase() ===
              String(cidadeToSelect || "").trim().toLowerCase()
          );
          setAddressValue("cidade", option ? String(option.value) : "", {
            shouldValidate: true,
          });
        }
        return;
      }

      setIsLoadingCidades(true);
      try {
        const options = await fetchCidadesByUf(normalizedUf);
        cidadesCacheRef.current[normalizedUf] = options;
        setCidadeOptions(options);
        if (cidadeToSelect !== undefined) {
          const option = options.find(
            (item) =>
              String(item.value).toLowerCase() ===
              String(cidadeToSelect || "").trim().toLowerCase()
          );
          setAddressValue("cidade", option ? String(option.value) : "", {
            shouldValidate: true,
          });
        }
      } catch (error) {
        console.error("Erro ao carregar cidades:", error);
        setCidadeOptions([]);
        if (cidadeToSelect !== undefined) {
          setAddressValue("cidade", "", { shouldValidate: true });
        }
      } finally {
        setIsLoadingCidades(false);
      }
    },
    [setAddressValue]
  );

  const senhaNova = watchPassword("senhaNova");
  const satisfiedRequirements = useMemo(
    () =>
      PASSWORD_REQUIREMENTS.map((requirement) => ({
        id: requirement.id,
        label: requirement.label,
        satisfied: requirement.validate(senhaNova || ""),
      })),
    [senhaNova]
  );

  const passwordMismatch =
    watchPassword("confirmarSenha") &&
    senhaNova !== watchPassword("confirmarSenha");

  // Valores iniciais do formulário - usar useRef para armazenar e evitar recálculos
  const initialValuesRef = useRef<ProfileFormData | null>(null);
  const profileIdRef = useRef<string | undefined>(undefined);
  const hasInitializedRef = useRef(false);

  // Criar defaultValues iniciais vazios
  const emptyDefaultValues: ProfileFormData = useMemo(
    () => ({
      nomeCompleto: "",
      email: "",
      telefone: "",
      dataNasc: "",
      genero: "",
      descricao: "",
      socialLinks: {
        linkedin: "",
        instagram: "",
        portfolio: "",
        website: "",
      },
    }),
    []
  );

  const {
    handleSubmit,
    control,
    formState: { errors, isDirty },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: emptyDefaultValues,
  });

  // Calcular valores iniciais quando o perfil mudar
  useEffect(() => {
    if (!profile?.id) return;

    const profileAny = profile as any;

    const dataNascIso =
      toIsoDateString(profileAny.dataNasc) ||
      toIsoDateString(profileAny.dataNascimento) ||
      toIsoDateString(profileAny?.informacoes?.dataNasc) ||
      toIsoDateString(profileAny?.informacoes?.dataNascimento);

    // Mapear redes sociais (API retorna redesSociais, não socialLinks)
    const redesSociais = profileAny.redesSociais || profile.socialLinks || {};

    // Buscar campos em informacoes ou diretamente no objeto
    // Tratar null como string vazia para garantir que os valores sejam aplicados
    const informacoes = profileAny.informacoes || {};
    const telefoneRaw = (profileAny.telefone ?? informacoes.telefone) || "";
    const telefone = telefoneRaw
      ? maskService.processInput(telefoneRaw, "phone")
      : "";

    // Gênero - verificar em múltiplos lugares
    // Usar valor vazio se for null ou undefined
    const genero = profileAny.genero
      ? normalizeGeneroValue(profileAny.genero)
      : informacoes.genero
      ? normalizeGeneroValue(informacoes.genero)
      : "";

    const descricao = (profileAny.descricao ?? informacoes.descricao) || "";

    const newValues: ProfileFormData = {
      nomeCompleto: profile.nomeCompleto || "",
      email: profile.email || "",
      telefone: telefone,
      dataNasc: dataNascIso,
      genero: genero,
      descricao: descricao,
      socialLinks: {
        linkedin: redesSociais.linkedin || "",
        instagram: redesSociais.instagram || "",
        portfolio: redesSociais.portfolio || redesSociais.website || "",
        website: redesSociais.website || redesSociais.portfolio || "",
      },
    };

    // Atualizar valores iniciais para referência
    initialValuesRef.current = newValues;

    // Reset do formulário com os novos valores
    reset(newValues, { keepDirty: false, keepValues: false });

    // Log para debug
    console.log("🔍 Valores iniciais do perfil carregados:", newValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id, profile?.atualizadoEm, maskService, reset]);

  const onFormSubmit = async (data: ProfileFormData) => {
    if (!isDirty) {
      toastCustom.info("Nenhuma alteração foi feita");
      return;
    }

    setIsSubmitting(true);
    try {
      // Prepara os dados para envio (remove campos vazios)
      const payload: Record<string, unknown> = {};

      if (
        data.nomeCompleto !== (initialValuesRef.current?.nomeCompleto || "")
      ) {
        payload.nomeCompleto = data.nomeCompleto;
      }
      // Email não pode ser alterado, então não incluímos

      if (data.telefone && data.telefone.trim() !== "") {
        const digits = data.telefone.replace(/\D/g, "");
        if (digits) payload.telefone = digits;
      }

      // Data de nascimento - envia em ISO (mesmo padrão das modais admin)
      if (data.dataNasc && String(data.dataNasc).trim() !== "") {
        const iso = toIsoDateString(data.dataNasc);
        if (iso) payload.dataNasc = iso;
      }

      // Gênero - enviar se tiver valor válido
      if (data.genero && String(data.genero).trim() !== "") {
        const generoValue = normalizeGeneroValue(data.genero);
        payload.genero = generoValue;
        console.log("👤 Enviando genero:", generoValue);
      }

      if (data.descricao && data.descricao.trim() !== "") {
        payload.descricao = data.descricao.trim();
      }

      // Log para debug
      console.log("🔍 Dados do formulário recebidos:", {
        genero: data.genero,
        dataNasc: data.dataNasc,
        telefone: data.telefone,
        descricao: data.descricao,
      });
      console.log("📦 Payload que será enviado:", payload);

      // Processa redesSociais - remove campos vazios
      // API espera redesSociais, não socialLinks
      const redesSociais: Record<string, string | null> = {};
      if (data.socialLinks) {
        // Mapear campos do formulário para a estrutura da API
        if (
          data.socialLinks.linkedin &&
          data.socialLinks.linkedin.trim() !== ""
        ) {
          redesSociais.linkedin = data.socialLinks.linkedin.trim();
        }
        if (
          data.socialLinks.instagram &&
          data.socialLinks.instagram.trim() !== ""
        ) {
          redesSociais.instagram = data.socialLinks.instagram.trim();
        }
        if (
          data.socialLinks.portfolio &&
          data.socialLinks.portfolio.trim() !== ""
        ) {
          redesSociais.portfolio = data.socialLinks.portfolio.trim();
        }
        if (
          data.socialLinks.website &&
          data.socialLinks.website.trim() !== ""
        ) {
          redesSociais.website = data.socialLinks.website.trim();
        }
      }

      if (Object.keys(redesSociais).length > 0) {
        payload.redesSociais = redesSociais;
      }

      try {
        const response = await onSubmit(payload);
        console.log("✅ Resposta da API:", response);
        toastCustom.success("Perfil atualizado com sucesso!");
      } catch (error) {
        console.error("❌ Erro ao atualizar perfil:", error);
        throw error;
      }

      // Atualiza os valores do formulário com os dados que foram salvos
      // Isso garante que os campos permaneçam preenchidos após salvar
      reset(data, { keepDefaultValues: false });

      // Atualiza initialValuesRef para manter sincronizado
      initialValuesRef.current = data;
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      toastCustom.error(
        error instanceof Error
          ? error.message
          : "Erro ao atualizar perfil. Tente novamente."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (initialValuesRef.current) {
      reset(initialValuesRef.current);
    } else {
      reset(emptyDefaultValues);
    }
  };

  const handleSave = () => {
    handleSubmit(onFormSubmit)();
  };

  const onPasswordSubmit = async (data: PasswordFormData) => {
    if (!isPasswordStrong(data.senhaNova)) {
      toastCustom.error(
        "A senha precisa atender a todos os requisitos de segurança."
      );
      return;
    }

    setIsSubmittingPassword(true);
    try {
      await changeUserPassword({
        senhaAntiga: data.senhaAntiga,
        senhaNova: data.senhaNova,
        confirmarSenha: data.confirmarSenha,
      });

      toastCustom.success("Senha alterada com sucesso!");
      resetPassword();
    } catch (error) {
      console.error("Erro ao alterar senha:", error);
      toastCustom.error(
        error instanceof Error
          ? error.message
          : "Erro ao alterar senha. Verifique se a senha antiga está correta."
      );
    } finally {
      setIsSubmittingPassword(false);
    }
  };

  // Handler para busca de CEP
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

        // Preencher campos automaticamente
        setAddressValue("logradouro", result.street || "");
        setAddressValue("bairro", result.neighborhood || "");
        setAddressValue("cep", result.cep);
        const ufFromCep = normalizeEstadoUf(result.state || "");
        setAddressValue("estado", ufFromCep, { shouldValidate: true });
        if (ufFromCep) {
          await fetchCidades(ufFromCep, result.city || "");
        } else {
          setAddressValue("cidade", "", { shouldValidate: true });
        }
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
    [fetchCidades, isCepLoading, setAddressValue]
  );

  // Handler para mudança de CEP
  const handleCepChange = useCallback(
    (value: string) => {
      const normalized = normalizeCep(value);
      setAddressValue("cep", normalized);

      const digits = normalized.replace(/\D/g, "");
      if (digits.length === 8) {
        handleCepSearch(normalized);
      }
    },
    [handleCepSearch, setAddressValue]
  );

  // Submit do formulário de endereço
  const onAddressSubmit = async (data: AddressFormData) => {
    if (isSubmittingAddress) return;

    // Validar CEP se preenchido
    if (data.cep && !isValidCep(data.cep)) {
      toastCustom.error({
        title: "CEP inválido",
        description:
          "Informe um CEP válido no formato 00000-000 para continuar.",
      });
      return;
    }

    setIsSubmittingAddress(true);
    try {
      const sanitizedCep = data.cep ? data.cep.replace(/\D/g, "") : "";
      const enderecoPayload = {
        endereco: {
          cep: sanitizedCep || null,
          logradouro: data.logradouro?.trim() || null,
          bairro: data.bairro?.trim() || null,
          numero: data.numero?.trim() || null,
          cidade: data.cidade?.trim() || null,
          estado: data.estado?.trim().toUpperCase() || null,
        },
      };

      await onSubmit(enderecoPayload as any);
      toastCustom.success({
        title: "Endereço atualizado",
        description: "As informações de endereço foram salvas com sucesso.",
      });
    } catch (error: any) {
      console.error("Erro ao atualizar endereço:", error);
      toastCustom.error({
        title: "Erro ao salvar",
        description:
          error?.message || "Não foi possível salvar o endereço agora.",
      });
    } finally {
      setIsSubmittingAddress(false);
    }
  };

  // Carregar dados de endereço quando o perfil mudar
  useEffect(() => {
    if (!profile?.id || !profile.enderecos) return;

    const primeiroEndereco = profile.enderecos[0];
    if (primeiroEndereco) {
      const addressValues: AddressFormData = {
        cep: primeiroEndereco.cep ? normalizeCep(primeiroEndereco.cep) : "",
        logradouro: primeiroEndereco.logradouro || "",
        numero: primeiroEndereco.numero || "",
        bairro: primeiroEndereco.bairro || "",
        cidade: primeiroEndereco.cidade || "",
        estado: normalizeEstadoUf(primeiroEndereco.estado || ""),
      };
      resetAddress(addressValues);
      if (addressValues.estado) {
        void fetchCidades(addressValues.estado, addressValues.cidade || "");
      } else {
        setCidadeOptions([]);
      }
    }
  }, [fetchCidades, profile?.id, profile?.enderecos, resetAddress]);

  // Notifica mudanças nas ações apenas quando isDirty ou isSubmitting mudarem
  useEffect(() => {
    if (!onActionsChange) return;

    const currentIsDirty = isDirty;
    const currentIsSubmitting = isLoading || isSubmitting;

    // Só atualiza se realmente mudou
    if (
      prevIsDirtyRef.current !== currentIsDirty ||
      prevIsSubmittingRef.current !== currentIsSubmitting
    ) {
      prevIsDirtyRef.current = currentIsDirty;
      prevIsSubmittingRef.current = currentIsSubmitting;

      onActionsChange({
        onCancel: handleCancel,
        onSave: handleSave,
        isDirty: currentIsDirty,
        isSubmitting: currentIsSubmitting,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDirty, isLoading, isSubmitting, onActionsChange]);

  return (
    <div className="space-y-6">
      <HorizontalTabs
        items={[
          {
            value: "sobre",
            label: "Sobre",
            icon: "User",
            content: (
              <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
                {/* Primeira linha: Nome completo, Email */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Controller
                    control={control}
                    name="nomeCompleto"
                    render={({ field }) => (
                      <InputCustom
                        ref={field.ref}
                        name={field.name}
                        label="Nome completo"
                        value={(field.value as string) ?? ""}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        error={errors.nomeCompleto?.message}
                        required
                        icon="User"
                      />
                    )}
                  />

                  <Controller
                    control={control}
                    name="email"
                    render={({ field }) => (
                      <InputCustom
                        ref={field.ref}
                        name={field.name}
                        label="Email"
                        type="email"
                        value={(field.value as string) ?? ""}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        error={errors.email?.message}
                        required
                        icon="Mail"
                        disabled
                        helperText="O email não pode ser alterado"
                      />
                    )}
                  />
                </div>

                {/* Segunda linha: Gênero, Telefone/Whatsapp, Data de nascimento */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <Controller
                    control={control}
                    name="genero"
                    render={({ field }) => {
                      // Log para debug
                      console.log(
                        "🔍 SelectCustom genero - field.value:",
                        field.value,
                        "type:",
                        typeof field.value
                      );

                      // Converter para string (SelectCustom espera string ou null)
                      // Se for string vazia ou falsy, manter como string vazia
                      const selectValue = field.value
                        ? String(field.value).trim()
                        : "";

                      console.log(
                        "🔍 SelectCustom genero - selectValue:",
                        selectValue
                      );

                      return (
                        <SelectCustom
                          mode="single"
                          label="Gênero"
                          placeholder="Selecione..."
                          options={GENERO_OPTIONS}
                          value={selectValue || null}
                          onChange={(value) => {
                            const generoValue = value || "";
                            console.log("👤 Gênero selecionado:", generoValue);
                            field.onChange(generoValue);
                          }}
                          error={errors.genero?.message}
                        />
                      );
                    }}
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
                        value={(field.value as string) ?? ""}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        error={errors.telefone?.message}
                        icon="Phone"
                        mask="phone"
                      />
                    )}
                  />

                  <Controller
                    control={control}
                    name="dataNasc"
                    render={({ field }) => {
                      let dateValue: Date | null = null;

                      if (field.value) {
                        const iso = toIsoDateString(field.value);
                        dateValue = iso ? new Date(iso) : null;
                      }

                      // Valida se a data é válida
                      const validDate =
                        dateValue && !isNaN(dateValue.getTime())
                          ? dateValue
                          : null;

                      return (
                        <DatePickerCustom
                          label="Data de nascimento"
                          required
                          value={validDate}
                          onChange={(date) => {
                            if (date && !isNaN(date.getTime())) {
                              field.onChange(new Date(date).toISOString());
                            } else {
                              field.onChange("");
                            }
                          }}
                          placeholder="Selecione a data de nascimento"
                          error={errors.dataNasc?.message}
                          maxDate={new Date()} // Não permite datas futuras
                          minDate={minBirthDate}
                        />
                      );
                    }}
                  />
                </div>

                {/* Descrição */}
                <Controller
                  control={control}
                  name="descricao"
                  render={({ field }) => (
                    <SimpleTextarea
                      label="Descrição"
                      placeholder="Conte um pouco sobre você..."
                      rows={5}
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value)}
                      error={errors.descricao?.message}
                      maxLength={500}
                      showCharCount
                    />
                  )}
                />

                {/* Botões de ação */}
                {renderActions && (
                  <div className="flex flex-col sm:flex-row gap-3 justify-end items-center pt-4 border-t border-gray-200">
                    {renderActions({
                      onCancel: handleCancel,
                      onSave: handleSave,
                      isDirty,
                      isSubmitting: isLoading || isSubmitting,
                    })}
                  </div>
                )}
              </form>
            ),
          },
          {
            value: "senha",
            label: "Senha",
            icon: "Lock",
            content: (
              <form
                onSubmit={handleSubmitPassword(onPasswordSubmit)}
                className="space-y-6"
              >
                <div className="space-y-4">
                  <InputCustom
                    label="Senha antiga"
                    type="password"
                    {...registerPassword("senhaAntiga")}
                    error={passwordErrors.senhaAntiga?.message}
                    placeholder="••••••••"
                    showPasswordToggle
                    required
                    icon="Lock"
                  />

                  <div className="grid gap-4 sm:grid-cols-2">
                    <InputCustom
                      label="Nova senha"
                      type="password"
                      {...registerPassword("senhaNova")}
                      error={passwordErrors.senhaNova?.message}
                      placeholder="••••••••"
                      showPasswordToggle
                      required
                      icon="Lock"
                    />

                    <InputCustom
                      label="Confirmar senha"
                      type="password"
                      {...registerPassword("confirmarSenha")}
                      error={
                        passwordMismatch
                          ? "As senhas não são iguais. Confira os campos."
                          : passwordErrors.confirmarSenha?.message
                      }
                      placeholder="••••••••"
                      showPasswordToggle
                      required
                      icon="Lock"
                    />
                  </div>

                  <div className="rounded-2xl border border-gray-200 bg-gray-100/30 p-4">
                    <p className="!mb-0 text-sm">Sua senha deve conter:</p>
                    <ul className="mt-2 space-y-2 text-left text-sm">
                      {satisfiedRequirements.map((requirement) => (
                        <li
                          key={requirement.id}
                          className="flex items-center gap-2"
                        >
                          <span
                            className={`flex h-4 w-4 items-center justify-center rounded-full border text-[11px] font-semibold transition ${
                              requirement.satisfied
                                ? "border-emerald-500 bg-emerald-500 text-white"
                                : "border-[var(--primary-color)]/40 bg-white text-[var(--primary-color)]/70"
                            }`}
                            aria-hidden
                          >
                            {requirement.satisfied ? "✓" : ""}
                          </span>
                          <span
                            className={
                              requirement.satisfied
                                ? "text-foreground"
                                : "text-muted-foreground"
                            }
                          >
                            {requirement.label}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-end items-center pt-4 border-t border-gray-200">
                  <ButtonCustom
                    type="submit"
                    variant="primary"
                    size="md"
                    disabled={isSubmittingPassword}
                    isLoading={isSubmittingPassword}
                  >
                    {isSubmittingPassword ? "Alterando..." : "Alterar senha"}
                  </ButtonCustom>
                </div>
              </form>
            ),
          },
          {
            value: "endereco",
            label: "Endereço",
            icon: "MapPin",
            content: (
              <form
                onSubmit={handleSubmitAddress(onAddressSubmit)}
                className="space-y-6"
              >
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Controller
                      control={addressControl}
                      name="cep"
                      render={({ field }) => (
                        <InputCustom
                          ref={field.ref}
                          name={field.name}
                          label="CEP"
                          value={field.value ?? ""}
                          onChange={(e) => {
                            field.onChange(e);
                            handleCepChange(e.target.value);
                          }}
                          onBlur={field.onBlur}
                          disabled={isSubmittingAddress || isCepLoading}
                          mask="cep"
                          maxLength={9}
                          rightIcon={isCepLoading ? "Loader2" : undefined}
                          error={addressErrors.cep?.message}
                          icon="MapPin"
                          required
                        />
                      )}
                    />
                    <Controller
                      control={addressControl}
                      name="numero"
                      render={({ field }) => (
                        <InputCustom
                          ref={field.ref}
                          name={field.name}
                          label="Número"
                          value={field.value ?? ""}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          disabled={isSubmittingAddress}
                          error={addressErrors.numero?.message}
                          icon="Hash"
                          required
                        />
                      )}
                    />
                  </div>

                  <Controller
                    control={addressControl}
                    name="logradouro"
                    render={({ field }) => (
                      <InputCustom
                        ref={field.ref}
                        name={field.name}
                        label="Logradouro"
                        value={field.value ?? ""}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        disabled={isSubmittingAddress}
                        error={addressErrors.logradouro?.message}
                        icon="MapPin"
                        required
                      />
                    )}
                  />

                  <div className="grid gap-4 sm:grid-cols-3">
                    <Controller
                      control={addressControl}
                      name="bairro"
                      render={({ field }) => (
                        <InputCustom
                          ref={field.ref}
                          name={field.name}
                          label="Bairro"
                          value={field.value ?? ""}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          disabled={isSubmittingAddress}
                          error={addressErrors.bairro?.message}
                          icon="MapPin"
                          required
                        />
                      )}
                    />
                    <Controller
                      control={addressControl}
                      name="estado"
                      render={({ field }) => (
                        <SelectCustom
                          mode="single"
                          label="Estado"
                          required
                          placeholder="Selecione o estado"
                          options={BRASIL_ESTADO_OPTIONS}
                          value={(field.value || null) as string | null}
                          onChange={(value) => {
                            const uf = normalizeEstadoUf(value || "");
                            field.onChange(uf);
                            setAddressValue("cidade", "", {
                              shouldValidate: true,
                            });
                            void fetchCidades(uf, null);
                          }}
                          disabled={isSubmittingAddress || isLoadingCidades}
                          error={addressErrors.estado?.message}
                          searchable
                        />
                      )}
                    />
                    <Controller
                      control={addressControl}
                      name="cidade"
                      render={({ field }) => (
                        <SelectCustom
                          mode="single"
                          label="Cidade"
                          required
                          placeholder={
                            !selectedEstado
                              ? "Selecione o estado primeiro"
                              : isLoadingCidades
                              ? "Carregando cidades..."
                              : "Selecione a cidade"
                          }
                          options={cidadeOptions}
                          value={(field.value || null) as string | null}
                          onChange={(value) => field.onChange(value || "")}
                          disabled={
                            isSubmittingAddress ||
                            !selectedEstado ||
                            isLoadingCidades ||
                            cidadeOptions.length === 0
                          }
                          error={addressErrors.cidade?.message}
                          searchable
                        />
                      )}
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-end items-center pt-4 border-t border-gray-200">
                  <ButtonCustom
                    type="submit"
                    variant="primary"
                    size="md"
                    disabled={isSubmittingAddress}
                    isLoading={isSubmittingAddress}
                  >
                    {isSubmittingAddress ? "Salvando..." : "Salvar endereço"}
                  </ButtonCustom>
                </div>
              </form>
            ),
          },
          {
            value: "redes",
            label: "Redes",
            icon: "Globe",
            content: (
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Controller
                    control={control}
                    name="socialLinks.linkedin"
                    render={({ field }) => (
                      <InputCustom
                        ref={field.ref}
                        name={field.name}
                        label="LinkedIn"
                        type="url"
                        value={(field.value as string) ?? ""}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        icon="Globe"
                        placeholder="https://linkedin.com/in/seu-perfil"
                      />
                    )}
                  />

                  <Controller
                    control={control}
                    name="socialLinks.instagram"
                    render={({ field }) => (
                      <InputCustom
                        ref={field.ref}
                        name={field.name}
                        label="Instagram"
                        type="url"
                        value={(field.value as string) ?? ""}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        icon="Globe"
                        placeholder="https://instagram.com/seu-perfil"
                      />
                    )}
                  />

                  <Controller
                    control={control}
                    name="socialLinks.portfolio"
                    render={({ field }) => (
                      <InputCustom
                        ref={field.ref}
                        name={field.name}
                        label="Portfólio"
                        type="url"
                        value={(field.value as string) ?? ""}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        icon="Globe"
                        placeholder="https://seu-portfolio.com"
                      />
                    )}
                  />

                  <Controller
                    control={control}
                    name="socialLinks.website"
                    render={({ field }) => (
                      <InputCustom
                        ref={field.ref}
                        name={field.name}
                        label="Website"
                        type="url"
                        value={(field.value as string) ?? ""}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        icon="Globe"
                        placeholder="https://seu-website.com"
                      />
                    )}
                  />
                </div>

                {/* Botões de ação */}
                {renderActions && (
                  <div className="flex flex-col sm:flex-row gap-3 justify-end items-center pt-4 border-t border-gray-200">
                    {renderActions({
                      onCancel: handleCancel,
                      onSave: handleSave,
                      isDirty,
                      isSubmitting: isLoading || isSubmitting,
                    })}
                  </div>
                )}
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
