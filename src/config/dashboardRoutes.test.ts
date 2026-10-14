import { describe, expect, it } from "vitest";

import { canAccessRoute, rotaDoPainel } from "./dashboardRoutes";
import { UserRole } from "./roles";

const cursoId = "2e035bc5-f6b8-4f2a-84e3-009b9db34780";
const turmaId = "fb488ecc-4f31-481e-97f1-b859e831ee4b";

describe("dashboardRoutes cursos", () => {
  it("permite aluno apenas na rota de aprendizagem da turma", () => {
    expect(
      canAccessRoute(
        `/dashboard/cursos/alunos/cursos/${cursoId}/${turmaId}`,
        UserRole.ALUNO_CANDIDATO,
      ),
    ).toBe(true);
    expect(
      canAccessRoute(
        "/dashboard/cursos/alunos/cursos",
        UserRole.ALUNO_CANDIDATO,
      ),
    ).toBe(true);
    expect(
      canAccessRoute(`/dashboard/cursos/${cursoId}`, UserRole.ALUNO_CANDIDATO),
    ).toBe(false);
    expect(
      canAccessRoute(
        `/dashboard/cursos/${cursoId}/editar`,
        UserRole.ALUNO_CANDIDATO,
      ),
    ).toBe(false);
  });

  it("permite ao aluno acessar somente a própria tela de notas", () => {
    expect(
      canAccessRoute(
        "/dashboard/cursos/alunos/notas",
        UserRole.ALUNO_CANDIDATO,
      ),
    ).toBe(true);
    expect(
      canAccessRoute("/dashboard/cursos/alunos/notas", UserRole.ADMIN),
    ).toBe(false);
    expect(
      canAccessRoute("/dashboard/cursos/notas", UserRole.ALUNO_CANDIDATO),
    ).toBe(false);
  });

  it("permite ao aluno acessar somente as próprias telas acadêmicas", () => {
    const alunoRoutes = [
      "/dashboard/cursos/alunos/frequencia",
      "/dashboard/cursos/alunos/certificados",
      "/dashboard/cursos/alunos/estagios",
      "/dashboard/cursos/pagamentos",
    ];

    for (const route of alunoRoutes) {
      expect(canAccessRoute(route, UserRole.ALUNO_CANDIDATO)).toBe(true);
      expect(canAccessRoute(route, UserRole.ADMIN)).toBe(false);
    }
  });

  it("permite ao aluno acessar as vagas do próprio portal", () => {
    expect(canAccessRoute("/dashboard/vagas", UserRole.ALUNO_CANDIDATO)).toBe(
      true,
    );
    expect(
      canAccessRoute(
        "/dashboard/vagas/7a973d5b-0ec3-4025-9f37-325aaee6d5bf",
        UserRole.ALUNO_CANDIDATO,
      ),
    ).toBe(true);
  });

  it("mantem rotas administrativas de cursos bloqueadas para aluno", () => {
    expect(canAccessRoute("/dashboard/cursos", UserRole.ALUNO_CANDIDATO)).toBe(
      false,
    );
    expect(
      canAccessRoute("/dashboard/cursos/turmas", UserRole.ALUNO_CANDIDATO),
    ).toBe(false);
  });

  it("permite instrutor ver detalhes administrativos, mas não editar", () => {
    expect(
      canAccessRoute(`/dashboard/cursos/${cursoId}`, UserRole.INSTRUTOR),
    ).toBe(true);
    expect(
      canAccessRoute(`/dashboard/cursos/${cursoId}/editar`, UserRole.INSTRUTOR),
    ).toBe(false);
  });
});

describe("dashboardRoutes config", () => {
  it("protege as rotas reais de configuração em /dashboard/config", () => {
    expect(canAccessRoute("/dashboard/config/empresas", UserRole.ADMIN)).toBe(
      true,
    );
    expect(
      canAccessRoute("/dashboard/config/empresas", UserRole.ALUNO_CANDIDATO),
    ).toBe(false);
    expect(
      canAccessRoute("/dashboard/config/geral", UserRole.ALUNO_CANDIDATO),
    ).toBe(false);
  });

  it("mantem acesso pedagogico apenas em configuracoes de cursos", () => {
    expect(
      canAccessRoute("/dashboard/config/cursos", UserRole.PEDAGOGICO),
    ).toBe(true);
    expect(
      canAccessRoute("/dashboard/config/empresas", UserRole.PEDAGOGICO),
    ).toBe(false);
  });
});

describe("caminho do painel no subdomínio app.", () => {
  it("raiz e caminhos curtos viram o caminho do painel", () => {
    expect(rotaDoPainel("/")).toBe("/dashboard");
    expect(rotaDoPainel("")).toBe("/dashboard");
    expect(rotaDoPainel("/empresas/vagas")).toBe("/dashboard/empresas/vagas");
    expect(rotaDoPainel("/dashboard/config/geral")).toBe("/dashboard/config/geral");
    expect(rotaDoPainel("/dashboard")).toBe("/dashboard");
  });

  it("empresa e aluno entram pela raiz do app sem ser barrados", () => {
    for (const papel of [UserRole.EMPRESA, UserRole.ALUNO_CANDIDATO, UserRole.ADMIN]) {
      expect(canAccessRoute(rotaDoPainel("/"), papel)).toBe(true);
    }
    expect(canAccessRoute(rotaDoPainel("/empresas/vagas"), UserRole.EMPRESA)).toBe(true);
    expect(canAccessRoute(rotaDoPainel("/config/geral"), UserRole.EMPRESA)).toBe(false);
  });
});
