export interface CreateVagaFormProps {
  onSuccess: () => void;
  isSubmitting: boolean;
  setIsSubmitting: (value: boolean) => void;
}

export interface FormState {
  usuarioId: string;
  areaInteresseId: string;
  subareaInteresseId: string[];
  titulo: string;
  descricao: string;
  requisitosObrigatorios: string;
  requisitosDesejaveis: string;
  atividadesPrincipais: string;
  atividadesExtras: string;
  beneficiosLista: string;
  beneficiosObservacoes: string;
  observacoes: string;
  modoAnonimo: boolean;
  paraPcd: boolean;
  vagaEmDestaque: boolean;
  regimeDeTrabalho: string;
  modalidade: string;
  jornada: string;
  senioridade: string;
  numeroVagas: string;
  salarioMin: string;
  salarioMax: string;
  salarioConfidencial: boolean;
  maxCandidaturasPorUsuario: string;
  limitarCandidaturas: "SIM" | "NAO";
  inscricoesAte: string;
  localizacao: {
    logradouro: string;
    numero: string;
    bairro: string;
    cidade: string;
    estado: string;
    cep: string;
    complemento: string;
    referencia: string;
  };
}

export type FormErrors = Record<string, string>;
export type SectionKey = "core" | "location" | "content" | "compensation";
