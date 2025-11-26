import type { UsuarioOverview } from "../types";
import { UserRole } from "@/config/roles";

export function getUsuarioInitials(name?: string): string {
  if (!name) return "?";
  const words = name.trim().split(/\s+/);
  if (words.length >= 2) {
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
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

export function formatDate(dateString?: string | null): string {
  if (!dateString) return "—";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

export function formatDateTime(dateString?: string | null): string {
  if (!dateString) return "—";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

export function getRoleLabel(role: UserRole): string {
  const labels: Record<UserRole, string> = {
    [UserRole.ADMIN]: "Administrador",
    [UserRole.MODERADOR]: "Moderador",
    [UserRole.EMPRESA]: "Empresa",
    [UserRole.ALUNO_CANDIDATO]: "Aluno/Candidato",
    [UserRole.INSTRUTOR]: "Instrutor",
    [UserRole.PEDAGOGICO]: "Pedagógico",
    [UserRole.RECRUTADOR]: "Recrutador",
    [UserRole.SETOR_DE_VAGAS]: "Setor de Vagas",
    [UserRole.FINANCEIRO]: "Financeiro",
  };
  return labels[role] || role;
}

export function getRoleColor(role: UserRole): string {
  const colors: Record<UserRole, string> = {
    [UserRole.ADMIN]: "bg-red-100 text-red-800 border-red-200",
    [UserRole.MODERADOR]: "bg-blue-100 text-blue-800 border-blue-200",
    [UserRole.EMPRESA]: "bg-indigo-100 text-indigo-800 border-indigo-200",
    [UserRole.ALUNO_CANDIDATO]: "bg-green-100 text-green-800 border-green-200",
    [UserRole.INSTRUTOR]: "bg-yellow-100 text-yellow-800 border-yellow-200",
    [UserRole.PEDAGOGICO]: "bg-pink-100 text-pink-800 border-pink-200",
    [UserRole.RECRUTADOR]: "bg-orange-100 text-orange-800 border-orange-200",
    [UserRole.SETOR_DE_VAGAS]: "bg-teal-100 text-teal-800 border-teal-200",
    [UserRole.FINANCEIRO]: "bg-emerald-100 text-emerald-800 border-emerald-200",
  };
  return colors[role] || "bg-gray-100 text-gray-800 border-gray-200";
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "ATIVO":
      return "bg-green-100 text-green-800 border-green-200";
    case "INATIVO":
      return "bg-gray-100 text-gray-800 border-gray-200";
    case "SUSPENSO":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "BLOQUEADO":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
}

export function getStatusLabel(status: string): string {
  switch (status) {
    case "ATIVO":
      return "Ativo";
    case "INATIVO":
      return "Inativo";
    case "SUSPENSO":
      return "Suspenso";
    case "BLOQUEADO":
      return "Bloqueado";
    default:
      return status;
  }
}
