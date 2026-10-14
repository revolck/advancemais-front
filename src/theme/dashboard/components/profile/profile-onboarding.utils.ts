import type { UsuarioProfileResponse } from "@/api/usuarios/types";

export function getPrimaryEndereco(
  usuario?: UsuarioProfileResponse["usuario"]
): any | null {
  const enderecos = usuario?.enderecos ?? [];
  return enderecos.length > 0 ? enderecos[0] : null;
}

/** Empresas (pessoa jurídica) não têm gênero nem data de nascimento */
export function isPessoaJuridica(
  usuario?: UsuarioProfileResponse["usuario"]
): boolean {
  return usuario?.tipoUsuario === "PESSOA_JURIDICA" || usuario?.role === "EMPRESA";
}

export function isProfileCompleteForOnboarding(
  usuario?: UsuarioProfileResponse["usuario"],
  stats?: UsuarioProfileResponse["stats"]
): boolean {
  if (!usuario || !stats) return true;

  const telefoneDigits = (usuario.telefone ?? "").replace(/\D/g, "");
  const hasTelefone = telefoneDigits.length > 0;
  const hasDataNasc = Boolean(usuario.dataNasc);
  const hasGenero = Boolean(usuario.genero && String(usuario.genero).trim());

  const endereco = getPrimaryEndereco(usuario);
  const hasEndereco =
    stats.hasAddress &&
    Boolean(endereco?.cep) &&
    Boolean(endereco?.logradouro) &&
    Boolean(endereco?.numero) &&
    Boolean(endereco?.bairro) &&
    Boolean(endereco?.cidade) &&
    Boolean(endereco?.estado);

  if (isPessoaJuridica(usuario)) return hasTelefone && hasEndereco;
  return hasTelefone && hasDataNasc && hasGenero && hasEndereco;
}
