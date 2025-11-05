export enum UserRole {
  ADMIN = "ADMIN",
  MODERADOR = "MODERADOR",
  FINANCEIRO = "FINANCEIRO",
  INSTRUTOR = "INSTRUTOR",
  EMPRESA = "EMPRESA",
  PEDAGOGICO = "PEDAGOGICO",
  SETOR_DE_VAGAS = "SETOR_DE_VAGAS",
  RECRUTADOR = "RECRUTADOR",
  ALUNO_CANDIDATO = "ALUNO_CANDIDATO",
}

export const ALL_ROLES: UserRole[] = Object.values(UserRole);

export const ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.ADMIN]: "Admin",
  [UserRole.MODERADOR]: "Moderador",
  [UserRole.FINANCEIRO]: "Financeiro",
  [UserRole.INSTRUTOR]: "Instrutor",
  [UserRole.EMPRESA]: "Empresa",
  [UserRole.PEDAGOGICO]: "Pedagógico",
  [UserRole.SETOR_DE_VAGAS]: "SETOR de VAGAS",
  [UserRole.RECRUTADOR]: "Recrutador",
  [UserRole.ALUNO_CANDIDATO]: "Aluno/Candidato",
};

export function getRoleLabel(role: string): string {
  const match = (Object.values(UserRole) as string[]).includes(role)
    ? (role as UserRole)
    : undefined;
  return match ? ROLE_LABELS[match] : role;
}
