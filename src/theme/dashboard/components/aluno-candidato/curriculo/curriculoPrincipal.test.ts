import { describe, expect, it } from "vitest";

import {
  getCurriculoPrincipalCreationState,
  getEffectivePrincipalChoice,
} from "./curriculoPrincipal";

describe("getCurriculoPrincipalCreationState", () => {
  it("mantem carregamento ou erro enquanto a lista nao foi resolvida", () => {
    expect(
      getCurriculoPrincipalCreationState({
        curriculosCount: null,
        isError: false,
      }),
    ).toBe("loading");
    expect(
      getCurriculoPrincipalCreationState({
        curriculosCount: null,
        isError: true,
      }),
    ).toBe("error");
  });

  it("distingue o primeiro cadastro de cadastros adicionais", () => {
    expect(
      getCurriculoPrincipalCreationState({
        curriculosCount: 0,
        isError: false,
      }),
    ).toBe("first");
    expect(
      getCurriculoPrincipalCreationState({
        curriculosCount: 1,
        isError: false,
      }),
    ).toBe("additional");
  });

  it("preserva dados ja carregados caso um refetch posterior falhe", () => {
    expect(
      getCurriculoPrincipalCreationState({
        curriculosCount: 0,
        isError: true,
      }),
    ).toBe("first");
  });
});

describe("getEffectivePrincipalChoice", () => {
  it("forca SIM no primeiro curriculo sem depender de selecao manual", () => {
    expect(
      getEffectivePrincipalChoice({
        isEditMode: false,
        creationState: "first",
        principalChoice: null,
      }),
    ).toBe("SIM");
  });

  it("inicia curriculos adicionais como NAO e preserva escolha SIM", () => {
    expect(
      getEffectivePrincipalChoice({
        isEditMode: false,
        creationState: "additional",
        principalChoice: null,
      }),
    ).toBe("NAO");
    expect(
      getEffectivePrincipalChoice({
        isEditMode: false,
        creationState: "additional",
        principalChoice: "SIM",
      }),
    ).toBe("SIM");
  });

  it("preserva o valor persistido no modo de edicao", () => {
    expect(
      getEffectivePrincipalChoice({
        isEditMode: true,
        creationState: null,
        principalChoice: "NAO",
      }),
    ).toBe("NAO");
  });
});
