import { describe, expect, it } from "vitest";

import type { ComunicadoAcaoAlunoResultado } from "@/api/email/types";
import {
  ACOES_POR_TIPO,
  TIPO_PENDENCIA_LABEL,
  descreverResultadoAcao,
  tonalidadeSituacao,
} from "./comunicado.utils";

const base: ComunicadoAcaoAlunoResultado = {
  email: "aluno@gmail.com",
  validacao: {
    resultado: "VALIDO",
    motivo: "CAIXA_CONFIRMADA",
    sugestao: null,
    fonte: "NEVERBOUNCE",
  },
  validadorIndisponivel: null,
  liberadoParaEnvio: true,
  envio: { enviados: 1, interrompidoPor: null },
};

describe("comunicado.utils", () => {
  it("confirma o envio quando a nova senha saiu", () => {
    expect(descreverResultadoAcao(base)).toMatchObject({
      sucesso: true,
      titulo: "Comunicado enviado",
    });
  });

  it("explica quando o e-mail é válido mas o envio está pausado", () => {
    const r = descreverResultadoAcao({
      ...base,
      envio: { enviados: 0, interrompidoPor: "TAXA_DEVOLUCAO_ALTA" },
    });
    expect(r.sucesso).toBe(false);
    expect(r.descricao).toContain("pausado");
  });

  it("não promete envio para endereço de risco", () => {
    const r = descreverResultadoAcao({
      ...base,
      validacao: {
        resultado: "RISCO",
        motivo: "ACEITA_QUALQUER_ENDERECO",
        sugestao: null,
        fonte: "NEVERBOUNCE",
      },
      liberadoParaEnvio: false,
      envio: null,
    });
    expect(r.titulo).toBe("E-mail salvo: risco elevado");
    expect(r.descricao).toContain("Não será enviado automaticamente");
  });

  it("pede o validador quando o endereço ficou pendente", () => {
    const r = descreverResultadoAcao({
      ...base,
      validacao: {
        resultado: "PENDENTE",
        motivo: null,
        sugestao: null,
        fonte: "LOCAL",
      },
      liberadoParaEnvio: false,
      envio: null,
    });
    expect(r.descricao).toContain("validador");
  });

  it("revogar só aparece para senha possivelmente exposta", () => {
    const comRevogar = Object.entries(ACOES_POR_TIPO)
      .filter(([, acoes]) => acoes.includes("revogar"))
      .map(([tipo]) => tipo);
    expect(comRevogar).toEqual(["SENHA_POSSIVELMENTE_EXPOSTA"]);
    expect(Object.keys(TIPO_PENDENCIA_LABEL)).toHaveLength(
      Object.keys(ACOES_POR_TIPO).length,
    );
  });

  it("tonalidade da situação", () => {
    expect(tonalidadeSituacao("EM_ANDAMENTO")).toBe("ok");
    expect(tonalidadeSituacao("TAXA_DEVOLUCAO_ALTA")).toBe("perigo");
    expect(tonalidadeSituacao("COTA_BREVO_INSUFICIENTE")).toBe("perigo");
    expect(tonalidadeSituacao("SEM_VALIDADOR")).toBe("alerta");
    expect(tonalidadeSituacao("DESLIGADO")).toBe("neutro");
  });
});
