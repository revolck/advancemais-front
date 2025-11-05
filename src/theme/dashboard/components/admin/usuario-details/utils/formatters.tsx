import { format, formatDistanceToNow } from "date-fns";
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

export function formatCpf(cpf?: string | null): string {
  if (!cpf) return "—";
  const digits = cpf.replace(/\D/g, "");
  if (digits.length !== 11) return cpf;
  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

export function formatCnpj(cnpj?: string | null): string {
  if (!cnpj) return "—";
  const digits = cnpj.replace(/\D/g, "");
  if (digits.length !== 14) return cnpj;
  return digits.replace(
    /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
    "$1.$2.$3/$4-$5"
  );
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

export function getUsuarioInitials(nome: string): string {
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
      label: "Inativo",
      color: "bg-gray-50/90 text-gray-600 border-gray-200",
    },
    BLOQUEADO: {
      label: "Bloqueado",
      color: "bg-red-50/90 text-red-600 border-red-200",
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
