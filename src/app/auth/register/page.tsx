"use client";

import { useEffect, useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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
    const savedType = localStorage.getItem("registerSelectedType") as SelectedType;
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
    } else {
      setPasswordError("");
    }
  }, [formData.password, formData.confirmPassword]);

  const userTypes = [
    {
      id: "student",
      title: "Aluno",
      icon: GraduationCap,
      description: "Acesso a cursos e conteúdos educacionais",
      color: "from-emerald-500 to-teal-600",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-200",
      hoverBg: "hover:bg-emerald-100",
    },
    {
      id: "candidate",
      title: "Candidato",
      icon: User,
      description: "Busca por oportunidades de carreira",
      color: "from-blue-500 to-indigo-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      hoverBg: "hover:bg-blue-100",
    },
    {
      id: "company",
      title: "Empresa",
      icon: Building,
      description: "Publicação de vagas e busca por talentos",
      color: "from-red-500 to-rose-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      hoverBg: "hover:bg-red-100",
    },
  ];

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
    return selectedType === "company" ? clean.length === 14 : clean.length === 11;
  };

  const isPhoneValid = () => {
    const clean = formData.phone.replace(/\D/g, "");
    return clean.length >= 10 && clean.length <= 11;
  };

  const isFormValid = () => {
    const { name, document, phone, email, password, confirmPassword } = formData;
    const fieldsFilled = [name, document, phone, email, password, confirmPassword].every(
      (value) => value.trim() !== ""
    );

    return (
      fieldsFilled &&
      maskService.validate(email, "email") &&
      isPhoneValid() &&
      isDocumentValid() &&
      password === confirmPassword &&
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
          window.location.href = "/auth/login";
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
      <motion.form
        onSubmit={handleSignUp}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        className="space-y-4 sm:space-y-6"
      >
        <div className="flex items-start justify-between flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <div className="space-y-1">
            <h1 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 leading-tight">
              Criar conta como {userTypes.find((type) => type.id === selectedType)?.title}
            </h1>
            <p className="text-xs sm:text-sm text-gray-500">
              {userTypes.find((type) => type.id === selectedType)?.description}
            </p>
          </div>
          <ButtonCustom
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={resetForm}
            type="button"
            variant="ghost"
            size="sm"
            icon="ArrowLeft"
            className="text-xs sm:text-sm text-gray-500 hover:text-gray-700 transition-all duration-200 p-2 rounded-lg hover:bg-gray-100 cursor-pointer self-end sm:self-auto"
          >
            Voltar
          </ButtonCustom>
        </div>

        <div className="space-y-3 sm:space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <InputCustom
              label={isCompany ? "Nome da empresa" : "Nome completo"}
              name="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder={isCompany ? "Advance Tecnologia" : "João Silva"}
              size="sm"
              className="text-sm"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <InputCustom
              label={isCompany ? "CNPJ" : "CPF"}
              name="document"
              value={formData.document}
              onChange={(e) => handleInputChange("document", e.target.value)}
              mask={isCompany ? "cnpj" : "cpf"}
              placeholder={isCompany ? "00.000.000/0000-00" : "000.000.000-00"}
              size="sm"
              className="text-sm"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-3 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-4"
          >
            <InputCustom
              label="Telefone"
              name="phone"
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              mask="phone"
              placeholder="(11) 99999-9999"
              size="sm"
              className="text-sm"
            />

            <InputCustom
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              mask="email"
              placeholder="joao@email.com"
              size="sm"
              className="text-sm"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="space-y-3 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-4"
          >
            <InputCustom
              label="Senha"
              name="password"
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              placeholder="••••••••"
              showPasswordToggle
              size="sm"
              className="text-sm"
            />

              <InputCustom
                label="Confirmar senha"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                placeholder="••••••••"
                showPasswordToggle
                size="sm"
                className="text-sm"
                error={passwordError}
              />
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-start space-x-2.5 pt-1"
        >
          <Checkbox
            id="terms"
            checked={acceptTerms}
            onCheckedChange={(v) => setAcceptTerms(!!v)}
          />
          <Label
            htmlFor="terms"
            className="text-xs sm:text-sm text-gray-600 leading-5 cursor-pointer"
          >
            Li e aceito os{" "}
            <a
              href="http://advancemais.com/termos-uso"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline font-medium cursor-pointer"
            >
              Termos de Uso
            </a>, a{" "}
            <a
              href="http://advancemais.com/politica-privacidade"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline font-medium cursor-pointer"
            >
              Política de Privacidade
            </a>{" "}e autorizo o uso das minhas informações conforme descrito.
          </Label>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
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
        </motion.div>
      </motion.form>
    );
  };

  return (
    <div className="h-[100dvh] flex flex-col md:flex-row font-geist w-[100dvw] bg-white">
      <section className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md sm:max-w-lg">
          <AnimatePresence mode="wait">
            {!selectedType ? (
              <motion.div
                key="selection"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                className="space-y-3 sm:space-y-6 md:space-y-8"
              >
                <div className="space-y-1 sm:space-y-2">
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
                    Criar conta
                  </h1>
                  <p className="text-gray-600 text-xs sm:text-sm md:text-base leading-relaxed">
                    Escolha o tipo de conta que melhor se adequa ao seu perfil
                  </p>
                </div>

                <div className="space-y-4 sm:space-y-6 md:space-y-8">
                  {userTypes.map((type, index) => {
                    const Icon = type.icon;
                    return (
                      <ButtonCustom
                        key={type.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          delay: index * 0.1,
                          duration: 0.4,
                          ease: [0.4, 0, 0.2, 1],
                        }}
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() =>
                          setSelectedType(type.id as SelectedType)
                        }
                        className={`w-full px-5 py-4 sm:px-6 sm:py-5 md:px-7 md:py-6 rounded-xl sm:rounded-2xl border-2 ${type.borderColor} ${type.bgColor} ${type.hoverBg} transition-all duration-300 text-left group shadow-sm hover:shadow-md cursor-pointer flex items-center justify-between`}
                      >
                        <div className="flex items-center space-x-6 sm:space-x-7 md:space-x-8">
                          <motion.div
                            whileHover={{ rotate: 5 }}
                            className={`p-1.5 sm:p-2.5 md:p-3 rounded-lg sm:rounded-xl bg-gradient-to-r ${type.color} shadow-sm`}
                          >
                            <Icon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
                          </motion.div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                              {type.title}
                            </h3>
                            <p className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1 leading-relaxed">
                              {type.description}
                            </p>
                          </div>
                        </div>
                        <motion.div
                          whileHover={{ x: 3 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                        </motion.div>
                      </ButtonCustom>
                    );
                  })}
                </div>

                <div className="pt-2 sm:pt-4 text-center">
                  <p className="text-xs sm:text-sm text-gray-600">
                    Já possui uma conta?{" "}
                    <a
                      href="/auth/login"
                      className="text-blue-600 hover:text-blue-700 font-medium cursor-pointer hover:underline transition-all duration-200"
                    >
                      Fazer login
                    </a>
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
              >
                {renderForm()}

                <div className="pt-3 sm:pt-6 text-center">
                  <p className="text-xs sm:text-sm text-gray-600">
                    Já possui uma conta?{" "}
                    <a
                      href="/auth/login"
                      className="text-blue-600 hover:text-blue-700 font-medium cursor-pointer hover:underline transition-all duration-200"
                    >
                      Fazer login
                    </a>
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
      <section className="hidden md:block flex-1 relative p-4">
        <div
          className="animate-slide-right animate-delay-300 absolute inset-4 rounded-3xl bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1642615835477-d303d7dc9ee9?w=2160&q=80')",
          }}
        ></div>
      </section>
      <OfflineModal />
    </div>
  );
};

export default RegisterPage;

