import type { Role } from "@/api/usuarios";

/** Funções que o painel pode aplicar (a API confere de novo) */
export const FUNCOES_GERENCIAVEIS: Role[] = [
  "ADMIN",
  "MODERADOR",
  "EMPRESA",
  "ALUNO_CANDIDATO",
  "INSTRUTOR",
  "PEDAGOGICO",
  "SETOR_DE_VAGAS",
  "RECRUTADOR",
  "FINANCEIRO",
];

const SO_ADMIN: Role[] = ["ADMIN", "MODERADOR"];
const PEDAGOGICO_PODE: Role[] = ["ALUNO_CANDIDATO", "INSTRUTOR"];

/** Mesmas regras da API: moderador não mexe em admin/moderador; pedagógico só aluno <-> instrutor */
export function funcoesDisponiveis(
  actorRole: string | null,
  targetRole: Role | undefined,
  actorUserId?: string | null,
  targetUserId?: string | null,
): Role[] {
  if (!actorRole || !targetRole) return [];
  if (actorUserId && targetUserId && actorUserId === targetUserId) return [];

  switch (actorRole) {
    case "ADMIN":
      return FUNCOES_GERENCIAVEIS;
    case "MODERADOR":
      return SO_ADMIN.includes(targetRole)
        ? []
        : FUNCOES_GERENCIAVEIS.filter((role) => !SO_ADMIN.includes(role));
    case "PEDAGOGICO":
      return PEDAGOGICO_PODE.includes(targetRole) ? PEDAGOGICO_PODE : [];
    default:
      return [];
  }
}

/** Nas telas de aluno e candidato, só administrador e moderador trocam a função */
export function funcoesParaAluno(
  actorRole: string | null,
  actorUserId?: string | null,
  targetUserId?: string | null,
): Role[] {
  if (actorRole !== "ADMIN" && actorRole !== "MODERADOR") return [];
  return funcoesDisponiveis(
    actorRole,
    "ALUNO_CANDIDATO",
    actorUserId,
    targetUserId,
  ).filter((role) => role !== "EMPRESA");
}

/** Sai da área do aluno (cursos e candidaturas) */
export const saiDeAluno = (atual: Role, nova: Role) =>
  atual === "ALUNO_CANDIDATO" && nova !== atual;

/** Ganha acesso de gestão a todo o sistema */
export const viraGestor = (nova: Role) => SO_ADMIN.includes(nova);

/** Texto do erro da API para o toast */
export function mensagemErroTrocaDeFuncao(error: unknown): string {
  const e = error as {
    response?: { data?: { code?: string; message?: string } };
    details?: { code?: string; message?: string };
    message?: string;
  };
  const code = e?.response?.data?.code ?? e?.details?.code;
  const message = e?.response?.data?.message ?? e?.details?.message ?? e?.message;

  switch (code) {
    case "FORBIDDEN_SELF_ROLE_CHANGE":
      return "Você não pode alterar a própria função.";
    case "FORBIDDEN_USER_ROLE":
      return "Você não tem permissão para aplicar essa função a este usuário.";
    case "USER_ROLE_UPDATE_BLOCKED":
      return "Essa função já está aplicada ao usuário.";
    case "INVALID_ROLE_FOR_USER_TYPE":
      return message || "A função selecionada é incompatível com o tipo de usuário.";
    default:
      return message || "Não foi possível alterar a função do usuário.";
  }
}
