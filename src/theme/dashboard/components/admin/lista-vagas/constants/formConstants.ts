import type { SectionKey } from "../types/formTypes";

export const SECTION_FIELD_MAP: Record<SectionKey, string[]> = {
  core: [
    "usuarioId",
    "titulo",
    "modalidade",
    "regimeDeTrabalho",
    "jornada",
    "senioridade",
    "areaInteresseId",
    "subareaInteresseId",
    "numeroVagas",
    "inscricoesAte",
    "limitarCandidaturas",
    "maxCandidaturasPorUsuario",
  ],
  location: [
    "localizacao.logradouro",
    "localizacao.numero",
    "localizacao.bairro",
    "localizacao.cidade",
    "localizacao.estado",
    "localizacao.cep",
  ],
  content: [
    "descricao",
    "atividadesPrincipais",
    "atividadesExtras",
    "requisitosObrigatorios",
    "requisitosDesejaveis",
    "beneficiosLista",
    "beneficiosObservacoes",
    "observacoes",
  ],
  compensation: [
    "salarioMin",
    "salarioMax",
    "salarioConfidencial",
    "paraPcd",
    "vagaEmDestaque",
  ],
};

export const FORM_STEPS: Array<{
  id: SectionKey;
  title: string;
  description: string;
}> = [
  {
    id: "core",
    title: "Informações básicas",
    description: "Defina empresa, categoria e parâmetros principais",
  },
  {
    id: "location",
    title: "Localização",
    description: "Informe o endereço da oportunidade",
  },
  {
    id: "content",
    title: "Conteúdo e benefícios",
    description: "Detalhe responsabilidades, atividades e vantagens",
  },
  {
    id: "compensation",
    title: "Remuneração e destaque",
    description: "Configure faixa salarial e visibilidade da vaga",
  },
];
