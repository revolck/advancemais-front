export interface SobreEmpresaBackendResponse {
  id: string;
  titulo: string;
  descricao: string;
  descricaoVisao: string;
  descricaoMissao: string;
  descricaoValores: string;
  videoUrl: string;
  criadoEm?: string;
  atualizadoEm?: string;
}

export type CreateSobreEmpresaPayload = Omit<SobreEmpresaBackendResponse, "id" | "criadoEm" | "atualizadoEm">;

export type UpdateSobreEmpresaPayload = Partial<CreateSobreEmpresaPayload>;

export interface AccordionItemData {
  id: string;
  value: string;
  trigger: string;
  content: string;
  order: number;
  isActive: boolean;
}

export interface AccordionSectionData {
  id: string;
  title: string;
  videoUrl: string;
  videoType: "youtube" | "vimeo" | "mp4" | "url";
  items: AccordionItemData[];
  order: number;
  isActive: boolean;
}
