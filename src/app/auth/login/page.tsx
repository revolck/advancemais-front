"use client";

import { useTransition, useState, useEffect } from "react";
import { SignInPage } from "@/components/partials/auth/login/sign-in";
import { apiFetch } from "@/api/client";
import { usuarioRoutes } from "@/api/routes";
import { toastCustom } from "@/components/ui/custom/toast";

const SignInPageDemo = () => {
  const [userName, setUserName] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const storedName = localStorage.getItem("userName");
    if (storedName) {
      setUserName(storedName);
    }
  }, []);

  const handleSignIn = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    startTransition(async () => {
      const formData = new FormData(event.currentTarget);
      const { documento, senha, rememberMe } = Object.fromEntries(
        formData.entries()
      ) as {
        documento: string;
        senha: string;
        rememberMe: string;
      };
      const documentoLimpo = documento.replace(/\D/g, "");
      const remember = rememberMe === "true";

      try {
        const res = await apiFetch<{ token: string; refreshToken: string }>(
          usuarioRoutes.login(),
          {
            cache: "no-cache",
            init: {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ documento: documentoLimpo, senha }),
            },
            retries: 1,
          }
        );

        // Busca nome do usuário para saudar em futuros logins
        try {
          const profile = await apiFetch<{ nome?: string }>(
            usuarioRoutes.profile.get(),
            {
              cache: "no-cache",
              init: {
                headers: { Authorization: `Bearer ${res.token}` },
              },
              retries: 1,
            }
          );
          if (profile.nome) {
            localStorage.setItem("userName", profile.nome);
          }
        } catch (profileError) {
          console.error("Erro ao buscar perfil:", profileError);
        }

        // Define cookies para compartilhamento entre subdomínios
        const host = window.location.hostname;
        const isLocalhost = host === "localhost" || host === "127.0.0.1";
        const baseDomain = host
          .replace(/^app\./, "")
          .replace(/^auth\./, "");
        const domain = isLocalhost ? host : `.${baseDomain}`;

        const maxAge = remember ? "; max-age=2592000" : "";
        document.cookie = `token=${res.token}; path=/; domain=${domain}${maxAge};`;
        document.cookie = `refresh_token=${res.refreshToken}; path=/; domain=${domain}${maxAge};`;

        // Redireciona para o subdomínio app
        const protocol = window.location.protocol;
        const port = window.location.port ? `:${window.location.port}` : "";
        toastCustom.success("Login realizado com sucesso!");
        setTimeout(() => {
          window.location.href = isLocalhost
            ? "/dashboard"
            : `${protocol}//app.${baseDomain}${port}/`;
        }, 1000);
      } catch (error) {
        console.error("Erro ao fazer login:", error);
        toastCustom.error(
          "Não foi possível realizar o login. Verifique suas credenciais."
        );
      }
    });
  };

  const handleResetPassword = () => {
    alert("Reset Password clicked");
  };

  const handleCreateAccount = () => {
    window.location.href = "/auth/register";
  };

  return (
    <div className="bg-background text-foreground">
      <SignInPage
        heroImageSrc="https://images.unsplash.com/photo-1642615835477-d303d7dc9ee9?w=2160&q=80"
        onSignIn={handleSignIn}
        onResetPassword={handleResetPassword}
        onCreateAccount={handleCreateAccount}
        isLoading={isPending}
        title={
          userName
            ? `Olá ${userName}, bem vindo de volta!`
            : "Entre no seu perfil"
        }
      />
    </div>
  );
};

export default SignInPageDemo;
