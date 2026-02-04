import { describe, it, expect } from "vitest";
import {
  buildAulaTemplateOptions,
  buildAvaliacaoTemplateOptions,
  buildTemplateLabel,
} from "./itemEditorModal.utils";

describe("itemEditorModal.utils", () => {
  it("buildTemplateLabel uses codigo + titulo when available", () => {
    expect(buildTemplateLabel({ id: "1", codigo: "AUL-1", titulo: "Aula 1" })).toBe("Aula 1");
  });

  it("buildTemplateLabel falls back when titulo is missing", () => {
    expect(buildTemplateLabel({ id: "1", codigo: "AUL-1", titulo: "" })).toBe("(sem título)");
    expect(buildTemplateLabel({ id: "1", titulo: null })).toBe("(sem título)");
  });

  it("buildAulaTemplateOptions does not filter by modalidade", () => {
    const templates = [
      { id: "1", codigo: "A1", titulo: "Online", modalidade: "ONLINE" } as any,
      { id: "2", codigo: "A2", titulo: "Presencial", modalidade: "PRESENCIAL" } as any,
      { id: "3", codigo: "A3", titulo: "Sem modalidade", modalidade: null } as any,
    ];

    const options = buildAulaTemplateOptions(templates, new Set(), null);
    expect(options.map((o) => o.value)).toEqual(["1", "2", "3"]);
  });

  it("disables duplicate selections for aulas (excluding current)", () => {
    const templates = [
      { id: "1", codigo: "A1", titulo: "Aula 1" },
      { id: "2", codigo: "A2", titulo: "Aula 2" },
    ];
    const used = new Set(["2"]);

    const options = buildAulaTemplateOptions(templates, used, "2");
    expect(options.find((o) => o.value === "2")?.disabled).toBe(false);
    expect(options.find((o) => o.value === "1")?.disabled).toBe(false);

    const optionsOther = buildAulaTemplateOptions(templates, used, null);
    expect(optionsOther.find((o) => o.value === "2")?.disabled).toBe(true);
  });

  it("buildAvaliacaoTemplateOptions filters only by tipo", () => {
    const templates = [
      { id: "p1", codigo: "P1", titulo: "Prova 1", tipo: "PROVA" as const },
      { id: "a1", codigo: "A1", titulo: "Atividade 1", tipo: "ATIVIDADE" as const },
    ];

    expect(
      buildAvaliacaoTemplateOptions(templates, "PROVA", new Set(), null).map((o) => o.value)
    ).toEqual(["p1"]);

    expect(
      buildAvaliacaoTemplateOptions(templates, "ATIVIDADE", new Set(), null).map(
        (o) => o.value
      )
    ).toEqual(["a1"]);
  });
});
