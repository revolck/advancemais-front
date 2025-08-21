"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  avatar?: string;
  plan: "free" | "pro" | "enterprise";
}

export function UserButton({ className }: UserButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = document.cookie
          .split("; ")
          .find((row) => row.startsWith("token="))?.split("=")[1];

        if (!token) return;

        const profile = await apiFetch<{
          usuario?: {
            nomeCompleto?: string;
            email: string;
            avatar?: string;
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
            avatar: userData.avatar,
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
      }
    };

    fetchUser();
  }, []);

  const menuItems = [
    {
      group: "Conta",
      items: [
        {
          icon: "User",
          label: "Meu Perfil",
          description: "Gerencie suas informações pessoais",
          action: () => console.log("Navegar para perfil"),
        },
        {
          icon: "Shield",
          label: "Segurança",
          description: "Senha, 2FA e configurações de segurança",
          action: () => console.log("Navegar para segurança"),
        },
      ],
    },
    {
      group: "Assinatura",
      items: [
        {
          icon: "Crown",
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
          icon: "CreditCard",
          label: "Fatura",
          description: "Histórico de pagamentos e faturas",
          action: () => console.log("Navegar para fatura"),
        },
      ],
    },
  ];

  const getPlanBadgeColor = (plan?: User["plan"]) => {
    switch (plan) {
      case "pro":
        return "bg-blue-100 text-blue-700";
      case "enterprise":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const handleLogout = async () => {
    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))?.split("=")[1];

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
      const baseDomain = host
        .replace(/^app\./, "")
        .replace(/^auth\./, "");
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
              <AvatarCustom
                name={displayName}
                src={user?.avatar}
                size="sm"
                showStatus={false}
                className="ring-2 ring-white shadow-sm"
              />
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-white leading-none">
                  {displayName}
                </p>
              </div>
              <motion.div
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
              >
                <Icon
                  name="ChevronDown"
                  size={14}
                  className="text-white/70 ml-1"
                />
              </motion.div>
            </div>
            <span className="sr-only">Menu do usuário</span>
          </Button>
        </motion.div>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80" sideOffset={8}>
        {/* Header do usuário */}
        <DropdownMenuLabel className="p-4">
          <div className="flex items-start gap-3">
            <AvatarCustom
              name={displayName}
              src={user?.avatar}
              size="md"
              showStatus={false}
              className="ring-2 ring-white shadow-sm"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {displayName}
                </p>
              </div>
              <p className="text-xs text-gray-500 truncate mb-2">
                {user?.email}
              </p>
              <div className="flex items-center gap-2">
                <Badge
                  variant="secondary"
                  className={cn(
                    "text-xs px-2 py-0.5",
                    getPlanBadgeColor(user?.plan)
                  )}
                >
                  {user?.plan === "pro"
                    ? "Plano Pro"
                    : user?.plan === "enterprise"
                    ? "Enterprise"
                    : "Plano Gratuito"}
                </Badge>
              </div>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {/* Menu items agrupados */}
        {menuItems.map((group, groupIndex) => (
          <motion.div
            key={group.group}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: groupIndex * 0.05 }}
          >
            <div className="px-4 py-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                {group.group}
              </p>
            </div>
            {group.items.map((item, itemIndex) => (
              <DropdownMenuItem
                key={item.label}
                className="px-4 py-3 cursor-pointer hover:bg-gray-50 focus:bg-gray-50"
                onClick={item.action}
              >
                <motion.div
                  className="flex items-start gap-3 w-full"
                  whileHover={{ x: 2 }}
                  transition={{ duration: 0.1 }}
                >
                  <div className="p-1.5 rounded-md bg-gray-100 shrink-0 mt-0.5">
                    <Icon name={item.icon as any} size={14} className="text-gray-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">
                        {item.label}
                      </p>
                      {item.badge && (
                        <Badge variant="secondary" className="text-xs ml-2">
                          {item.badge}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                  <Icon
                    name="ChevronRight"
                    size={12}
                    className="text-gray-400 mt-1 shrink-0"
                  />
                </motion.div>
              </DropdownMenuItem>
            ))}
            {groupIndex < menuItems.length - 1 && <DropdownMenuSeparator />}
          </motion.div>
        ))}

        <DropdownMenuSeparator />

        {/* Botão de Logout */}
        <DropdownMenuItem
          className="px-4 py-3 cursor-pointer text-red-600 focus:text-red-700 hover:bg-red-50 focus:bg-red-50"
          onClick={handleLogout}
        >
          <motion.div
            className="flex items-center gap-3 w-full"
            whileHover={{ x: 2 }}
            transition={{ duration: 0.1 }}
          >
            <div className="p-1.5 rounded-md bg-red-100 shrink-0">
              <Icon name="LogOut" size={14} className="text-red-600" />
            </div>
            <div>
              <p className="text-sm font-medium">Sair</p>
              <p className="text-xs text-red-500/70 mt-0.5">Encerrar sessão atual</p>
            </div>
            <Icon
              name="ChevronRight"
              size={12}
              className="text-red-400 ml-auto shrink-0"
            />
          </motion.div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

