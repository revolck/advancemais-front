import { describe, expect, it } from "vitest";
import {
  getTurmaEstruturaItemCount,
  getTurmaEstruturaResumo,
  isTurmaStatusPublicado,
} from "./estrutura";

describe("turma estrutura utils", () => {
  it("considera estrutura vazia quando nao ha modulos nem itens avulsos", () => {
    expect(
      getTurmaEstruturaResumo({
        modules: [],
        standaloneItems: [],
      }),
    ).toEqual({
      itemCount: 0,
      modulesCount: 0,
      standaloneItemsCount: 0,
    });
  });

  it("considera modulo sem itens como estrutura sem itens efetivos", () => {
    expect(
      getTurmaEstruturaResumo({
        modules: [{ id: "mod-1", title: "Modulo 1", items: [] }],
        standaloneItems: [],
      }),
    ).toEqual({
      itemCount: 0,
      modulesCount: 1,
      standaloneItemsCount: 0,
    });
  });

  it("conta itens de modulos e itens avulsos", () => {
    expect(
      getTurmaEstruturaItemCount({
        modules: [
          {
            id: "mod-1",
            title: "Modulo 1",
            items: [
              { id: "aula-1", title: "Aula 1", type: "AULA" },
              { id: "prova-1", title: "Prova", type: "PROVA" },
            ],
          },
        ],
        standaloneItems: [{ id: "aula-2", title: "Aula 2", type: "AULA" }],
      }),
    ).toBe(3);
  });

  it("identifica status publicado sem depender de caixa", () => {
    expect(isTurmaStatusPublicado("PUBLICADO")).toBe(true);
    expect(isTurmaStatusPublicado("publicado")).toBe(true);
    expect(isTurmaStatusPublicado("RASCUNHO")).toBe(false);
  });
});
