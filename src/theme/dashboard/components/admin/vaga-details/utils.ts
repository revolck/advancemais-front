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

export function formatCurrency(value?: string | number | null): string {
  if (!value) return "—";
  const numValue = typeof value === "string" ? parseFloat(value) : value;
  if (Number.isNaN(numValue)) return "—";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(numValue);
}

export function formatVagaStatus(status?: string | null): string {
  if (!status) return "—";
  const normalized = status.toUpperCase();
  const readable: Record<string, string> = {
    PUBLICADO: "Publicada",
    EM_ANALISE: "Em análise",
    RASCUNHO: "Rascunho",
    DESPUBLICADA: "Despublicada",
    PAUSADA: "Pausada",
    ENCERRADA: "Encerrada",
    EXPIRADO: "Expirada",
  };
  return readable[normalized] ?? status;
}

export function formatModalidade(modalidade?: string | null): string {
  if (!modalidade) return "—";
  const normalized = modalidade.toUpperCase();
  const readable: Record<string, string> = {
    REMOTO: "Remoto",
    PRESENCIAL: "Presencial",
    HIBRIDO: "Híbrido",
  };
  return readable[normalized] ?? modalidade;
}

export function formatJornada(jornada?: string | null): string {
  if (!jornada) return "—";
  const normalized = jornada.toUpperCase();
  const readable: Record<string, string> = {
    INTEGRAL: "Integral",
    MEIO_PERIODO: "Meio Período",
    FLEXIVEL: "Flexível",
  };
  return readable[normalized] ?? jornada;
}

export function formatRegimeTrabalho(regime?: string | null): string {
  if (!regime) return "—";
  const normalized = regime.toUpperCase();
  const readable: Record<string, string> = {
    CLT: "CLT",
    PJ: "PJ",
    ESTAGIO: "Estágio",
    TRAINEE: "Trainee",
    FREELANCE: "Freelance",
  };
  return readable[normalized] ?? regime;
}

export function formatSenioridade(senioridade?: string | null): string {
  if (!senioridade) return "—";
  const normalized = senioridade.toUpperCase();
  const readable: Record<string, string> = {
    JUNIOR: "Júnior",
    PLENO: "Pleno",
    SENIOR: "Sênior",
    ESPECIALISTA: "Especialista",
    GERENTE: "Gerente",
    DIRETOR: "Diretor",
  };
  return readable[normalized] ?? senioridade;
}

export function getVagaStatusBadgeClasses(status?: string | null): string {
  if (!status) return "border-slate-200 bg-slate-100 text-slate-600";
  const normalized = status.toUpperCase();
  switch (normalized) {
    case "PUBLICADO":
      return "bg-green-100 text-green-800 border-green-200";
    case "EM_ANALISE":
      return "bg-amber-100 text-amber-800 border-amber-200";
    case "RASCUNHO":
      return "bg-slate-100 text-slate-600 border-slate-200";
    case "DESPUBLICADA":
    case "ENCERRADA":
    case "EXPIRADO":
      return "bg-red-100 text-red-800 border-red-200";
    case "PAUSADA":
      return "bg-orange-100 text-orange-800 border-orange-200";
    default:
      return "bg-slate-100 text-slate-600 border-slate-200";
  }
}

export function toDateInputValue(value?: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}
