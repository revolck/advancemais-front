"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Icon } from "@/components/ui/custom/Icons";
import { cn } from "@/lib/utils";
import { getUserProfile, logoutUserSession } from "@/api/usuarios";
import { logoutUser } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";

export interface UserButtonProps {
  className?: string;
  onNavigate?: (key: string) => void;
}

interface User {
  firstName: string;
  lastName?: string;
  email: string;
  plan: "free" | "pro" | "enterprise";
  avatarUrl?: string | null;
  role?: string;
}

const DASHBOARD_URL = "https://app.advancemais.com/dashboard";

const UserButtonSkeleton = () => (
  <div className="flex items-center gap-2 rounded-full bg-white/10 px-2 py-1">
    <Skeleton className="h-9 w-9 rounded-full bg-white/20" />
    <div className="hidden min-w-0 md:block">
      <Skeleton className="h-4 w-24 bg-white/20" />
      <Skeleton className="mt-1 h-3 w-32 bg-white/10" />
    </div>
    <Skeleton className="h-4 w-4 rounded bg-white/10" />
  </div>
);

export function UserButton({ className, onNavigate }: UserButtonProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const token = useMemo(() => {
    if (typeof document === "undefined") return undefined;
    return document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1];
  }, []);

  const { data: profileResponse, isLoading } = useQuery({
    queryKey: ["user-profile"],
    queryFn: async () => {
      if (!token) {
        throw new Error("Token não encontrado");
      }
      return getUserProfile(token);
    },
    enabled: Boolean(token),
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  const user: User | null = useMemo(() => {
    if (
      !profileResponse ||
      !("usuario" in profileResponse) ||
      !profileResponse.usuario?.email
    ) {
      return null;
    }

    const full = profileResponse.usuario.nomeCompleto?.trim();
    const parts = full ? full.split(" ") : [];
    const firstName = parts[0] || profileResponse.usuario.email.split("@")[0];
    const lastName = parts.slice(1).join(" ") || undefined;

    return {
      firstName,
      lastName,
      email: profileResponse.usuario.email,
      plan: "free",
      avatarUrl: profileResponse.usuario.avatarUrl ?? null,
      role: profileResponse.usuario.role,
    };
  }, [profileResponse]);

  const menuItems = useMemo(() => {
    if (user?.role === "EMPRESA") {
      return [
        {
          key: "dashboard",
          icon: "LayoutDashboard" as const,
          label: "Meu painel",
        },
        {
          key: "upgrade",
          icon: "Sparkles" as const,
          label: "Fazer upgrade agora",
        },
        { key: "profile", icon: "User" as const, label: "Perfil" },
        {
          key: "subscription",
          icon: "CreditCard" as const,
          label: "Assinatura",
        },
      ];
    }

    return [
      {
        key: "dashboard",
        icon: "LayoutDashboard" as const,
        label: "Meu painel",
      },
      { key: "profile", icon: "User" as const, label: "Perfil" },
    ];
  }, [user?.role]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];
      if (token) {
        await logoutUserSession(token);
      }
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    } finally {
      logoutUser();
    }
  };

  const handleMenuClick = (key: string) => {
    setIsOpen(false);
    if (onNavigate) {
      onNavigate(key);
    } else {
      // Navegação padrão baseada na chave
      if (key === "dashboard") {
        window.location.assign(DASHBOARD_URL);
      } else if (key === "profile") {
        router.push("/perfil");
      } else if (key === "upgrade") {
        router.push("/dashboard/upgrade");
      } else if (key === "subscription") {
        router.push("/dashboard/empresas/pagamentos");
      }
    }
  };

  const displayName = user?.firstName ?? "";
  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(" ");
  const initials = fullName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const primaryItems = menuItems.filter((item) =>
    ["dashboard", "profile"].includes(item.key),
  );
  const secondaryItems = menuItems.filter((item) =>
    ["upgrade", "subscription"].includes(item.key),
  );

  if (isLoading) {
    return (
      <div
        className={cn(
          "relative h-10 px-3 rounded-lg transition-all duration-200",
          className,
        )}
      >
        <UserButtonSkeleton />
      </div>
    );
  }

  if (!user) return null;

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    // Previne scroll para o topo quando o dropdown abrir
    if (open) {
      const currentScroll = window.scrollY;
      // Usa requestAnimationFrame para garantir que o scroll não seja alterado
      requestAnimationFrame(() => {
        if (window.scrollY !== currentScroll) {
          window.scrollTo(0, currentScroll);
        }
      });
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={handleOpenChange} modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          data-popup-target="website-user-menu"
          className={cn(
            "group relative h-auto rounded-full border border-white/10 bg-white/8 pl-2 pr-3 py-1.5 active:scale-95",
            "transition-all duration-200 text-left text-white shadow-[0_10px_24px_-18px_rgba(15,23,42,0.8)] backdrop-blur-sm",
            "hover:border-white/20 hover:bg-white/14 focus-visible:outline-none focus-visible:ring-0",
            className,
          )}
        >
          <div className="flex items-center gap-2">
            <Avatar className="size-9 rounded-full border border-white/20 bg-white/95 shadow-sm">
              <AvatarImage
                src={user?.avatarUrl ?? undefined}
                alt={fullName || displayName}
              />
              <AvatarFallback className="rounded-full bg-slate-100 text-sm font-semibold text-[var(--color-blue)]">
                {initials || "US"}
              </AvatarFallback>
            </Avatar>
            <div className="hidden max-w-[190px] min-w-0 md:flex md:flex-col md:leading-tight md:text-left">
              <span className="truncate text-sm font-semibold text-white">
                {fullName || displayName}
              </span>
              <span className="truncate text-xs text-white/68">
                {user.email}
              </span>
            </div>
            <div
              className={cn(
                "transition-transform duration-200 text-white/70",
                isOpen ? "rotate-180" : "rotate-0",
              )}
            >
              <Icon name="ChevronDown" size={14} />
            </div>
          </div>
          <span className="sr-only">Menu do usuário</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-64 rounded-[22px] border border-slate-200 bg-white p-1.5 shadow-[0_20px_50px_-28px_rgba(15,23,42,0.38)]"
      >
        <div className="mb-1 rounded-[18px] bg-slate-50 px-3 py-3">
          <div className="flex items-center gap-3">
            <Avatar className="size-10 rounded-full">
              <AvatarImage
                src={user?.avatarUrl ?? undefined}
                alt={fullName || displayName}
              />
              <AvatarFallback className="rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-sm font-semibold text-white">
                {initials || "US"}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold text-slate-900">
                {fullName || displayName}
              </div>
              <div className="truncate text-xs text-slate-500">
                {user.email}
              </div>
            </div>
          </div>
        </div>

        <DropdownMenuSeparator className="mx-0 my-1 bg-slate-200/80" />

        <DropdownMenuGroup>
          {primaryItems.map((item) => (
            <DropdownMenuItem
              key={item.key}
              className="cursor-pointer gap-2.5 rounded-2xl px-3 py-3 text-sm font-medium text-slate-800"
              onClick={() => handleMenuClick(item.key)}
            >
              <Icon
                name={item.icon}
                size={16}
                className="text-slate-500 opacity-75"
              />
              <span>{item.label}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>

        {secondaryItems.length > 0 ? (
          <>
            <DropdownMenuSeparator className="mx-0 my-1 bg-slate-200/80" />
            <DropdownMenuGroup>
              {secondaryItems.map((item) => (
                <DropdownMenuItem
                  key={item.key}
                  className="cursor-pointer gap-2.5 rounded-2xl px-3 py-3 text-sm font-medium text-slate-800"
                  onClick={() => handleMenuClick(item.key)}
                >
                  <Icon
                    name={item.icon}
                    size={16}
                    className="text-slate-500 opacity-75"
                  />
                  <span className="flex-1">{item.label}</span>
                  {item.key === "upgrade" ? (
                    <span className="rounded-md bg-fuchsia-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-fuchsia-700">
                      Pro
                    </span>
                  ) : null}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </>
        ) : null}

        <DropdownMenuSeparator className="mx-0 my-1 bg-slate-200/80" />

        <DropdownMenuItem
          className="cursor-pointer gap-2.5 rounded-2xl px-3 py-3 text-sm font-medium text-red-600 focus:bg-red-50 focus:text-red-700"
          onClick={handleLogout}
          disabled={isLoggingOut}
        >
          {isLoggingOut ? (
            <Icon
              name="Loader2"
              size={16}
              className="animate-spin text-red-500"
            />
          ) : (
            <Icon
              name="LogOut"
              size={16}
              className="text-red-500"
            />
          )}
          <span>{isLoggingOut ? "Saindo..." : "Sair"}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default UserButton;
