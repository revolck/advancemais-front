export type ConfigCategory =
  | "mercadopago"
  | "emails"
  | "agenda"
  | "logs"
  | "uploads"
  | "integracoes";

export type ConfigValueType =
  | "string"
  | "number"
  | "boolean"
  | "url"
  | "email"
  | "csv"
  | "cron";

export type ConfigSource = "DB" | "ENV" | "DEFAULT" | "EMPTY";

export interface ConfigItem {
  key: string;
  label: string;
  description?: string;
  type: ConfigValueType;
  secret: boolean;
  required?: boolean;
  restartRequired?: boolean;
  source: ConfigSource;
  value?: string | number | boolean | null;
  configured: boolean;
  fingerprint?: string | null;
  maskedPreview?: string | null;
  envSource?: string | null;
  updatedAt?: string | null;
}

export interface ConfigCategoryGroup {
  category: ConfigCategory;
  label: string;
  description: string;
  items: ConfigItem[];
}

export interface ConfiguracoesGeraisListResponse {
  success: boolean;
  data: ConfigCategoryGroup[];
}

export type SecretConfigAction = "keep" | "replace" | "clear";

export interface UpdateConfiguracaoGeralPayload {
  values?: Record<string, string | number | boolean | null>;
  secrets?: Record<string, { action: SecretConfigAction; value?: string }>;
  motivo?: string;
}

export interface UpdateConfiguracaoGeralResponse {
  success: boolean;
  data: ConfigCategoryGroup;
}

export interface TestConfiguracaoGeralResponse {
  success: boolean;
  data: {
    category?: ConfigCategory;
    ok?: boolean;
    checks: Array<{
      key: string;
      label: string;
      ok: boolean;
      message: string;
    }>;
    success?: boolean;
    message?: string;
    details?: {
      activeMode?: "production" | "test";
      missingKeys?: string[];
      hasAccessToken?: boolean;
      hasPublicKey?: boolean;
      tokenFingerprint?: string | null;
      courseInstallmentsEnabled?: boolean;
      courseInstallmentsMax?: number;
    };
  };
}

export interface ConfiguracoesGeraisHistoricoItem {
  id: string;
  tipo: string;
  acao: string;
  descricao: string;
  categoria?: string | null;
  dadosAnteriores?: unknown;
  dadosNovos?: unknown;
  metadata?: unknown;
  criadoEm: string;
  usuario?: {
    id: string;
    nome?: string | null;
    email?: string | null;
    role?: string | null;
  } | null;
}

export interface ConfiguracoesGeraisHistoricoResponse {
  success: boolean;
  data: ConfiguracoesGeraisHistoricoItem[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface PublicMercadoPagoConfigResponse {
  success: boolean;
  data: {
    configured: boolean;
    publicKey: string | null;
    isTestMode: boolean;
    activeMode?: "production" | "test";
    courseInstallmentsEnabled?: boolean;
    courseInstallmentsMax?: number;
  };
}
