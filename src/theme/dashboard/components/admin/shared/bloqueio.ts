/** Mesmo mínimo da API para as observações do bloqueio */
export const MIN_OBSERVACOES_BLOQUEIO = 3;

/**
 * Admin bloqueia qualquer usuário; moderador bloqueia todos, menos administrador.
 * Ninguém bloqueia a própria conta. A API confere as mesmas regras.
 */
export function podeBloquear(
  actorRole: string | null,
  targetRole: string | null | undefined,
  actorId?: string | null,
  targetId?: string | null,
): boolean {
  if (actorId && targetId && actorId === targetId) return false;
  if (actorRole === "ADMIN") return true;
  if (actorRole === "MODERADOR") return targetRole !== "ADMIN";
  return false;
}

/** Mostra o motivo que a API devolveu (validação, permissão); erro de servidor fica genérico */
export function mensagemErroBloqueio(error: unknown, padrao: string): string {
  const e = error as {
    status?: number;
    message?: string;
    details?: { message?: string };
  };
  if (!e?.status || e.status >= 500) return padrao;
  return e.details?.message || e.message || padrao;
}
