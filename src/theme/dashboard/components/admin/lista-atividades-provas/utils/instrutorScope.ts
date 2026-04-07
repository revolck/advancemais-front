type InstrutorScopedEntity = {
  instrutorId?: string | null;
  instrutor?:
    | string
    | {
        id?: string | null;
      }
    | null;
  criadoPorId?: string | null;
  criadoPor?: {
    id?: string | null;
  } | null;
};

function normalizeOptionalId(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

export function isInstrutorOwnerOrCreator(
  entity: InstrutorScopedEntity | null | undefined,
  userId?: string | null
): boolean {
  const normalizedUserId = normalizeOptionalId(userId);
  if (!entity || !normalizedUserId) return false;

  const directInstrutorId = normalizeOptionalId(entity.instrutorId);
  if (directInstrutorId === normalizedUserId) {
    return true;
  }

  if (
    entity.instrutor &&
    typeof entity.instrutor === "object" &&
    normalizeOptionalId(entity.instrutor.id) === normalizedUserId
  ) {
    return true;
  }

  const createdById =
    normalizeOptionalId(entity.criadoPorId) ??
    normalizeOptionalId(entity.criadoPor?.id);

  return createdById === normalizedUserId;
}
