import { describe, expect, it } from "vitest";

import { formatReadableText } from "./display-text";

describe("formatReadableText", () => {
  it("formats all-uppercase text as readable title case", () => {
    expect(formatReadableText("ATENDENTE DE CLÍNICAS")).toBe(
      "Atendente de Clínicas",
    );
  });

  it("preserves already readable text", () => {
    expect(formatReadableText("Atendente de clínicas")).toBe(
      "Atendente de clínicas",
    );
  });

  it("preserves common acronyms in uppercase records", () => {
    expect(
      formatReadableText(
        "FORMAÇÃO EM CONSULTORIA INTERNA DE RH - CURSO 100% ON-LINE",
      ),
    ).toBe("Formação em Consultoria Interna de RH - Curso 100% on-line");

    expect(formatReadableText("SPED FISCAL NA PRÁTICA")).toBe(
      "SPED Fiscal na Prática",
    );

    expect(formatReadableText("CURSO DE POWER BI E LGPD")).toBe(
      "Curso de Power BI e LGPD",
    );
  });

  it("does not rewrite identifier-like codes", () => {
    expect(formatReadableText("MIGC07F1B0")).toBe("MIGC07F1B0");
    expect(formatReadableText("ALU-000001")).toBe("ALU-000001");
  });

  it("trims duplicated spaces without changing mixed-case text", () => {
    expect(formatReadableText("  Curso   de Excel  ")).toBe("Curso de Excel");
  });

  it("formats uppercase words inside mixed-case text", () => {
    expect(formatReadableText("CURSO de ORATÓRIA")).toBe("Curso de Oratória");
    expect(formatReadableText("ANDRE ANJOS DOS SANTOS")).toBe(
      "Andre Anjos dos Santos",
    );
    expect(
      formatReadableText("CURSO de ALMOXARIFADO e EXPEDIÇÃO - CURSO 100% ON-LINE"),
    ).toBe("Curso de Almoxarifado e Expedição - Curso 100% on-line");
    expect(formatReadableText("MACEIÓ, AL")).toBe("Maceió, AL");
  });
});
