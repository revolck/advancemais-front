"use client";

import { useTransition } from "react";
import { SignInPage } from "@/components/partials/auth/login/sign-in";
import { apiFetch } from "@/api/client";
import { usuarioRoutes } from "@/api/routes";

const SignInPageDemo = () => {
  const [, startTransition] = useTransition();

  const handleSignIn = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    startTransition(async () => {
      const formData = new FormData(event.currentTarget);
      const { documento, senha } = Object.fromEntries(formData.entries()) as {
        documento: string;
        senha: string;
      };

      try {
        const res = await apiFetch<{ token: string; refreshToken: string }>(
          usuarioRoutes.login(),
          {
            cache: "no-cache",
            init: {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ documento, senha }),
            },
            retries: 1,
          }
        );

        // Define cookies para compartilhamento entre subdomínios
        const host = window.location.hostname;
        const isLocalhost = host === "localhost" || host === "127.0.0.1";
        const baseDomain = host
          .replace(/^app\./, "")
          .replace(/^auth\./, "");
        const domain = isLocalhost ? host : `.${baseDomain}`;

        document.cookie = `token=${res.token}; path=/; domain=${domain};`;
        document.cookie = `refresh_token=${res.refreshToken}; path=/; domain=${domain};`;

        // Redireciona para o subdomínio app
        const protocol = window.location.protocol;
        const port = window.location.port ? `:${window.location.port}` : "";
        window.location.href = isLocalhost
          ? "/dashboard"
          : `${protocol}//app.${baseDomain}${port}/`;
      } catch (error) {
        console.error("Erro ao fazer login:", error);
        alert("Não foi possível realizar o login. Verifique suas credenciais.");
      }
    });
  };

  const handleGoogleSignIn = () => {
    console.log("Continue with Google clicked");
    alert("Continue with Google clicked");
  };

  const handleResetPassword = () => {
    alert("Reset Password clicked");
  };

  const handleCreateAccount = () => {
    alert("Create Account clicked");
  };

  return (
    <div className="bg-background text-foreground">
      <SignInPage
        heroImageSrc="https://images.unsplash.com/photo-1642615835477-d303d7dc9ee9?w=2160&q=80"
        onSignIn={handleSignIn}
        onGoogleSignIn={handleGoogleSignIn}
        onResetPassword={handleResetPassword}
        onCreateAccount={handleCreateAccount}
        title="Entre no seu perfil"
        description="Access your account and continue your journey with us"
      />
    </div>
  );
};

export default SignInPageDemo;
