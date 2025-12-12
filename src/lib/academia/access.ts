import { UserRole } from "@/config/roles";
import type { AcademiaAudience } from "./types";

export function isAcademiaSuperRole(role: UserRole | null | undefined) {
  return role === UserRole.ADMIN || role === UserRole.MODERADOR;
}

export function canAccessAcademiaVideo(
  role: UserRole | null | undefined,
  audiencias: AcademiaAudience[] | undefined
) {
  // Segurança defensiva: sem audiencias => não exibir
  if (!audiencias || audiencias.length === 0) return false;

  if (isAcademiaSuperRole(role)) return true;

  // Conteúdo para todos os usuários autenticados
  if (audiencias.includes("TODOS")) return true;

  // Sem role detectada, negar conteúdos restritos
  if (!role) return false;

  return audiencias.includes(role);
}


