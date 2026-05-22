import { describe, expect, it } from "vitest";

import { formatReadableText } from "./display-text";

describe("formatReadableText", () => {
  it("formats all-uppercase text as sentence case", () => {
    expect(formatReadableText("ATENDENTE DE CLÍNICAS")).toBe(
      "Atendente de clínicas",
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
    ).toBe("Formação em consultoria interna de RH - curso 100% on-line");

    expect(formatReadableText("SPED FISCAL NA PRÁTICA")).toBe(
      "SPED fiscal na prática",
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
});
