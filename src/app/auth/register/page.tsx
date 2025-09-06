"use client";

import { useEffect, useState, useTransition } from "react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/radix-checkbox";
import {
  InputCustom,
  ButtonCustom,
  toastCustom,
  OfflineModal,
} from "@/components/ui/custom";
import { GraduationCap, User, Building, ChevronRight } from "lucide-react";
import { apiFetch } from "@/api/client";
import { usuarioRoutes } from "@/api/routes";
import { MaskService } from "@/services";
import Image from "next/image";

type SelectedType = "student" | "candidate" | "company" | null;

const RegisterPage = () => {
  const initialFormData = {
    name: "",
    document: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  };

  const [selectedType, setSelectedType] = useState<SelectedType>(null);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState(initialFormData);
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    const savedForm = localStorage.getItem("registerFormData");
    const savedType = localStorage.getItem(
      "registerSelectedType"
    ) as SelectedType;
    if (savedForm) {
      setFormData(JSON.parse(savedForm));
    }
    if (savedType) {
      setSelectedType(savedType);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("registerFormData", JSON.stringify(formData));
  }, [formData]);

  useEffect(() => {
    if (selectedType) {
      localStorage.setItem("registerSelectedType", selectedType);
    }
  }, [selectedType]);

  useEffect(() => {
    if (
      formData.password &&
      formData.confirmPassword &&
      formData.password !== formData.confirmPassword
    ) {
      setPasswordError("As senhas não coincidem");
    } else if (formData.password && !isPasswordValid(formData.password)) {
      setPasswordError(
        "A senha deve conter letras maiúsculas, minúsculas e caracteres especiais"
      );
    } else {
      setPasswordError("");
    }
  }, [formData.password, formData.confirmPassword]);

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

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setSelectedType(null);
    setFormData(initialFormData);
    localStorage.removeItem("registerFormData");
    localStorage.removeItem("registerSelectedType");
  };

  const isDocumentValid = () => {
    const clean = formData.document.replace(/\D/g, "");
    return selectedType === "company"
      ? clean.length === 14
      : clean.length === 11;
  };

  const isPhoneValid = () => {
    const clean = formData.phone.replace(/\D/g, "");
    return clean.length >= 10 && clean.length <= 11;
  };

  const isPasswordValid = (password: string) => {
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);
    return hasUpper && hasLower && hasSpecial;
  };

  const isFormValid = () => {
    const { name, document, phone, email, password, confirmPassword } =
      formData;
    const fieldsFilled = [
      name,
      document,
      phone,
      email,
      password,
      confirmPassword,
    ].every((value) => value.trim() !== "");

    return (
      fieldsFilled &&
      maskService.validate(email, "email") &&
      isPhoneValid() &&
      isDocumentValid() &&
      password === confirmPassword &&
      isPasswordValid(password) &&
      acceptTerms
    );
  };

  const handleSignUp = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    startTransition(async () => {
      const documentoLimpo = formData.document.replace(/\D/g, "");
      const telefoneLimpo = formData.phone.replace(/\D/g, "");
      const tipoUsuario =
        selectedType === "company" ? "PESSOA_JURIDICA" : "PESSOA_FISICA";
      const payload: any = {
        nomeCompleto: formData.name,
        telefone: telefoneLimpo,
        email: formData.email,
        senha: formData.password,
        confirmarSenha: formData.confirmPassword,
        aceitarTermos: acceptTerms,
        supabaseId: crypto.randomUUID(),
        tipoUsuario,
      };
      if (tipoUsuario === "PESSOA_FISICA") {
        payload.cpf = documentoLimpo;
      } else {
        payload.cnpj = documentoLimpo;
      }
      try {
        await apiFetch(usuarioRoutes.register(), {
          cache: "no-cache",
          init: {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          },
          retries: 1,
        });
        toastCustom.success(
          "Cadastro realizado com sucesso! Verifique seu email para confirmar."
        );
        setTimeout(() => {
          window.location.href = "https://auth.advancemais.com/login";
        }, 1000);
      } catch (error) {
        console.error("Erro ao cadastrar:", error);
        let message = "Não foi possível realizar o cadastro.";
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
            <h1 className="!text-2xl sm:text-xl md:text-2xl !mb-0 font-semibold text-gray-900 leading-tight">
              Criar conta como{" "}
              {userTypes.find((type) => type.id === selectedType)?.title}
            </h1>
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
              label="Telefone"
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

          <div className="space-y-3 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-4">
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
              error={passwordError}
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
              error={passwordError}
              required
            />
          </div>
        </div>

        <div className="flex items-start space-x-2.5 pt-1">
          <Checkbox
            id="terms"
            checked={acceptTerms}
            onCheckedChange={(v) => setAcceptTerms(!!v)}
            required
          />
          <Label
            htmlFor="terms"
            className="sm:text-sm text-gray-600 leading-5 cursor-pointer"
          >
            Li e aceito os{" "}
            <a
              href="http://advancemais.com/termos-uso"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline font-medium cursor-pointer"
            >
              Termos de Uso
            </a>
            , a{" "}
            <a
              href="http://advancemais.com/politica-privacidade"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline font-medium cursor-pointer"
            >
              Política de Privacidade
            </a>{" "}
            e autorizo o uso das minhas informações conforme descrito.
          </Label>
        </div>

        <div>
          <ButtonCustom
            type="submit"
            fullWidth
            size="md"
            variant="primary"
            className="h-10 sm:h-11 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-sm"
            disabled={!isFormValid() || isPending}
            isLoading={isPending}
            loadingText="Criando..."
          >
            Criar conta
          </ButtonCustom>
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

      <OfflineModal />
    </div>
  );
};

export default RegisterPage;
