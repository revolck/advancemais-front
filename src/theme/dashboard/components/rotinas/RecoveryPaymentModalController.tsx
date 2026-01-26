"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useUserRole } from "@/hooks/useUserRole";
import { UserRole } from "@/config/roles";
import { RecuperacaoFinalPagamentoModal } from "@/components/ui/custom";
import type { Notificacao, NotificacaoTipo } from "@/api/notificacoes/types";
import {
  useMarkNotificationsAsRead,
  useNotifications,
} from "@/theme/dashboard/hooks/useNotifications";
import { getNotificationAction } from "@/theme/dashboard/utils/notifications";

/**
 * Controller para a modal de pagamento de recuperação final.
 * 
 * Regras:
 * - Só é exibida para usuários com role ALUNO_CANDIDATO
 * - Só busca notificações quando o usuário é ALUNO_CANDIDATO
 * - Não exibe na página de pagamentos
 */
export function RecoveryPaymentModalController() {
  const router = useRouter();
  const pathname = usePathname() || "";
  const userRole = useUserRole();
  
  const [mounted, setMounted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [notification, setNotification] = useState<Notificacao | null>(null);

  // Só busca notificações de recuperação final se o usuário for ALUNO_CANDIDATO
  const isAlunoCandidato = userRole === UserRole.ALUNO_CANDIDATO;

  const notificationsParams = useMemo(
    () =>
      isAlunoCandidato
        ? {
            page: 1,
            pageSize: 1,
            apenasNaoLidas: true,
            tipo: ["RECUPERACAO_FINAL_PAGAMENTO_PENDENTE"] as NotificacaoTipo[],
          }
        : undefined,
    [isAlunoCandidato]
  );

  const { data: notificationsData } = useNotifications(notificationsParams);
  const markAsRead = useMarkNotificationsAsRead();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Exibe a modal quando há notificação pendente
  useEffect(() => {
    if (!mounted) return;
    if (!isAlunoCandidato) return;
    if (showModal) return;
    if (pathname.startsWith("/dashboard/cursos/pagamentos")) return;

    const pending = notificationsData?.data?.[0] ?? null;
    if (!pending) return;

    setNotification(pending);
    setShowModal(true);
  }, [mounted, isAlunoCandidato, pathname, notificationsData, showModal]);

  const handleClose = () => {
    if (notification?.status === "NAO_LIDA") {
      markAsRead.mutate({ notificacaoIds: [notification.id] });
    }
    setShowModal(false);
    setNotification(null);
  };

  const handlePayNow = () => {
    if (!notification) return;

    if (notification.status === "NAO_LIDA") {
      markAsRead.mutate({ notificacaoIds: [notification.id] });
    }

    const action = getNotificationAction(notification);
    setShowModal(false);
    setNotification(null);
    router.push(action.href || "/dashboard/cursos/pagamentos?tipo=recuperacao-final");
  };

  // Não renderiza nada se não for ALUNO_CANDIDATO
  if (!isAlunoCandidato) {
    return null;
  }

  // Extrai dados da notificação
  const dados = (notification?.dados ?? null) as Record<string, unknown> | null;
  const courseName = typeof dados?.cursoNome === "string" ? dados.cursoNome : null;
  const turmaName = typeof dados?.turmaNome === "string" ? dados.turmaNome : null;
  const amount = (() => {
    const raw = dados?.valor;
    if (typeof raw === "number" && Number.isFinite(raw)) return raw;
    if (typeof raw === "string") {
      const n = Number(raw);
      if (Number.isFinite(n)) return n;
    }
    return 50;
  })();

  return (
    <RecuperacaoFinalPagamentoModal
      isOpen={showModal}
      onClose={handleClose}
      onPayNow={handlePayNow}
      isPaying={markAsRead.isPending}
      amount={amount}
      courseName={courseName}
      turmaName={turmaName}
    />
  );
}









