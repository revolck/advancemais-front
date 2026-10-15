import { describe, expect, it } from "vitest";

import type { VagaListItem } from "@/api/vagas";
import { paginarVagas, type NormalizedVagaFilters } from "./useVagasDashboardQuery";

const vaga = (i: number, extra: Partial<VagaListItem> = {}): VagaListItem =>
  ({
    id: `v${i}`,
    codigo: `COD${i}`,
    titulo: `Vaga ${i}`,
    status: "PUBLICADO",
    empresa: { nome: i % 2 ? "Empresa Ímpar" : "Empresa Par" },
    localizacao: { cidade: "Maceió", estado: "AL" },
    ...extra,
  }) as VagaListItem;

const filtros = (extra: Partial<NormalizedVagaFilters> = {}): NormalizedVagaFilters => ({
  page: 1,
  pageSize: 10,
  statuses: [],
  ...extra,
});

const vagas = Array.from({ length: 25 }, (_, i) => vaga(i + 1));

describe("lista de vagas do painel", () => {
  it("sem filtro mostra o total real e as outras páginas (antes: 10 e fim)", () => {
    const r = paginarVagas(vagas, filtros());
    expect(r.vagas).toHaveLength(10);
    expect(r.pagination).toEqual({ page: 1, pageSize: 10, total: 25, totalPages: 3 });
    expect(paginarVagas(vagas, filtros({ page: 3 })).vagas.map((v) => v.id)).toEqual([
      "v21",
      "v22",
      "v23",
      "v24",
      "v25",
    ]);
  });

  it("a busca encontra vaga que está fora da primeira página", () => {
    const r = paginarVagas(vagas, filtros({ search: "cod23" }));
    expect(r.vagas.map((v) => v.id)).toEqual(["v23"]);
    expect(r.pagination.total).toBe(1);
  });

  it("filtro de empresa olha todas as vagas", () => {
    const r = paginarVagas(vagas, filtros({ company: "Empresa Par" }));
    expect(r.pagination.total).toBe(12);
  });

  it("setor de vagas vê rascunhos (o filtro antigo escondia)", () => {
    const comRascunho = [...vagas, vaga(99, { status: "RASCUNHO" })];
    const r = paginarVagas(comRascunho, filtros({ statuses: ["RASCUNHO"] }));
    expect(r.vagas.map((v) => v.id)).toEqual(["v99"]);
  });

  it("página além do fim volta para a última", () => {
    expect(paginarVagas(vagas, filtros({ page: 9 })).pagination.page).toBe(3);
  });

  it("guarda todas as vagas para montar as opções dos filtros", () => {
    expect(paginarVagas(vagas, filtros({ company: "Empresa Par" })).todas).toHaveLength(25);
  });
});
