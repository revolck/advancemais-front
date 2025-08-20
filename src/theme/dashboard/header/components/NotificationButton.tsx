"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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

interface Notification {
  id: number;
  title: string;
  description: string;
  time: string;
  unread: boolean;
  type: "message" | "task" | "meeting" | "system";
}

export function NotificationButton({ className }: NotificationButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Mock de notificações - substitua pela sua lógica real
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      title: "Nova mensagem",
      description: "Você recebeu uma nova mensagem de João Silva",
      time: "2 min atrás",
      unread: true,
      type: "message",
    },
    {
      id: 2,
      title: "Tarefa concluída",
      description: "Projeto XYZ foi finalizado com sucesso",
      time: "1 hora atrás",
      unread: true,
      type: "task",
    },
    {
      id: 3,
      title: "Reunião agendada",
      description: "Reunião de equipe marcada para amanhã às 14h",
      time: "3 horas atrás",
      unread: false,
      type: "meeting",
    },
    {
      id: 4,
      title: "Atualização do sistema",
      description: "Nova versão disponível para download",
      time: "1 dia atrás",
      unread: false,
      type: "system",
    },
  ]);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "message":
        return "MessageCircle";
      case "task":
        return "CheckCircle";
      case "meeting":
        return "Calendar";
      case "system":
        return "Settings";
      default:
        return "Bell";
    }
  };

  const markAsRead = (notificationId: number) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === notificationId
          ? { ...notification, unread: false }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, unread: false }))
    );
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "relative w-10 h-10 rounded-lg hover:bg-gray-100 active:bg-gray-200",
              "transition-all duration-200 ease-in-out",
              "focus:outline-none focus:ring-2 focus:ring-blue-500/20",
              className
            )}
          >
            <motion.div
              animate={unreadCount > 0 ? { rotate: [0, 10, -10, 0] } : {}}
              transition={{
                duration: 0.5,
                repeat: unreadCount > 0 ? Infinity : 0,
                repeatDelay: 3,
              }}
            >
              <Icon
                name="Bell"
                size={18}
                className="text-gray-600 hover:text-gray-800 transition-colors"
              />
            </motion.div>

            <AnimatePresence>
              {unreadCount > 0 && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="absolute -top-1 -right-1"
                >
                  <Badge
                    variant="destructive"
                    className="h-5 w-5 p-0 flex items-center justify-center text-xs font-semibold"
                  >
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </Badge>
                </motion.div>
              )}
            </AnimatePresence>
            <span className="sr-only">Notificações</span>
          </Button>
        </motion.div>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-96 max-h-[500px] overflow-hidden"
        sideOffset={8}
      >
        <DropdownMenuLabel className="flex items-center justify-between py-3 px-4">
          <div className="flex items-center gap-2">
            <Icon name="Bell" size={16} />
            <span className="font-semibold">Notificações</span>
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <>
                <Badge variant="secondary" className="text-xs px-2 py-1">
                  {unreadCount} nova{unreadCount !== 1 ? "s" : ""}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={markAllAsRead}
                >
                  Marcar todas como lidas
                </Button>
              </>
            )}
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <div className="max-h-96 overflow-y-auto">
          {notifications.length > 0 ? (
            notifications.map((notification, index) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <DropdownMenuItem
                  className="p-4 cursor-pointer hover:bg-gray-50 focus:bg-gray-50"
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start gap-3 w-full">
                    <div
                      className={cn(
                        "p-2 rounded-lg shrink-0 mt-0.5",
                        notification.unread ? "bg-blue-100" : "bg-gray-100"
                      )}
                    >
                      <Icon
                        name={getNotificationIcon(notification.type) as any}
                        size={14}
                        className={cn(
                          notification.unread
                            ? "text-blue-600"
                            : "text-gray-500"
                        )}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p
                            className={cn(
                              "text-sm font-medium truncate",
                              notification.unread
                                ? "text-gray-900"
                                : "text-gray-600"
                            )}
                          >
                            {notification.title}
                          </p>
                          <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                            {notification.description}
                          </p>
                          <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                            <Icon name="Clock" size={12} />
                            {notification.time}
                          </p>
                        </div>
                        {notification.unread && (
                          <motion.div
                            className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1 ml-2"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.1 }}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </DropdownMenuItem>
              </motion.div>
            ))
          ) : (
            <div className="p-8 text-center">
              <Icon
                name="BellOff"
                size={32}
                className="text-gray-300 mx-auto mb-3"
              />
              <p className="text-sm text-gray-500 font-medium">
                Nenhuma notificação
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Você está em dia com tudo!
              </p>
            </div>
          )}
        </div>

        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="justify-center p-3 text-sm font-medium text-blue-600 hover:text-blue-700 cursor-pointer">
              <Icon name="ExternalLink" size={14} className="mr-2" />
              Ver todas as notificações
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

