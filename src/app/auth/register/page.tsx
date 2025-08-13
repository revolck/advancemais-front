"use client";

import { useState, useTransition } from "react";
import { SignUpPage } from "@/components/partials/auth/register/sign-up";
import { TypeSelection } from "@/components/partials/auth/register/type-selection";
import { apiFetch } from "@/api/client";
import { usuarioRoutes } from "@/api/routes";
import { toastCustom } from "@/components/ui/custom/toast";
import { OfflineModal } from "@/components/ui/custom";

const RegisterPage = () => {
  const [userType, setUserType] = useState<
    "PESSOA_FISICA" | "PESSOA_JURIDICA" | null
  >(null);
  const [isPending, startTransition] = useTransition();

  const handleSignUp = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    startTransition(async () => {
      const formData = new FormData(event.currentTarget);
      const data = Object.fromEntries(formData.entries()) as any;
      const documentoLimpo = (data.documento as string).replace(/\D/g, "");
      const telefoneLimpo = (data.telefone as string).replace(/\D/g, "");
      const payload: any = {
        nomeCompleto: data.nomeCompleto,
        telefone: telefoneLimpo,
        email: data.email,
        senha: data.senha,
        confirmarSenha: data.confirmarSenha,
        aceitarTermos: data.aceitarTermos === "true",
        supabaseId: crypto.randomUUID(),
        tipoUsuario: data.tipoUsuario,
      };
      if (data.tipoUsuario === "PESSOA_FISICA") {
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
            ? "Dados já cadastrados. Verifique seu email, CPF/CNPJ ou telefone."
            : "Não foi possível realizar o cadastro.";
        toastCustom.error(message);
      }
    });
  };

  return (
    <div className="bg-background text-foreground">
      {userType === null ? (
        <TypeSelection onSelect={setUserType} />
      ) : (
        <SignUpPage
          heroImageSrc="https://images.unsplash.com/photo-1642615835477-d303d7dc9ee9?w=2160&q=80"
          onSignUp={handleSignUp}
          isLoading={isPending}
          defaultTipoUsuario={userType}
          showUserTypeSelect={false}
          onBack={() => setUserType(null)}
        />
      )}
      <OfflineModal />
    </div>
  );
};

export default RegisterPage;

