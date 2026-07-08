export type WebsiteStatus = "PUBLICADO" | "RASCUNHO";
export type PopupDevice = "AMBOS" | "MOBILE" | "DESKTOP";
export type PopupScope = "WEBSITE" | "DASHBOARD" | "AMBOS";
export type PopupPosition =
  | "CENTRO"
  | "ESQUERDA_SUPERIOR"
  | "DIREITA_SUPERIOR"
  | "ESQUERDA_INFERIOR"
  | "DIREITA_INFERIOR";
export type PopupTrigger =
  | "IMEDIATAMENTE"
  | "ATRASO"
  | "INATIVIDADE"
  | "SCROLL"
  | "SAIDA"
  | "CLIQUE"
  | "HOVER";
export type PopupTriggerTarget =
  | "website-logo"
  | "website-nav-home"
  | "website-nav-about"
  | "website-nav-courses"
  | "website-nav-vagas"
  | "website-nav-recruitment"
  | "website-nav-training"
  | "website-user-menu"
  | "website-recrutamento-cta"
  | "website-footer-about"
  | "website-footer-how-it-works"
  | "website-footer-how-to-buy"
  | "website-footer-cookie-preferences"
  | "website-footer-courses"
  | "website-footer-for-business"
  | "website-footer-for-candidates"
  | "website-footer-faq"
  | "website-footer-help-center"
  | "website-footer-ombudsman"
  | "dashboard-user-menu"
  | "dashboard-sidebar-item"
  | "dashboard-vagas-create-button"
  | "dashboard-popup-new-button"
  | "dashboard-popup-save-draft-button"
  | "dashboard-popup-publish-button";

export type PopupSpecificPageKey =
  | "HOME"
  | "ABOUT"
  | "COURSES"
  | "RECRUITMENT"
  | "TRAINING"
  | "JOBS"
  | "FAQ"
  | "PRIVACY"
  | "TERMS";
export type PopupSchedule = "EXIBIR_AGORA" | "PERIODO";
export type PopupFrequency =
  | "SEM_LIMITE"
  | "UMA_VEZ_POR_SESSAO"
  | "UMA_VEZ_A_CADA_HORA"
  | "UMA_VEZ_A_CADA_6_HORAS"
  | "UMA_VEZ_A_CADA_24_HORAS";

export type PopupLayout =
  | "SEM_PLANO_DE_FUNDO"
  | "PLANO_DE_FUNDO"
  | "IMAGEM_ESQUERDA"
  | "IMAGEM_DIREITA"
  | "IMAGEM_TOPO"
  | "IMAGEM_EMBAIXO"
  | "DUAS_COLUNAS";

export type PopupFormFieldType =
  | "text"
  | "email"
  | "tel"
  | "whatsapp"
  | "checkbox"
  | "select";

export type PopupContentBlockType =
  | "TITLE"
  | "DESCRIPTION"
  | "IMAGE"
  | "FIELDS"
  | "BUTTON"
  | "LEGAL_TEXT";

export type PopupBlockColumn = "LEFT" | "RIGHT";
export type PopupBuilderStructure =
  | "SINGLE"
  | "ROW_2"
  | "ROW_3"
  | "COLUMN_2"
  | "COLUMN_3";
export type PopupBuilderAtomicType =
  | "TITLE"
  | "PARAGRAPH"
  | "IMAGE"
  | "BUTTON"
  | "CONSENT"
  | "INPUT"
  | "VIDEO"
  | "TIMER"
  | "ROULETTE"
  | "COUPON"
  | "SOCIAL_LINKS";
export type PopupBuilderInputKind = "NAME" | "EMAIL" | "PHONE";
export type PopupBuilderSocialPlatform =
  | "FACEBOOK"
  | "INSTAGRAM"
  | "LINKEDIN"
  | "YOUTUBE"
  | "WHATSAPP"
  | "X";
export type PopupBuilderSocialIconSize = "SM" | "MD" | "LG";
export type PopupBuilderSocialIconShape = "ROUNDED" | "CIRCLE" | "SQUARE";
export type PopupBuilderSocialTheme = "COLOR" | "DARK" | "LIGHT";
export type PopupBuilderSocialAlign = "LEFT" | "CENTER" | "RIGHT";
export type PopupBuilderCouponVariant =
  | "ALPHA"
  | "OMEGA"
  | "SIGMA"
  | "DELTA";
export type PopupBuilderCouponTone =
  | "PRIMARY"
  | "SECONDARY"
  | "LIGHT"
  | "DARK";
export type PopupBuilderCouponScope = "COURSES" | "SUBSCRIPTIONS";

export interface PopupBuilderRouletteItem {
  id: string;
  label: string;
  weight?: number;
  couponId?: string | null;
  couponCode?: string | null;
  couponValue?: string | null;
  couponValidity?: string | null;
  caption?: string | null;
  color?: string;
  textColor?: string;
  isNoPrize?: boolean;
  noPrizeMessage?: string | null;
  noPrizeContactFields?: PopupBuilderInputKind[];
}

export interface PopupBuilderSocialLink {
  id: string;
  platform: PopupBuilderSocialPlatform;
  url?: string | null;
}

export interface PopupBuilderAtomicNode {
  id: string;
  kind: "ATOMIC";
  type: PopupBuilderAtomicType;
  className?: string | null;
  textColor?: string | null;
  buttonBackgroundColor?: string | null;
  headingLevel?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | null;
  content?: string | null;
  consentCheckbox?: boolean;
  url?: string | null;
  alt?: string | null;
  inputKind?: PopupBuilderInputKind;
  label?: string | null;
  placeholder?: string | null;
  required?: boolean;
  timerDurationSeconds?: number;
  couponCode?: string | null;
  couponValue?: string | null;
  couponCaption?: string | null;
  couponValidity?: string | null;
  couponVariant?: PopupBuilderCouponVariant;
  couponTone?: PopupBuilderCouponTone;
  couponId?: string | null;
  couponScope?: PopupBuilderCouponScope | null;
  rouletteScope?: PopupBuilderCouponScope | null;
  rouletteCouponIds?: string[];
  rouletteItems?: PopupBuilderRouletteItem[];
  rouletteNoPrizeTitle?: string | null;
  rouletteNoPrizeMessage?: string | null;
  rouletteNoPrizeButtonText?: string | null;
  rouletteNoPrizeContactFields?: PopupBuilderInputKind[];
  socialLinks?: PopupBuilderSocialLink[];
  socialIconSize?: PopupBuilderSocialIconSize;
  socialIconShape?: PopupBuilderSocialIconShape;
  socialTheme?: PopupBuilderSocialTheme;
  socialGap?: number;
  socialAlign?: PopupBuilderSocialAlign;
  socialWidthPercent?: number;
}

export interface PopupBuilderAreaNode {
  id: string;
  kind: "AREA";
  children: PopupBuilderAtomicNode[];
}

export interface PopupBuilderRootNode {
  id: string;
  kind: "ROOT";
  structure: PopupBuilderStructure;
  reverse?: boolean;
  areas: PopupBuilderAreaNode[];
}

export interface PopupContentConfig {
  titulo: string;
  subtitulo: string;
  botaoTexto: string;
  textoLegal?: string | null;
  blockOrder?: PopupContentBlockType[];
  columnAssignments?: Partial<Record<PopupContentBlockType, PopupBlockColumn>>;
  builderTree?: PopupBuilderRootNode | null;
}

export interface PopupFormField {
  id: string;
  type: PopupFormFieldType;
  label: string;
  placeholder?: string | null;
  required: boolean;
  order: number;
  options?: string[];
}

export interface PopupDesignConfig {
  backgroundColor: string;
  layout: PopupLayout;
  imageUrl?: string | null;
  imageAlt?: string | null;
  imageDisposition: "PREENCHER" | "REPETIR" | "CENTRALIZAR" | "ESTICAR";
  imagePosition: "CENTRO" | "TOPO" | "ESQUERDA" | "DIREITA" | "BASE";
  imageProportion: "50" | "33" | "25";
  showImageOnMobile: boolean;
}

export interface PopupSubscriptionConfig {
  email: string;
  sms?: string | null;
  whatsapp: string;
}

export interface PopupPageRules {
  mode:
    | "ALL_PAGES"
    | "HOME"
    | "COURSES"
    | "URL_CONTAINS"
    | "HTML_SELECTOR"
    | "SPECIFIC_PAGE";
  urlContains?: string | null;
  htmlSelector?: string | null;
  pageKey?: PopupSpecificPageKey | null;
}

export interface WebsitePopup {
  id: string;
  nome: string;
  templateSlug?: string | null;
  status: WebsiteStatus;
  dispositivo: PopupDevice;
  escopo: PopupScope;
  posicaoDesktop: PopupPosition;
  posicaoMobile: PopupPosition;
  gatilho: PopupTrigger;
  atrasoSegundos: number;
  inatividadeSegundos?: number | null;
  scrollPercentual?: number | null;
  seletorAlvo?: string | null;
  triggerTarget?: PopupTriggerTarget | null;
  cronograma: PopupSchedule;
  inicioEm?: string | null;
  fimEm?: string | null;
  frequencia: PopupFrequency;
  tag?: string | null;
  redirectUrl?: string | null;
  redirectNovaAba: boolean;
  prioridade: number;
  contentConfig: PopupContentConfig;
  formFields: PopupFormField[];
  designConfig: PopupDesignConfig;
  subscriptionConfig?: PopupSubscriptionConfig | null;
  pageRules?: PopupPageRules | null;
  criadoEm: string;
  atualizadoEm: string;
  _count?: {
    WebsitePopupContatos?: number;
  };
}

export type WebsitePopupListItem = Pick<
  WebsitePopup,
  | "id"
  | "nome"
  | "templateSlug"
  | "status"
  | "dispositivo"
  | "escopo"
  | "gatilho"
  | "cronograma"
  | "frequencia"
  | "prioridade"
  | "tag"
  | "criadoEm"
  | "atualizadoEm"
  | "_count"
>;

export interface PopupPagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface ListPopupsParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: WebsiteStatus;
  dispositivo?: PopupDevice;
  escopo?: PopupScope;
}

export interface ListPopupsResponse {
  success: boolean;
  popups: WebsitePopupListItem[];
  pagination: PopupPagination;
}

export interface PopupResponse {
  success: boolean;
  data: WebsitePopup;
}

export type CreatePopupPayload = Omit<
  WebsitePopup,
  "id" | "criadoEm" | "atualizadoEm" | "_count"
>;

export type UpdatePopupPayload = Partial<CreatePopupPayload>;

export interface ActivePopupsParams {
  scope: "WEBSITE" | "DASHBOARD";
  path: string;
  device: "MOBILE" | "DESKTOP";
}

export interface CreatePopupContactPayload {
  nome?: string | null;
  email?: string | null;
  telefone?: string | null;
  whatsapp?: string | null;
  tag?: string | null;
  origemPath?: string | null;
  payload: Record<string, string | number | boolean | null>;
}

export interface WebsitePopupContact {
  id: string;
  popupId: string;
  usuarioId?: string | null;
  contactKey?: string | null;
  nome?: string | null;
  email?: string | null;
  telefone?: string | null;
  whatsapp?: string | null;
  tag?: string | null;
  payload: Record<string, unknown>;
  origemPath?: string | null;
  userAgent?: string | null;
  ipHash?: string | null;
  removidoEm?: string | null;
  criadoEm: string;
  WebsitePopup?: {
    id: string;
    nome: string;
  };
}

export type PopupLeadStatus =
  | "NOVO"
  | "EM_ATENDIMENTO"
  | "QUALIFICANDO"
  | "QUALIFICADO"
  | "CONVERTIDO"
  | "PERDIDO"
  | "ARQUIVADO";

export type PopupLeadOpportunityStatus =
  | "ABERTA"
  | "EM_ANDAMENTO"
  | "GANHA"
  | "PERDIDA";

export type PopupLeadInterestSource = "AUTO" | "MANUAL";

export interface PopupLeadOwnerSummary {
  id: string;
  nome?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
}

export interface PopupLeadListItem {
  id: string;
  contactKey: string;
  nome?: string | null;
  email?: string | null;
  telefone?: string | null;
  whatsapp?: string | null;
  empresa?: string | null;
  dataNascimento?: string | null;
  endereco?: string | null;
  cidade?: string | null;
  estado?: string | null;
  tag?: string | null;
  origemPath?: string | null;
  popupId?: string | null;
  popupNome?: string | null;
  status: PopupLeadStatus;
  ownerUsuarioId?: string | null;
  owner?: PopupLeadOwnerSummary | null;
  inscricoesCount: number;
  primeiraCapturaEm: string;
  ultimaCapturaEm: string;
}

export interface PopupLeadNote {
  id: string;
  conteudo: string;
  criadoEm: string;
  atualizadoEm: string;
  autor?: PopupLeadOwnerSummary | null;
}

export interface PopupLeadInterest {
  id: string;
  label: string;
  source: PopupLeadInterestSource;
  criadoEm: string;
}

export interface PopupLeadOpportunity {
  id: string;
  titulo: string;
  status: PopupLeadOpportunityStatus;
  valorEsperado?: string | number | null;
  closeDate?: string | null;
  descricao?: string | null;
  criadoEm: string;
  atualizadoEm: string;
  owner?: PopupLeadOwnerSummary | null;
}

export interface PopupLeadDetail extends PopupLeadListItem {
  userAgent?: string | null;
  ipHash?: string | null;
  notes: PopupLeadNote[];
  interests: PopupLeadInterest[];
  opportunities: PopupLeadOpportunity[];
}

export interface PopupContactHistoryItem {
  id: string;
  popupId?: string | null;
  popupNome?: string | null;
  nome?: string | null;
  email?: string | null;
  telefone?: string | null;
  whatsapp?: string | null;
  tag?: string | null;
  payload: Record<string, unknown>;
  origemPath?: string | null;
  userAgent?: string | null;
  ipHash?: string | null;
  criadoEm: string;
}

export interface PopupLeadResponse {
  success: boolean;
  data: PopupLeadDetail;
}

export interface PopupContactHistoryResponse {
  success: boolean;
  history: PopupContactHistoryItem[];
}

export interface PopupLeadActivityActor {
  id: string | null;
  nome: string | null;
  email: string | null;
  role: string | null;
  roleLabel: string | null;
}

export interface PopupLeadActivityItem {
  id: string;
  tipo: string;
  categoria: string;
  titulo: string;
  descricao?: string | null;
  dataHora: string;
  ator: PopupLeadActivityActor;
  contexto?: Record<string, unknown> | null;
  dadosAnteriores?: Record<string, unknown> | null;
  dadosNovos?: Record<string, unknown> | null;
  meta?: Record<string, unknown> | null;
}

export interface PopupLeadActivityResponse {
  success: boolean;
  data: PopupLeadActivityItem[];
}

export interface ListPopupContactsParams {
  page?: number;
  pageSize?: number;
  search?: string;
  popupId?: string;
  origemPath?: string;
  status?: PopupLeadStatus;
  ownerUsuarioId?: string;
  from?: string;
  to?: string;
}

export interface ListPopupContactsResponse {
  success: boolean;
  contatos: PopupLeadListItem[];
  pagination: PopupPagination;
}

export interface UpdatePopupContactPayload {
  nome?: string | null;
  email?: string | null;
  telefone?: string | null;
  whatsapp?: string | null;
  empresa?: string | null;
  dataNascimento?: string | null;
  endereco?: string | null;
  cidade?: string | null;
  estado?: string | null;
  status?: PopupLeadStatus;
  ownerUsuarioId?: string | null;
  tag?: string | null;
}

export interface CreatePopupLeadNotePayload {
  conteudo: string;
}

export interface UpdatePopupLeadNotePayload {
  conteudo: string;
}

export interface CreatePopupLeadInterestPayload {
  label: string;
}

export interface CreatePopupLeadOpportunityPayload {
  titulo: string;
  status?: PopupLeadOpportunityStatus;
  valorEsperado?: number | null;
  closeDate?: string | null;
  descricao?: string | null;
  ownerUsuarioId?: string | null;
}

export type UpdatePopupLeadOpportunityPayload =
  Partial<CreatePopupLeadOpportunityPayload>;
