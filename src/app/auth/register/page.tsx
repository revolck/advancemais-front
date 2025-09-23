"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Building, GraduationCap, User } from "lucide-react";

import { registerUser } from "@/api/usuarios";
import type { UsuarioRegisterPayload } from "@/api/usuarios";
import { UserRole } from "@/config/roles";
import { MaskService } from "@/services";

import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/radix-checkbox";
import {
  ButtonCustom,
  InputCustom,
  OfflineModal,
  toastCustom,
} from "@/components/ui/custom";
import PrivacyPolicyModal from "@/components/partials/auth/register/privacy-policy-modal";
import TermsOfUseModal from "@/components/partials/auth/register/terms-of-use-modal";

const AUTH_LOGIN_URL = "https://auth.advancemais.com/login" as const;

const STORAGE_KEYS = {
  draft: "auth.register.formDraft",
  legacyForm: "registerFormData",
  legacyType: "registerSelectedType",
} as const;

const PASSWORD_VALIDATIONS = [
  { test: (value: string) => value.length >= 8, message: "A senha deve conter pelo menos 8 caracteres." },
  { test: (value: string) => /[A-Z]/.test(value), message: "Inclua ao menos uma letra maiúscula." },
  { test: (value: string) => /[a-z]/.test(value), message: "Inclua ao menos uma letra minúscula." },
  { test: (value: string) => /\d/.test(value), message: "Inclua ao menos um número." },
  {
    test: (value: string) => /[^A-Za-z0-9]/.test(value),
    message: "Inclua ao menos um caractere especial.",
  },
] as const;

const ACCOUNT_OPTIONS = [
  {
    id: "student" as const,
    title: "Aluno",
    description: "Acesso a cursos e conteúdos educacionais.",
    icon: GraduationCap,
  },
  {
    id: "candidate" as const,
    title: "Candidato",
    description: "Busca por oportunidades de carreira.",
    icon: User,
  },
  {
    id: "company" as const,
    title: "Empresa",
    description: "Publicação de vagas e busca por talentos.",
    icon: Building,
  },
] as const;

type RegisterAccountType = (typeof ACCOUNT_OPTIONS)[number]["id"];

type RegisterFormValues = {
  accountType?: RegisterAccountType;
  name: string;
  document: string;
  phone: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
};

type PersistedRegisterDraft = Pick<
  RegisterFormValues,
  "accountType" | "name" | "document" | "phone" | "email"
>;

type MaskServiceInstance = ReturnType<typeof MaskService.getInstance>;

const defaultValues: RegisterFormValues = {
  accountType: undefined,
  name: "",
  document: "",
  phone: "",
  email: "",
  password: "",
  confirmPassword: "",
  acceptTerms: false,
};

function createRegisterSchema(maskService: MaskServiceInstance) {
  return z
    .object({
      accountType: z
        .enum(["student", "candidate", "company"], {
          errorMap: () => ({ message: "Selecione o tipo de conta." }),
        })
        .optional(),
      name: z
        .string({ required_error: "Informe o nome." })
        .trim()
        .min(3, "Informe seu nome completo."),
      document: z
        .string({ required_error: "Informe o documento." })
        .trim()
        .min(1, "Informe o documento."),
      phone: z
        .string({ required_error: "Informe o telefone." })
        .trim()
        .min(1, "Informe o telefone."),
      email: z
        .string({ required_error: "Informe o e-mail." })
        .trim()
        .min(1, "Informe o e-mail.")
        .email("Informe um e-mail válido."),
      password: z
        .string({ required_error: "Informe a senha." })
        .min(8, PASSWORD_VALIDATIONS[0].message)
        .superRefine((value, ctx) => {
          PASSWORD_VALIDATIONS.slice(1).forEach(({ test, message }) => {
            if (!test(value)) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message,
              });
            }
          });
        }),
      confirmPassword: z
        .string({ required_error: "Confirme a senha." })
        .min(1, "Confirme a senha."),
      acceptTerms: z
        .boolean()
        .refine((value) => value, {
          message: "É necessário aceitar os termos para prosseguir.",
        }),
    })
    .superRefine((data, ctx) => {
      if (!data.accountType) {
        ctx.addIssue({
          path: ["accountType"],
          code: z.ZodIssueCode.custom,
          message: "Selecione o tipo de conta.",
        });
        return;
      }

      const documentMask = data.accountType === "company" ? "cnpj" : "cpf";

      if (!maskService.validate(data.document, documentMask)) {
        ctx.addIssue({
          path: ["document"],
          code: z.ZodIssueCode.custom,
          message:
            documentMask === "cnpj"
              ? "Informe um CNPJ válido."
              : "Informe um CPF válido.",
        });
      }

      if (!maskService.validate(data.phone, "phone")) {
        ctx.addIssue({
          path: ["phone"],
          code: z.ZodIssueCode.custom,
          message: "Informe um telefone válido.",
        });
      }

      if (data.password !== data.confirmPassword) {
        ctx.addIssue({
          path: ["confirmPassword"],
          code: z.ZodIssueCode.custom,
          message: "As senhas não coincidem.",
        });
      }
    });
}

function resolveRegisterError(error: unknown): string {
  const defaultMessage = "Não foi possível realizar o cadastro.";

  if (!error || typeof error !== "object") {
    return defaultMessage;
  }

  const status = (error as { status?: number }).status;
  if (status === 409) {
    return "Usuário já cadastrado, por favor faça login.";
  }

  const rawMessage =
    typeof (error as { message?: unknown }).message === "string"
      ? ((error as { message?: unknown }).message as string)
      : undefined;

  if (rawMessage) {
    const normalized = rawMessage.toLowerCase();
    if (normalized.includes("cpf")) return "CPF já cadastrado.";
    if (normalized.includes("cnpj")) return "CNPJ já cadastrado.";
    if (normalized.includes("email")) return "Email já cadastrado.";
    if (normalized.includes("usuário") || normalized.includes("usuario")) {
      return "Usuário já cadastrado, por favor faça login.";
    }
  }

  if (error instanceof Error) {
    const normalized = error.message.toLowerCase();
    if (normalized.includes("cpf")) return "CPF já cadastrado.";
    if (normalized.includes("cnpj")) return "CNPJ já cadastrado.";
    if (normalized.includes("email")) return "Email já cadastrado.";
  }

  return defaultMessage;
}

function maskEmailForLog(email: string): string {
  const [userPart, domainPart] = email.split("@");
  if (!domainPart) return "***";
  const maskedUser = userPart
    ? `${userPart.slice(0, 1)}${"*".repeat(Math.max(userPart.length - 1, 0))}`
    : "";
  return `${maskedUser}@${domainPart}`;
}

function maskValue(value: string): string {
  if (!value) return "";
  const trimmed = value.trim();
  if (trimmed.length <= 4) {
    return `${"*".repeat(Math.max(trimmed.length - 1, 0))}${trimmed.slice(-1)}`;
  }
  return `${"*".repeat(trimmed.length - 4)}${trimmed.slice(-4)}`;
}

function logRegisterPayload(payload: UsuarioRegisterPayload): void {
  if (process.env.NODE_ENV === "production") return;

  const sanitized: Record<string, unknown> = {
    ...payload,
    telefone: maskValue(payload.telefone),
    email: maskEmailForLog(payload.email),
    senha: `***(${payload.senha.length} chars)`,
    confirmarSenha: `***(${payload.confirmarSenha.length} chars)`,
  };

  if (payload.cpf) sanitized.cpf = maskValue(payload.cpf);
  if (payload.cnpj) sanitized.cnpj = maskValue(payload.cnpj);

  console.groupCollapsed("🧪 Registro | Payload sanitizado");
  console.log("Endpoint:", "POST /api/v1/usuarios/registrar");
  console.table(sanitized);
  console.groupEnd();
}

const RegisterPage = () => {
  const maskService = useMemo(() => MaskService.getInstance(), []);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);

  const registerSchema = useMemo(
    () => createRegisterSchema(maskService),
    [maskService],
  );

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting, isValid },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues,
    mode: "onChange",
    reValidateMode: "onChange",
  });

  const accountType = watch("accountType");
  const nameValue = watch("name");
  const documentValue = watch("document");
  const phoneValue = watch("phone");
  const emailValue = watch("email");

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const stored = window.localStorage.getItem(STORAGE_KEYS.draft);
      if (stored) {
        const parsed = JSON.parse(stored) as PersistedRegisterDraft;
        reset({
          ...defaultValues,
          ...parsed,
          accountType: parsed.accountType ?? undefined,
        });
        return;
      }

      const legacyForm = window.localStorage.getItem(STORAGE_KEYS.legacyForm);
      const legacyType = window.localStorage.getItem(
        STORAGE_KEYS.legacyType,
      ) as RegisterAccountType | undefined | null;

      if (legacyForm) {
        const parsedLegacy = JSON.parse(legacyForm) as PersistedRegisterDraft;
        reset({
          ...defaultValues,
          ...parsedLegacy,
          accountType: legacyType ?? undefined,
        });
      }
    } catch (error) {
      console.warn("Não foi possível restaurar o formulário de cadastro:", error);
    } finally {
      window.localStorage.removeItem(STORAGE_KEYS.legacyForm);
      window.localStorage.removeItem(STORAGE_KEYS.legacyType);
    }
  }, [reset]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const draft: PersistedRegisterDraft = {
      accountType: accountType ?? undefined,
      name: nameValue ?? "",
      document: documentValue ?? "",
      phone: phoneValue ?? "",
      email: emailValue ?? "",
    };

    const hasData = Boolean(
      draft.accountType ||
        draft.name.trim() ||
        draft.document.trim() ||
        draft.phone.trim() ||
        draft.email.trim(),
    );

    if (!hasData) {
      window.localStorage.removeItem(STORAGE_KEYS.draft);
      return;
    }

    window.localStorage.setItem(STORAGE_KEYS.draft, JSON.stringify(draft));
  }, [accountType, nameValue, documentValue, phoneValue, emailValue]);

  const selectedOption = useMemo(
    () => ACCOUNT_OPTIONS.find((option) => option.id === accountType) ?? null,
    [accountType],
  );

  const documentLabel = accountType === "company" ? "CNPJ" : "CPF";
  const documentPlaceholder = accountType === "company"
    ? "00.000.000/0000-00"
    : "000.000.000-00";

  const handleSelectType = useCallback(
    (type: RegisterAccountType) => {
      setValue("accountType", type, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
    },
    [setValue],
  );

  const handleReset = useCallback(() => {
    reset(defaultValues);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEYS.draft);
    }
  }, [reset]);

  const onSubmit = useCallback(
    async (values: RegisterFormValues) => {
      if (!values.accountType) {
        toastCustom.error("Selecione o tipo de conta para continuar.");
        return;
      }

      const tipoUsuario: UsuarioRegisterPayload["tipoUsuario"] =
        values.accountType === "company"
          ? "PESSOA_JURIDICA"
          : "PESSOA_FISICA";

      const cleanDocument = maskService
        .removeMask(values.document, "cpfCnpj")
        .trim();
      const cleanPhone = maskService.removeMask(values.phone, "phone").trim();

      const payload: UsuarioRegisterPayload = {
        nomeCompleto: values.name.trim(),
        telefone: cleanPhone,
        email: values.email.trim().toLowerCase(),
        senha: values.password,
        confirmarSenha: values.confirmPassword,
        aceitarTermos: values.acceptTerms,
        tipoUsuario,
        role:
          values.accountType === "company"
            ? UserRole.EMPRESA
            : UserRole.ALUNO_CANDIDATO,
      };

      if (values.accountType === "company") {
        payload.cnpj = cleanDocument;
      } else {
        payload.cpf = cleanDocument;
      }

      logRegisterPayload(payload);

      try {
        await registerUser(payload);
        toastCustom.success(
          "Cadastro realizado com sucesso! Verifique seu email para confirmar.",
        );
        handleReset();
        setTimeout(() => {
          if (typeof window !== "undefined") {
            window.location.href = AUTH_LOGIN_URL;
          }
        }, 1000);
      } catch (error) {
        console.error("Erro ao cadastrar:", error);
        toastCustom.error(resolveRegisterError(error));
      }
    },
    [handleReset, maskService],
  );

  const renderForm = () => {
    if (!accountType) return null;
    const isCompany = accountType === "company";
    const mask = isCompany ? "cnpj" : "cpf";

    return (
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-5 sm:space-y-6"
        noValidate
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-3">
          <div className="hidden sm:block" />
          <div className="text-center space-y-1">
            <h1 className="!text-2xl sm:text-xl md:text-2xl !mb-0 font-semibold text-gray-900 leading-tight">
              Criar conta como {selectedOption?.title}
            </h1>
            <p className="sm:text-sm text-gray-500">
              {selectedOption?.description}
            </p>
          </div>
          <div className="flex justify-end">
            <ButtonCustom
              onClick={handleReset}
              type="button"
              variant="ghost"
              size="sm"
              icon="ArrowLeft"
              className="bg-gray-400/10 hover:bg-gray-400/30"
            >
              Voltar
            </ButtonCustom>
          </div>
        </div>

        <div className="space-y-3 sm:space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Controller
              control={control}
              name="name"
              render={({ field }) => (
                <InputCustom
                  {...field}
                  value={field.value ?? ""}
                  label={isCompany ? "Nome da empresa" : "Nome completo"}
                  placeholder={
                    isCompany
                      ? "Digite o nome da sua empresa"
                      : "Digite seu nome"
                  }
                  size="md"
                  className="text-sm"
                  required
                  error={errors.name?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="document"
              render={({ field }) => (
                <InputCustom
                  {...field}
                  value={field.value ?? ""}
                  label={documentLabel}
                  placeholder={documentPlaceholder}
                  size="md"
                  className="text-sm"
                  required
                  mask={mask}
                  error={errors.document?.message}
                />
              )}
            />
          </div>

          <div className="space-y-3 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-4">
            <Controller
              control={control}
              name="phone"
              render={({ field }) => (
                <InputCustom
                  {...field}
                  value={field.value ?? ""}
                  label="Telefone"
                  placeholder="(00) 00000-0000"
                  size="md"
                  className="text-sm"
                  required
                  mask="phone"
                  error={errors.phone?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="email"
              render={({ field }) => (
                <InputCustom
                  {...field}
                  value={field.value ?? ""}
                  label="Email"
                  type="email"
                  placeholder="seuemail@email.com"
                  size="md"
                  className="text-sm"
                  required
                  mask="email"
                  error={errors.email?.message}
                />
              )}
            />
          </div>

          <div className="space-y-3 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-4">
            <Controller
              control={control}
              name="password"
              render={({ field }) => (
                <InputCustom
                  {...field}
                  value={field.value ?? ""}
                  label="Senha"
                  type="password"
                  placeholder="••••••••"
                  showPasswordToggle
                  size="md"
                  className="text-sm"
                  required
                  error={errors.password?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="confirmPassword"
              render={({ field }) => (
                <InputCustom
                  {...field}
                  value={field.value ?? ""}
                  label="Confirmar senha"
                  type="password"
                  placeholder="••••••••"
                  showPasswordToggle
                  size="md"
                  className="text-sm"
                  required
                  error={errors.confirmPassword?.message}
                />
              )}
            />
          </div>
        </div>

        <div className="flex items-start space-x-2.5 pt-1">
          <Controller
            control={control}
            name="acceptTerms"
            render={({ field }) => (
              <Checkbox
                id="terms"
                checked={field.value}
                onCheckedChange={(checked) => field.onChange(Boolean(checked))}
                required
              />
            )}
          />
          <Label
            htmlFor="terms"
            className="sm:text-sm text-gray-600 leading-5 cursor-pointer"
          >
            Li e aceito os{" "}
            <button
              type="button"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                setIsTermsModalOpen(true);
              }}
              className="text-blue-600 hover:underline font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white rounded"
            >
              Termos de Uso
            </button>
            , a{" "}
            <button
              type="button"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                setIsPrivacyModalOpen(true);
              }}
              className="text-blue-600 hover:underline font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white rounded"
            >
              Política de Privacidade
            </button>{" "}
            e autorizo o uso das minhas informações conforme descrito.
            {errors.acceptTerms?.message && (
              <span className="block text-xs text-destructive mt-1">
                {errors.acceptTerms.message}
              </span>
            )}
          </Label>
        </div>

        <div>
          <ButtonCustom
            type="submit"
            fullWidth
            size="md"
            variant="primary"
            className="h-10 sm:h-11 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-sm"
            disabled={!isValid || isSubmitting}
            isLoading={isSubmitting}
            loadingText="Criando..."
          >
            Criar conta
          </ButtonCustom>
        </div>
      </form>
    );
  };

  return (
    <div className="relative min-h-screen flex flex-col bg-slate-50">
      <main className="flex-1">
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[var(--primary-color)]" />
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary-color)] via-[var(--primary-color)]/95 to-[var(--secondary-color)]" />
          <div className="relative max-w-6xl mx-auto px-6 py-12 sm:py-16 lg:py-24 grid lg:grid-cols-[1.1fr_0.9fr] gap-10 lg:gap-16 items-center">
            <div className="space-y-8 text-white">
              <div className="space-y-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 text-sm">
                  Plataforma completa para sua jornada profissional
                </span>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
                  Conquiste novas oportunidades com a Advance+
                </h1>
                <p className="text-base sm:text-lg text-white/80 leading-relaxed">
                  Faça parte do ecossistema que conecta alunos, candidatos e empresas. Cadastre-se gratuitamente e tenha acesso a recursos exclusivos para impulsionar sua carreira.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {["Gestão completa de cursos", "Conexão com recrutadores", "Suporte especializado", "Tecnologia intuitiva"].map((feature) => (
                  <div
                    key={feature}
                    className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3"
                  >
                    <div className="size-8 rounded-full bg-white/20 grid place-items-center">
                      <span className="text-lg">•</span>
                    </div>
                    <p className="text-sm font-medium text-white/90 leading-tight">
                      {feature}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative bg-white rounded-3xl shadow-xl p-6 sm:p-8 md:p-10 lg:p-8 xl:p-10">
              <div className="absolute -top-12 -right-8 hidden lg:block">
                <div className="size-24 rounded-full bg-white/10 backdrop-blur" />
              </div>
              <div className="absolute -bottom-10 -left-10 hidden lg:block">
                <div className="size-20 rounded-full bg-white/10 backdrop-blur" />
              </div>

              <div className="relative space-y-6">
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-semibold text-gray-900">
                    Crie sua conta na Advance+
                  </h2>
                  <p className="text-sm text-gray-500">
                    Selecione o perfil que melhor representa você para personalizarmos sua experiência.
                  </p>
                </div>

                {!accountType ? (
                  <div className="space-y-5">
                    <div className="grid gap-4 sm:grid-cols-2">
                      {ACCOUNT_OPTIONS.map((option) => {
                        const Icon = option.icon;
                        const isSelected = option.id === accountType;
                        return (
                          <div
                            key={option.id}
                            className={`relative rounded-2xl border transition-all duration-300 bg-[var(--primary-color)]/5 hover:bg-[var(--primary-color)]/10 p-5 sm:p-6 cursor-pointer group ${
                              isSelected
                                ? "border-[var(--secondary-color)] shadow-[0_15px_35px_rgba(37,99,235,0.1)]"
                                : "border-transparent"
                            }`}
                            role="button"
                            tabIndex={0}
                            onClick={() => handleSelectType(option.id)}
                            onKeyDown={(event) => {
                              if (event.key === "Enter" || event.key === " ") {
                                event.preventDefault();
                                handleSelectType(option.id);
                              }
                            }}
                          >
                            <div className="grid place-items-center size-14 rounded-xl bg-[var(--secondary-color)] text-white mb-4">
                              <Icon className="size-6" />
                            </div>
                            <h2 className="md:text-xl font-semibold text-gray-900">
                              {option.title}
                            </h2>
                            <p className="mt-2 text-sm text-gray-500 min-h-[2.75rem] flex-1 leading-normal">
                              {option.description}
                            </p>
                            <div className="w-full flex justify-center">
                              <ButtonCustom
                                type="button"
                                onClick={() => handleSelectType(option.id)}
                                variant="secondary"
                                size="md"
                                className="mt-5 w-full sm:w-auto"
                                aria-label={`Escolher ${option.title}`}
                                withAnimation
                              >
                                Escolher
                              </ButtonCustom>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="pt-2 sm:pt-4 text-center">
                      <p className="animate-element animate-delay-700 text-center text-sm text-muted-foreground">
                        Já possui uma conta?{" "}
                        <a
                          href={AUTH_LOGIN_URL}
                          className="hover:opacity-100 transition-colors text-[var(--primary-color)] cursor-pointer opacity-70 font-semibold"
                        >
                          Fazer login
                        </a>
                      </p>
                    </div>
                  </div>
                ) : (
                  <div>
                    {renderForm()}

                    <div className="!pt-6 sm:pt-4 text-center">
                      <p className="animate-element animate-delay-700 text-center text-sm text-muted-foreground">
                        Já possui uma conta?{" "}
                        <a
                          href={AUTH_LOGIN_URL}
                          className="hover:opacity-100 transition-colors text-[var(--primary-color)] cursor-pointer opacity-70 font-semibold"
                        >
                          Fazer login
                        </a>
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-[var(--color-blue)] text-white/80 py-8">
        <div className="max-w-5xl mx-auto px-6 text-center space-y-3">
          <p className="sm:text-sm tracking-wide text-white">
            Todos os direitos reservados © {new Date().getFullYear()} {" "}
            <span className="font-semibold text-[var(--secondary-color)]">
              Advance+
            </span>
          </p>
          <div className="flex flex-wrap items-center justify-center text-[12px] sm:text-sm text-white/80">
            <a
              href="http://advancemais.com/politica-privacidade"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors px-3"
            >
              Política de Privacidade
            </a>
            <span className="h-4 w-px bg-blue-800/50 self-center" aria-hidden></span>
            <a
              href="http://advancemais.com/termos-uso"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors px-3"
            >
              Termos de Uso
            </a>
            <span className="h-4 w-px bg-blue-800/20 self-center" aria-hidden></span>
            <a href="#" className="hover:text-white transition-colors px-3">
              Preferências de Cookies
            </a>
          </div>
        </div>
      </footer>

      <TermsOfUseModal
        isOpen={isTermsModalOpen}
        onOpenChange={setIsTermsModalOpen}
      />
      <PrivacyPolicyModal
        isOpen={isPrivacyModalOpen}
        onOpenChange={setIsPrivacyModalOpen}
      />
      <OfflineModal />
    </div>
  );
};

export default RegisterPage;
