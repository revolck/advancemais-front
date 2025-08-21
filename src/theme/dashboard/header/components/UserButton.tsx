"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
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

// Skeleton para o botão do usuário
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
          usuario?: {
            nomeCompleto?: string;
            email: string;
            plano?: string;
          };
        }>(usuarioRoutes.profile.get(), {
          cache: "no-cache",
          init: { headers: { Authorization: `Bearer ${token}` } },
        });

        const userData = profile.usuario;
        if (userData) {
          const full = userData.nomeCompleto?.trim();
          const parts = full ? full.split(" ") : [];
          const firstName = parts[0] || userData.email.split("@")[0];
          const lastName = parts.slice(1).join(" ") || undefined;

          setUser({
            firstName,
            lastName,
            email: userData.email,
            plan:
              userData.plano === "pro"
                ? "pro"
                : userData.plano === "enterprise"
                ? "enterprise"
                : "free",
          });
        }
      } catch (error) {
        console.error("Erro ao carregar perfil:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  const menuItems = [
    {
      icon: "User" as const,
      label: "Perfil",
      description: "Gerencie suas configurações de conta",
      action: () => console.log("Navegar para perfil"),
    },
    {
      icon: "Users" as const,
      label: "Comunidade",
      description: "Conecte-se com outros usuários",
      action: () => console.log("Navegar para comunidade"),
    },
    {
      icon: "Crown" as const,
      label: "Assinatura",
      description: "Gerencie sua assinatura",
      action: () => console.log("Navegar para assinatura"),
      badge:
        user?.plan === "pro"
          ? "PRO"
          : user?.plan === "enterprise"
          ? "ENT"
          : null,
    },
    {
      icon: "Settings" as const,
      label: "Configurações",
      description: "Personalize sua experiência",
      action: () => console.log("Navegar para configurações"),
    },
    {
      icon: "HelpCircle" as const,
      label: "Central de Ajuda",
      description: "Obtenha suporte e documentação",
      action: () => console.log("Navegar para ajuda"),
    },
  ];

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
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
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
          "relative h-10 px-3 rounded-lg transition-all duration-200 ease-in-out",
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
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "group relative h-10 px-3 rounded-xl hover:bg-white/10 active:scale-95",
            "transition-all duration-200 ease-in-out",
            "focus-visible:outline-none focus-visible:ring-0 focus:ring-0 outline-none border-none",
            "data-[state=open]:bg-white/10",
            className
          )}
        >
          <div className="flex items-center justify-center gap-3">
            {/* Avatar */}
            <div className="relative">
              <AvatarCustom name={displayName} size="sm" showStatus={false} />
            </div>

            {/* User Info - Hidden on mobile */}
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-white leading-tight">
                Olá, {user.firstName}
              </p>
            </div>

            {/* Chevron (gira sem framer-motion) */}
            <div
              className={cn(
                "transition-transform duration-200 ease-in-out",
                isOpen ? "rotate-180" : "rotate-0"
              )}
            >
              <Icon name="ChevronDown" size={14} className="text-white/70" />
            </div>
          </div>
          <span className="sr-only">Menu do usuário</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80 p-0" sideOffset={8}>
        {/* Cabeçalho do usuário */}
        <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100/50 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="relative">
              <AvatarCustom name={displayName} size="md" showStatus={false} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 text-base truncate">
                {displayName}
              </h3>
              <div className="flex items-center gap-1 mt-0.5">
                <Icon name="Mail" size={12} className="text-gray-400" />
                <p className="text-sm text-gray-500 truncate">{user.email}</p>
              </div>
            </div>
            {user.plan === "pro" && (
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-2.5 py-1 rounded-full text-xs font-semibold">
                PRO
              </div>
            )}
          </div>
        </div>

        {/* Itens do menu (sem motion) */}
        <div className="py-2">
          {menuItems.map((item) => (
            <DropdownMenuItem
              key={item.label}
              className="px-4 py-3 cursor-pointer focus:bg-gray-50 hover:bg-gray-50 group"
              onClick={item.action}
            >
              <div className="flex items-center gap-3 w-full">
                <div className="w-10 h-10 rounded-xl bg-gray-100 group-hover:bg-gray-200 flex items-center justify-center transition-colors duration-150 shrink-0">
                  <Icon
                    name={item.icon}
                    size={18}
                    className="text-gray-600 group-hover:text-gray-700"
                  />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900 text-sm">
                      {item.label}
                    </p>
                    {item.badge && (
                      <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-2 py-0.5 rounded-full text-xs font-semibold">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {item.description}
                  </p>
                </div>
              </div>
            </DropdownMenuItem>
          ))}
        </div>

        <DropdownMenuSeparator />

        {/* Sair */}
        <div className="p-2">
          <DropdownMenuItem
            className="px-4 py-3 cursor-pointer text-red-600 focus:text-red-700 hover:bg-red-50 focus:bg-red-50 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            <div className="flex items-center gap-3 w-full">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center transition-colors duration-150 shrink-0">
                {isLoggingOut ? (
                  <Icon
                    name="Loader2"
                    size={18}
                    className="text-red-600 animate-spin"
                  />
                ) : (
                  <Icon name="LogOut" size={18} className="text-red-600" />
                )}
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-red-600 text-sm">
                  {isLoggingOut ? "Saindo..." : "Sair"}
                </p>
                <p className="text-xs text-red-400 mt-0.5">
                  {isLoggingOut ? "Aguarde..." : "Sair da sua conta"}
                </p>
              </div>
            </div>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
