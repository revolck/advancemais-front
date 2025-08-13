"use client";

import React, { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SignUpPageProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  heroImageSrc?: string;
  onSignUp?: (event: React.FormEvent<HTMLFormElement>) => void;
  isLoading?: boolean;
  defaultTipoUsuario?: "PESSOA_FISICA" | "PESSOA_JURIDICA";
  showUserTypeSelect?: boolean;
  onBack?: () => void;
}

const GlassInputWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-2xl border border-border bg-foreground/5 backdrop-blur-sm transition-colors focus-within:border-violet-400/70 focus-within:bg-violet-500/10">
    {children}
  </div>
);

export const SignUpPage: React.FC<SignUpPageProps> = ({
  title = (
    <span className="font-light text-foreground tracking-tighter">
      Crie sua conta
    </span>
  ),
  description,
  heroImageSrc,
  onSignUp,
  isLoading,
  defaultTipoUsuario = "PESSOA_FISICA",
  showUserTypeSelect = true,
  onBack,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [tipoUsuario, setTipoUsuario] = useState<
    "PESSOA_FISICA" | "PESSOA_JURIDICA"
  >(defaultTipoUsuario);
  const [documento, setDocumento] = useState("");
  const [telefone, setTelefone] = useState("");
  const [aceitarTermos, setAceitarTermos] = useState(false);

  const handleDocumentoChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const digits = e.target.value
      .replace(/\D/g, "")
      .slice(0, tipoUsuario === "PESSOA_FISICA" ? 11 : 14);
    const formatted =
      tipoUsuario === "PESSOA_FISICA"
        ? digits
            .replace(/(\d{3})(\d)/, "$1.$2")
            .replace(/(\d{3})(\d)/, "$1.$2")
            .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
        : digits
            .replace(/(\d{2})(\d)/, "$1.$2")
            .replace(/(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
            .replace(/\.(\d{3})(\d)/, ".$1/$2")
            .replace(/(\d{4})(\d)/, "$1-$2");
    setDocumento(formatted);
  };

  const handleTelefoneChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 11);
    const formatted = digits
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2");
    setTelefone(formatted);
  };

  const isPessoaFisica = tipoUsuario === "PESSOA_FISICA";

  return (
    <div className="relative h-[100dvh] flex flex-col md:flex-row font-geist w-[100dvw] text-foreground">
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="absolute left-4 top-4 text-sm text-[var(--color-blue)] hover:underline"
        >
          Voltar
        </button>
      )}
      <section className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white/90 backdrop-blur-md p-8 rounded-3xl shadow-xl">
          <div className="flex flex-col gap-6">
            <h1 className="animate-element animate-delay-100 text-4xl md:text-5xl font-semibold leading-tight">
              {title}
            </h1>
            {description && (
              <p className="animate-element animate-delay-200 text-muted-foreground">
                {description}
              </p>
            )}

            <form className="space-y-5" onSubmit={onSignUp}>
              <div className="animate-element animate-delay-300">
                <label className="text-sm font-medium text-muted-foreground">
                  Nome completo
                </label>
                <GlassInputWrapper>
                  <input
                    name="nomeCompleto"
                    type="text"
                    required
                    placeholder="Digite seu nome completo"
                    className="w-full bg-transparent text-sm p-4 rounded-2xl focus:outline-none"
                  />
                </GlassInputWrapper>
              </div>

              {showUserTypeSelect && (
                <div className="animate-element animate-delay-300">
                  <label className="text-sm font-medium text-muted-foreground">
                    Tipo de usuário
                  </label>
                  <GlassInputWrapper>
                    <Select
                      value={tipoUsuario}
                      onValueChange={(v) =>
                        setTipoUsuario(
                          v as "PESSOA_FISICA" | "PESSOA_JURIDICA"
                        )
                      }
                    >
                      <SelectTrigger className="w-full bg-transparent text-sm p-4 rounded-2xl focus:outline-none cursor-pointer">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PESSOA_FISICA">Pessoa Física</SelectItem>
                        <SelectItem value="PESSOA_JURIDICA">Pessoa Jurídica</SelectItem>
                      </SelectContent>
                    </Select>
                  </GlassInputWrapper>
                </div>
              )}
              <input type="hidden" name="tipoUsuario" value={tipoUsuario} />

              <div className="animate-element animate-delay-300">
                <label className="text-sm font-medium text-muted-foreground">
                  {isPessoaFisica ? "CPF" : "CNPJ"}
                </label>
                <GlassInputWrapper>
                  <input
                    name="documento"
                    type="text"
                    required
                    value={documento}
                    onChange={handleDocumentoChange}
                    placeholder={
                      isPessoaFisica ? "Digite seu CPF" : "Digite seu CNPJ"
                    }
                    className="w-full bg-transparent text-sm p-4 rounded-2xl focus:outline-none"
                  />
                </GlassInputWrapper>
              </div>

              <div className="animate-element animate-delay-300">
                <label className="text-sm font-medium text-muted-foreground">
                  Telefone
                </label>
                <GlassInputWrapper>
                  <input
                    name="telefone"
                    type="text"
                    required
                    value={telefone}
                    onChange={handleTelefoneChange}
                    placeholder="Digite seu telefone"
                    className="w-full bg-transparent text-sm p-4 rounded-2xl focus:outline-none"
                  />
                </GlassInputWrapper>
              </div>

              <div className="animate-element animate-delay-300">
                <label className="text-sm font-medium text-muted-foreground">
                  Email
                </label>
                <GlassInputWrapper>
                  <input
                    name="email"
                    type="email"
                    required
                    placeholder="Digite seu email"
                    className="w-full bg-transparent text-sm p-4 rounded-2xl focus:outline-none"
                  />
                </GlassInputWrapper>
              </div>

              <div className="animate-element animate-delay-400">
                <label className="text-sm font-medium text-muted-foreground">
                  Senha
                </label>
                <GlassInputWrapper>
                  <div className="relative">
                    <input
                      name="senha"
                      type={showPassword ? "text" : "password"}
                      placeholder="Digite sua senha"
                      className="w-full bg-transparent text-sm p-4 pr-12 rounded-2xl focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-3 flex items-center cursor-pointer"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
                      ) : (
                        <Eye className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
                      )}
                    </button>
                  </div>
                </GlassInputWrapper>
              </div>

              <div className="animate-element animate-delay-400">
                <label className="text-sm font-medium text-muted-foreground">
                  Confirmar senha
                </label>
                <GlassInputWrapper>
                  <div className="relative">
                    <input
                      name="confirmarSenha"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirme sua senha"
                      className="w-full bg-transparent text-sm p-4 pr-12 rounded-2xl focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute inset-y-0 right-3 flex items-center cursor-pointer"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
                      ) : (
                        <Eye className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
                      )}
                    </button>
                  </div>
                </GlassInputWrapper>
              </div>

              <div className="animate-element animate-delay-500 flex items-center text-sm gap-3">
                <Checkbox
                  id="aceitarTermos"
                  checked={aceitarTermos}
                  onCheckedChange={(v) => setAceitarTermos(!!v)}
                />
                <label
                  htmlFor="aceitarTermos"
                  className="text-foreground/90 cursor-pointer"
                >
                  Aceito os termos de uso
                </label>
              </div>

              <input
                type="hidden"
                name="aceitarTermos"
                value={aceitarTermos ? "true" : "false"}
              />

              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-2xl bg-[var(--color-blue)] text-white py-4 font-medium hover:bg-[var(--color-blue)]/90 transition-colors flex items-center justify-center cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  "Cadastrar"
                )}
              </button>
            </form>

            <p className="animate-element animate-delay-700 text-center text-sm text-muted-foreground">
              Já possui conta?{" "}
              <a
                href="/auth/login"
                className="text-violet-400 hover:underline transition-colors cursor-pointer"
              >
                Entre
              </a>
            </p>
          </div>
        </div>
      </section>

      {heroImageSrc && (
      <section className="hidden md:block flex-1 relative p-4">
        <div
          className="animate-slide-right animate-delay-300 absolute inset-4 rounded-3xl bg-cover bg-center shadow-xl overflow-hidden"
          style={{ backgroundImage: `url(${heroImageSrc})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-black/20" />
        </div>
      </section>
      )}
    </div>
  );
};

