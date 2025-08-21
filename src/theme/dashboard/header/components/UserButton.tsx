"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { AvatarCustom } from "@/components/ui/custom/avatar";
import { Icon } from "@/components/ui/custom/Icons";
import { cn } from "@/lib/utils";
import { apiFetch } from "@/api/client";
import { usuarioRoutes } from "@/api/routes";

interface UserButtonProps {
  className?: string;
}
interface User {
  firstName: string;
  lastName?: string;
  email: string;
  plan: "free" | "pro" | "enterprise";
}

const UserButtonSkeleton = () => (
  <div className="flex items-center justify-center gap-3 px-0">
    <Skeleton className="h-8 w-8 rounded-full bg-white/20" />
    <div className="hidden md:block">
      <Skeleton className="h-4 w-24 bg-white/20" />
    </div>
    <Skeleton className="h-3 w-3 rounded bg-white/10" />
  </div>
);

export function UserButton({ className }: UserButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = document.cookie
          .split("; ")
          .find((row) => row.startsWith("token="))
          ?.split("=")[1];

        if (!token) {
          setIsLoading(false);
          return;
        }

        const profile = await apiFetch<{
          usuario?: { nomeCompleto?: string; email: string; plano?: string };
        }>(usuarioRoutes.profile.get(), {
          cache: "no-cache",
          init: { headers: { Authorization: `Bearer ${token}` } },
        });

        const u = profile.usuario;
        if (u) {
          const full = u.nomeCompleto?.trim();
          const parts = full ? full.split(" ") : [];
          const firstName = parts[0] || u.email.split("@")[0];
          const lastName = parts.slice(1).join(" ") || undefined;

          setUser({
            firstName,
            lastName,
            email: u.email,
            plan:
              u.plano === "pro"
                ? "pro"
                : u.plano === "enterprise"
                ? "enterprise"
                : "free",
          });
        }
      } catch (e) {
        console.error("Erro ao carregar perfil:", e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];

      if (token) {
        await apiFetch(usuarioRoutes.logout(), {
          cache: "no-cache",
          init: {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
          },
        });
      }
    } catch (e) {
      console.error("Erro ao fazer logout:", e);
    } finally {
      const host = window.location.hostname;
      const isLocalhost = host === "localhost" || host === "127.0.0.1";
      const baseDomain = host.replace(/^app\./, "").replace(/^auth\./, "");
      const domain = isLocalhost ? host : `.${baseDomain}`;
      document.cookie = `token=; path=/; domain=${domain}; max-age=0`;
      document.cookie = `refresh_token=; path=/; domain=${domain}; max-age=0`;

      const protocol = window.location.protocol;
      const port = window.location.port ? `:${window.location.port}` : "";
      window.location.href = isLocalhost
        ? "/auth/login"
        : `${protocol}//auth.${baseDomain}${port}/login`;
    }
  };

  const displayName = user
    ? `${user.firstName}${user.lastName ? ` ${user.lastName}` : ""}`
    : "";

  if (isLoading) {
    return (
      <div
        className={cn(
          "relative h-10 px-3 rounded-lg transition-all",
          className
        )}
      >
        <UserButtonSkeleton />
      </div>
    );
  }
  if (!user) return null;

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      {/* Trigger */}
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "user-trigger group h-10 rounded-xl px-3 hover:bg-white/10 active:scale-95 transition",
            "focus-visible:outline-none focus-visible:ring-0",
            className
          )}
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              {/* anel gradiente ao redor do avatar */}
              <div className="p-[2px] rounded-full bg-gradient-to-tr from-fuchsia-500 to-orange-400">
                <div className="rounded-full bg-white p-[2px]">
                  <AvatarCustom
                    name={displayName}
                    size="sm"
                    showStatus={false}
                  />
                </div>
              </div>

              {/* chip “Hi, {nome}” */}
              <span className="user-chip hidden md:block">
                Hi, {user.firstName}
              </span>
            </div>

            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-white leading-tight">
                Olá, {user.firstName}
              </p>
            </div>

            <div
              className={cn(
                "transition-transform duration-200",
                isOpen ? "rotate-180" : "rotate-0"
              )}
            >
              <Icon name="ChevronDown" size={14} className="text-white/70" />
            </div>
          </div>
          <span className="sr-only">Menu do usuário</span>
        </Button>
      </DropdownMenuTrigger>

      {/* Content estilizado como cartão do print */}
      <DropdownMenuContent align="end" sideOffset={10} className="user-menu">
        {/* Header */}
        <div className="user-menu__header">
          <div className="relative">
            <div className="p-[3px] rounded-full bg-gradient-to-tr from-fuchsia-500 to-orange-400">
              <div className="rounded-full bg-white p-[3px]">
                <AvatarCustom name={displayName} size="md" showStatus={false} />
              </div>
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="user-menu__name">{displayName}</h3>
            <p className="user-menu__email">{user.email}</p>
          </div>
        </div>

        {/* Itens */}
        <div className="user-menu__list">
          {/* Perfil */}
          <DropdownMenuItem
            onClick={() => console.log("Navegar para perfil")}
            className="user-menu__item"
          >
            <div className="user-menu__icon">
              <Icon name="User" size={18} />
            </div>
            <div className="user-menu__label">
              <p className="user-menu__title">Perfil</p>
              <p className="user-menu__desc">
                Gerencie suas configurações de conta
              </p>
            </div>
          </DropdownMenuItem>

          {/* Comunidade + botão (+) */}
          <DropdownMenuItem
            onClick={() => console.log("Navegar para comunidade")}
            className="user-menu__item"
          >
            <div className="user-menu__icon">
              <Icon name="Users" size={18} />
            </div>
            <div className="user-menu__label">
              <p className="user-menu__title">Comunidade</p>
              <p className="user-menu__desc">Conecte-se com outros usuários</p>
            </div>
            <button
              type="button"
              aria-label="Adicionar"
              className="user-menu__plus-btn"
            >
              <Icon name="Plus" size={14} />
            </button>
          </DropdownMenuItem>

          {/* Assinatura + badge PRO */}
          <DropdownMenuItem
            onClick={() => console.log("Navegar para assinatura")}
            className="user-menu__item"
          >
            <div className="user-menu__icon">
              <Icon name="Crown" size={18} />
            </div>
            <div className="user-menu__label">
              <p className="user-menu__title">Assinatura</p>
              <p className="user-menu__desc">Gerencie sua assinatura</p>
            </div>
            {user.plan !== "free" && (
              <span className="user-menu__badge">
                <Icon name="Cog" size={12} />
                {user.plan === "pro" ? "PRO" : "ENT"}
              </span>
            )}
          </DropdownMenuItem>

          {/* Configurações */}
          <DropdownMenuItem
            onClick={() => console.log("Navegar para configurações")}
            className="user-menu__item"
          >
            <div className="user-menu__icon">
              <Icon name="Settings" size={18} />
            </div>
            <div className="user-menu__label">
              <p className="user-menu__title">Configurações</p>
              <p className="user-menu__desc">Personalize sua experiência</p>
            </div>
          </DropdownMenuItem>

          {/* Central de Ajuda */}
          <DropdownMenuItem
            onClick={() => console.log("Navegar para ajuda")}
            className="user-menu__item"
          >
            <div className="user-menu__icon">
              <Icon name="HelpCircle" size={18} />
            </div>
            <div className="user-menu__label">
              <p className="user-menu__title">Central de Ajuda</p>
              <p className="user-menu__desc">Obtenha suporte e documentação</p>
            </div>
          </DropdownMenuItem>
        </div>

        <DropdownMenuSeparator className="my-1 border-gray-100" />

        {/* Sair */}
        <div className="p-2">
          <DropdownMenuItem
            onClick={handleLogout}
            disabled={isLoggingOut}
            className={cn("user-menu__item user-menu__logout", {
              "opacity-70": isLoggingOut,
            })}
          >
            <div className="user-menu__icon bg-red-100 text-red-600">
              <Icon name="LogOut" size={18} />
            </div>
            <div className="user-menu__label">
              <p className="user-menu__title text-red-600">
                {isLoggingOut ? "Saindo..." : "Sair"}
              </p>
              <p className="user-menu__desc text-red-400">
                {isLoggingOut ? "Aguarde..." : "Sair da sua conta"}
              </p>
            </div>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
