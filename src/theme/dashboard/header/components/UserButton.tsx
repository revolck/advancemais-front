"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Icon } from "@/components/ui/custom/Icons";
import { cn } from "@/lib/utils";

interface UserButtonProps {
  className?: string;
}

export function UserButton({ className }: UserButtonProps) {
  // Mock de dados do usuário - substitua pela sua lógica real
  const user = {
    name: "João Silva",
    email: "joao.silva@empresa.com",
    avatar: null, // URL da imagem ou null para fallback
    initials: "JS",
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "relative h-10 w-10 p-0 rounded-full hover:bg-white/10 transition-colors duration-200",
            className
          )}
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatar || undefined} alt={user.name} />
            <AvatarFallback className="bg-white/20 text-white text-sm font-medium">
              {user.initials}
            </AvatarFallback>
          </Avatar>
          <span className="sr-only">Menu do usuário</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer">
          <Icon name="User" className="mr-2 h-4 w-4" />
          <span>Perfil</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer">
          <Icon name="Settings" className="mr-2 h-4 w-4" />
          <span>Configurações</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer">
          <Icon name="CreditCard" className="mr-2 h-4 w-4" />
          <span>Cobrança</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600">
          <Icon name="LogOut" className="mr-2 h-4 w-4" />
          <span>Sair</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
