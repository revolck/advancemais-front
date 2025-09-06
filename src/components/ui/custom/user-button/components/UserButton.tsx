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
import { logoutUser } from "@/lib/auth";

export interface UserButtonProps {
  className?: string;
  onNavigate?: (key: string) => void;
}

interface User {
  firstName: string;
  lastName?: string;
  email: string;
  plan: "free" | "pro" | "enterprise";
}

const UserButtonSkeleton = () => (
  <div className="flex items-center justify-center gap-2">
    <Skeleton className="h-8 w-8 rounded-full bg-white/20" />
    <Skeleton className="h-3 w-3 rounded bg-white/10 hidden sm:block" />
  </div>
);

export function UserButton({ className, onNavigate }: UserButtonProps) {
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
    { key: "profile", icon: "User" as const, label: "Perfil" },
    { key: "community", icon: "Users" as const, label: "Comunidade" },
    {
      key: "billing",
      icon: "Cog" as const,
      label: "Assinatura",
      badge:
        user?.plan === "pro" ? "PRO" : user?.plan === "enterprise" ? "ENT" : null,
      iconBg: "bg-emerald-100 group-hover:bg-emerald-200",
      iconColor: "text-emerald-600 group-hover:text-emerald-700",
    },
    { key: "settings", icon: "Sliders" as const, label: "Configurações" },
    { key: "help", icon: "HelpCircle" as const, label: "Ajuda" },
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
          init: { method: "POST", headers: { Authorization: `Bearer ${token}` } },
        });
      }
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    } finally {
      logoutUser();
    }
  };

  const displayName = user
    ? `${user.firstName}${user.lastName ? ` ${user.lastName}` : ""}`
    : "";

  if (isLoading) {
    return (
      <div className={cn("relative h-10 px-3 rounded-lg transition-all duration-200", className)}>
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
            "group relative h-10 rounded-xl hover:bg-white/10 active:scale-95",
            "px-2 sm:px-3",
            "transition-all duration-200",
            "focus-visible:outline-none focus-visible:ring-0",
            className
          )}
        >
          <div className="flex items-center justify-center gap-2">
            <div className="relative">
              <AvatarCustom name={displayName} size="sm" showStatus={false} />
            </div>
            <div
              className={cn(
                "transition-transform duration-200",
                isOpen ? "rotate-180" : "rotate-0",
                "hidden sm:block"
              )}
            >
              <Icon name="ChevronDown" size={14} className="text-white/70" />
            </div>
          </div>
          <span className="sr-only">Menu do usuário</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80 p-0" sideOffset={8}>
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="relative">
              <AvatarCustom name={displayName} size="md" showStatus={false} className="ring-2 ring-pink-500" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 text-base truncate">{displayName}</h3>
              <div className="flex items-center gap-1 mt-0.5">
                <Icon name="Mail" size={12} className="text-gray-400" />
                <p className="text-sm text-gray-500 truncate">{user.email}</p>
              </div>
            </div>
            {user.plan !== "free" && (
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-2.5 py-1 rounded-full text-xs font-semibold">
                {user.plan === "pro" ? "PRO" : "ENT"}
              </div>
            )}
          </div>
        </div>

        <div className="py-1.5">
          {menuItems.map((item) => (
            <DropdownMenuItem
              key={item.key}
              className="px-3 py-2.5 cursor-pointer focus:bg-gray-50 hover:bg-gray-50 group"
              onClick={() => onNavigate?.(item.key)}
            >
              <div className="flex items-center gap-2.5 w-full">
                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-150 shrink-0", item.iconBg || "bg-gray-100 group-hover:bg-gray-200")}> 
                  <Icon name={item.icon} size={16} className={cn(item.iconColor || "text-gray-600 group-hover:text-gray-700")} />
                </div>
                <p className="font-medium text-gray-900 text-sm flex-1">{item.label}</p>
                {item.badge && (
                  <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-2 py-0.5 rounded-full text-xs font-semibold">{item.badge}</span>
                )}
              </div>
            </DropdownMenuItem>
          ))}
        </div>

        <DropdownMenuSeparator />

        <div className="p-2">
          <DropdownMenuItem
            className="px-3 py-2.5 cursor-pointer text-red-600 focus:text-red-700 hover:bg-red-50 focus:bg-red-50 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            <div className="flex items-center gap-2.5 w-full">
              <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center transition-colors duration-150 shrink-0">
                {isLoggingOut ? (
                  <Icon name="Loader2" size={16} className="text-red-600 animate-spin" />
                ) : (
                  <Icon name="LogOut" size={16} className="text-red-600" />
                )}
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-red-600 text-sm">{isLoggingOut ? "Saindo..." : "Sair"}</p>
                <p className="text-xs text-red-400 mt-0.5">{isLoggingOut ? "Aguarde..." : "Sair da sua conta"}</p>
              </div>
            </div>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default UserButton;

