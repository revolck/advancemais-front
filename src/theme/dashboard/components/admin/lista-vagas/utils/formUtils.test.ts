import { describe, expect, it } from "vitest";

import { campoDoFormulario, problemaNaLista, problemaNoTamanho } from "./formUtils";

describe("validação do texto da vaga (mesmos limites da API)", () => {
  const paragrafo = "a".repeat(257);

  it("parágrafo de 257 caracteres passa (antes a API recusava)", () => {
    expect(problemaNaLista(`Ensino médio\n${paragrafo}`)).toBeNull();
  });

  it("aponta o item longo demais, com o número da linha", () => {
    expect(problemaNaLista(`ok\n\n${"b".repeat(1001)}`)).toBe(
      "O item 2 tem 1001 caracteres (máximo 1000). Divida em itens menores, um por linha."
    );
  });

  it("limite de 50 itens e de tamanho do texto", () => {
    expect(problemaNaLista(Array.from({ length: 51 }, (_, i) => `item ${i}`).join("\n"))).toContain(
      "no máximo 50 itens"
    );
    expect(problemaNoTamanho("x".repeat(8001), 8000)).toContain("agora tem 8001");
    expect(problemaNoTamanho("curto", 8000)).toBeNull();
  });

  it("erro da API vai para o campo certo do formulário", () => {
    expect(campoDoFormulario("requisitos.obrigatorios.1")).toBe("requisitosObrigatorios");
    expect(campoDoFormulario("requisitos.desejaveis.0")).toBe("requisitosDesejaveis");
    expect(campoDoFormulario("requisitos")).toBe("requisitosObrigatorios");
    expect(campoDoFormulario("beneficios.observacoes")).toBe("beneficiosObservacoes");
    expect(campoDoFormulario("localizacao.cep")).toBe("localizacao.cep");
    expect(campoDoFormulario("categoriaVagaId")).toBe("areaInteresseId");
    expect(campoDoFormulario("titulo")).toBe("titulo");
  });
});
