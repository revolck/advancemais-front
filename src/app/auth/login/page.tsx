"use client";

import { useState, FormEvent, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { CheckboxCustom } from "@/components/ui/custom/checkbox";
import { InputCustom } from "@/components/ui/custom/input";
import { ButtonCustom } from "@/components/ui/custom/button";
import { DarkTheme } from "@/components/partials/darkTheme/darkTheme";

/**
 * Página de Login
 *
 * Implementa o fluxo de autenticação do usuário com validação de CPF e senha.
 */
export default function LoginPage() {
  // Estado do formulário
  const [formData, setFormData] = useState({
    cpf: "",
    senha: "",
  });

  // Estado de erros
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Estado de loading
  const [loading, setLoading] = useState(false);

  // Estado para animação de entrada
  const [isVisible, setIsVisible] = useState(false);

  // Trigger de animação na montagem do componente
  useEffect(() => {
    setIsVisible(true);
  }, []);

  /**
   * Handler para mudança nos campos do formulário
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Atualiza o valor do campo
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Limpa o erro quando o usuário começa a digitar
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  /**
   * Handler para envio do formulário
   */
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    // Validação básica
    const newErrors: Record<string, string> = {};

    if (!formData.cpf) {
      newErrors.cpf = "CPF é obrigatório";
    }

    if (!formData.senha) {
      newErrors.senha = "Senha é obrigatória";
    } else if (formData.senha.length < 6) {
      newErrors.senha = "A senha deve ter pelo menos 6 caracteres";
    }

    setErrors(newErrors);

    // Se não houver erros, processa o login
    if (Object.keys(newErrors).length === 0) {
      setLoading(true);

      // Aqui seria feita a chamada para a API de autenticação
      console.log("Login iniciado:", formData);

      // Simulação de API call
      setTimeout(() => {
        setLoading(false);
        // Redirecionamento ou tratamento de sucesso
      }, 1000);
    }
  };

  // Imagens de logotipo e imagem lateral podem não estar presentes no projeto
  // Vamos usar alternativas seguras
  const logoSrc = "/logo-white.svg";
  const bgImage = "/images/signup-collage.png";

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      {/* Theme Toggle - Posicionado no canto superior direito */}
      <div className="absolute top-4 right-4 z-10">
        <DarkTheme />
      </div>

      {/* Lado esquerdo - Formulário */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center px-6 py-12 bg-background transition-colors duration-300">
        <div
          className={`max-w-md w-full space-y-8 transition-all duration-500 ease-in-out transform ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          {/* Logo */}
          <div className="flex justify-center">
            <div className="text-2xl font-bold">Logo da Aplicação</div>
          </div>

          {/* Cabeçalho */}
          <div className="space-y-2 text-center lg:text-left mb-4">
            <h1 className="text-3xl font-bold text-foreground transition-colors duration-300 mb-0">
              Olá, Filipe.
            </h1>
            <p className="text-lg text-muted-foreground transition-colors duration-300">
              Que bom te ver de novo!
            </p>
          </div>

          {/* Formulário */}
          <div
            className={`space-y-6 transition-all duration-500 ease-in-out delay-100 transform ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-8 opacity-0"
            }`}
          >
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-5">
                {/* Input CPF */}
                <div className="space-y-2">
                  <InputCustom
                    label="CPF"
                    type="text"
                    name="cpf"
                    mask="cpf"
                    icon="User"
                    value={formData.cpf}
                    onChange={handleChange}
                    error={errors.cpf}
                    required
                    size="md"
                    disabled={loading}
                  />
                </div>

                {/* Input Senha */}
                <div className="space-y-2">
                  <InputCustom
                    label="Senha"
                    type="password"
                    name="senha"
                    icon="Lock"
                    showPasswordToggle
                    value={formData.senha}
                    onChange={handleChange}
                    error={errors.senha}
                    required
                    size="md"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Opções adicionais */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                <div className="flex items-center gap-2">
                  {/* <CheckboxCustom
                    label="Me mantenha na conta"
                    size="md"
                    variant="filled"
                    withAnimation={true}
                  /> */}
                </div>
                <Link
                  href="/auth/recuperar-senha"
                  className={`text-sm text-primary hover:text-primary/80 transition-colors duration-200 hover:underline ${
                    loading ? "pointer-events-none opacity-50" : ""
                  }`}
                  tabIndex={loading ? -1 : 0}
                  aria-disabled={loading}
                >
                  Esqueceu a senha?
                </Link>
              </div>

              {/* Botão de submissão - Agora usando ButtonCustom */}
              <ButtonCustom
                type="submit"
                variant="default"
                size="lg"
                fullWidth
                isLoading={loading}
                withAnimation={true}
                loadingText="Entrando..."
                iconPosition="right"
                icon="ArrowRight"
              >
                Entrar
              </ButtonCustom>
            </form>
          </div>

          {/* Termos */}
          <p
            className={`text-xs text-muted-foreground text-center transition-all duration-500 ease-in-out delay-200 transform ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-8 opacity-0"
            }`}
          >
            Ao continuar, você concorda com nossos{" "}
            <Link
              href="/termos"
              className="text-primary hover:underline transition-colors duration-200"
            >
              Termos de Serviço
            </Link>{" "}
            e{" "}
            <Link
              href="/privacidade"
              className="text-primary hover:underline transition-colors duration-200"
            >
              Política de Privacidade
            </Link>
            .
          </p>
        </div>
      </div>

      {/* Lado direito - Imagem */}
      <div className="hidden lg:block w-1/2 relative bg-gradient-to-br from-purple-500/90 to-blue-600/90">
        <div className="absolute inset-0 bg-black/30 z-0"></div>
        <div
          className={`w-full h-full bg-gray-700 ${
            isVisible ? "scale-100 opacity-80" : "scale-110 opacity-0"
          } transition-all duration-1000 ease-in-out`}
        >
          <div className="flex items-center justify-center h-full text-white text-xl">
            Imagem de background
          </div>
        </div>
      </div>
    </div>
  );
}
