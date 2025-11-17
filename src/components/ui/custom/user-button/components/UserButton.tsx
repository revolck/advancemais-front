"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
import { getUserProfile, logoutUserSession } from "@/api/usuarios";
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
  <div className="flex items-center justify-center gap-3 px-0">
    <Skeleton className="h-8 w-8 rounded-full bg-white/20" />
    <div className="hidden md:block">
      <Skeleton className="h-4 w-24 bg-white/20" />
    </div>
    <Skeleton className="h-3 w-3 rounded bg-white/10" />
  </div>
);

export function UserButton({ className, onNavigate }: UserButtonProps) {
  const router = useRouter();
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

        const profile = await getUserProfile(token);
        if (
          !profile?.success ||
          !("usuario" in profile) ||
          !profile.usuario?.email
        ) {
          setIsLoading(false);
          return;
        }

        const full = profile.usuario.nomeCompleto?.trim();
        const parts = full ? full.split(" ") : [];
        const firstName = parts[0] || profile.usuario.email.split("@")[0];
        const lastName = parts.slice(1).join(" ") || undefined;

        setUser({
          firstName,
          lastName,
          email: profile.usuario.email,
          plan: "free", // Plano padrão - propriedade plano não está disponível no tipo atual
        });
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
  ];

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
      if (key === "profile") {
        router.push("/dashboard/perfil");
      }
    }
  };

  const displayName = user?.firstName ?? "";

  if (isLoading) {
    return (
      <div
        className={cn(
          "relative h-10 px-3 rounded-lg transition-all duration-200",
          className
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
          className={cn(
            "group relative h-10 pl-2 pr-3 rounded-full active:scale-95",
            "transition-all duration-200 text-left text-white",
            "hover:bg-white/10 focus-visible:outline-none focus-visible:ring-0",
            className
          )}
        >
          <div className="flex items-center gap-2">
            <AvatarCustom name={displayName} size="sm" showStatus={false} />
            <div className="hidden md:flex flex-col leading-tight max-w-[160px] text-left">
              <span className="text-sm font-semibold truncate text-[var(--secondary-color)]">
                Bem-vindo(a), {displayName}
              </span>
              <span className="text-[11px] text-white/70 truncate">
                {user.email}
              </span>
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

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-[230px] rounded-2xl border border-black/5 bg-white p-1 shadow-xl"
      >
        <div className="py-1">
          {menuItems.map((item) => (
            <DropdownMenuItem
              key={item.key}
              className="px-3 py-2 cursor-pointer flex items-center gap-3 rounded-none hover:bg-gray-50 focus:bg-gray-50"
              onClick={() => handleMenuClick(item.key)}
            >
              <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center">
                <Icon name={item.icon} size={16} />
              </div>
              <span className="text-sm text-gray-900 font-medium">
                {item.label}
              </span>
            </DropdownMenuItem>
          ))}
        </div>

        <DropdownMenuSeparator className="my-0" />

        <DropdownMenuItem
          className="px-3 py-2 cursor-pointer text-red-600 focus:text-red-700 hover:bg-red-50 focus:bg-red-50"
          onClick={handleLogout}
          disabled={isLoggingOut}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
              {isLoggingOut ? (
                <Icon name="Loader2" size={16} className="animate-spin" />
              ) : (
                <Icon name="LogOut" size={16} />
              )}
            </div>
            <span className="text-sm font-medium">
              {isLoggingOut ? "Saindo..." : "Sair"}
            </span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default UserButton;
