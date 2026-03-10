"use client";

type AvaliacaoStatusLike =
  | "RASCUNHO"
  | "PUBLICADA"
  | "EM_ANDAMENTO"
  | "CONCLUIDA"
  | "CANCELADA"
  | string
  | null
  | undefined;

type AvaliacaoStatusSource = {
  status?: AvaliacaoStatusLike;
  turmaId?: string | null;
  turma?:
    | string
    | {
        id?: string | null;
      }
    | null;
};

export function hasTurmaVinculadaAvaliacao(
  avaliacao: AvaliacaoStatusSource | null | undefined
): boolean {
  if (!avaliacao) return false;

  if (
    typeof avaliacao.turmaId === "string" &&
    avaliacao.turmaId.trim().length > 0
  ) {
    return true;
  }

  if (
    avaliacao.turma &&
    typeof avaliacao.turma === "object" &&
    typeof avaliacao.turma.id === "string" &&
    avaliacao.turma.id.trim().length > 0
  ) {
    return true;
  }

  return false;
}

export function getAvaliacaoStatusEfetivo<T extends AvaliacaoStatusSource>(
  avaliacao: T | null | undefined
): Exclude<AvaliacaoStatusLike, null | undefined> {
  const status = String(avaliacao?.status || "RASCUNHO").toUpperCase();

  if (status === "PUBLICADA" && !hasTurmaVinculadaAvaliacao(avaliacao)) {
    return "RASCUNHO";
  }

  return status;
}
