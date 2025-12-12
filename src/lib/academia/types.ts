import { UserRole } from "@/config/roles";

/**
 * Público alvo do conteúdo da Academia.
 * - "TODOS": conteúdo liberado para qualquer usuário autenticado
 * - UserRole: conteúdo restrito a um papel específico
 */
export type AcademiaAudience = "TODOS" | UserRole;


