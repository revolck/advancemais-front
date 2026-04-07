import type { CursoTurma } from "@/api/cursos";

export interface TurmaInstrutorVinculado {
  id: string;
  nome: string;
  email: string | null;
  codUsuario: string | null;
  avatarUrl: string | null;
}

type RecordLike = Record<string, unknown>;

function asRecord(value: unknown): RecordLike | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as RecordLike;
}

function pickString(...values: unknown[]): string | null {
  for (const value of values) {
    if (typeof value !== "string") {
      continue;
    }

    const normalized = value.trim();
    if (normalized.length > 0) {
      return normalized;
    }
  }

  return null;
}

function buildKey(instrutor: TurmaInstrutorVinculado): string {
  return instrutor.id || instrutor.email || instrutor.nome;
}

function normalizeLinkedInstrutor(
  value: unknown
): TurmaInstrutorVinculado | null {
  const raw = asRecord(value);
  if (!raw) {
    return null;
  }

  const nestedInstrutor = asRecord(raw.instrutor);
  const nestedUsuario = asRecord(raw.usuario);
  const source = nestedInstrutor ?? nestedUsuario ?? raw;

  const id =
    pickString(
      source.id,
      raw.instrutorId,
      raw.usuarioId,
      raw.userId,
      raw.id
    ) ?? "";
  const nome =
    pickString(
      source.nomeCompleto,
      source.nome,
      raw.nomeCompleto,
      raw.nome,
      source.email,
      raw.email,
      source.codUsuario,
      raw.codUsuario
    ) ?? id;

  if (!nome) {
    return null;
  }

  return {
    id,
    nome,
    email: pickString(source.email, raw.email),
    codUsuario: pickString(source.codUsuario, raw.codUsuario),
    avatarUrl: pickString(source.avatarUrl, raw.avatarUrl),
  };
}

export function getTurmaInstrutoresVinculados(
  turma: Pick<CursoTurma, "instrutor" | "instrutores">
): TurmaInstrutorVinculado[] {
  const linked = new Map<string, TurmaInstrutorVinculado>();

  const primary = normalizeLinkedInstrutor(turma.instrutor);
  if (primary) {
    linked.set(buildKey(primary), primary);
  }

  if (Array.isArray(turma.instrutores)) {
    turma.instrutores.forEach((item) => {
      const normalized = normalizeLinkedInstrutor(item);
      if (!normalized) {
        return;
      }

      const key = buildKey(normalized);
      if (!linked.has(key)) {
        linked.set(key, normalized);
      }
    });
  }

  return Array.from(linked.values());
}

export function turmaHasInstrutorVinculado(
  turma: Pick<CursoTurma, "instrutor" | "instrutores">,
  instrutorId?: string | null
): boolean {
  if (!instrutorId) {
    return true;
  }

  return getTurmaInstrutoresVinculados(turma).some(
    (instrutor) => instrutor.id === instrutorId
  );
}

export function getTurmaInstrutoresResumo(
  turma: Pick<CursoTurma, "instrutor" | "instrutores">,
  maxVisibleNames = 2
): string {
  const instrutores = getTurmaInstrutoresVinculados(turma);

  if (instrutores.length === 0) {
    return "—";
  }

  const names = instrutores.map((instrutor) => instrutor.nome);
  if (names.length <= maxVisibleNames) {
    return names.join(", ");
  }

  return `${names.slice(0, maxVisibleNames).join(", ")} +${
    names.length - maxVisibleNames
  }`;
}
