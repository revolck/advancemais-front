import { beforeEach, describe, expect, it, vi } from "vitest";

import { apiFetch } from "@/api/client";
import { adicionarCartao } from "./index";
import type { CartaoEmpresa } from "./types";

vi.mock("@/api/client", () => ({
  apiFetch: vi.fn(),
}));

const cartao: CartaoEmpresa = {
  id: "cartao-1",
  empresaId: "empresa-1",
  ultimos4Digitos: "1234",
  bandeira: "visa",
  tipo: "credito",
  nomeNoCartao: "EMPRESA TESTE",
  mesExpiracao: 12,
  anoExpiracao: 2030,
  isPadrao: true,
  isAtivo: true,
  validadoEm: "2026-08-03T12:00:00.000Z",
  falhasConsecutivas: 0,
  criadoEm: "2026-08-03T12:00:00.000Z",
  atualizadoEm: "2026-08-03T12:00:00.000Z",
};

describe("adicionarCartao", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("mantem resposta nova com data.cartao", async () => {
    vi.mocked(apiFetch).mockResolvedValueOnce({
      success: true,
      data: {
        cartao,
        validacao: {
          sucesso: true,
          mensagem: "Cartão cadastrado com sucesso.",
        },
      },
      message: "Cartão adicionado com sucesso",
    });

    const response = await adicionarCartao({
      token: "card_token",
      tipo: "credito",
      isPadrao: true,
    });

    expect(response.data?.cartao).toEqual(cartao);
    expect(response.data?.validacao).toEqual({
      sucesso: true,
      mensagem: "Cartão cadastrado com sucesso.",
    });
  });

  it("normaliza resposta legada com cartao no topo", async () => {
    vi.mocked(apiFetch).mockResolvedValueOnce({
      success: true,
      cartao,
      message: "Cartão adicionado com sucesso",
    });

    const response = await adicionarCartao({
      token: "card_token",
      tipo: "credito",
    });

    expect(response.data).toEqual({
      cartao,
      validacao: {
        sucesso: true,
        mensagem: "Cartão adicionado com sucesso",
      },
    });
  });
});
