import { describe, expect, it } from "vitest";

import { podeReceberCertificado } from "./useAlunosForTurmaSelect";

describe("quem aparece para receber certificado", () => {
  it("cancelado (não concluiu), reprovado, trancado e sem pagamento ficam de fora", () => {
    for (const status of ["CANCELADO", "REPROVADO", "TRANCADO", "AGUARDANDO_PAGAMENTO"]) {
      expect(podeReceberCertificado({ id: "i", alunoId: "a", status })).toBe(false);
    }
  });

  it("concluído e cursando aparecem", () => {
    expect(podeReceberCertificado({ id: "i", alunoId: "a", status: "CONCLUIDO" })).toBe(true);
    expect(podeReceberCertificado({ id: "i", alunoId: "a", statusInscricao: "INSCRITO" })).toBe(true);
  });
});
