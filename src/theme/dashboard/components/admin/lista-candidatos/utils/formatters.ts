import { formatDistanceToNow, format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function formatDate(date: string | null | undefined): string {
  if (!date) return "—";

  try {
    return format(new Date(date), "dd/MM/yyyy", { locale: ptBR });
  } catch {
    return "—";
  }
}

export function formatDateTime(date: string | null | undefined): string {
  if (!date) return "—";

  try {
    return format(new Date(date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  } catch {
    return "—";
  }
}

export function formatRelativeTime(date: string | null | undefined): string {
  if (!date) return "—";

  try {
    return formatDistanceToNow(new Date(date), {
      addSuffix: true,
      locale: ptBR,
    });
  } catch {
    return "—";
  }
}

export function formatCandidaturasCount(candidaturas: any[]): string {
  if (!candidaturas || candidaturas.length === 0) {
    return "Nenhuma";
  }

  const total = candidaturas.length;
  const ativas = candidaturas.filter(
    (c) =>
      ![
        "RECUSADO",
        "DESISTIU",
        "NAO_COMPARECEU",
        "ARQUIVADO",
        "CANCELADO",
      ].includes(c.status)
  ).length;

  if (ativas === total) {
    return `${total} candidatura${total !== 1 ? "s" : ""}`;
  }

  return `${total} (${ativas} ativa${ativas !== 1 ? "s" : ""})`;
}

export function formatLocalizacao(candidato: any): string {
  const { cidade, estado } = candidato;

  if (!cidade && !estado) {
    return "Não informado";
  }

  if (cidade && estado) {
    return `${cidade}, ${estado}`;
  }

  return cidade || estado || "Não informado";
}

export function formatContato(candidato: any): string {
  const { email, telefone } = candidato;

  if (email && telefone) {
    return `${email}\n${telefone}`;
  }

  return email || telefone || "Não informado";
}

export function formatTelefone(telefone?: string | null): string {
  if (!telefone) return "—";
  const digits = telefone.replace(/\D/g, "");

  if (digits.length === 10) {
    return digits.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  }

  if (digits.length === 11) {
    return digits.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  }

  return telefone;
}

export function getCandidatoInitials(nome: string): string {
  if (!nome) return "??";

  const words = nome.trim().split(" ");
  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  }

  return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
}

export function truncateText(text: string, maxLength: number = 50): string {
  if (!text || text.length <= maxLength) {
    return text;
  }

  return `${text.substring(0, maxLength)}...`;
}


