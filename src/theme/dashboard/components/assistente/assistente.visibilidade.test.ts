import { describe, expect, it } from "vitest";

import { escolherVisibilidade } from "./assistente.visibilidade";

const em = (hora: string) => `2026-10-14T${hora}:00.000Z`;

describe("assistente oculto continua oculto", () => {
  it("ocultou e o servidor não salvou: depois do F5 continua oculto", () => {
    expect(escolherVisibilidade(undefined, { status: "OCULTO", em: em("10:00") })).toBe("OCULTO");
  });

  it("servidor sem a escolha e navegador sem registro: visível", () => {
    expect(escolherVisibilidade(undefined, null)).toBe("VISIVEL");
  });

  it("ocultou em outro aparelho: vale o servidor", () => {
    expect(escolherVisibilidade({ status: "OCULTO", em: em("10:00") }, null)).toBe("OCULTO");
  });

  it("vale a escolha mais recente entre navegador e servidor", () => {
    expect(
      escolherVisibilidade({ status: "VISIVEL", em: em("09:00") }, { status: "OCULTO", em: em("10:00") })
    ).toBe("OCULTO");
    expect(
      escolherVisibilidade({ status: "VISIVEL", em: em("11:00") }, { status: "OCULTO", em: em("10:00") })
    ).toBe("VISIVEL");
  });

  it("status de tutorial (CONCLUIDO) na chave não conta como escolha", () => {
    expect(escolherVisibilidade({ status: "CONCLUIDO", em: em("10:00") }, null)).toBe("VISIVEL");
  });
});
