import { describe, expect, it } from "vitest";

import type { TutoriaisUsuario } from "@/api/usuarios/tutoriais";
import type { ContextoAluno } from "@/api/usuarios/assistente";
import { BOAS_VINDAS_ALUNO, escolherConversaAluno } from "./assistente.aluno";

const agora = new Date("2026-10-14T15:00:00Z");
const aluno = (extra: Partial<ContextoAluno> = {}): ContextoAluno => ({
  cursosEmAndamento: [],
  inscricoesAguardandoPagamento: 0,
  cursosConcluidos: 0,
  certificados: 0,
  curriculos: 0,
  candidaturas: 0,
  entrevistas: { proximos7Dias: 0, proxima: null },
  ...extra,
});
const jaViu = { [BOAS_VINDAS_ALUNO]: { status: "CONCLUIDO" as const, em: "2026-10-14" } };
const conversa = (
  a: ContextoAluno | null,
  tutoriais: TutoriaisUsuario = jaViu,
  dispensada = false
) =>
  escolherConversaAluno({
    nome: "Maria Souza",
    aluno: a,
    tutoriais,
    urlCursosDoSite: "https://advancemais.com/cursos",
    dispensadaHoje: () => dispensada,
    agora,
  });
const rotulos = (c: ReturnType<typeof conversa>) => c.botoes.map((b) => b.rotulo);

describe("assistente do aluno/candidato", () => {
  it("primeiro acesso: abre sozinho, se apresenta e ensina a ocultar", () => {
    const c = conversa(aluno(), {});
    expect(c).toMatchObject({ motivo: "BOAS_VINDAS", abrirSozinho: true, marcaTutorial: BOAS_VINDAS_ALUNO });
    expect(c.mensagens.join(" ")).toContain("ocultar");
  });

  it("sem curso e sem currículo: criar currículo e conhecer cursos (no site)", () => {
    const c = conversa(aluno());
    expect(rotulos(c)).toEqual(["Criar meu currículo", "Conhecer cursos", "Central de ajuda"]);
    expect(c.botoes[1]).toMatchObject({ externo: true, href: "https://advancemais.com/cursos" });
    expect(c.mensagens.join(" ")).toContain("ainda não está em nenhum curso");
  });

  it("com curso em andamento: continuar o curso, sem oferecer conhecer cursos", () => {
    const c = conversa(
      aluno({
        cursosEmAndamento: [{ cursoId: "c1", turmaId: "t1", curso: "Excel Avançado", turma: "A" }],
        curriculos: 1,
      })
    );
    expect(c.botoes[0]).toMatchObject({
      rotulo: "Continuar Excel Avançado",
      href: "/dashboard/cursos/alunos/cursos/c1/t1",
      principal: true,
    });
    expect(rotulos(c)).toContain("Ver vagas");
    expect(rotulos(c)).not.toContain("Conhecer cursos");
  });

  it("pagamento pendente vem primeiro e acende a bolinha", () => {
    const c = conversa(aluno({ inscricoesAguardandoPagamento: 1, curriculos: 1 }));
    expect(c.botoes[0].rotulo).toBe("Concluir pagamento");
    expect(c.novidade).toBe(true);
  });

  it("com currículo: oferece vagas, não criar currículo", () => {
    const c = conversa(aluno({ curriculos: 2, candidaturas: 3, cursosConcluidos: 1, certificados: 1 }));
    expect(rotulos(c)).toEqual(["Ver vagas", "Meus certificados", "Central de ajuda"]);
    expect(c.mensagens.join(" ")).toContain("3 candidaturas");
  });

  it("entrevista em até 2 dias: lembrete abre sozinho, uma vez por dia", () => {
    const comEntrevista = aluno({
      curriculos: 1,
      entrevistas: { proximos7Dias: 1, proxima: "2026-10-15T13:00:00Z" },
    });
    const c = conversa(comEntrevista);
    expect(c).toMatchObject({ motivo: "ENTREVISTA", abrirSozinho: true });
    expect(c.mensagens.join(" ")).toContain("amanhã às 10:00");
    expect(conversa(comEntrevista, jaViu, true).abrirSozinho).toBe(false);
  });

  it("sem dados da API: ajuda genérica, sem prometer nada", () => {
    const c = conversa(null);
    expect(c.motivo).toBe("AJUDA");
    expect(rotulos(c)).toEqual(["Meus cursos", "Ver vagas", "Central de ajuda"]);
  });
});
