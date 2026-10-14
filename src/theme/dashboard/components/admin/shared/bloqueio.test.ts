import { describe, expect, it } from "vitest";

import { mensagemErroBloqueio, podeBloquear } from "./bloqueio";

describe("bloqueio de usuários", () => {
  it("admin bloqueia qualquer função", () => {
    for (const alvo of ["ADMIN", "MODERADOR", "RECRUTADOR", "ALUNO_CANDIDATO", "EMPRESA"]) {
      expect(podeBloquear("ADMIN", alvo, "a", "b")).toBe(true);
    }
  });

  it("moderador bloqueia todos, menos administrador", () => {
    expect(podeBloquear("MODERADOR", "ADMIN", "a", "b")).toBe(false);
    expect(podeBloquear("MODERADOR", "MODERADOR", "a", "b")).toBe(true);
    expect(podeBloquear("MODERADOR", "RECRUTADOR", "a", "b")).toBe(true);
  });

  it("ninguém bloqueia a própria conta; outras funções não bloqueiam pela ficha", () => {
    expect(podeBloquear("ADMIN", "ADMIN", "a", "a")).toBe(false);
    expect(podeBloquear("PEDAGOGICO", "ALUNO_CANDIDATO", "a", "b")).toBe(false);
  });

  it("mostra a mensagem da API em erros de validação e permissão", () => {
    const validacao = Object.assign(new Error("x"), {
      status: 400,
      details: { message: "Informe observações com pelo menos 3 caracteres" },
    });
    expect(mensagemErroBloqueio(validacao, "padrão")).toBe(
      "Informe observações com pelo menos 3 caracteres",
    );
    expect(
      mensagemErroBloqueio(Object.assign(new Error("Falhou"), { status: 500 }), "padrão"),
    ).toBe("padrão");
    expect(mensagemErroBloqueio(new TypeError("Failed to fetch"), "padrão")).toBe("padrão");
  });
});
