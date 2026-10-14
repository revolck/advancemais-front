import { describe, expect, it } from "vitest";

import {
  isPessoaJuridica,
  isProfileCompleteForOnboarding,
} from "./profile-onboarding.utils";

const endereco = {
  cep: "57000000",
  logradouro: "Rua A",
  numero: "10",
  bairro: "Centro",
  cidade: "Maceió",
  estado: "AL",
};

const usuario = (extra: Record<string, unknown>) =>
  ({
    telefone: "82900000000",
    genero: null,
    dataNasc: null,
    enderecos: [endereco],
    ...extra,
  }) as any;

const stats = { hasAddress: true } as any;

describe("onboarding: dados pessoais só para pessoa física", () => {
  it("empresa completa sem gênero e sem data de nascimento", () => {
    const empresa = usuario({ tipoUsuario: "PESSOA_JURIDICA", role: "EMPRESA" });
    expect(isPessoaJuridica(empresa)).toBe(true);
    expect(isProfileCompleteForOnboarding(empresa, stats)).toBe(true);
  });

  it("empresa sem endereço ou telefone continua pendente", () => {
    const semEndereco = usuario({ tipoUsuario: "PESSOA_JURIDICA", enderecos: [] });
    expect(isProfileCompleteForOnboarding(semEndereco, stats)).toBe(false);
    const semTelefone = usuario({ tipoUsuario: "PESSOA_JURIDICA", telefone: "" });
    expect(isProfileCompleteForOnboarding(semTelefone, stats)).toBe(false);
  });

  it("pessoa física ainda precisa de gênero e data de nascimento", () => {
    const aluno = usuario({ tipoUsuario: "PESSOA_FISICA", role: "ALUNO_CANDIDATO" });
    expect(isPessoaJuridica(aluno)).toBe(false);
    expect(isProfileCompleteForOnboarding(aluno, stats)).toBe(false);
    expect(
      isProfileCompleteForOnboarding(
        { ...aluno, genero: "FEMININO", dataNasc: "1995-05-10" },
        stats
      )
    ).toBe(true);
  });
});
