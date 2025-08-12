"use client";

import React, { useRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

interface SignUpPageProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  heroImageSrc?: string;
  onSignUp?: (event: React.FormEvent<HTMLFormElement>) => void;
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
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [tipoUsuario, setTipoUsuario] = useState<
    "PESSOA_FISICA" | "PESSOA_JURIDICA"
  >("PESSOA_FISICA");
  const [documento, setDocumento] = useState("");
  const [telefone, setTelefone] = useState("");
  const [aceitarTermos, setAceitarTermos] = useState(false);
  const [step, setStep] = useState(1);
  const formRef = useRef<HTMLFormElement>(null);

  const handleNextStep = () => {
    if (formRef.current?.reportValidity()) {
      setStep(2);
    }
  };

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
    <div className="h-[100dvh] flex flex-col md:flex-row font-geist w-[100dvw]">
      <section className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="flex flex-col gap-6">
            <h1 className="animate-element animate-delay-100 text-4xl md:text-5xl font-semibold leading-tight">
              {title}
            </h1>
            {description && (
              <p className="animate-element animate-delay-200 text-muted-foreground">
                {description}
              </p>
            )}

            <form ref={formRef} className="space-y-5" onSubmit={onSignUp}>
              <div className={step === 1 ? "space-y-5" : "hidden"}>
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

                <div className="animate-element animate-delay-300">
                  <label className="text-sm font-medium text-muted-foreground">
                    Tipo de usuário
                  </label>
                  <GlassInputWrapper>
                    <select
                      name="tipoUsuario"
                      value={tipoUsuario}
                      onChange={(e) =>
                        setTipoUsuario(
                          e.target.value as "PESSOA_FISICA" | "PESSOA_JURIDICA"
                        )
                      }
                      className="w-full bg-transparent text-sm p-4 rounded-2xl focus:outline-none"
                    >
                      <option value="PESSOA_FISICA">Pessoa Física</option>
                      <option value="PESSOA_JURIDICA">Pessoa Jurídica</option>
                    </select>
                  </GlassInputWrapper>
                </div>

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

                <button
                  type="button"
                  onClick={handleNextStep}
                  className="animate-element animate-delay-600 w-full rounded-2xl bg-primary py-4 font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Continuar
                </button>
              </div>

              {step === 2 && (
                <div className="space-y-5">
                  {isPessoaFisica && (
                    <>
                      <div className="animate-element animate-delay-300">
                        <label className="text-sm font-medium text-muted-foreground">
                          Data de nascimento
                        </label>
                        <GlassInputWrapper>
                          <input
                            name="dataNasc"
                            type="date"
                            required
                            className="w-full bg-transparent text-sm p-4 rounded-2xl focus:outline-none"
                          />
                        </GlassInputWrapper>
                      </div>
                      <div className="animate-element animate-delay-300">
                        <label className="text-sm font-medium text-muted-foreground">
                          Gênero
                        </label>
                        <GlassInputWrapper>
                          <select
                            name="genero"
                            required
                            className="w-full bg-transparent text-sm p-4 rounded-2xl focus:outline-none"
                          >
                            <option value="MASCULINO">Masculino</option>
                            <option value="FEMININO">Feminino</option>
                            <option value="OUTRO">Outro</option>
                            <option value="NAO_INFORMAR">Prefiro não informar</option>
                          </select>
                        </GlassInputWrapper>
                      </div>
                    </>
                  )}

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
                          className="absolute inset-y-0 right-3 flex items-center"
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
                          className="absolute inset-y-0 right-3 flex items-center"
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
                      className="text-foreground/90"
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
                    className="animate-element animate-delay-600 w-full rounded-2xl bg-primary py-4 font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    Cadastrar
                  </button>
                </div>
              )}
            </form>

            <p className="animate-element animate-delay-700 text-center text-sm text-muted-foreground">
              Já possui conta?{" "}
              <a
                href="/auth/login"
                className="text-violet-400 hover:underline transition-colors"
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
            className="animate-slide-right animate-delay-300 absolute inset-4 rounded-3xl bg-cover bg-center"
            style={{ backgroundImage: `url(${heroImageSrc})` }}
          ></div>
        </section>
      )}
    </div>
  );
};

