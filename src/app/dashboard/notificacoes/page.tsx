"use client";

import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BellRing, BellDot, Briefcase, ShieldAlert, Clock } from "lucide-react";
import { Icon } from "@/components/ui/custom/Icons";
import { cn } from "@/lib/utils";
import { ButtonCustom } from "@/components/ui/custom/button";
import {
  ModalBody,
  ModalCustom,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/custom/modal";
import {
  getUnreadCount,
  useMarkAllNotificationsAsRead,
  useMarkNotificationsAsRead,
  useNotifications,
} from "@/theme/dashboard/hooks/useNotifications";
import type { Notificacao } from "@/api/notificacoes/types";
import {
  PRIORITY_COLORS,
  SISTEMA_TYPES,
  TYPE_META,
  VAGA_TYPES,
  formatRelativeTime,
} from "@/theme/dashboard/utils/notifications";
import { CardsStatistics } from "@/components/ui/custom/cards-statistics";
import type { StatisticCard } from "@/components/ui/custom/cards-statistics";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";

type FilterType = "all" | "vagas" | "sistema";

export default function DashboardNotificationsPage() {
  const router = useRouter();
  const [filter, setFilter] = useState<FilterType>("all");
  const [selectedNotification, setSelectedNotification] =
    useState<Notificacao | null>(null);

  const listParams = useMemo(() => ({ page: 1, pageSize: 25 }), []);

  const { data, isLoading, isFetching, isError, refetch } =
    useNotifications(listParams);
  const allNotifications = data?.data ?? [];
  const unreadCount = getUnreadCount(data) ?? 0;

  // Mostra skeleton apenas no carregamento inicial (não durante refetch)
  const showSkeleton = isLoading;

  const filteredNotifications = useMemo(() => {
    if (filter === "vagas") {
      return allNotifications.filter((n) => VAGA_TYPES.includes(n.tipo));
    }
    if (filter === "sistema") {
      return allNotifications.filter((n) => SISTEMA_TYPES.includes(n.tipo));
    }
    return allNotifications;
  }, [allNotifications, filter]);

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

    const hasLongMessage = notification.mensagem.length > 120;
    const hasExtraData =
      notification.dados && Object.keys(notification.dados).length > 0;

    if (hasLongMessage || hasExtraData) {
      setSelectedNotification(notification);
    } else if (notification.linkAcao) {
      router.push(notification.linkAcao);
    }
  };

  const handleNotificationKeyDown = (
    event: React.KeyboardEvent<HTMLDivElement>,
    notification: Notificacao
  ) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleNotificationClick(notification);
    }
  };

  const handleMarkAsRead = (
    event: React.MouseEvent,
    notification: Notificacao
  ) => {
    event.stopPropagation();
    if (notification.status === "NAO_LIDA") {
      markNotificationAsRead.mutate({ notificacaoIds: [notification.id] });
    }
  };

  const handleModalClose = () => setSelectedNotification(null);

  const handleModalAction = () => {
    if (selectedNotification?.linkAcao) {
      const route = selectedNotification.linkAcao;
      setSelectedNotification(null);
      router.push(route);
    } else {
      setSelectedNotification(null);
    }
  };

  const handleMarkAll = () => {
    if (!unreadCount || markAllAsRead.isPending) return;
    markAllAsRead.mutate(undefined);
  };

  const totalCount = allNotifications.length;
  const totalUnread = allNotifications.filter(
    (notification) => notification.status === "NAO_LIDA"
  ).length;
  const vagasTotal = allNotifications.filter((notification) =>
    VAGA_TYPES.includes(notification.tipo)
  ).length;
  const sistemaTotal = allNotifications.filter((notification) =>
    SISTEMA_TYPES.includes(notification.tipo)
  ).length;

  const summaryCards = useMemo(
    (): StatisticCard[] => [
      {
        icon: BellRing,
        iconBg: "bg-blue-100 text-blue-600",
        value: totalCount,
        label: "Total de notificações",
        info: (
          <span className="!text-xs text-gray-500">
            Últimos registros disponíveis
          </span>
        ),
        cardBg: "bg-white",
      },
      {
        icon: BellDot,
        iconBg: "bg-amber-100 text-amber-600",
        value: totalUnread,
        label: "Não lidas",
        info: (
          <span className="!text-xs text-gray-500">
            Inclui vagas e alertas de sistema
          </span>
        ),
        cardBg: "bg-white",
      },
      {
        icon: Briefcase,
        iconBg: "bg-emerald-100 text-emerald-600",
        value: vagasTotal,
        label: "Relacionadas às vagas",
        info: (
          <span className="!text-xs text-gray-500">
            Publicação, aprovação e candidatos
          </span>
        ),
        cardBg: "bg-white",
      },
      {
        icon: ShieldAlert,
        iconBg: "bg-purple-100 text-purple-600",
        value: sistemaTotal,
        label: "Alertas do sistema",
        info: (
          <span className="!text-xs text-gray-500">
            Pagamentos, planos e segurança
          </span>
        ),
        cardBg: "bg-white",
      },
    ],
    [sistemaTotal, totalCount, totalUnread, vagasTotal]
  );

  return (
    <div className="container mx-auto space-y-6">
      <div className="flex flex-wrap items-center justify-end gap-2">
        <div className="flex items-center gap-2">
          <ButtonCustom
            variant="ghost"
            onClick={() => refetch()}
            icon={isFetching ? "Loader2" : "RefreshCw"}
            disabled={isFetching}
            className={cn(
              "border border-gray-200 !text-sm text-gray-600 hover:text-[var(--primary-color)] hover:bg-[var(--primary-color)]/10",
              isFetching && "[&_svg]:animate-spin"
            )}
          >
            {isFetching ? "Atualizando..." : "Atualizar"}
          </ButtonCustom>
          <ButtonCustom
            variant="primary"
            onClick={handleMarkAll}
            disabled={!unreadCount || markAllAsRead.isPending}
          >
            Marcar todas como lidas
          </ButtonCustom>
        </div>
      </div>

      {showSkeleton ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={`notification-stat-skeleton-${index}`}
              className="rounded-xl border border-gray-200 bg-white p-6"
            >
              <Skeleton className="h-4 w-24" />
              <Skeleton className="mt-3 h-8 w-16" />
              <Skeleton className="mt-2 h-3 w-32" />
            </div>
          ))}
        </div>
      ) : (
        <CardsStatistics
          cards={summaryCards}
          gridClassName="grid-cols-1 sm:grid-cols-2 xl:grid-cols-4"
        />
      )}

      <div className="rounded-3xl border border-gray-200 bg-white/95">
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-5 border-b border-gray-100">
          <div>
            <h2 className="!text-lg !font-semibold !mb-0">Caixa de entrada</h2>
            <p className="!text-xs text-gray-500 mt-1">
              Acompanhe as interações recentes e filtre por categoria.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1.5 text-[11px] text-gray-500">
            <Icon name="Info" size={12} />
            Atualizado automaticamente
          </div>
        </div>
        {/* Filtros em abas */}
        <div className="flex border-b border-gray-100 px-6">
          {showSkeleton ? (
            // Skeleton das abas
            <>
              {["Todas", "Vagas", "Sistema"].map((label, index) => (
                <div
                  key={label}
                  className="flex-1 px-4 py-3 flex items-center gap-2"
                >
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-5 w-6 rounded-full" />
                  {index === 0 && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-200" />
                  )}
                </div>
              ))}
            </>
          ) : (
            // Abas reais
            <>
              <button
                type="button"
                onClick={() => setFilter("all")}
                className={cn(
                  "flex-1 px-4 py-3 text-left !text-sm !font-medium transition-colors relative",
                  filter === "all"
                    ? "text-[var(--primary-color)]"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                )}
              >
                Todas
                <span
                  className={cn(
                    "ml-2 inline-flex items-center justify-center rounded-full px-2 py-0.5 !text-xs",
                    filter === "all"
                      ? "bg-[var(--primary-color)] text-white"
                      : "bg-gray-100 text-gray-600"
                  )}
                >
                  {allNotifications.length}
                </span>
                {filter === "all" && (
                  <motion.div
                    layoutId="dashboard-active-tab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--primary-color)]"
                  />
                )}
              </button>
              <button
                type="button"
                onClick={() => setFilter("vagas")}
                className={cn(
                  "flex-1 px-4 py-3 text-left !text-sm !font-medium transition-colors relative",
                  filter === "vagas"
                    ? "text-[var(--primary-color)]"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                )}
              >
                Vagas
                <span
                  className={cn(
                    "ml-2 inline-flex items-center justify-center rounded-full px-2 py-0.5 !text-xs",
                    filter === "vagas"
                      ? "bg-[var(--primary-color)] text-white"
                      : "bg-gray-100 text-gray-600"
                  )}
                >
                  {vagasCount}
                </span>
                {filter === "vagas" && (
                  <motion.div
                    layoutId="dashboard-active-tab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--primary-color)]"
                  />
                )}
              </button>
              <button
                type="button"
                onClick={() => setFilter("sistema")}
                className={cn(
                  "flex-1 px-4 py-3 text-left !text-sm !font-medium transition-colors relative",
                  filter === "sistema"
                    ? "text-[var(--primary-color)]"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                )}
              >
                Sistema
                <span
                  className={cn(
                    "ml-2 inline-flex items-center justify-center rounded-full px-2 py-0.5 !text-xs",
                    filter === "sistema"
                      ? "bg-[var(--primary-color)] text-white"
                      : "bg-gray-100 text-gray-600"
                  )}
                >
                  {sistemaCount}
                </span>
                {filter === "sistema" && (
                  <motion.div
                    layoutId="dashboard-active-tab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--primary-color)]"
                  />
                )}
              </button>
            </>
          )}
        </div>

        {/* Lista */}
        <div className="max-h-[700px] overflow-y-auto">
          {showSkeleton ? (
            <div className="divide-y divide-gray-100">
              {[...Array(5)].map((_, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 px-6 py-4 animate-pulse"
                >
                  <div className="h-9 w-9 rounded-full bg-gray-100" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-2/3 rounded bg-gray-100" />
                    <div className="h-3 w-1/2 rounded bg-gray-50" />
                  </div>
                  <div className="h-4 w-16 rounded bg-gray-50" />
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center gap-2 px-6 py-12 text-center">
              <Icon name="AlertTriangle" size={28} className="text-red-400" />
              <p className="!text-sm !font-medium text-gray-600">
                Não foi possível carregar as notificações.
              </p>
              <p className="!text-xs text-gray-400">
                Tente novamente em instantes.
              </p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
              <span className="rounded-full bg-gray-50 p-3 text-gray-300">
                <Icon name="BellOff" size={28} />
              </span>
              <div className="space-y-1">
                <p className="!text-sm !font-medium text-gray-600 !mb-0">
                  Nenhuma notificação
                </p>
                <p className="!text-xs !text-gray-400">
                  Você está em dia com tudo.
                </p>
              </div>
            </div>
          ) : (
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
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{
                        duration: 0.2,
                        delay: index < 5 ? index * 0.05 : 0,
                      }}
                      layout
                      className={cn(
                        "group flex items-start gap-4 px-6 py-4 transition-colors",
                        isUnread ? "bg-blue-50/30" : "bg-white"
                      )}
                    >
                      {/* Ícone circular */}
                      <div
                        className={cn(
                          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                          meta.bgColor,
                          meta.textColor
                        )}
                      >
                        <Icon name={meta.icon as any} size={18} />
                      </div>

                      {/* Conteúdo principal */}
                      <div className="flex-1 min-w-0 space-y-1">
                        {/* Tag de tipo */}
                        <span
                          className={cn(
                            "inline-block text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded",
                            meta.tagBg,
                            meta.tagText
                          )}
                        >
                          {meta.label}
                        </span>

                        {/* Mensagem */}
                        <p
                          className={cn(
                            "!text-[13px] leading-snug line-clamp-2",
                            isUnread
                              ? "text-gray-800 font-medium"
                              : "text-gray-600"
                          )}
                        >
                          {notification.mensagem}
                        </p>
                      </div>

                      {/* Coluna direita: Tempo + Ações */}
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        {/* Tempo com ícone */}
                        <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                          <Clock className="h-3 w-3" />
                          <span>{relativeTime}</span>
                        </div>

                        {/* Botões de ação */}
                        <div className="flex items-center gap-2">
                          {/* Ver vaga */}
                          {notification.linkAcao && (
                            <ButtonCustom
                              variant="primary"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(notification.linkAcao!);
                              }}
                              className="!h-7 !text-xs !px-3"
                            >
                              Ver vaga
                            </ButtonCustom>
                          )}

                          {/* Marcar como lida */}
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
                              className="!h-7 !text-xs !px-3"
                            >
                              Marcar como lida
                            </ButtonCustom>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

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
                    "flex h-11 w-11 items-center justify-center rounded-full",
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
                    size={20}
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
              <p className="!text-sm leading-relaxed text-gray-700">
                {selectedNotification.mensagem}
              </p>

              {selectedNotification.dados &&
                Object.keys(selectedNotification.dados).length > 0 && (
                  <div className="rounded-lg bg-gray-50 p-4">
                    <p className="!text-xs !font-medium text-gray-500 uppercase tracking-wide">
                      Detalhes adicionais
                    </p>
                    <div className="mt-3 space-y-2">
                      {Object.entries(selectedNotification.dados).map(
                        ([key, value]) => (
                          <div
                            key={key}
                            className="flex items-start justify-between gap-4"
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
                  </div>
                )}

              {selectedNotification.vaga && (
                <div className="flex items-center gap-2 rounded-lg bg-blue-50 p-3">
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
                    "inline-flex items-center gap-1 rounded-full px-2 py-0.5 !text-xs !font-medium",
                    PRIORITY_COLORS[selectedNotification.prioridade]
                  )}
                >
                  <Icon name="Activity" size={10} />
                  {selectedNotification.prioridade.toLowerCase()}
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
    </div>
  );
}
