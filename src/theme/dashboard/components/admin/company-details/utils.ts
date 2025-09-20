export function formatDate(value?: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export function formatDateTime(value?: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatCurrency(value?: string | null): string {
  if (!value) return "—";
  const parsed = Number.parseFloat(value);
  if (Number.isNaN(parsed)) return value;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(parsed);
}

export function formatCnpj(value?: string | null): string {
  if (!value) return "—";
  const digits = value.replace(/\D/g, "");
  if (digits.length !== 14) return value;
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
}

export function formatPlanType(type?: string | null): string {
  if (!type) return "—";
  const normalized = type.toLowerCase();
  const map: Record<string, string> = {
    parceiro: "Parceiro",
    "7_dias": "7 dias",
    "15_dias": "15 dias",
    "30_dias": "30 dias",
    "60_dias": "60 dias",
    "90_dias": "90 dias",
    "120_dias": "120 dias",
    assinatura_mensal: "Assinatura",
  };

  if (map[normalized]) {
    return map[normalized];
  }

  return normalized
    .split(/[_\s]+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function formatPaymentStatus(status?: string | null): string {
  if (!status) return "—";
  const humanized: Record<string, string> = {
    APROVADO: "Pago",
    PAGO: "Pago",
    PENDENTE: "Pendente",
    EM_ANALISE: "Em análise",
    EM_PROCESSAMENTO: "Em processamento",
    PROCESSANDO: "Em processamento",
    CANCELADO: "Cancelado",
    RECUSADO: "Recusado",
    ESTORNADO: "Estornado",
  };
  const normalized = status.toUpperCase().replace(/\s+/g, "_");
  return humanized[normalized] ?? status;
}

export function getPaymentStatusBadgeClasses(status?: string | null): string {
  if (!status) return "border-slate-200 bg-slate-100 text-slate-600";
  const normalized = status.toUpperCase().replace(/\s+/g, "_");
  switch (normalized) {
    case "APROVADO":
    case "PAGO":
      return "bg-green-100 text-green-800 border-green-200";
    case "PENDENTE":
      return "bg-amber-100 text-amber-800 border-amber-200";
    case "EM_PROCESSAMENTO":
    case "PROCESSANDO":
    case "EM_ANALISE":
      return "bg-sky-100 text-sky-800 border-sky-200";
    case "CANCELADO":
    case "RECUSADO":
      return "bg-rose-100 text-rose-800 border-rose-200";
    case "ESTORNADO":
      return "bg-slate-100 text-slate-700 border-slate-200";
    default:
      return "bg-slate-100 text-slate-600 border-slate-200";
  }
}

export function formatVacancyStatus(status?: string | null): string {
  if (!status) return "—";
  const normalized = status.toUpperCase();
  const readable: Record<string, string> = {
    PUBLICADO: "Publicado",
    EM_ANALISE: "Em análise",
    RASCUNHO: "Rascunho",
    EXPIRADO: "Expirado",
  };
  return readable[normalized] ?? status;
}

export function toDateInputValue(value?: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}
