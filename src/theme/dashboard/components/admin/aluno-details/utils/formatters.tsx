import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { AlunoEndereco, AlunoInscricao } from "../types";

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

export function formatCpf(cpf?: string | null): string {
  if (!cpf) return "—";
  const digits = cpf.replace(/\D/g, "");
  if (digits.length !== 11) return cpf;
  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

export function formatTelefone(telefone?: string | null): string {
  if (!telefone) return "Não informado";
  const digits = telefone.replace(/\D/g, "");

  if (digits.length === 10) {
    return digits.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  }

  if (digits.length === 11) {
    return digits.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  }

  return telefone;
}

export function getAlunoInitials(nome: string): string {
  if (!nome) return "??";

  const words = nome.trim().split(" ");
  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  }

  return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
}

export function getStatusBadge(status?: string) {
  if (!status) {
    return (
      <Badge
        variant="outline"
        className="text-xs font-normal text-gray-600 bg-white/90 backdrop-blur-sm border-gray-200"
      >
        Desconhecido
      </Badge>
    );
  }

  const normalized = status.toUpperCase();
  const statusConfig = {
    ATIVO: {
      label: "Ativo",
      color: "bg-emerald-50/90 text-emerald-700 border-emerald-200",
    },
    INATIVO: {
      label: "Reprovado",
      color: "bg-gray-50/90 text-gray-600 border-gray-200",
    },
    BLOQUEADO: {
      label: "Bloqueado",
      color: "bg-red-50/90 text-red-600 border-red-200",
    },
    INSCRITO: {
      label: "Inscrito",
      color: "bg-blue-50/90 text-blue-700 border-blue-200",
    },
    MATRICULADO: {
      label: "Inscrito",
      color: "bg-blue-50/90 text-blue-700 border-blue-200",
    },
    EM_ANDAMENTO: {
      label: "Em andamento",
      color: "bg-amber-50/90 text-amber-700 border-amber-200",
    },
    EM_CURSO: {
      label: "Em andamento",
      color: "bg-amber-50/90 text-amber-700 border-amber-200",
    },
    CONCLUIDO: {
      label: "Concluído",
      color: "bg-emerald-50/90 text-emerald-700 border-emerald-200",
    },
    CANCELADO: {
      label: "Cancelado",
      color: "bg-red-50/90 text-red-600 border-red-200",
    },
    TRANCADO: {
      label: "Trancado",
      color: "bg-orange-50/90 text-orange-600 border-orange-200",
    },
    EM_ESTAGIO: {
      label: "Em estágio",
      color: "bg-purple-50/90 text-purple-700 border-purple-200",
    },
  } as const;

  const config = statusConfig[normalized as keyof typeof statusConfig] || {
    label: status,
    color: "bg-gray-50/90 text-gray-600 border-gray-200",
  };

  return (
    <Badge
      variant="outline"
      className={cn("text-xs font-normal backdrop-blur-sm", config.color)}
    >
      {config.label}
    </Badge>
  );
}

export function formatEndereco(endereco: AlunoEndereco): string {
  const partes = [
    endereco.logradouro,
    endereco.numero,
    endereco.bairro,
    endereco.cidade,
    endereco.estado,
  ]
    .filter(Boolean)
    .join(", ");

  return partes || "Endereço não informado";
}

export function buildInscricoesResumo(
  inscricoes: AlunoInscricao[]
): Record<string, number> {
  return inscricoes.reduce((acc, inscricao) => {
    const status = inscricao.statusInscricao?.toUpperCase() || "DESCONHECIDO";
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
}
