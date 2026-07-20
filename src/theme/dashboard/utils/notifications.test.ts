import { describe, expect, it } from "vitest";

import type { Notificacao } from "@/api/notificacoes/types";
import { getNotificationAction, getNotificationMeta } from "./notifications";

function buildNotification(overrides: Partial<Notificacao>): Notificacao {
  return {
    id: "notif-1",
    tipo: "SISTEMA",
    status: "NAO_LIDA",
    prioridade: "NORMAL",
    titulo: "Notificação",
    mensagem: "Mensagem",
    criadoEm: new Date("2026-07-20T10:00:00.000Z").toISOString(),
    dados: null,
    linkAcao: null,
    ...overrides,
  };
}

describe("dashboard notification utilities", () => {
  it("renders course payment metadata", () => {
    const meta = getNotificationMeta(
      buildNotification({ tipo: "CURSO_PAGAMENTO_PROCESSANDO" })
    );

    expect(meta.label).toBe("Curso");
    expect(meta.icon).toBe("LoaderCircle");
  });

  it("routes approved course payment notifications to the student course page", () => {
    const action = getNotificationAction(
      buildNotification({
        tipo: "CURSO_PAGAMENTO_APROVADO",
        dados: { cursoId: "curso-1", turmaId: "turma-1" },
      })
    );

    expect(action).toEqual({
      href: "/dashboard/cursos/alunos/cursos/curso-1/turma-1",
      label: "Acessar curso",
    });
  });

  it("routes pending course payment notifications to payments", () => {
    const action = getNotificationAction(
      buildNotification({ tipo: "CURSO_PAGAMENTO_PENDENTE" })
    );

    expect(action).toEqual({
      href: "/dashboard/cursos/pagamentos",
      label: "Ver pagamento",
    });
  });
});
