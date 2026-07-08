export type RecipientListStatus = "ATIVA" | "ARQUIVADA";
export type RecipientListMembershipMode = "MANUAL" | "DINAMICA" | "HIBRIDA";
export type RecipientListRecalculationStatus =
  | "IDLE"
  | "PROCESSING"
  | "FAILED";
export type RecipientKind = "MARKETING_LEAD" | "USUARIO";
export type RecipientListLogicOperator = "AND" | "OR";
export type RecipientListConditionOperator =
  | "IS"
  | "IS_NOT"
  | "IN"
  | "NOT_IN"
  | "EXISTS"
  | "NOT_EXISTS"
  | "GT"
  | "GTE"
  | "LT"
  | "LTE"
  | "BETWEEN"
  | "HAS_ANY"
  | "HAS_ALL";

export type RecipientListConditionField =
  | "recipient.base.kind"
  | "recipient.user.role"
  | "recipient.user.status"
  | "lead.popupId"
  | "lead.status"
  | "lead.tag"
  | "lead.captureDate"
  | "lead.ownerUsuarioId"
  | "student.hasResume"
  | "student.resumeCount"
  | "student.hasEnrollment"
  | "student.courseId"
  | "student.enrollmentDate"
  | "student.enrollmentStatus"
  | "student.hasCertificate"
  | "student.turmaId"
  | "company.hasPlan"
  | "company.planId"
  | "company.hasVacancies"
  | "company.vacancyStatus"
  | "company.vacancyCount"
  | "instructor.courseId"
  | "instructor.turmaId"
  | "instructor.assignmentCount";

export interface RecipientListFolder {
  id: string;
  nome: string;
  ordem: number;
  listCount: number;
  criadoEm: string;
  atualizadoEm: string;
}

export interface RecipientReference {
  recipientKind: RecipientKind;
  recipientId: string;
}

export interface RecipientListCondition {
  id?: string;
  field: RecipientListConditionField;
  operator: RecipientListConditionOperator;
  value?: unknown;
  valueTo?: unknown;
}

export interface RecipientListRulesGroup {
  operator: RecipientListLogicOperator;
  conditions: RecipientListCondition[];
  groups?: RecipientListRulesGroup[];
}

export interface RecipientListMember {
  id: string;
  recipientKind: RecipientKind;
  recipientId: string;
  email: string;
  nome: string;
  role: string | null;
  source: "RULE" | "MANUAL_INCLUDE";
  criadoEm: string;
}

export interface RecipientList {
  id: string;
  nome: string;
  descricao: string | null;
  folderId: string | null;
  status: RecipientListStatus;
  membershipMode: RecipientListMembershipMode;
  rulesConfig: RecipientListRulesGroup | null;
  manualIncludes: RecipientReference[];
  manualExcludes: RecipientReference[];
  recipientCount: number;
  lastCalculatedAt: string | null;
  recalculationStatus: RecipientListRecalculationStatus;
  recalculationStartedAt: string | null;
  recalculationFinishedAt: string | null;
  recalculationError: string | null;
  criadoPorId: string | null;
  atualizadoPorId: string | null;
  criadoEm: string;
  atualizadoEm: string;
  Folder?: { id: string; nome: string } | null;
  Members?: RecipientListMember[];
}

export interface RecipientListListItem {
  id: string;
  nome: string;
  descricao: string | null;
  status: RecipientListStatus;
  membershipMode: RecipientListMembershipMode;
  recipientCount: number;
  lastCalculatedAt: string | null;
  recalculationStatus: RecipientListRecalculationStatus;
  recalculationStartedAt: string | null;
  recalculationFinishedAt: string | null;
  recalculationError: string | null;
  criadoEm: string;
  atualizadoEm: string;
  Folder?: { id: string; nome: string } | null;
}

export interface RecipientListPagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface ListRecipientListsParams {
  page?: number;
  pageSize?: number;
  search?: string;
  folderId?: string;
  status?: RecipientListStatus;
  membershipMode?: RecipientListMembershipMode;
  updatedFrom?: string;
  updatedTo?: string;
}

export interface ListRecipientListsResponse {
  success: boolean;
  lists: RecipientListListItem[];
  pagination: RecipientListPagination;
}

export interface RecipientListResponse {
  success: boolean;
  data: RecipientList;
}

export interface RecipientListFoldersResponse {
  success: boolean;
  folders: RecipientListFolder[];
}

export interface RecipientListFolderResponse {
  success: boolean;
  data: RecipientListFolder;
}

export interface RecipientListRuleFieldMeta {
  field: RecipientListConditionField;
  label: string;
  operators: RecipientListConditionOperator[];
  routineKey: string;
  routineLabel: string;
}

export interface RecipientListRuleCategory {
  key: string;
  label: string;
  fields: RecipientListRuleFieldMeta[];
}

export interface RecipientListRuleRoutine {
  key: string;
  label: string;
  fields: RecipientListRuleFieldMeta[];
}

export interface RecipientListsRuleOptions {
  roles: Array<{ value: string; label: string }>;
  userStatuses: Array<{ value: string; label: string }>;
  leadStatuses: Array<{ value: string; label: string }>;
  enrollmentStatuses: Array<{ value: string; label: string }>;
  vacancyStatuses: Array<{ value: string; label: string }>;
  recipientKinds: Array<{ value: string; label: string }>;
  categories: RecipientListRuleCategory[];
  routines: RecipientListRuleRoutine[];
  values: {
    popups: Array<{ id: string; nome: string }>;
    owners: Array<{ value: string; label: string }>;
    plans: Array<{ value: string; label: string }>;
    courses: Array<{ value: string; label: string }>;
    turmas: Array<{ value: string; label: string }>;
    tags: Array<{ value: string; label: string }>;
  };
}

export interface RecipientListsRuleOptionsResponse {
  success: boolean;
  data: RecipientListsRuleOptions;
}

export interface RecipientOptionItem {
  recipientKind: RecipientKind;
  recipientId: string;
  nome: string;
  email: string | null;
  subtitle: string;
}

export interface RecipientListRecipientsOptions {
  leads: RecipientOptionItem[];
  users: RecipientOptionItem[];
}

export interface RecipientListRecipientsOptionsResponse {
  success: boolean;
  data: RecipientListRecipientsOptions;
}

export interface RecipientListRecipientsOptionsParams {
  search?: string;
  kind?: "ALL" | RecipientKind;
  limit?: number;
}

export interface RecipientListStatusSnapshot {
  id: string;
  recipientCount: number;
  lastCalculatedAt: string | null;
  recalculationStatus: RecipientListRecalculationStatus;
  recalculationStartedAt: string | null;
  recalculationFinishedAt: string | null;
  recalculationError: string | null;
  atualizadoEm: string;
}

export interface RecipientListStatusesResponse {
  success: boolean;
  data: RecipientListStatusSnapshot[];
}

export interface RecipientListStatusesParams {
  listIds: string[];
}

export type CreateRecipientListPayload = Omit<
  RecipientList,
  | "id"
  | "recipientCount"
  | "lastCalculatedAt"
  | "criadoPorId"
  | "atualizadoPorId"
  | "criadoEm"
  | "atualizadoEm"
  | "Folder"
  | "Members"
>;

export type UpdateRecipientListPayload = Partial<CreateRecipientListPayload>;

export interface CreateRecipientListFolderPayload {
  nome: string;
  ordem?: number;
}

export type UpdateRecipientListFolderPayload =
  Partial<CreateRecipientListFolderPayload>;
