import type {
  CreatePopupPayload,
  PopupContentConfig,
  PopupDesignConfig,
  PopupFormField,
} from "@/api/websites/components/popups";

export type MarketingEmailStatus = "PUBLICADO" | "RASCUNHO";
export type MarketingEmailWorkflowStatus =
  | "RASCUNHO"
  | "PROCESSANDO"
  | "FALHOU"
  | "AGENDADO"
  | "ENVIADO";
export type MarketingEmailType = "CAMPANHA" | "NEWSLETTER" | "COMUNICADO";
export type MarketingEmailMode = "REGULAR";
export type MarketingEmailAudienceType =
  | "ALL_CONTACTS"
  | "MANUAL_CONTACTS"
  | "LISTS";
export type MarketingEmailDeliveryMode = "NOW" | "SCHEDULED";
export type MarketingEmailDeliveryStatus =
  | "IDLE"
  | "PROCESSING"
  | "SENT"
  | "FAILED";

export interface MarketingEmailBuilderConfig {
  content: PopupContentConfig;
  design: PopupDesignConfig;
  fields: PopupFormField[];
}

export interface MarketingEmailContentConfig {
  builder?: MarketingEmailBuilderConfig | null;
  popupPayload?: CreatePopupPayload | null;
  [key: string]: unknown;
}

export interface MarketingEmailTargetConfig {
  mode: MarketingEmailMode;
  audienceType: MarketingEmailAudienceType;
  contactIds: string[];
  listIds: string[];
}

export interface MarketingEmailSenderConfig {
  fromEmail: string;
  fromName: string;
  displayName: string;
}

export interface MarketingEmailSettingsConfig {
  language?: string | null;
  replyToEmail?: string | null;
  trackOpens: boolean;
  trackClicks: boolean;
  googleAnalyticsCampaign?: string | null;
  notes?: string | null;
  deliveryMode?: MarketingEmailDeliveryMode;
  scheduledAt?: string | null;
  deliveryStatus?: MarketingEmailDeliveryStatus;
  processingStartedAt?: string | null;
  lastSentAt?: string | null;
  lastError?: string | null;
}

export interface MarketingEmailActor {
  id: string;
  nomeCompleto: string;
  avatarUrl?: string | null;
}

export interface MarketingEmail {
  id: string;
  nome: string;
  status: MarketingEmailStatus;
  workflowStatus?: MarketingEmailWorkflowStatus;
  deliveryReferenceAt?: string | null;
  tipo: MarketingEmailType;
  assunto?: string | null;
  previewText?: string | null;
  templateSlug?: string | null;
  htmlContent?: string | null;
  contentConfig?: MarketingEmailContentConfig | null;
  targetConfig?: MarketingEmailTargetConfig | null;
  senderConfig?: MarketingEmailSenderConfig | null;
  settingsConfig?: MarketingEmailSettingsConfig | null;
  destinatariosEstimados: number;
  criadoPorId?: string | null;
  atualizadoPorId?: string | null;
  criadoPor?: MarketingEmailActor | null;
  atualizadoPor?: MarketingEmailActor | null;
  criadoEm: string;
  atualizadoEm: string;
}

export type MarketingEmailListItem = Omit<
  MarketingEmail,
  "htmlContent" | "contentConfig" | "targetConfig" | "senderConfig"
>;

export interface MarketingEmailPagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface ListMarketingEmailsParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: MarketingEmailStatus;
  workflowStatus?: MarketingEmailWorkflowStatus;
  tipo?: MarketingEmailType;
  actorId?: string;
  sentFrom?: string;
  sentTo?: string;
}

export interface ListMarketingEmailsResponse {
  success: boolean;
  emails: MarketingEmailListItem[];
  pagination: MarketingEmailPagination;
}

export interface MarketingEmailResponse {
  success: boolean;
  data: MarketingEmail;
}

export interface MarketingEmailRecipientOption {
  id: string;
  nome: string;
  email: string | null;
  status: string;
  tag: string | null;
  avatarUrl?: string | null;
}

export interface MarketingEmailRecipientOptions {
  sender: MarketingEmailSenderConfig;
  contatos: MarketingEmailRecipientOption[];
  lists: Array<{
    id: string;
    nome: string;
    folderName: string | null;
    recipientCount: number;
  }>;
}

export interface MarketingEmailRecipientOptionsResponse {
  success: boolean;
  data: MarketingEmailRecipientOptions;
}

export interface MarketingEmailFilterOptions {
  users: MarketingEmailActor[];
}

export interface MarketingEmailFilterOptionsResponse {
  success: boolean;
  data: MarketingEmailFilterOptions;
}

export type MarketingEmailDetail = MarketingEmail;

export type CreateMarketingEmailPayload = Omit<
  MarketingEmail,
  "id" | "criadoEm" | "atualizadoEm" | "criadoPorId" | "atualizadoPorId"
>;

export type UpdateMarketingEmailPayload = Partial<CreateMarketingEmailPayload>;

export interface MarketingEmailTemplate {
  slug: string;
  name: string;
  category: "ZERO" | "MY_MODELS" | "BASIC" | "READY";
  description: string;
  imageUrl: string | null;
}
