import { describe, expect, it } from "vitest";

import { diaEmBrasilia, fimDoDiaEmBrasilia } from "./formUtils";

describe("prazo de inscrições da vaga", () => {
  it("o dia escolhido vale até 23:59:59 em Brasília", () => {
    expect(fimDoDiaEmBrasilia("2026-10-30")).toBe("2026-10-31T02:59:59.000Z");
  });

  it("volta para o calendário como o mesmo dia", () => {
    expect(diaEmBrasilia(fimDoDiaEmBrasilia("2026-10-30"))).toBe("2026-10-30");
  });

  it("data antiga salva à meia-noite UTC aparece como o dia em Brasília", () => {
    expect(diaEmBrasilia("2026-10-30T00:00:00.000Z")).toBe("2026-10-29");
  });

  it("vazio ou inválido não quebra o formulário", () => {
    expect(fimDoDiaEmBrasilia("")).toBeUndefined();
    expect(diaEmBrasilia(null)).toBe("");
    expect(diaEmBrasilia("lixo")).toBe("");
  });
});
