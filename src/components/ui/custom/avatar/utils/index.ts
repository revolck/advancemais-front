import { AVATAR_COLORS } from "../types";

/**
 * Extrai as iniciais de um nome completo
 * @param name Nome completo da pessoa
 * @returns Iniciais (máximo 2 caracteres)
 *
 * @example
 * getInitials("João Feitosa Fernandes") → "JF"
 * getInitials("Maria Silva") → "MS"
 * getInitials("Pedro") → "PE"
 * getInitials("") → "??"
 */
export function getInitials(name: string): string {
  if (!name || name.trim() === "") {
    return "??";
  }

  const cleanName = name.trim();
  const words = cleanName.split(/\s+/).filter((word) => word.length > 0);

  if (words.length === 0) {
    return "??";
  }

  if (words.length === 1) {
    // Se só há um nome, pega as duas primeiras letras
    const singleWord = words[0];
    return singleWord.length >= 2
      ? singleWord.substring(0, 2).toUpperCase()
      : (singleWord.charAt(0) + singleWord.charAt(0)).toUpperCase();
  }

  // Se há múltiplas palavras, pega primeira letra da primeira e última palavra
  const firstInitial = words[0].charAt(0);
  const lastInitial = words[words.length - 1].charAt(0);

  return (firstInitial + lastInitial).toUpperCase();
}

/**
 * Gera uma cor de fundo baseada no nome da pessoa
 * Usa hash do nome para garantir consistência
 * @param name Nome da pessoa
 * @returns Classe CSS da cor de fundo
 */
export function getAvatarColor(name: string): string {
  if (!name || name.trim() === "") {
    return AVATAR_COLORS[0]; // Cor padrão
  }

  // Gera hash simples do nome
  let hash = 0;
  const cleanName = name.trim().toLowerCase();

  for (let i = 0; i < cleanName.length; i++) {
    const char = cleanName.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Converte para 32-bit integer
  }

  // Garante que o hash seja positivo
  const positiveHash = Math.abs(hash);

  // Seleciona cor baseada no hash
  const colorIndex = positiveHash % AVATAR_COLORS.length;
  return AVATAR_COLORS[colorIndex];
}

/**
 * Gera um ID único para o avatar (útil para testes e debugging)
 * @param name Nome da pessoa
 * @returns ID único baseado no nome
 */
export function generateAvatarId(name: string): string {
  const cleanName = name.trim().toLowerCase().replace(/\s+/g, "-");
  const timestamp = Date.now().toString(36);
  return `avatar-${cleanName}-${timestamp}`;
}
