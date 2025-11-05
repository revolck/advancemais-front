/**
 * Formata o status da turma para exibição
 */
export function formatTurmaStatus(status?: string | null): string {
  if (!status) return "—";

  const formatted = status
    .replace(/_/g, " ")
    .toLowerCase()
    .split(" ")
    .map((word) => {
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");

  // Correções de acentuação
  return formatted
    .replace(/Inscricoes/g, "Inscrições")
    .replace(/Encerradas/g, "Encerradas")
    .replace(/Canceladas/g, "Canceladas")
    .replace(/Publicado/g, "Publicado");
}

/**
 * Retorna as classes CSS para o badge de status da turma
 */
export function getTurmaStatusBadgeClasses(status?: string | null): string {
  if (!status) return "bg-gray-100 text-gray-800 border-gray-200";

  const normalized = status.toUpperCase().replace(/_/g, "");

  switch (normalized) {
    case "ATIVA":
    case "ATIVO":
    case "EMANDAMENTO":
    case "PUBLICADO":
    case "INSCRICOESABERTAS":
      return "bg-green-100 text-green-800 border-green-200";
    case "ENCERRADA":
    case "ENCERRADO":
    case "FINALIZADA":
    case "INSCRICOESENCERRADAS":
      return "bg-gray-100 text-gray-800 border-gray-200";
    case "PLANEJADA":
    case "AGENDADA":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "CANCELADA":
    case "CANCELADO":
      return "bg-red-100 text-red-800 border-red-200";
    case "PAUSADA":
    case "PAUSADO":
      return "bg-orange-100 text-orange-800 border-orange-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
}

