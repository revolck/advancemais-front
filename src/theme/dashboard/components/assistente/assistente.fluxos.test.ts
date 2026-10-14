import { describe, expect, it } from "vitest";

import type { SituacaoBonificacao } from "@/api/empresas/bonificacao";
import { TOUR_EMPRESA, conversaTourConcluido, escolherConversa } from "./assistente.fluxos";

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
