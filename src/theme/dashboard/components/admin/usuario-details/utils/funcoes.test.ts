import { describe, expect, it } from "vitest";

import {
  funcoesDisponiveis,
  funcoesParaAluno,
  mensagemErroTrocaDeFuncao,
  saiDeAluno,
  viraGestor,
} from "./funcoes";

describe("troca de função", () => {
  it("nas telas de aluno só admin e moderador trocam a função", () => {
    expect(funcoesParaAluno("ADMIN")).toContain("SETOR_DE_VAGAS");
    expect(funcoesParaAluno("MODERADOR")).toContain("SETOR_DE_VAGAS");
    expect(funcoesParaAluno("PEDAGOGICO")).toEqual([]);
    expect(funcoesParaAluno("SETOR_DE_VAGAS")).toEqual([]);
    expect(funcoesParaAluno(null)).toEqual([]);
  });

  it("moderador não promove a admin/moderador; ninguém vira empresa pela tela de aluno", () => {
    expect(funcoesParaAluno("MODERADOR")).not.toContain("ADMIN");
    expect(funcoesParaAluno("MODERADOR")).not.toContain("MODERADOR");
    expect(funcoesParaAluno("ADMIN")).not.toContain("EMPRESA");
  });

  it("ninguém altera a própria função", () => {
    expect(funcoesParaAluno("ADMIN", "u1", "u1")).toEqual([]);
    expect(funcoesDisponiveis("ADMIN", "PEDAGOGICO", "u1", "u1")).toEqual([]);
  });

  it("regras da tela de usuários continuam as mesmas", () => {
    expect(funcoesDisponiveis("MODERADOR", "ADMIN")).toEqual([]);
    expect(funcoesDisponiveis("PEDAGOGICO", "ALUNO_CANDIDATO")).toEqual([
      "ALUNO_CANDIDATO",
      "INSTRUTOR",
    ]);
    expect(funcoesDisponiveis("PEDAGOGICO", "SETOR_DE_VAGAS")).toEqual([]);
  });

  it("identifica saída da área do aluno e promoção a gestor", () => {
    expect(saiDeAluno("ALUNO_CANDIDATO", "SETOR_DE_VAGAS")).toBe(true);
    expect(saiDeAluno("ALUNO_CANDIDATO", "ALUNO_CANDIDATO")).toBe(false);
    expect(saiDeAluno("INSTRUTOR", "SETOR_DE_VAGAS")).toBe(false);
    expect(viraGestor("ADMIN")).toBe(true);
    expect(viraGestor("SETOR_DE_VAGAS")).toBe(false);
  });

  it("mensagem do erro da API", () => {
    expect(
      mensagemErroTrocaDeFuncao({
        response: { data: { code: "FORBIDDEN_USER_ROLE" } },
      }),
    ).toContain("permissão");
    expect(mensagemErroTrocaDeFuncao(new Error("Falhou"))).toBe("Falhou");
  });
});
