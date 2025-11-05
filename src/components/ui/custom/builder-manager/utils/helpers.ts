/**
 * Gera um ID único com prefixo
 */
export function uid(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Retorna o horário local formatado para datetime-local input
 */
export function getNowLocal(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  const localIso = new Date(now.getTime() - offset).toISOString().slice(0, 16);
  return localIso;
}
