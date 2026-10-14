import { describe, expect, it } from "vitest";

import type { ComunicadoAcaoAlunoResultado } from "@/api/email/types";
import {
  ACOES_POR_TIPO,
  GRAVIDADE_PENDENCIA,
  TIPO_PENDENCIA_LABEL,
  descreverResultadoAcao,
  formatarPercentual,
  iniciais,
  percentual,
  prazoCampanha,
  segmentosProgresso,
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

describe("painel: progresso e lista", () => {
  it("percentual com uma casa e sem divisão por zero", () => {
    expect(percentual(1, 3)).toBe(33.3);
    expect(percentual(5, 0)).toBe(0);
    expect(formatarPercentual(33.3)).toBe("33,3%");
  });

  it("barra de progresso segue a ordem das faixas e soma 100%", () => {
    const segmentos = segmentosProgresso({
      jaAcessaram: 50,
      receberamComunicado: 20,
      emAndamento: 0,
      aguardandoPrimeiroAcesso: 25,
      precisamAtencao: 5,
    });
    expect(segmentos.map((s) => s.chave)).toEqual([
      "jaAcessaram",
      "receberamComunicado",
      "emAndamento",
      "aguardandoPrimeiroAcesso",
      "precisamAtencao",
    ]);
    expect(segmentos.reduce((soma, s) => soma + s.percentual, 0)).toBe(100);
  });

  it("todo tipo de pendência tem gravidade; senha exposta é crítica", () => {
    for (const tipo of Object.keys(TIPO_PENDENCIA_LABEL)) {
      expect(GRAVIDADE_PENDENCIA).toHaveProperty(tipo);
    }
    expect(GRAVIDADE_PENDENCIA.SENHA_POSSIVELMENTE_EXPOSTA).toBe("critica");
  });

  it("iniciais do aluno para o avatar", () => {
    expect(iniciais("maria da silva souza")).toBe("MS");
    expect(iniciais("Ana")).toBe("A");
    expect(iniciais("  ")).toBe("?");
  });
});

describe("prazo da campanha de inauguração", () => {
  const inicio = "2026-10-14T03:00:00.000Z";
  const fim = "2026-11-15T02:59:59.999Z"; // fim do dia 14/11 em Brasília

  it("no primeiro dia faltam 31 dias", () => {
    expect(prazoCampanha(inicio, fim, new Date("2026-10-14T18:00:00Z"))).toMatchObject({
      totalDias: 31,
      faltam: 31,
      encerrada: false,
      percentual: 0,
    });
  });

  it("no último dia ainda vale; no dia seguinte está encerrada", () => {
    expect(prazoCampanha(inicio, fim, new Date("2026-11-14T23:00:00Z"))).toMatchObject({
      faltam: 0,
      encerrada: false,
      percentual: 100,
    });
    expect(prazoCampanha(inicio, fim, new Date("2026-11-15T12:00:00Z")).encerrada).toBe(true);
  });
});
