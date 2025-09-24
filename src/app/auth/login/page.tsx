"use client";

import { useTransition, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { SignInPage } from "@/components/partials/auth/login/sign-in";
import { PasswordRecoveryModal } from "@/components/partials/auth/login/password-recovery-modal";
import { toastCustom } from "@/components/ui/custom/toast";
import { ALL_ROLES, UserRole } from "@/config/roles";
import { getLoginImageDataClient } from "@/api/websites/components";
import { getUserProfile, loginUser } from "@/api/usuarios";

const SignInPageDemo = () => {
  const [userName, setUserName] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [heroImageSrc, setHeroImageSrc] = useState<string | undefined>();
  const [heroImageLink, setHeroImageLink] = useState<string | undefined>();
  const [isRecoveryOpen, setIsRecoveryOpen] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    const storedName = localStorage.getItem("userName");
    if (storedName) {
      setUserName(storedName);
    }
  }, []);

  useEffect(() => {
    const error = searchParams?.get("error");
    if (error === "unauthorized") {
      toastCustom.error(
        "Você não tem autorização para acessar como visitante. Por favor realize seu cadastro."
      );
    }
  }, [searchParams]);

  useEffect(() => {
    getLoginImageDataClient()
      .then((data) => {
        if (data?.imagemUrl) setHeroImageSrc(data.imagemUrl);
        if (data?.link) setHeroImageLink(data.link || undefined);
      })
      .catch((err) => {
        console.error("Erro ao carregar imagem de login:", err);
      });
  }, []);

  const handleSignIn = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formElement = event.currentTarget;

    startTransition(async () => {
      const formData = new FormData(formElement);
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
        const res = await loginUser({
          documento: documentoLimpo,
          senha,
          rememberMe: remember,
        });

        // Verificar se o login foi bem-sucedido
        if (!res.success || !("token" in res)) {
          throw new Error(res.message || "Login falhou");
        }

        let userRole: UserRole | undefined;
        // Busca nome e role do usuário para saudar em futuros logins
        try {
          const profile = await getUserProfile(res.token);

          // Verificar se o perfil foi obtido com sucesso
          if (profile.success && "usuario" in profile) {
            const fullName = profile.usuario.nomeCompleto;
            if (fullName) {
              const [firstName] = fullName.split(" ");
              localStorage.setItem("userName", firstName);
            }
            const candidateRoles = [profile.usuario.role].filter(
              Boolean
            ) as string[];
            userRole = candidateRoles.find((roleCandidate) =>
              ALL_ROLES.includes(roleCandidate as UserRole)
            ) as UserRole | undefined;
          }
        } catch (profileError) {
          console.error("Erro ao buscar perfil:", profileError);
        }

        // Define cookies para compartilhamento entre subdomínios
        const host = window.location.hostname;
        const isLocalhost = host === "localhost" || host === "127.0.0.1";
        const baseDomain = host.replace(/^app\./, "").replace(/^auth\./, "");
        const domain = isLocalhost ? host : `.${baseDomain}`;

        const rememberPreference = res.rememberMe ?? remember;
        const maxAge = rememberPreference ? "; max-age=2592000" : "";
        document.cookie = `token=${res.token}; path=/; domain=${domain}${maxAge};`;
        document.cookie = `refresh_token=${res.refreshToken}; path=/; domain=${domain}${maxAge};`;
        if (userRole) {
          document.cookie = `user_role=${userRole}; path=/; domain=${domain}${maxAge};`;
        }

        // Redireciona para o subdomínio app
        const protocol = window.location.protocol;
        const port = window.location.port ? `:${window.location.port}` : "";
        toastCustom.success("Login realizado com sucesso!");
        setTimeout(() => {
          window.location.href = isLocalhost
            ? "/"
            : `${protocol}//app.${baseDomain}${port}/`;
        }, 1000);
      } catch (error) {
        console.error("Erro ao fazer login:", error);
        const status = (error as any)?.status as number | undefined;
        let message =
          "Não foi possível realizar o login. Verifique suas credenciais.";

        if (status === 404) {
          message = "Usuário não encontrado. Verifique suas credenciais.";
        } else if (status === 401) {
          message = "Credenciais inválidas. Verifique e tente novamente.";
        } else if (error instanceof Error && error.message) {
          message = error.message;
        }

        toastCustom.error(message);
      }
    });
  };

  const handleResetPassword = () => {
    setIsRecoveryOpen(true);
  };

  const handleCreateAccount = () => {
    window.location.href = "https://auth.advancemais.com/register";
  };

  return (
    <div className="bg-background text-foreground">
      <SignInPage
        heroImageSrc={heroImageSrc}
        heroImageLink={heroImageLink}
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
      <PasswordRecoveryModal
        open={isRecoveryOpen}
        onOpenChange={setIsRecoveryOpen}
      />
    </div>
  );
};

export default SignInPageDemo;
