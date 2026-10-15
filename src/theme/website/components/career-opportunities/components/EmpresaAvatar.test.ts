import { describe, expect, it } from "vitest";

import { iniciaisDaEmpresa } from "./EmpresaAvatar";

describe("iniciais da empresa sem logo", () => {
  it("usa as duas primeiras palavras que identificam a empresa", () => {
    expect(iniciaisDaEmpresa("GESTAO DE PESSOAS E PLANEJAMENTO EMPRESARIAL")).toBe("GP");
    expect(iniciaisDaEmpresa("Mister Limp Comercio e Servico LTDA - EPP")).toBe("ML");
    expect(iniciaisDaEmpresa("IZABEL MOURÃO EIRELI EPP")).toBe("IM");
  });

  it("ignora sufixos societários e pontuação", () => {
    expect(iniciaisDaEmpresa("Pulmonar Clinica LTDA")).toBe("PC");
    expect(iniciaisDaEmpresa("RS MACEIÓ")).toBe("RM");
  });

  it("nome de uma palavra só vira as duas primeiras letras", () => {
    expect(iniciaisDaEmpresa("Advance")).toBe("AD");
  });

  it("sem nome: nada (cai no ícone de empresa)", () => {
    expect(iniciaisDaEmpresa("")).toBe("");
    expect(iniciaisDaEmpresa(null)).toBe("");
    expect(iniciaisDaEmpresa("LTDA ME")).toBe("");
  });
});
