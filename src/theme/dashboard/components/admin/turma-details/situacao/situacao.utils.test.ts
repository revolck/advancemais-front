import { describe, expect, it } from "vitest";

import { extrairCpfs, frasesDoResumo } from "./situacao.utils";

describe("lista de CPFs colada", () => {
  it("aceita linhas, vírgulas, pontuação e ignora repetidos e textos sem número", () => {
    expect(
      extrairCpfs("111.111.111-11\n22222222222, 111.111.111-11; Maria\n\n333.333.333-33")
    ).toEqual(["11111111111", "22222222222", "33333333333"]);
  });

  it("completa o zero à esquerda que o Excel tira", () => {
    expect(extrairCpfs("1234567890\n123456789")).toEqual(["01234567890", "00123456789"]);
  });

  it("mantém o que não é CPF para a API apontar como inválido", () => {
    expect(extrairCpfs("12345")).toEqual(["12345"]);
  });
});

describe("prévia", () => {
  it("explica o que muda, inclusive certificados", () => {
    const frases = frasesDoResumo({
      aplicado: false,
      selecionados: 3,
      naoEncontrados: [],
      cpfsInvalidos: [],
      atingidos: 3,
      mudam: 2,
      jaNaSituacao: 1,
      certificadosARevogar: 2,
      certificadosARestaurar: 0,
      concluintesSemCertificado: 0,
    });
    expect(frases[0]).toBe("3 alunos atingidos; 2 mudam de situação.");
    expect(frases.join(" ")).toContain("2 certificados serão revogados");
    expect(frases.join(" ")).toContain("1 aluno já estava nessa situação.");
  });
});
