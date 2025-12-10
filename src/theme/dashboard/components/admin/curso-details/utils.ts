/**
 * Formata o status do curso para exibição
 * Transforma INSCRICOES_ABERTAS em INSCRIÇÕES ABERTAS
 */
export function formatCursoStatus(status?: string | null): string {
  if (!status) return "—";

  const formatted = status
    .replace(/_/g, " ") // Remove underscores
    .toLowerCase()
    .split(" ")
    .map((word) => {
      // Capitaliza a primeira letra de cada palavra
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");

  // Correções de acentuação
  return formatted
    .replace(/Inscricoes/g, "Inscrições")
    .replace(/Encerrado/g, "Encerrado")
    .replace(/Cancelado/g, "Cancelado");
}

/**
 * Retorna as classes CSS para o badge de status
 */
export function getCursoStatusBadgeClasses(status?: string | null): string {
  if (!status) return "bg-gray-100 text-gray-800 border-gray-200";

  const normalized = status.toUpperCase().replace(/_/g, "");

  switch (normalized) {
    case "PUBLICADO":
    case "INSCRICOESABERTAS":
      return "bg-green-100 text-green-800 border-green-200";
    case "RASCUNHO":
      return "bg-gray-100 text-gray-800 border-gray-200";
    case "ENCERRADO":
    case "INSCRICOESENCERRADAS":
      return "bg-red-100 text-red-800 border-red-200";
    case "PAUSADO":
      return "bg-orange-100 text-orange-800 border-orange-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
}
