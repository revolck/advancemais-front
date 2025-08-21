"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { AvatarCustom } from "@/components/ui/custom/avatar";
import { Icon } from "@/components/ui/custom/Icons";
import { Badge } from "@/components/ui/badge";
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

// Skeleton component para o botão do usuário
const UserButtonSkeleton = () => (
  <div className="flex items-center gap-3 px-2">
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
          init: {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        });

        const userData = profile.usuario;
        if (userData?.nomeCompleto) {
          const parts = userData.nomeCompleto.split(" ");
          const firstName = parts[0];
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
      label: "Meu Perfil",
      description: "Gerencie suas informações pessoais",
      action: () => console.log("Navegar para perfil"),
    },
    {
      icon: "Shield" as const,
      label: "Segurança",
      description: "Senha, 2FA e configurações de segurança",
      action: () => console.log("Navegar para segurança"),
    },
    {
      icon: "Crown" as const,
      label: "Assinatura",
      description: "Gerencie seu plano atual",
      action: () => console.log("Navegar para assinatura"),
      badge:
        user?.plan === "pro"
          ? "Pro"
          : user?.plan === "enterprise"
          ? "Enterprise"
          : null,
    },
    {
      icon: "CreditCard" as const,
      label: "Fatura",
      description: "Histórico de pagamentos e faturas",
      action: () => console.log("Navegar para fatura"),
    },
  ];

  const getPlanBadgeVariant = (plan?: User["plan"]) => {
    switch (plan) {
      case "pro":
        return "default";
      case "enterprise":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getPlanLabel = (plan?: User["plan"]) => {
    switch (plan) {
      case "pro":
        return "Plano Pro";
      case "enterprise":
        return "Enterprise";
      default:
        return "Plano Gratuito";
    }
  };

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
            headers: {
              Authorization: `Bearer ${token}`,
            },
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

  // Se está carregando, mostra skeleton
  if (isLoading) {
    return (
      <div
        className={cn(
          "relative h-10 px-2 rounded-lg",
          "transition-all duration-200 ease-in-out",
          className
        )}
      >
        <UserButtonSkeleton />
      </div>
    );
  }

  // Se não há usuário, não renderiza nada ou mostra um fallback
  if (!user) {
    return null;
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            variant="ghost"
            className={cn(
              "relative h-10 px-2 rounded-lg hover:bg-white/10 active:bg-white/20",
              "transition-all duration-200 ease-in-out",
              "focus:outline-none focus:ring-2 focus:ring-white/20",
              className
            )}
          >
            <div className="flex items-center gap-3">
              <AvatarCustom name={displayName} size="sm" showStatus={false} />
              <div className="hidden md:flex flex-col items-start justify-center">
                <p className="text-sm font-medium text-white leading-tight">
                  {displayName}
                </p>
              </div>
              <motion.div
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
              >
                <Icon name="ChevronDown" size={14} className="text-white/70" />
              </motion.div>
            </div>
            <span className="sr-only">Menu do usuário</span>
          </Button>
        </motion.div>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64" sideOffset={8}>
        {/* Header do usuário */}
        <DropdownMenuLabel className="p-3">
          <div className="flex items-center gap-3">
            <AvatarCustom
              name={displayName}
              size="md"
              showStatus={false}
              className="ring-2 ring-white shadow-sm"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {displayName}
              </p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
              <Badge
                variant={getPlanBadgeVariant(user.plan)}
                className="mt-1.5 text-xs h-5"
              >
                {getPlanLabel(user.plan)}
              </Badge>
            </div>
          </div>
        </DropdownMenuLabel>

        <Separator />

        {/* Menu items */}
        <div className="p-1">
          {menuItems.map((item, index) => (
            <DropdownMenuItem
              key={item.label}
              className="px-3 py-2 cursor-pointer rounded-sm"
              onClick={item.action}
            >
              <motion.div
                className="flex items-center gap-3 w-full"
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-md bg-gray-100 shrink-0">
                  <Icon name={item.icon} size={16} className="text-gray-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">
                      {item.label}
                    </p>
                    {item.badge && (
                      <Badge variant="secondary" className="text-xs ml-2 h-5">
                        {item.badge}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 leading-tight">
                    {item.description}
                  </p>
                </div>
                <Icon
                  name="ChevronRight"
                  size={14}
                  className="text-gray-400 shrink-0"
                />
              </motion.div>
            </DropdownMenuItem>
          ))}
        </div>

        <Separator />

        {/* Botão de Logout */}
        <div className="p-1">
          <DropdownMenuItem
            className="px-3 py-2 cursor-pointer rounded-sm text-red-600 focus:text-red-700 hover:bg-red-50 focus:bg-red-50"
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            <motion.div
              className="flex items-center gap-3 w-full"
              whileHover={{ x: 2 }}
              transition={{ duration: 0.1 }}
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-md bg-red-100 shrink-0">
                {isLoggingOut ? (
                  <Icon
                    name="Loader2"
                    size={16}
                    className="text-red-600 animate-spin"
                  />
                ) : (
                  <Icon name="LogOut" size={16} className="text-red-600" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">
                  {isLoggingOut ? "Saindo..." : "Sair"}
                </p>
                <p className="text-xs text-red-500/70 leading-tight">
                  Encerrar sessão atual
                </p>
              </div>
              <Icon
                name="ChevronRight"
                size={14}
                className="text-red-400 shrink-0"
              />
            </motion.div>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
