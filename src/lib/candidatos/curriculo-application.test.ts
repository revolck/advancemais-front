import { describe, expect, it } from "vitest";

import { getCurriculoApplicationAvailability } from "./curriculo-application";

describe("getCurriculoApplicationAvailability", () => {
  it("permite candidatura quando existe curriculo valido", () => {
    expect(
      getCurriculoApplicationAvailability({
        isLoading: false,
        isError: false,
        curriculoCount: 1,
      }),
    ).toEqual({ status: "available", isBlocked: false, tooltip: null });
  });

  it("bloqueia candidatura e orienta cadastro quando a lista esta vazia", () => {
    const result = getCurriculoApplicationAvailability({
      isLoading: false,
      isError: false,
      curriculoCount: 0,
    });

    expect(result.status).toBe("missing");
    expect(result.isBlocked).toBe(true);
    expect(result.tooltip).toContain("Cadastre um currículo");
  });

  it("bloqueia candidatura durante carregamento e falha de consulta", () => {
    expect(
      getCurriculoApplicationAvailability({
        isLoading: true,
        isError: false,
        curriculoCount: 0,
      }).status,
    ).toBe("loading");

    expect(
      getCurriculoApplicationAvailability({
        isLoading: false,
        isError: true,
        curriculoCount: 0,
      }).status,
    ).toBe("error");
  });

  it("nao interfere na candidatura quando a validacao nao se aplica", () => {
    expect(
      getCurriculoApplicationAvailability({
        shouldValidate: false,
        isLoading: false,
        isError: false,
        curriculoCount: 0,
      }),
    ).toEqual({ status: "not-applicable", isBlocked: false, tooltip: null });
  });
});
