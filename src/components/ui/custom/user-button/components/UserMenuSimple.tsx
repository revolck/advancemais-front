"use client";

import React from "react";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import {
  MENU_ACCOUNT,
  MENU_LOGOUT,
  MENU_UPGRADE,
} from "../constants";

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
import { Button } from "@/components/ui/button";
import { getUserProfile, logoutUserSession } from "@/api/usuarios";
import { logoutUser } from "@/lib/auth";

interface User {
  name: string;
  email: string;
  avatar?: string;
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
        if (!profile?.email) {
          setIsLoading(false);
          return;
        }

        const fullName = profile.nomeCompleto?.trim();
        const name = fullName && fullName.length > 0 ? fullName : profile.email.split("@")[0];
        setUser({
          name,
          email: profile.email,
          avatar: profile.imagemPerfil ?? undefined,
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

  if (isLoading || !user) return null;

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2 px-2">
          <Avatar className="size-6 rounded-lg">
            {user.avatar && <AvatarImage src={user.avatar} alt={user.name} />}
            <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
          </Avatar>
          <div className="truncate">{user.name}</div>
          <ChevronDown />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
        sideOffset={4}
      >
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
            <Avatar className="size-8 rounded-lg">
              {user.avatar && <AvatarImage src={user.avatar} alt={user.name} />}
              <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">{user.name}</span>
              <span className="text-muted-foreground truncate text-xs">
                {user.email}
              </span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {MENU_UPGRADE.map((item) => (
            <DropdownMenuItem key={item.href} asChild>
              <Link href={item.href} className="flex items-center gap-2">
                <item.icon />
                {item.label}
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {MENU_ACCOUNT.map((item) => (
            <DropdownMenuItem key={item.href} asChild>
              <Link href={item.href} className="flex items-center gap-2">
                <item.icon />
                {item.label}
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleLogout}
          className={MENU_LOGOUT.className}
        >
          <div className="flex items-center gap-2">
            <MENU_LOGOUT.icon className={MENU_LOGOUT.iconClassName} />
            {isLoggingOut ? "Saindo..." : MENU_LOGOUT.label}
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
