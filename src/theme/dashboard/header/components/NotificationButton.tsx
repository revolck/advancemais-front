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
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/custom/Icons";
import { cn } from "@/lib/utils";

interface NotificationButtonProps {
  className?: string;
}

export function NotificationButton({ className }: NotificationButtonProps) {
  // Mock de notificações - substitua pela sua lógica real
  const notifications = [
    {
      id: 1,
      title: "Nova mensagem",
      description: "Você recebeu uma nova mensagem de João",
      time: "2 min atrás",
      unread: true,
    },
    {
      id: 2,
      title: "Tarefa concluída",
      description: "Projeto XYZ foi finalizado com sucesso",
      time: "1 hora atrás",
      unread: true,
    },
    {
      id: 3,
      title: "Reunião agendada",
      description: "Reunião de equipe marcada para amanhã",
      time: "3 horas atrás",
      unread: false,
    },
  ];

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
      <Button
          variant="ghost"
          size="icon"
          className={cn(
            "relative p-2.5 rounded-lg hover:bg-white/10 transition-colors duration-200",
            className
          )}
        >
          <Icon name="Bell" size={22} className="text-white" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {unreadCount}
            </Badge>
          )}
          <span className="sr-only">Notificações</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          Notificações
          {unreadCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {unreadCount} nova{unreadCount !== 1 ? "s" : ""}
            </Badge>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <DropdownMenuItem
              key={notification.id}
              className="flex flex-col items-start p-3 cursor-pointer"
            >
              <div className="flex items-start justify-between w-full">
                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      "text-sm font-medium truncate",
                      notification.unread && "font-semibold"
                    )}
                  >
                    {notification.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {notification.description}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {notification.time}
                  </p>
                </div>
                {notification.unread && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1 ml-2" />
                )}
              </div>
            </DropdownMenuItem>
          ))
        ) : (
          <DropdownMenuItem disabled>
            <p className="text-sm text-muted-foreground">
              Nenhuma notificação
            </p>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem className="justify-center text-sm font-medium text-primary">
          Ver todas as notificações
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
