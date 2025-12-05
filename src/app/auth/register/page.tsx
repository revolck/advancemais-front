"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/radix-checkbox";
import {
  InputCustom,
  ButtonCustom,
  toastCustom,
  OfflineModal,
} from "@/components/ui/custom";
import TermsOfUseModal from "@/components/partials/auth/register/terms-of-use-modal";
import PrivacyPolicyModal from "@/components/partials/auth/register/privacy-policy-modal";
import { GraduationCap, User, Building } from "lucide-react";
import { registerUser } from "@/api/usuarios";
import type { UsuarioRegisterPayload } from "@/api/usuarios";
import { MaskService } from "@/services";
import Image from "next/image";

type SelectedType = "student" | "candidate" | "company" | null;

type RegisterFormData = {
  name: string;
  document: string;
  phone: string;
  email: string;
  password: string;
  confirmPassword: string;
};

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

const createInitialFormData = (): RegisterFormData => ({
  name: "",
  document: "",
  phone: "",
  email: "",
  password: "",
  confirmPassword: "",
});

const RegisterPage = () => {
  const [selectedType, setSelectedType] = useState<SelectedType>(null);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState<RegisterFormData>(() =>
    createInitialFormData()
  );
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);

  useEffect(() => {
    const savedForm = localStorage.getItem("registerFormData");
    const savedType = localStorage.getItem(
      "registerSelectedType"
    ) as SelectedType;
    if (savedForm) {
      try {
        const parsed = JSON.parse(savedForm) as Partial<RegisterFormData>;
        const allowedKeys = Object.keys(createInitialFormData());
        const sanitized = Object.fromEntries(
          Object.entries(parsed).filter(([key]) => allowedKeys.includes(key))
        ) as Partial<RegisterFormData>;
        setFormData((prev) => ({ ...prev, ...sanitized }));
      } catch (error) {
        console.warn(
          "Não foi possível restaurar o formulário de cadastro:",
          error
        );
        localStorage.removeItem("registerFormData");
      }
    }
    if (savedType) {
      setSelectedType(savedType);
    }
  }, []);

  useEffect(() => {
    const isEmptyForm = Object.values(formData).every((value) => value === "");
    if (isEmptyForm) {
      localStorage.removeItem("registerFormData");
      return;
    }
    localStorage.setItem("registerFormData", JSON.stringify(formData));
  }, [formData]);

  useEffect(() => {
    if (selectedType) {
      localStorage.setItem("registerSelectedType", selectedType);
    }
  }, [selectedType]);

  // Resetar formulário quando o tipo de conta mudar
  useEffect(() => {
    if (selectedType) {
      resetFormData();
    }
  }, [selectedType]);

  const userTypes = [
    {
      id: "student",
      title: "Aluno",
      icon: GraduationCap,
      description: "Acesso a cursos e conteúdos educacionais.",
      color: "from-emerald-500 to-teal-600",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-200",
      hoverBg: "hover:bg-emerald-100",
    },
    {
      id: "candidate",
      title: "Candidato",
      icon: User,
      description: "Busca por oportunidades de carreira.",
      color: "from-blue-500 to-indigo-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      hoverBg: "hover:bg-blue-100",
    },
    {
      id: "company",
      title: "Empresa",
      icon: Building,
      description: "Publicação de vagas e busca por talentos.",
      color: "from-red-500 to-rose-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      hoverBg: "hover:bg-red-100",
    },
  ];

  const typeStyles: Record<string, { ring: string }> = {
    student: { ring: "focus-visible:ring-blue-500" },
    candidate: { ring: "focus-visible:ring-blue-500" },
    company: { ring: "focus-visible:ring-blue-500" },
  };

  const maskService = MaskService.getInstance();

  const maskSensitiveValue = (value: string, visibleChars = 4) => {
    const trimmed = value?.trim() ?? "";
    if (!trimmed) return "";
    if (trimmed.length <= visibleChars) {
      return "*".repeat(Math.max(trimmed.length - 1, 0)) + trimmed.slice(-1);
    }
    const maskedLength = Math.max(trimmed.length - visibleChars, 0);
    return `${"*".repeat(maskedLength)}${trimmed.slice(-visibleChars)}`;
  };

  const maskEmail = (email: string) => {
    const [userPart, domainPart] = email.split("@");
    if (!domainPart) return maskSensitiveValue(email);
    const maskedUser = userPart
      ? `${userPart[0]}${"*".repeat(Math.max(userPart.length - 1, 0))}`
      : "";
    return `${maskedUser}@${domainPart}`;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setSelectedType(null);
    setFormData(createInitialFormData());
    setAcceptTerms(false);
    localStorage.removeItem("registerFormData");
    localStorage.removeItem("registerSelectedType");
  };

  const resetFormData = () => {
    setFormData(createInitialFormData());
    setAcceptTerms(false);
    localStorage.removeItem("registerFormData");
  };

  const trimmedPassword = formData.password.trim();
  const trimmedConfirmPassword = formData.confirmPassword.trim();

  const passwordMismatch =
    trimmedConfirmPassword.length > 0 &&
    trimmedPassword !== trimmedConfirmPassword;

  const satisfiedRequirements = useMemo(
    () =>
      PASSWORD_REQUIREMENTS.map((requirement) => ({
        id: requirement.id,
        label: requirement.label,
        satisfied: requirement.validate(trimmedPassword),
      })),
    [trimmedPassword]
  );

  const passwordValidationMessage = useMemo(() => {
    if (passwordMismatch) {
      return "As senhas não são iguais. Confira os campos.";
    }

    if (
      trimmedPassword.length > 0 &&
      trimmedConfirmPassword.length > 0 &&
      !isPasswordStrong(trimmedPassword)
    ) {
      return "A senha precisa atender a todos os requisitos de segurança.";
    }

    return null;
  }, [passwordMismatch, trimmedConfirmPassword, trimmedPassword]);

  const isDocumentValid = () => {
    if (!selectedType) {
      return false;
    }
    const maskType = selectedType === "company" ? "cnpj" : "cpf";
    return maskService.validate(formData.document, maskType);
  };

  const isPhoneValid = () => {
    return maskService.validate(formData.phone, "phone");
  };

  const isFormValid = () => {
    const { name, document, phone, email } = formData;

    // Verificar se todos os campos obrigatórios estão preenchidos
    const fieldsFilled = [
      name,
      document,
      phone,
      email,
      trimmedPassword,
      trimmedConfirmPassword,
    ].every((value) => value.trim() !== "");

    // Validações específicas
    const trimmedEmail = email.trim();
    const emailValid = maskService.validate(trimmedEmail, "email");
    const phoneValid = isPhoneValid();
    const documentValid = isDocumentValid();
    const passwordMatch = !passwordMismatch;
    const passwordValid = isPasswordStrong(trimmedPassword);
    const termsAccepted = acceptTerms;

    // Validação específica baseada no tipo de conta
    const isCompany = selectedType === "company";
    const documentTypeValid = isCompany
      ? maskService.validate(document, "cnpj")
      : maskService.validate(document, "cpf");

    return (
      fieldsFilled &&
      emailValid &&
      phoneValid &&
      documentValid &&
      documentTypeValid &&
      passwordMatch &&
      passwordValid &&
      termsAccepted
    );
  };

  const formatPhoneForApi = (phone: string): string => {
    const trimmed = phone.trim();

    if (!trimmed) {
      return "";
    }

    const digits = maskService.removeMask(trimmed, "phone");

    return digits;
  };

  const handleSignUp = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedType) {
      toastCustom.error("Selecione o tipo de conta para continuar.");
      return;
    }
    startTransition(async () => {
      const documentoLimpo = maskService.removeMask(
        formData.document,
        selectedType === "company" ? "cnpj" : "cpf"
      );
      const telefoneFormatado = formatPhoneForApi(formData.phone);
      const isCompanyAccount = selectedType === "company";
      const tipoUsuario: UsuarioRegisterPayload["tipoUsuario"] =
        isCompanyAccount ? "PESSOA_JURIDICA" : "PESSOA_FISICA";

      // Criar payload baseado no tipo selecionado
      const payloadForApi: UsuarioRegisterPayload = {
        nomeCompleto: formData.name.trim(),
        telefone: telefoneFormatado,
        email: formData.email.trim().toLowerCase(),
        senha: formData.password,
        confirmarSenha: formData.confirmPassword,
        aceitarTermos: acceptTerms,
        tipoUsuario,
        supabaseId: `temp-${Date.now()}-${Math.random()
          .toString(36)
          .substr(2, 9)}-${Math.random().toString(36).substr(2, 9)}`,
      };

      // Adicionar campos específicos baseados no tipo
      if (isCompanyAccount) {
        payloadForApi.cnpj = documentoLimpo;
        payloadForApi.cpf = undefined;
        payloadForApi.role = "EMPRESA";
      } else {
        payloadForApi.cpf = documentoLimpo;
        payloadForApi.cnpj = undefined;
        payloadForApi.role = "ALUNO_CANDIDATO";
      }

      const maskedPayloadForLog: Record<string, unknown> = {
        ...payloadForApi,
        documento: maskSensitiveValue(documentoLimpo),
        telefone: maskSensitiveValue(telefoneFormatado),
        email: maskEmail(payloadForApi.email),
        senha: `***(${payloadForApi.senha.length} chars)`,
        confirmarSenha: `***(${payloadForApi.confirmarSenha.length} chars)`,
        supabaseId: maskSensitiveValue(payloadForApi.supabaseId || ""),
        cpf: payloadForApi.cpf
          ? maskSensitiveValue(payloadForApi.cpf)
          : undefined,
        cnpj: payloadForApi.cnpj
          ? maskSensitiveValue(payloadForApi.cnpj)
          : undefined,
      };

      try {
        const response = await registerUser(payloadForApi);

        if (response.success) {
          toastCustom.success(
            response.message ||
              "Cadastro realizado com sucesso! Verifique seu email para confirmar."
          );
          resetForm();
          // Redirecionar imediatamente para a tela de login
          window.location.href = "https://auth.advancemais.com/login";
        } else {
          // Tratar erros da API
          let errorMessage =
            response.message || "Não foi possível realizar o cadastro.";

          // Verificar se há erros específicos de validação
          if (
            "errors" in response &&
            response.errors &&
            response.errors.length > 0
          ) {
            const firstError = response.errors[0];
            errorMessage = firstError.message;
          }

          toastCustom.error(errorMessage);
        }
      } catch (error) {
        console.error("Erro ao cadastrar:", error);
        let message = "Não foi possível realizar o cadastro.";

        // Tratar erros de rede ou parsing
        if (error instanceof Error) {
          const msg = error.message.toLowerCase();
          if (msg.includes("cpf")) {
            message = "CPF já cadastrado.";
          } else if (msg.includes("cnpj")) {
            message = "CNPJ já cadastrado.";
          } else if (msg.includes("email")) {
            message = "Email já cadastrado.";
          } else if (msg.includes("usuario") || msg.includes("usuário")) {
            message = "Usuário já cadastrado, por favor faça login.";
          } else if ((error as any).status === 409) {
            message = "Usuário já cadastrado, por favor faça login.";
          } else if ((error as any).status === 429) {
            message = "Muitas tentativas. Tente novamente mais tarde.";
          } else if ((error as any).status === 400) {
            message =
              "Dados inválidos. Verifique as informações e tente novamente.";
          }
        }

        toastCustom.error(message);
      }
    });
  };

  const renderForm = () => {
    if (!selectedType) return null;
    const isCompany = selectedType === "company";

    return (
      <form onSubmit={handleSignUp} className="space-y-5 sm:space-y-6">
        {/* Cabeçalho centralizado com botão à direita */}
        <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-3">
          <div className="hidden sm:block" />
          <div className="text-center space-y-1">
            <div className="flex items-center justify-center gap-2 mb-2">
              <h1 className="!text-2xl sm:text-xl md:text-2xl !mb-0 font-semibold text-gray-900 leading-tight">
                Criar conta como{" "}
                {userTypes.find((type) => type.id === selectedType)?.title}
              </h1>
            </div>
            <p className="sm:text-sm text-gray-500">
              {userTypes.find((type) => type.id === selectedType)?.description}
            </p>
          </div>
          <div className="flex justify-end">
            <ButtonCustom
              onClick={resetForm}
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
          {/* Nome + Documento na mesma linha */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputCustom
              label={isCompany ? "Nome da empresa" : "Nome completo"}
              name="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder={
                isCompany ? "Digite o nome da sua empresa" : "Digite seu nome"
              }
              size="md"
              className="text-sm"
              required
            />
            <InputCustom
              label={isCompany ? "CNPJ" : "CPF"}
              name="document"
              value={formData.document}
              onChange={(e) => handleInputChange("document", e.target.value)}
              mask={isCompany ? "cnpj" : "cpf"}
              placeholder={isCompany ? "00.000.000/0000-00" : "000.000.000-00"}
              size="md"
              className="text-sm"
              required
            />
          </div>

          <div className="space-y-3 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-4">
            <InputCustom
              label="Telefone/Whatsapp"
              name="phone"
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              mask="phone"
              placeholder="(00) 00000-0000"
              size="md"
              className="text-sm"
              required
            />

            <InputCustom
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              mask="email"
              placeholder="seuemail@email.com"
              size="md"
              className="text-sm"
              required
            />
          </div>

          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <InputCustom
                label="Senha"
                name="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                placeholder="••••••••"
                showPasswordToggle
                size="md"
                className="text-sm"
                required
              />

              <InputCustom
                label="Confirmar senha"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) =>
                  handleInputChange("confirmPassword", e.target.value)
                }
                placeholder="••••••••"
                showPasswordToggle
                size="md"
                className="text-sm"
                error={
                  passwordMismatch
                    ? "As senhas não são iguais. Confira os campos."
                    : undefined
                }
                required
              />
            </div>

            <div className="rounded-2xl border border-gray-200 bg-gray-100/30 p-4">
              <p className="!mb-0 text-sm">Sua senha deve conter:</p>
              <ul className="mt-2 space-y-2 text-left text-sm">
                {satisfiedRequirements.map((requirement) => (
                  <li key={requirement.id} className="flex items-center gap-2">
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

            {passwordValidationMessage && (
              <p
                className="text-sm font-medium text-destructive"
                role="alert"
                aria-live="assertive"
              >
                {passwordValidationMessage}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-start space-x-2.5 pt-1">
          <Checkbox
            id="terms"
            checked={acceptTerms}
            onCheckedChange={(v) => setAcceptTerms(!!v)}
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
          </Label>
        </div>

        <div className="space-y-3">
          <ButtonCustom
            type="submit"
            fullWidth
            size="md"
            variant="primary"
            className="h-10 sm:h-11 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-sm"
            disabled={!isFormValid() || isPending}
            isLoading={isPending}
            loadingText={`Criando conta ${
              selectedType === "company"
                ? "da empresa"
                : selectedType === "student"
                ? "do aluno"
                : "do candidato"
            }...`}
          >
            Criar conta
          </ButtonCustom>

          {isPending && (
            <div className="text-center">
              <p className="text-sm text-gray-500">
                Enviando dados para{" "}
                {selectedType === "company"
                  ? "cadastro de empresa"
                  : selectedType === "student"
                  ? "cadastro de aluno"
                  : "cadastro de candidato"}
                ...
              </p>
            </div>
          )}
        </div>
      </form>
    );
  };

  return (
    <div className="min-h-[100dvh] w-full bg-white font-geist flex flex-col">
      {/* Header com logo centralizada */}
      <header className="w-full border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-6 flex justify-center">
          <Image
            src="/images/logos/logo_padrao.webp"
            alt="Logo"
            width={120}
            height={40}
            priority
            className="object-contain"
          />
        </div>
      </header>

      <main className="flex-1">
        <section className="flex items-center justify-center px-6 py-24">
          <div className="w-full max-w-5xl">
            {!selectedType ? (
              <div className="space-y-6 md:space-y-8">
                <div className="space-y-1 sm:space-y-2">
                  <h1 className="sm:text-4xl font-semibold text-[var(--primary-color)] text-center !mb-0">
                    Criar conta
                  </h1>
                  <p className="!text-gray-500 text-sm md:text-base leading-relaxed text-center">
                    Escolha o tipo de conta que melhor se adequa ao seu perfil.
                  </p>
                </div>

                {/* Grid 3 colunas no desktop, responsivo */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6 items-stretch">
                  {userTypes.map((type) => {
                    const Icon = type.icon;
                    const styles =
                      typeStyles[type.id as keyof typeof typeStyles];
                    return (
                      <div
                        key={type.id}
                        className={`group flex flex-col items-center text-center rounded-2xl border border-transparent bg-[var(--primary-color)] text-white p-6 md:p-8 shadow-sm transition-all duration-150 focus-within:ring-2 focus-within:ring-offset-2 ${styles.ring} h-full min-h-[300px] md:min-h-[320px] cursor-pointer hover:shadow-md hover:-translate-y-0.5`}
                        role="button"
                        tabIndex={0}
                        onClick={() => setSelectedType(type.id as SelectedType)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setSelectedType(type.id as SelectedType);
                          }
                        }}
                      >
                        <div className="grid place-items-center size-14 rounded-xl bg-[var(--secondary-color)] text-white mb-4">
                          <Icon className="size-6" />
                        </div>
                        <h2
                          id={`type-${type.id}-title`}
                          className="md:text-xl font-semibold"
                        >
                          {type.title}
                        </h2>
                        <p
                          id={`type-${type.id}-desc`}
                          className="mt-2 !text-sm !text-white/70 min-h-[2.75rem] flex-1 !leading-normal"
                        >
                          {type.description}
                        </p>
                        <div className="w-full flex justify-center">
                          <ButtonCustom
                            type="button"
                            onClick={() =>
                              setSelectedType(type.id as SelectedType)
                            }
                            variant="secondary"
                            size="md"
                            className="mt-5 w-full sm:w-auto"
                            aria-label={`Escolher ${type.title}`}
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
                      href="https://auth.advancemais.com/login"
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
                      href="https://auth.advancemais.com/login"
                      className="hover:opacity-100 transition-colors text-[var(--primary-color)] cursor-pointer opacity-70 font-semibold"
                    >
                      Fazer login
                    </a>
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Footer minimalista */}
      <footer className="bg-[var(--color-blue)] text-white/80 py-8">
        <div className="max-w-5xl mx-auto px-6 text-center space-y-3">
          <p className="sm:text-sm tracking-wide !text-white">
            Todos os direitos reservados © {new Date().getFullYear()}{" "}
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
            <span
              className="h-4 w-px bg-blue-800/50 self-center"
              aria-hidden
            ></span>
            <a
              href="http://advancemais.com/termos-uso"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors px-3"
            >
              Termos de Uso
            </a>
            <span
              className="h-4 w-px bg-blue-800/20 self-center"
              aria-hidden
            ></span>
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
