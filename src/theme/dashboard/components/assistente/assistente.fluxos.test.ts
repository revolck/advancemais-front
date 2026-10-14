import { describe, expect, it } from "vitest";

import type { SituacaoBonificacao } from "@/api/empresas/bonificacao";
import type { ContextoEmpresa } from "@/api/usuarios/assistente";
import {
  TOUR_EMPRESA,
  conversaTourConcluido,
  escolherConversa,
  quando,
  situacaoDePublicacao,
} from "./assistente.fluxos";

const bonus = (exibir = true): SituacaoBonificacao => ({
  bonificacao: {
    planoId: "p1",
    planoNome: "Inicial",
    quantidadeVagas: 3,
    validoAte: "2026-11-15T02:59:59.999Z",
    exibir,
  },
  gratuitoExpirado: null,
});

const tourFeito = { [TOUR_EMPRESA]: { status: "CONCLUIDO" as const, em: "2026-10-14" } };
const base = { nomeEmpresa: "Empresa Teste Inauguração LTDA", expiradoDispensadoHoje: false };

describe("assistente: o que dizer para a empresa", () => {
  it("presente de inauguração: abre sozinho, comemora e oferece o tour", () => {
    const c = escolherConversa({ ...base, situacao: bonus(), tutoriais: {} });
    expect(c).toMatchObject({ motivo: "BONIFICACAO", abrirSozinho: true, comemorar: true });
    expect(c.mensagens[0]).toBe("Oi, Empresa! 👋 Eu sou o assistente da Advance+.");
    expect(c.mensagens.join(" ")).toContain("1 mês grátis do plano Inicial");
    expect(c.mensagens.join(" ")).toContain("14 de novembro");
    expect(c.mensagens.join(" ")).toContain("até 3 vagas");
    expect(c.botoes.map((b) => b.acao)).toEqual(["INICIAR_TOUR", "PUBLICAR_VAGA", "AGORA_NAO"]);
  });

  it("presente para quem já fez o tour: vai direto para publicar vaga", () => {
    const c = escolherConversa({ ...base, situacao: bonus(), tutoriais: tourFeito });
    expect(c.botoes[0].acao).toBe("PUBLICAR_VAGA");
    expect(c.botoes.some((b) => b.acao === "INICIAR_TOUR")).toBe(false);
  });

  it("sem bonificação (ex.: comprou um plano): só o tour de primeiro acesso", () => {
    const c = escolherConversa({
      ...base,
      situacao: { bonificacao: null, gratuitoExpirado: null },
      tutoriais: {},
    });
    expect(c).toMatchObject({ motivo: "PRIMEIRO_ACESSO", abrirSozinho: true, comemorar: false });
    expect(c.mensagens.join(" ")).not.toContain("grátis");
  });

  it("presente já visto e tour feito: assistente fica quieto, só ajuda se chamado", () => {
    const c = escolherConversa({ ...base, situacao: bonus(false), tutoriais: tourFeito });
    expect(c).toMatchObject({ motivo: "AJUDA", abrirSozinho: false });
    expect(c.mensagens.join(" ")).toContain("vai até 14 de novembro");
  });

  it("plano gratuito encerrado tem prioridade e respeita o 'agora não' do dia", () => {
    const situacao: SituacaoBonificacao = {
      bonificacao: null,
      gratuitoExpirado: { planoId: "p1", planoNome: "Inicial", inauguracao: true, expirouEm: null },
    };
    const c = escolherConversa({ ...base, situacao, tutoriais: {} });
    expect(c.motivo).toBe("PLANO_GRATUITO_EXPIRADO");
    expect(c.mensagens[0]).toContain("Seu mês grátis chegou ao fim");
    expect(c.botoes[0].acao).toBe("VER_PLANOS");
    expect(
      escolherConversa({ ...base, situacao, tutoriais: {}, expiradoDispensadoHoje: true })
        .abrirSozinho
    ).toBe(false);
  });

  it("fim do tour convida a publicar a primeira vaga", () => {
    expect(conversaTourConcluido().botoes[0].acao).toBe("PUBLICAR_VAGA");
  });
});

describe("assistente: empresa só vê o que pode fazer", () => {
  const contexto = (extra: Partial<ContextoEmpresa> = {}): ContextoEmpresa => ({
    plano: { nome: "Inicial", modo: "CLIENTE", fim: null, limiteVagas: 3 },
    vagasIlimitadas: false,
    vagas: { publicadas: 1, emAnalise: 0, rascunhos: 0 },
    candidatosNovos7Dias: 0,
    entrevistas: { proximos7Dias: 0, proxima: null },
    ...extra,
  });
  const ajuda = (c: ContextoEmpresa) =>
    escolherConversa({
      ...base,
      situacao: { bonificacao: null, gratuitoExpirado: null },
      tutoriais: tourFeito,
      contexto: c,
    });

  it("sem plano: não oferece publicar vaga, oferece escolher um plano", () => {
    const c = ajuda(contexto({ plano: null }));
    expect(c.botoes.some((b) => b.acao === "PUBLICAR_VAGA")).toBe(false);
    expect(c.botoes[0]).toMatchObject({ acao: "VER_PLANOS", rotulo: "Escolher um plano" });
    expect(c.mensagens.join(" ")).toContain("precisa de um plano ativo");
  });

  it("limite do plano atingido (publicadas + em análise): oferece upgrade", () => {
    const c = ajuda(contexto({ vagas: { publicadas: 2, emAnalise: 1, rascunhos: 0 } }));
    expect(c.botoes.some((b) => b.acao === "PUBLICAR_VAGA")).toBe(false);
    expect(c.botoes[0]).toMatchObject({ acao: "VER_PLANOS", rotulo: "Fazer upgrade do plano" });
    expect(c.mensagens.join(" ")).toContain("3 de 3 vagas");
  });

  it("com vaga livre: publicar vaga em primeiro, uso do plano e atalhos do dia", () => {
    const c = ajuda(
      contexto({
        candidatosNovos7Dias: 2,
        entrevistas: { proximos7Dias: 1, proxima: "2026-10-20T13:00:00.000Z" },
      })
    );
    expect(c.botoes[0].acao).toBe("PUBLICAR_VAGA");
    expect(c.mensagens.join(" ")).toContain("1 de 3 vagas em uso");
    expect(c.mensagens.join(" ")).toContain("2 candidatos novos");
    expect(c.botoes.map((b) => b.href)).toContain("/dashboard/empresas/candidatos");
  });

  it("vagas ilimitadas (recursos premium) publicam mesmo sem plano", () => {
    expect(situacaoDePublicacao(contexto({ plano: null, vagasIlimitadas: true })).pode).toBe(true);
  });

  it("fim do tour sem plano leva para os planos", () => {
    expect(conversaTourConcluido(contexto({ plano: null })).botoes[0].acao).toBe("VER_PLANOS");
  });

  it("quando: hoje, amanhã ou data", () => {
    const agora = new Date("2026-10-14T15:00:00Z");
    expect(quando("2026-10-14T20:00:00Z", agora)).toBe("hoje às 17:00");
    expect(quando("2026-10-15T13:30:00Z", agora)).toBe("amanhã às 10:30");
    expect(quando("2026-10-20T13:00:00Z", agora)).toBe("20 de outubro às 10:00");
  });
});
