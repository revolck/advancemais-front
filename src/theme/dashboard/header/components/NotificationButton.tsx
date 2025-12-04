"use client";

import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Icon } from "@/components/ui/custom/Icons";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import {
  getUnreadCount,
  useMarkAllNotificationsAsRead,
  useMarkNotificationsAsRead,
  useNotifications,
} from "@/theme/dashboard/hooks/useNotifications";
import type { Notificacao } from "@/api/notificacoes/types";
import {
  ModalCustom,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalTitle,
} from "@/components/ui/custom/modal";
import { ButtonCustom } from "@/components/ui/custom/button";
import {
  TYPE_META,
  VAGA_TYPES,
  SISTEMA_TYPES,
  formatRelativeTime,
  PRIORITY_COLORS,
} from "@/theme/dashboard/utils/notifications";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface NotificationButtonProps {
  className?: string;
}

type FilterType = "all" | "vagas" | "sistema";

export function NotificationButton({ className }: NotificationButtonProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<FilterType>("all");
  const [selectedNotification, setSelectedNotification] =
    useState<Notificacao | null>(null);

  const listParams = useMemo(() => ({ page: 1, pageSize: 10 }), []);

  const { data, isLoading, isError, isFetching, refetch } =
    useNotifications(listParams);
  const allNotifications = data?.data ?? [];
  const unreadCount = getUnreadCount(data) ?? 0;

  // Filtrar notificações por categoria
  const filteredNotifications = useMemo(() => {
    if (filter === "vagas") {
      return allNotifications.filter((n) => VAGA_TYPES.includes(n.tipo));
    }
    if (filter === "sistema") {
      return allNotifications.filter((n) => SISTEMA_TYPES.includes(n.tipo));
    }
    return allNotifications;
  }, [allNotifications, filter]);

  // Contar por categoria
  const vagasCount = allNotifications.filter((n) =>
    VAGA_TYPES.includes(n.tipo)
  ).length;
  const sistemaCount = allNotifications.filter((n) =>
    SISTEMA_TYPES.includes(n.tipo)
  ).length;

  const markNotificationAsRead = useMarkNotificationsAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();

  const handleNotificationClick = (notification: Notificacao) => {
    if (notification.status === "NAO_LIDA") {
      markNotificationAsRead.mutate({ notificacaoIds: [notification.id] });
    }

    const hasLongMessage = notification.mensagem.length > 100;
    const hasExtraData =
      notification.dados && Object.keys(notification.dados).length > 0;

    if (hasLongMessage || hasExtraData) {
      setSelectedNotification(notification);
    } else if (notification.linkAcao) {
      setIsOpen(false);
      router.push(notification.linkAcao);
    }
  };

  const handleMarkAsRead = (e: React.MouseEvent, notification: Notificacao) => {
    e.stopPropagation();
    if (notification.status === "NAO_LIDA") {
      markNotificationAsRead.mutate({ notificacaoIds: [notification.id] });
    }
  };

  const handleModalClose = () => setSelectedNotification(null);

  const handleModalAction = () => {
    if (selectedNotification?.linkAcao) {
      setSelectedNotification(null);
      setIsOpen(false);
      router.push(selectedNotification.linkAcao);
    } else {
      setSelectedNotification(null);
    }
  };

  const handleMarkAllAsRead = () => {
    if (!unreadCount || markAllAsRead.isPending) return;
    markAllAsRead.mutate(undefined);
  };

  return (
    <>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "relative h-10 w-10 rounded-lg hover:bg-white/10 active:bg-white/20",
                "transition-all duration-200 ease-in-out",
                "focus:outline-none focus:ring-2 focus:ring-white/20",
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
                  className="text-white transition-colors"
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
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[11px] font-semibold text-white shadow-lg">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <span className="sr-only">Notificações</span>
            </Button>
          </motion.div>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          className="w-[380px] overflow-hidden rounded-2xl border border-gray-200 bg-white p-0 shadow-xl"
          sideOffset={12}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Icon
                name="BellRing"
                size={18}
                className="text-[var(--primary-color)]"
              />
              <h3 className="!m-0 !text-base !font-semibold leading-none">
                Notificações
              </h3>
            </div>
            <TooltipProvider>
              <div className="flex items-center gap-1.5">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={handleMarkAllAsRead}
                      disabled={!unreadCount || markAllAsRead.isPending}
                      className="p-1.5 rounded-full text-gray-400 transition-colors hover:text-[var(--primary-color)] hover:bg-[var(--primary-color)]/10 disabled:text-gray-300 disabled:hover:bg-transparent"
                    >
                      <Icon name="CheckCheck" size={16} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="!text-xs">
                    Marcar todas como lidas
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={() => refetch()}
                      className="p-1.5 rounded-full text-gray-400 hover:text-[var(--primary-color)] hover:bg-[var(--primary-color)]/10 transition-colors disabled:text-gray-300 disabled:hover:bg-transparent"
                      disabled={isFetching && !isLoading}
                    >
                      {isFetching && !isLoading ? (
                        <Icon
                          name="Loader2"
                          size={16}
                          className="animate-spin"
                        />
                      ) : (
                        <Icon name="RefreshCw" size={16} />
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="!text-xs">
                    Atualizar
                  </TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>
          </div>

          {/* Tabs de filtro */}
          <div className="flex border-b border-gray-100">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={cn(
                "flex-1 px-4 py-2.5 !text-sm !font-medium transition-colors relative",
                filter === "all"
                  ? "text-[var(--primary-color)]"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              )}
            >
              Todas
              <span
                className={cn(
                  "ml-1.5 px-1.5 py-0.5 rounded !text-xs",
                  filter === "all"
                    ? "bg-[var(--primary-color)] text-white"
                    : "bg-gray-100 text-gray-600"
                )}
              >
                {allNotifications.length}
              </span>
              {filter === "all" && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--primary-color)]"
                />
              )}
            </button>
            <button
              type="button"
              onClick={() => setFilter("vagas")}
              className={cn(
                "flex-1 px-4 py-2.5 !text-sm !font-medium transition-colors relative",
                filter === "vagas"
                  ? "text-[var(--primary-color)]"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              )}
            >
              Vagas
              <span
                className={cn(
                  "ml-1.5 px-1.5 py-0.5 rounded !text-xs",
                  filter === "vagas"
                    ? "bg-[var(--primary-color)] text-white"
                    : "bg-gray-100 text-gray-600"
                )}
              >
                {vagasCount}
              </span>
              {filter === "vagas" && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--primary-color)]"
                />
              )}
            </button>
            <button
              type="button"
              onClick={() => setFilter("sistema")}
              className={cn(
                "flex-1 px-4 py-2.5 !text-sm !font-medium transition-colors relative",
                filter === "sistema"
                  ? "text-[var(--primary-color)]"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              )}
            >
              Sistema
              <span
                className={cn(
                  "ml-1.5 px-1.5 py-0.5 rounded !text-xs",
                  filter === "sistema"
                    ? "bg-[var(--primary-color)] text-white"
                    : "bg-gray-100 text-gray-600"
                )}
              >
                {sistemaCount}
              </span>
              {filter === "sistema" && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--primary-color)]"
                />
              )}
            </button>
          </div>

          {/* Lista */}
          <div className="max-h-[340px] overflow-y-auto">
            {isLoading ? (
              <div className="p-4 space-y-4">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="flex gap-3 animate-pulse">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0" />
                    <div className="flex-1 space-y-2 py-1">
                      <div className="h-3 w-4/5 rounded bg-gray-200" />
                      <div className="h-2.5 w-3/5 rounded bg-gray-100" />
                    </div>
                  </div>
                ))}
              </div>
            ) : isError ? (
              <div className="px-4 py-10 text-center">
                <Icon
                  name="AlertTriangle"
                  size={28}
                  className="mx-auto mb-2 text-red-400"
                />
                <p className="!text-sm !font-medium text-gray-600">
                  Erro ao carregar
                </p>
                <p className="!text-xs text-gray-400 mt-1">
                  Tente novamente mais tarde
                </p>
              </div>
            ) : filteredNotifications.length > 0 ? (
              <div className="divide-y divide-gray-100">
                <AnimatePresence mode="popLayout">
                  {filteredNotifications.map((notification, index) => {
                  const meta = TYPE_META[notification.tipo] ?? {
                    label: "Notificação",
                    icon: "Bell",
                      bgColor: "bg-slate-100",
                      textColor: "text-slate-600",
                      tagBg: "bg-slate-50",
                      tagText: "text-slate-700",
                  };
                  const isUnread = notification.status === "NAO_LIDA";
                  const relativeTime = formatRelativeTime(
                    notification.criadoEm
                  );
                    const isMarkingAsRead = markNotificationAsRead.isPending;

                  return (
                      <motion.div
                      key={notification.id}
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -15 }}
                        transition={{
                          duration: 0.15,
                          delay: index < 3 ? index * 0.03 : 0,
                        }}
                        layout
                      className={cn(
                          "flex items-start gap-3 px-4 py-3 transition-colors",
                          isUnread ? "bg-blue-50/30" : "bg-white"
                      )}
                    >
                      {/* Icon */}
                      <div
                        className={cn(
                            "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
                            meta.bgColor,
                            meta.textColor
                        )}
                      >
                          <Icon name={meta.icon as any} size={14} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                          {/* Tag de tipo */}
                          <span
                            className={cn(
                              "inline-block text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded mb-1",
                              meta.tagBg,
                              meta.tagText
                            )}
                          >
                            {meta.label}
                          </span>

                        <p
                          className={cn(
                              "!text-[12px] text-gray-700 line-clamp-2 leading-snug",
                              isUnread && "!font-medium text-gray-800"
                          )}
                        >
                          {notification.mensagem}
                        </p>
                        </div>

                        {/* Coluna direita: Tempo + Ações */}
                        <div className="flex flex-col items-end gap-1.5 shrink-0">
                          {/* Tempo com ícone */}
                          <div className="flex items-center gap-1 text-[10px] text-gray-400">
                            <Icon name="Clock" size={10} />
                            <span>{relativeTime}</span>
                          </div>

                          {/* Botões de ação */}
                          <div className="flex items-center gap-1">
                            {notification.linkAcao && (
                              <ButtonCustom
                                variant="primary"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  router.push(notification.linkAcao!);
                                }}
                                className="!h-6 !text-[10px] !px-2"
                              >
                                Ver vaga
                              </ButtonCustom>
                            )}

                        {isUnread && (
                              <ButtonCustom
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markNotificationAsRead.mutate({
                                    notificacaoIds: [notification.id],
                                  });
                                }}
                                disabled={isMarkingAsRead}
                                className="!h-6 !text-[10px] !px-2"
                              >
                                Lida
                              </ButtonCustom>
                        )}
                      </div>
                        </div>
                      </motion.div>
                  );
                })}
                </AnimatePresence>
              </div>
            ) : (
              <div className="px-4 py-10 text-center">
                <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
                  <Icon name="BellOff" size={24} className="text-gray-400" />
                </div>
                <p className="!text-sm !font-medium !mb-0">
                  Nenhuma notificação
                </p>
                <p className="!text-xs !mt-0">Você está em dia!</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-center px-5 py-4 border-t border-gray-100 bg-gray-50/60">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                router.push("/dashboard/notificacoes");
              }}
              className="flex w-full border-none items-center justify-center gap-2 !bg-transparent px-4 py-2.5 !text-sm !font-semibold text-[var(--primary-color)] transition-all hover:-translate-y-[1px] cursor-pointer"
            >
              Ver notificações anteriores
            </button>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Modal de detalhes */}
      <ModalCustom
        isOpen={!!selectedNotification}
        onClose={handleModalClose}
        size="md"
        backdrop="blur"
      >
        {selectedNotification && (
          <>
            <ModalHeader>
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center",
                    TYPE_META[selectedNotification.tipo]?.bgColor ??
                      "bg-slate-100",
                    TYPE_META[selectedNotification.tipo]?.textColor ??
                      "text-slate-600"
                  )}
                >
                  <Icon
                    name={
                      (TYPE_META[selectedNotification.tipo]?.icon ??
                        "Bell") as any
                    }
                    size={18}
                  />
                </div>
                <div>
                  <ModalTitle>{selectedNotification.titulo}</ModalTitle>
                  <p className="!text-xs text-gray-500 mt-0.5">
                    {TYPE_META[selectedNotification.tipo]?.label ??
                      "Notificação"}{" "}
                    • {formatRelativeTime(selectedNotification.criadoEm)}
                  </p>
                </div>
              </div>
            </ModalHeader>

            <ModalBody className="space-y-4">
              <p className="!text-sm text-gray-700 leading-relaxed">
                {selectedNotification.mensagem}
              </p>

              {selectedNotification.dados &&
                Object.keys(selectedNotification.dados).length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                    {Object.entries(selectedNotification.dados).map(
                      ([key, value]) => (
                        <div
                          key={key}
                          className="flex justify-between items-start gap-4"
                        >
                          <span className="!text-xs !font-medium text-gray-500 capitalize">
                            {key.replace(/([A-Z])/g, " $1").trim()}:
                          </span>
                          <span className="!text-xs text-gray-700 text-right">
                            {typeof value === "string"
                              ? value
                              : JSON.stringify(value)}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                )}

              {selectedNotification.vaga && (
                <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                  <Icon name="Briefcase" size={16} className="text-blue-600" />
                  <div>
                    <p className="!text-xs !font-medium text-blue-900">
                      {selectedNotification.vaga.titulo}
                    </p>
                    <p className="!text-xs text-blue-600">
                      Código: {selectedNotification.vaga.codigo}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2">
                <span className="!text-xs text-gray-500">Prioridade:</span>
                <span
                  className={cn(
                    "px-2 py-0.5 rounded-full !text-xs !font-medium",
                    PRIORITY_COLORS[selectedNotification.prioridade]
                  )}
                >
                  {selectedNotification.prioridade}
                </span>
              </div>
            </ModalBody>

            <ModalFooter>
              <ButtonCustom variant="ghost" onClick={handleModalClose}>
                Fechar
              </ButtonCustom>
              {selectedNotification.linkAcao && (
                <ButtonCustom variant="primary" onClick={handleModalAction}>
                  Ver detalhes
                </ButtonCustom>
              )}
            </ModalFooter>
          </>
        )}
      </ModalCustom>
    </>
  );
}
