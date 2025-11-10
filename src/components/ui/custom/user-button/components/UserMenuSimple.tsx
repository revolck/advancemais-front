"use client";

import React from "react";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { MENU_ACCOUNT, MENU_LOGOUT, MENU_UPGRADE } from "../constants";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { getUserProfile, logoutUserSession } from "@/api/usuarios";
import { logoutUser } from "@/lib/auth";

interface User {
  name: string;
  email: string;
  avatar?: string;
  role?: string;
}

export default function UserMenuSimple() {
  const [open, setOpen] = React.useState(false);
  const [user, setUser] = React.useState<User | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  React.useEffect(() => {
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

        const fullName = profile.usuario.nomeCompleto?.trim();
        const name =
          fullName && fullName.length > 0
            ? fullName
            : profile.usuario.email.split("@")[0];
        setUser({
          name,
          email: profile.usuario.email,
          avatar: undefined, // imagemPerfil não está disponível no tipo atual
          role: profile.usuario.role,
        });
      } catch (error) {
        console.error("Erro ao carregar perfil:", error);
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
        await logoutUserSession(token);
      }
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    } finally {
      logoutUser();
    }
  };

  // Skeleton loader enquanto carrega
  if (isLoading) {
    return (
      <div className="flex items-center gap-2.5 px-1 py-1">
        {/* Avatar skeleton */}
        <Skeleton className="size-8 rounded-full bg-white/10" />
        {/* Nome skeleton */}
        <div className="flex flex-col items-start min-w-0 max-w-[140px] gap-1">
          <Skeleton className="h-4 w-24 bg-white/10 rounded" />
        </div>
        {/* Chevron skeleton */}
        <ChevronDown className="size-4 text-white/30 shrink-0" />
      </div>
    );
  }

  // Se não há usuário após o carregamento, não renderiza nada
  if (!user) return null;

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center gap-2.5 px-1 py-1 rounded-lg hover:bg-white/5 transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-2 focus:ring-offset-[var(--color-blue)]"
          aria-label="Menu do usuário"
        >
          <Avatar className="size-8 rounded-full ring-2 ring-white/20 group-hover:ring-white/40 transition-all duration-200">
            {user.avatar && <AvatarImage src={user.avatar} alt={user.name} />}
            <AvatarFallback className="rounded-full bg-gradient-to-br from-white/25 via-white/15 to-transparent text-white font-semibold text-xs shadow-sm">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-start min-w-0 max-w-[140px]">
            <span className="text-sm font-medium text-white truncate w-full">
              {user.name}
            </span>
          </div>
          <ChevronDown className="size-4 text-white/60 group-hover:text-white/90 group-hover:translate-y-0.5 transition-all duration-200 shrink-0" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-64 rounded-lg border border-gray-200 shadow-lg bg-white p-1.5"
        sideOffset={8}
        align="end"
      >
        {/* Header do usuário - simples e direto */}
        <div className="px-3 py-2.5 mb-1">
          <div className="flex items-center gap-3">
            <Avatar className="size-9 rounded-full">
              {user.avatar && <AvatarImage src={user.avatar} alt={user.name} />}
              <AvatarFallback className="rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-semibold text-xs">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col flex-1 min-w-0">
              <span className="text-sm font-semibold text-gray-900 truncate">
                {user.name}
              </span>
              <span className="text-xs text-gray-500 truncate">
                {user.email}
              </span>
            </div>
          </div>
        </div>

        <DropdownMenuSeparator />

        {/* Menu items - design minimalista */}
        {/* Upgrade apenas para empresas */}
        {user.role === "EMPRESA" && (
          <>
            <DropdownMenuGroup>
              {MENU_UPGRADE.map((item) => (
                <DropdownMenuItem key={item.href} asChild>
                  <Link href={item.href} className="cursor-pointer">
                    <item.icon className="size-4" />
                    <span>{item.label}</span>
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
          </>
        )}

        {/* Menu de conta - removendo Notificações e Pagamentos (apenas para ALUNO_CANDIDATO e EMPRESA) */}
        <DropdownMenuGroup>
          {MENU_ACCOUNT.filter((item) => {
            // Remove Notificações
            if (item.label === "Notificações") return false;
            // Remove Pagamentos se o role não for ALUNO_CANDIDATO ou EMPRESA
            if (item.label === "Pagamentos") {
              return (
                user.role === "ALUNO_CANDIDATO" || user.role === "EMPRESA"
              );
            }
            return true;
          }).map((item) => (
            <DropdownMenuItem key={item.href} asChild>
              <Link href={item.href} className="cursor-pointer">
                <item.icon className="size-4" />
                <span>{item.label}</span>
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {/* Logout */}
        <DropdownMenuItem
          onClick={handleLogout}
          className="cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50"
        >
          <MENU_LOGOUT.icon className="size-4" />
          <span>{isLoggingOut ? "Saindo..." : MENU_LOGOUT.label}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
