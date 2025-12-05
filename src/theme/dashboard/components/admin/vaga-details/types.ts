import type { VagaListItem } from "@/api/vagas";

// Interface para candidato
export interface CandidatoItem {
  id: string;
  codUsuario?: string;
  candidaturaId?: string;
  curriculoId?: string;
  nome: string;
  email: string;
  telefone?: string;
  avatarUrl?: string | null;
  dataInscricao: string;
  status: "pendente" | "aprovado" | "rejeitado" | "em_analise";
  experiencia?: string;
  formacao?: string;
  createdAt: string;
  [key: string]: any;
}

// Props para AboutTab
export interface AboutTabProps {
  vaga: VagaListItem;
}

// Props para DetailsTab
export interface DetailsTabProps {
  vaga: VagaListItem;
}

// Props para VagaDetailsView
export interface VagaDetailsViewProps {
  vagaId: string;
  initialData?: VagaListItem | null;
}

// Props para VagaHeaderInfo - Updated
export interface VagaHeaderInfoProps {
  vaga: VagaListItem;
  onEditVaga?: () => void;
  onDeleteVaga?: () => void;
  onToggleStatus?: () => void;
  onPublishVaga?: () => void;
  onUnpublishVaga?: () => void;
}
