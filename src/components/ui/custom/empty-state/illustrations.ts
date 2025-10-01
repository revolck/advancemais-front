export const emptyStateIllustrations = {
  addFiles: "/empty-state/adicionar_arquivos.svg",
  fileNotFound: "/empty-state/arquivo_nao_encontrado.svg",
  maleAvatar: "/empty-state/avatar_masc.svg",
  femaleAvatar: "/empty-state/avatar_fem.svg",
  openEmail: "/empty-state/email_aberto.svg",
  spaceUniverse: "/empty-state/escpaco_universo.svg",
  photos: "/empty-state/fotos.svg",
  books: "/empty-state/livros.svg",
  location: "/empty-state/localizacao.svg",
  myFiles: "/empty-state/meus_arquivos.svg",
  pass: "/empty-state/pass.svg",
  terms: "/empty-state/termos.svg",
  userProfiles: "/empty-state/perfis_users.svg",
  companyDetails: "/empty-state/empresa_descricao.svg",
  subscription: "/empty-state/plano_empresarial.svg",
} as const;

export type EmptyStateIllustration = keyof typeof emptyStateIllustrations;
