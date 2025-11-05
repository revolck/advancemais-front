import { formatDistanceToNow, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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

export function getCandidatoInitials(nome: string): string {
  if (!nome) return "??";

  const words = nome.trim().split(" ");
  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  }

  return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
}

export function getStatusBadge(status: string) {
  const statusConfig = {
    RECEBIDA: { label: "Recebida", color: "bg-blue-100 text-blue-800" },
    EM_ANALISE: { label: "Em Análise", color: "bg-yellow-100 text-yellow-800" },
    EM_TRIAGEM: { label: "Em Triagem", color: "bg-orange-100 text-orange-800" },
    ENTREVISTA: { label: "Entrevista", color: "bg-purple-100 text-purple-800" },
    DESAFIO: { label: "Desafio", color: "bg-indigo-100 text-indigo-800" },
    DOCUMENTACAO: { label: "Documentação", color: "bg-cyan-100 text-cyan-800" },
    CONTRATADO: { label: "Contratado", color: "bg-green-100 text-green-800" },
    RECUSADO: { label: "Recusado", color: "bg-red-100 text-red-800" },
    DESISTIU: { label: "Desistiu", color: "bg-gray-100 text-gray-800" },
    NAO_COMPARECEU: {
      label: "Não Compareceu",
      color: "bg-gray-100 text-gray-800",
    },
    ARQUIVADO: { label: "Arquivado", color: "bg-gray-100 text-gray-800" },
    CANCELADO: { label: "Cancelado", color: "bg-red-100 text-red-800" },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || {
    label: status,
    color: "bg-gray-100 text-gray-800",
  };

  return (
    <Badge
      variant="outline"
      className={cn("text-xs font-medium", config.color)}
    >
      {config.label}
    </Badge>
  );
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

export function formatCandidaturasSummary(candidato: any): {
  total: number;
  ativas: number;
  porStatus: Record<string, number>;
} {
  const candidaturas = candidato.candidaturas || [];
  const total = candidaturas.length;

  const ativas = candidaturas.filter(
    (c: any) =>
      ![
        "RECUSADO",
        "DESISTIU",
        "NAO_COMPARECEU",
        "ARQUIVADO",
        "CANCELADO",
      ].includes(c.status)
  ).length;

  const porStatus = candidaturas.reduce(
    (acc: Record<string, number>, c: any) => {
      acc[c.status] = (acc[c.status] || 0) + 1;
      return acc;
    },
    {}
  );

  return { total, ativas, porStatus };
}













