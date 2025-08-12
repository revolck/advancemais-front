"use client";

import { useTransition } from "react";
import { SignUpPage } from "@/components/partials/auth/register/sign-up";
import { apiFetch } from "@/api/client";
import { usuarioRoutes } from "@/api/routes";
import { toastCustom } from "@/components/ui/custom/toast";

const RegisterPage = () => {
  const [, startTransition] = useTransition();

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
        payload.dataNasc = data.dataNasc;
        payload.genero = data.genero;
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
        toastCustom.success("Cadastro realizado com sucesso!");
        setTimeout(() => {
          window.location.href = "/auth/login";
        }, 1000);
      } catch (error) {
        console.error("Erro ao cadastrar:", error);
        toastCustom.error("Não foi possível realizar o cadastro.");
      }
    });
  };

  return (
    <div className="bg-background text-foreground">
      <SignUpPage
        heroImageSrc="https://images.unsplash.com/photo-1642615835477-d303d7dc9ee9?w=2160&q=80"
        onSignUp={handleSignUp}
      />
    </div>
  );
};

export default RegisterPage;

