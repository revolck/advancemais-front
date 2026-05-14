import { describe, expect, it } from "vitest";
import {
  mapDepoimentoResponsesToTestimonialData,
  normalizeDepoimentosListResponse,
} from "./normalization";

const publishedDepoimento = {
  id: "ordem-1",
  depoimentoId: "depoimento-1",
  depoimento: "A Advance mudou nossos processos.",
  nome: "Vitoria Jordany",
  cargo: "Diretora",
  fotoUrl: "https://cdn.example.com/vitoria.webp",
  status: "PUBLICADO",
  ordem: 2,
};

describe("mapDepoimentoResponsesToTestimonialData", () => {
  it("normaliza depoimentos publicados com payload direto", () => {
    const result = mapDepoimentoResponsesToTestimonialData([
      publishedDepoimento,
    ]);

    expect(result).toEqual([
      {
        id: "depoimento-1",
        name: "Vitoria Jordany",
        position: "Diretora",
        company: undefined,
        testimonial: "A Advance mudou nossos processos.",
        imageUrl: "https://cdn.example.com/vitoria.webp",
        rating: 5,
        order: 2,
        isActive: true,
      },
    ]);
  });

  it("normaliza depoimentos com recurso aninhado e status ausente quando permitido", () => {
    const result = mapDepoimentoResponsesToTestimonialData(
      [
        {
          id: "ordem-2",
          ordem: "1",
          depoimento: {
            id: "depoimento-2",
            texto: "Equipe muito preparada.",
            autor: "Marina Silva",
            role: "RH",
            foto: {
              url: "website/depoimentos/marina.webp",
            },
          },
        },
      ],
      { assumePublishedWhenStatusMissing: true },
    );

    expect(result).toEqual([
      {
        id: "depoimento-2",
        name: "Marina Silva",
        position: "RH",
        company: undefined,
        testimonial: "Equipe muito preparada.",
        imageUrl: "/website/depoimentos/marina.webp",
        rating: 5,
        order: 1,
        isActive: true,
      },
    ]);
  });

  it("mantem depoimentos publicados sem texto quando houver dados do autor", () => {
    const result = mapDepoimentoResponsesToTestimonialData([
      {
        id: "ordem-3",
        depoimentoId: "depoimento-3",
        nome: "Vitória Jordany",
        cargo: "Gerente de RH",
        fotoUrl: "https://cdn.example.com/sem-texto.webp",
        status: "PUBLICADO",
        ordem: 1,
      },
    ]);

    expect(result).toEqual([
      {
        id: "depoimento-3",
        name: "Vitória Jordany",
        position: "Gerente de RH",
        company: undefined,
        testimonial: "",
        imageUrl: "https://cdn.example.com/sem-texto.webp",
        rating: 5,
        order: 1,
        isActive: true,
      },
    ]);
  });

  it("remove itens sem texto e sem dados visiveis", () => {
    const result = mapDepoimentoResponsesToTestimonialData([
      {
        id: "ordem-4",
        depoimentoId: "depoimento-4",
        status: "PUBLICADO",
        ordem: 1,
      },
    ]);

    expect(result).toEqual([]);
  });
});

describe("normalizeDepoimentosListResponse", () => {
  it("mantem resposta em array direto", () => {
    expect(normalizeDepoimentosListResponse([publishedDepoimento])).toEqual([
      publishedDepoimento,
    ]);
  });

  it("aceita resposta envelopada em data", () => {
    expect(
      normalizeDepoimentosListResponse({ data: [publishedDepoimento] }),
    ).toEqual([publishedDepoimento]);
  });

  it("retorna lista vazia para payload sem lista", () => {
    expect(normalizeDepoimentosListResponse({ success: true })).toEqual([]);
  });
});
