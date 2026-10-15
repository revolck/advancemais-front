import { describe, expect, it } from "vitest";

import type { ResultadoAdicao } from "@/api/cursos/situacao";
import {
  adicaoPedeCiencia,
  ehTurmaMigrada,
  frasesDaAdicao,
  frasesDaRemocao,
  frasesDoResumo,
  motivoSemCobranca,
  termoDeBusca,
} from "./situacao.utils";

describe("prévia", () => {
  it("explica o que muda, inclusive certificados", () => {
    const frases = frasesDoResumo({
      aplicado: false,
      selecionados: 3,
      naoEncontrados: [],
      cpfsInvalidos: [],
      atingidos: 3,
      mudam: 2,
      jaNaSituacao: 1,
      certificadosARevogar: 2,
      certificadosARestaurar: 0,
      concluintesSemCertificado: 0,
    });
    expect(frases[0]).toBe("3 alunos atingidos; 2 mudam de situação.");
    expect(frases.join(" ")).toContain("2 certificados serão revogados");
    expect(frases.join(" ")).toContain("1 aluno já estava nessa situação.");
  });
});

const adicao = (extra: Partial<ResultadoAdicao> = {}): ResultadoAdicao => ({
  aplicado: false,
  adicionar: [{ alunoId: "a1", nome: "Ana" }],
  reativar: [],
  jaNaTurma: [],
  recusados: [],
  avisos: {
    turmaConcluida: false,
    turmaIniciada: false,
    prazoDeInscricaoEncerrado: false,
    excedeVagas: false,
    outrasTurmasDoCurso: [],
  },
  vagas: { ocupadas: 10, limite: 30, depois: 11 },
  ...extra,
});

describe("matrícula pela equipe", () => {
  it("turma migrada (MIGT…) não avisa o aluno por padrão", () => {
    expect(ehTurmaMigrada("MIGTa1b2c3d4")).toBe(true);
    expect(ehTurmaMigrada("T-2026-01")).toBe(false);
    expect(ehTurmaMigrada(undefined)).toBe(false);
  });

  it("cobrança só para turma à venda no site", () => {
    expect(motivoSemCobranca("CONCLUIDO")).toMatch(/concluída/);
    expect(motivoSemCobranca("RASCUNHO")).toMatch(/rascunho/);
    expect(motivoSemCobranca("EM_ANDAMENTO")).toBeNull();
  });

  it("CPF com pontuação vira só números; nome fica como digitado", () => {
    expect(termoDeBusca(" 774.883.904-23 ")).toBe("77488390423");
    expect(termoDeBusca("Luana Liz")).toBe("Luana Liz");
  });

  it("prévia de quem entra: quem entra, quem volta, vagas", () => {
    const { frases, alertas } = frasesDaAdicao(
      adicao({ reativar: [{ alunoId: "a2", nome: "Bia" }], vagas: { ocupadas: 10, limite: 30, depois: 12 } })
    );
    expect(frases).toContain("1 aluno entra na turma.");
    expect(frases.join(" ")).toContain("1 aluno volta para a turma (tinha sido removido)");
    expect(frases).toContain("Vagas: 10 de 30 ocupadas; ficam 12.");
    expect(alertas).toEqual([]);
  });

  it("turma concluída e vagas estouradas pedem ciência", () => {
    const r = adicao({
      avisos: {
        turmaConcluida: true,
        turmaIniciada: true,
        prazoDeInscricaoEncerrado: true,
        excedeVagas: true,
        outrasTurmasDoCurso: [{ alunoId: "a1", nome: "Ana", turma: "Turma B" }],
      },
      vagas: { ocupadas: 30, limite: 30, depois: 31 },
    });
    const { alertas } = frasesDaAdicao(r);
    expect(alertas[0]).toMatch(/já foi concluída/);
    // Concluída já diz tudo: não repete "já começou" nem "prazo"
    expect(alertas.join(" ")).not.toMatch(/já começou|prazo/);
    expect(alertas.join(" ")).toContain("31 alunos para 30 vagas");
    expect(alertas.join(" ")).toContain("Ana já está em outra turma deste curso (Turma B)");
    expect(adicaoPedeCiencia(r)).toBe(true);
    expect(adicaoPedeCiencia(adicao())).toBe(false);
  });

  it("prévia de remoção fala de acesso, certificado e cobrança", () => {
    const frases = frasesDaRemocao({
      aplicado: false,
      remover: [
        { inscricaoId: "i1", alunoId: "a1", nome: "Ana" },
        { inscricaoId: "i2", alunoId: "a2", nome: "Bia" },
      ],
      jaRemovidas: 1,
      naoEncontradas: 0,
      certificadosARevogar: 1,
      cobrancasACancelar: 1,
    });
    expect(frases[0]).toBe(
      "2 alunos saem da turma e perdem o acesso. Notas, frequência e histórico ficam guardados."
    );
    expect(frases.join(" ")).toContain("1 certificado será revogado");
    expect(frases.join(" ")).toContain("1 cobrança pendente será cancelada");
    expect(frases.join(" ")).toContain("1 aluno já tinha sido removido");
  });
});
