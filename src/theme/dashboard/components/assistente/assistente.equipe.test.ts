import { describe, expect, it } from "vitest";

import type { TutoriaisUsuario } from "@/api/usuarios/tutoriais";
import { BOAS_VINDAS_EQUIPE, escolherConversaEquipe } from "./assistente.equipe";

const jaViu = { [BOAS_VINDAS_EQUIPE]: { status: "CONCLUIDO" as const, em: "2026-10-14" } };
const conversa = (
  role: string,
  equipe: Record<string, unknown> | null,
  tutoriais: TutoriaisUsuario = jaViu
) =>
  escolherConversaEquipe({
    role,
    nome: "Ana Lima",
    equipe,
    tutoriais,
    agora: new Date("2026-10-14T15:00:00Z"),
  });

describe("assistente da equipe", () => {
  it("primeiro acesso: abre sozinho uma vez e ensina a ocultar", () => {
    const c = conversa("ADMIN", { vagasEmAnalise: 0, usuariosPendentes: 0, empresasNovas7Dias: 0 }, {});
    expect(c).toMatchObject({ motivo: "BOAS_VINDAS", abrirSozinho: true, marcaTutorial: BOAS_VINDAS_EQUIPE });
    expect(c.mensagens.join(" ")).toContain("Ocultar assistente");
  });

  it("admin: vagas para aprovar e acessos para liberar, com atalhos", () => {
    const c = conversa("ADMIN", { vagasEmAnalise: 5, usuariosPendentes: 2, empresasNovas7Dias: 0 });
    expect(c).toMatchObject({ motivo: "RESUMO_DO_DIA", abrirSozinho: false, novidade: true });
    expect(c.mensagens.join(" ")).toContain("5 vagas aguardam aprovação");
    expect(c.botoes.map((b) => b.href)).toEqual([
      "/dashboard/empresas/solicitacoes",
      "/dashboard/usuarios",
      "/dashboard/config/geral?tab=comunicado",
      undefined,
    ]);
  });

  it("setor de vagas não recebe atalho de usuários nem do comunicado (sem acesso)", () => {
    const c = conversa("SETOR_DE_VAGAS", { vagasEmAnalise: 1, usuariosPendentes: 9, empresasNovas7Dias: 1 });
    const hrefs = c.botoes.map((b) => b.href);
    expect(hrefs).toContain("/dashboard/empresas/solicitacoes");
    expect(hrefs).not.toContain("/dashboard/usuarios");
    expect(hrefs).not.toContain("/dashboard/config/geral?tab=comunicado");
  });

  it("nada pendente: diz que está tudo em dia e não acende a bolinha", () => {
    const c = conversa("MODERADOR", { vagasEmAnalise: 0, usuariosPendentes: 0, empresasNovas7Dias: 0 });
    expect(c.mensagens.join(" ")).toContain("Tudo em dia");
    expect(c.novidade).toBe(false);
  });

  it("recrutador sem vínculo é avisado; com entrevista hoje, atalho para entrevistas", () => {
    expect(conversa("RECRUTADOR", { vagasVinculadas: 0 }).mensagens.join(" ")).toContain(
      "Peça ao administrador"
    );
    const c = conversa("RECRUTADOR", { vagasVinculadas: 3, entrevistasHoje: 2, candidatosNovos7Dias: 0 });
    expect(c.botoes[0]).toMatchObject({ href: "/dashboard/empresas/entrevistas", principal: true });
  });

  it("instrutor: provas para corrigir e notas pendentes", () => {
    const c = conversa("INSTRUTOR", { turmas: 2, aulasHoje: 0, provasParaCorrigir: 4, notasPendentes: 1 });
    expect(c.botoes.map((b) => b.rotulo)).toEqual(["Corrigir", "Lançar notas", "Central de ajuda"]);
  });

  it("financeiro (sem painel próprio): só a central de ajuda", () => {
    const c = conversa("FINANCEIRO", {});
    expect(c.botoes).toEqual([{ acao: "AJUDA", rotulo: "Central de ajuda", principal: true }]);
  });
});
