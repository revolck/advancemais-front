import { describe, expect, it } from "vitest";

import { formatarDataDigitada, lerDataDigitada } from "./data-digitada";

describe("data digitada (DD/MM/AAAA)", () => {
  it("lê a data completa como meia-noite local", () => {
    const r = lerDataDigitada("25/06/1995");
    expect(r.tipo).toBe("ok");
    if (r.tipo !== "ok") return;
    expect([r.data.getFullYear(), r.data.getMonth(), r.data.getDate()]).toEqual([1995, 5, 25]);
  });

  it("enquanto digita, não acusa erro", () => {
    expect(lerDataDigitada("25/06/19").tipo).toBe("incompleta");
    expect(lerDataDigitada("").tipo).toBe("vazia");
  });

  it("recusa data que não existe (31/02, mês 13)", () => {
    expect(lerDataDigitada("31/02/2000").tipo).toBe("invalida");
    expect(lerDataDigitada("10/13/2000").tipo).toBe("invalida");
    expect(lerDataDigitada("29/02/2024").tipo).toBe("ok");
  });

  it("respeita os limites, com mensagem própria", () => {
    const hoje = new Date(2026, 9, 15);
    const futuro = lerDataDigitada("16/10/2026", {
      maxDate: hoje,
      mensagemMax: "A data de nascimento não pode ser no futuro.",
    });
    expect(futuro).toEqual({
      tipo: "invalida",
      mensagem: "A data de nascimento não pode ser no futuro.",
    });
    expect(lerDataDigitada("15/10/2026", { maxDate: hoje }).tipo).toBe("ok");
    expect(lerDataDigitada("01/01/1900", { minDate: new Date(1916, 9, 15) }).tipo).toBe("invalida");
  });

  it("formata para exibir no campo", () => {
    expect(formatarDataDigitada(new Date(1995, 5, 25))).toBe("25/06/1995");
    expect(formatarDataDigitada(null)).toBe("");
  });
});
