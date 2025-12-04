import type {
  NotificacaoPrioridade,
  NotificacaoTipo,
} from "@/api/notificacoes/types";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export const PRIORITY_COLORS: Record<NotificacaoPrioridade, string> = {
  BAIXA: "bg-slate-100 text-slate-600",
  NORMAL: "bg-blue-100 text-blue-600",
  ALTA: "bg-amber-100 text-amber-700",
  URGENTE: "bg-red-100 text-red-600",
};

export const TYPE_META: Record<
  NotificacaoTipo,
  { label: string; icon: string; bgColor: string; textColor: string; tagBg: string; tagText: string }
> = {
  VAGA_REJEITADA: {
    label: "Vaga rejeitada",
    icon: "XCircle",
    bgColor: "bg-red-100",
    textColor: "text-red-600",
    tagBg: "bg-red-50",
    tagText: "text-red-700",
  },
  VAGA_APROVADA: {
    label: "Vaga aprovada",
    icon: "BadgeCheck",
    bgColor: "bg-emerald-100",
    textColor: "text-emerald-600",
    tagBg: "bg-emerald-50",
    tagText: "text-emerald-700",
  },
  NOVO_CANDIDATO: {
    label: "Novo candidato",
    icon: "UserPlus",
    bgColor: "bg-blue-100",
    textColor: "text-blue-600",
    tagBg: "bg-blue-50",
    tagText: "text-blue-700",
  },
  VAGA_PREENCHIDA: {
    label: "Vaga preenchida",
    icon: "ClipboardCheck",
    bgColor: "bg-violet-100",
    textColor: "text-violet-600",
    tagBg: "bg-violet-50",
    tagText: "text-violet-700",
  },
  PLANO_EXPIRANDO: {
    label: "Plano expirando",
    icon: "Clock",
    bgColor: "bg-amber-100",
    textColor: "text-amber-600",
    tagBg: "bg-amber-50",
    tagText: "text-amber-700",
  },
  PLANO_EXPIRADO: {
    label: "Plano expirado",
    icon: "Ban",
    bgColor: "bg-red-100",
    textColor: "text-red-600",
    tagBg: "bg-red-50",
    tagText: "text-red-700",
  },
  ASSINATURA_RENOVADA: {
    label: "Assinatura",
    icon: "RefreshCw",
    bgColor: "bg-emerald-100",
    textColor: "text-emerald-600",
    tagBg: "bg-emerald-50",
    tagText: "text-emerald-700",
  },
  PAGAMENTO_APROVADO: {
    label: "Pagamento",
    icon: "CreditCard",
    bgColor: "bg-emerald-100",
    textColor: "text-emerald-600",
    tagBg: "bg-emerald-50",
    tagText: "text-emerald-700",
  },
  PAGAMENTO_RECUSADO: {
    label: "Pagamento",
    icon: "CreditCard",
    bgColor: "bg-red-100",
    textColor: "text-red-600",
    tagBg: "bg-red-50",
    tagText: "text-red-700",
  },
  SISTEMA: {
    label: "Sistema",
    icon: "Bell",
    bgColor: "bg-slate-100",
    textColor: "text-slate-600",
    tagBg: "bg-slate-50",
    tagText: "text-slate-700",
  },
};

export const VAGA_TYPES: NotificacaoTipo[] = [
  "VAGA_REJEITADA",
  "VAGA_APROVADA",
  "NOVO_CANDIDATO",
  "VAGA_PREENCHIDA",
];

export const SISTEMA_TYPES: NotificacaoTipo[] = [
  "PLANO_EXPIRANDO",
  "PLANO_EXPIRADO",
  "ASSINATURA_RENOVADA",
  "PAGAMENTO_APROVADO",
  "PAGAMENTO_RECUSADO",
  "SISTEMA",
];

export function formatRelativeTime(date?: string | null): string {
  if (!date) return "";
  try {
    return formatDistanceToNow(new Date(date), {
      addSuffix: false,
      locale: ptBR,
    }).replace("cerca de ", "");
  } catch {
    return "";
  }
}

