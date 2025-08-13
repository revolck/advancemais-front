"use client";

import { useState, useTransition } from "react";
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

type SelectedType = "student" | "candidate" | "company" | null;

const RegisterPage = () => {
  const [selectedType, setSelectedType] = useState<SelectedType>(null);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState({
    name: "",
    document: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

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

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const isFormValid = () => {
    return (
      Object.values(formData).every((value) => value.trim() !== "") &&
      formData.password === formData.confirmPassword &&
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
        const message =
          error instanceof Error && /409/.test(error.message)
            ? "Usuário já cadastrado, por favor faça login."
            : "Não foi possível realizar o cadastro.";
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
          {/* Animate externally to avoid passing motion props to ButtonCustom */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <ButtonCustom
              onClick={() => setSelectedType(null)}
              type="button"
              variant="ghost"
              size="sm"
              icon="ArrowLeft"
              withAnimation={false}
              className="text-xs sm:text-sm text-gray-500 hover:text-gray-700 transition-all duration-200 p-2 rounded-lg hover:bg-gray-100 cursor-pointer self-end sm:self-auto"
            >
              Voltar
            </ButtonCustom>
          </motion.div>
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
            className="mt-0.5 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 cursor-pointer"
          />
          <Label
            htmlFor="terms"
            className="text-xs sm:text-sm text-gray-600 leading-5 cursor-pointer"
          >
            Aceito os{" "}
            <a
              href="#"
              className="text-blue-600 hover:underline font-medium cursor-pointer"
            >
              termos de uso
            </a>{" "}
            e{" "}
            <a
              href="#"
              className="text-blue-600 hover:underline font-medium cursor-pointer"
            >
              política de privacidade
            </a>
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
    <div className="min-h-screen bg-white">
      <div className="absolute top-2 sm:top-4 md:top-6 left-3 sm:left-4 md:left-6 z-20">
        <div className="flex items-center space-x-1.5 sm:space-x-2">
          <div className="w-5 h-5 sm:w-7 sm:h-7 md:w-8 md:h-8 bg-gradient-to-r from-blue-600 to-red-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xs">A+</span>
          </div>
          <span className="text-sm sm:text-lg md:text-xl font-bold text-gray-900">ADVANCE</span>
        </div>
      </div>

      <div className="min-h-screen flex flex-col lg:flex-row">
        <div className="flex-1 flex items-center justify-center px-3 sm:px-6 md:px-8 py-3 sm:py-8 md:py-12 pt-12 sm:pt-20 md:pt-12">
          <div className="w-full max-w-sm sm:max-w-md">
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

                  <div className="space-y-2 sm:space-y-3 md:space-y-4">
                    {userTypes.map((type, index) => {
                      const Icon = type.icon;
                      return (
                        // Wrap each card in motion.div so ButtonCustom stays animation-free
                        <motion.div
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
                        >
                          <ButtonCustom
                            onClick={() => setSelectedType(type.id as SelectedType)}
                            withAnimation={false}
                            className={`w-full p-2.5 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl border-2 ${type.borderColor} ${type.bgColor} ${type.hoverBg} transition-all duration-300 text-left group shadow-sm hover:shadow-md cursor-pointer flex items-center justify-between`}
                          >
                            <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4">
                              <motion.div
                                whileHover={{ rotate: 5 }}
                                className={`p-1.5 sm:p-2.5 md:p-3 rounded-lg sm:rounded-xl bg-gradient-to-r ${type.color} shadow-sm`}
                              >
                                <Icon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
                              </motion.div>
                              <div className="flex-1">
                                <h3 className="font-semibold text-gray-900 text-sm sm:text-base md:text-lg">
                                  {type.title}
                                </h3>
                                <p className="text-xs text-gray-600 mt-0.5 sm:mt-1 leading-relaxed">
                                  {type.description}
                                </p>
                              </div>
                            </div>
                            <motion.div
                              whileHover={{ x: 3 }}
                              transition={{ duration: 0.2 }}
                            >
                              <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                            </motion.div>
                          </ButtonCustom>
                        </motion.div>
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
        </div>

        <div
          className="hidden lg:flex flex-1 items-center justify-center p-12 relative"
          style={{
            backgroundImage:
              "linear-gradient(rgba(59, 130, 246, 0.8), rgba(37, 99, 235, 0.8)), url('/business-team-collaboration.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-lg text-center space-y-6 text-white"
          >
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ duration: 0.3 }}
              className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-2xl mx-auto flex items-center justify-center border border-white/30 cursor-pointer"
            >
              <span className="text-white font-bold text-3xl">A+</span>
            </motion.div>
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Conecte-se ao futuro</h2>
              <p className="text-white/90 leading-relaxed">
                Junte-se à plataforma que conecta talentos, empresas e oportunidades de crescimento profissional.
              </p>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="grid grid-cols-3 gap-4 pt-8"
            >
              {[{ value: "10k+", label: "Usuários" }, { value: "500+", label: "Empresas" }, { value: "1k+", label: "Vagas" }].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.1, duration: 0.3 }}
                  whileHover={{ scale: 1.1 }}
                  className="text-center cursor-pointer"
                >
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-sm text-white/80">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>
      <OfflineModal />
    </div>
  );
};

export default RegisterPage;

