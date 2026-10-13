export interface EmailSuccessResponse {
  success: true;
  message: string;
}

export type EmailErrorCode =
  | "MISSING_TOKEN"
  | "INVALID_TOKEN"
  | "TOKEN_EXPIRED"
  | "ALREADY_VERIFIED"
  | "MISSING_EMAIL"
  | "INVALID_EMAIL"
  | "USER_NOT_FOUND"
  | "ACCOUNT_INACTIVE"
  | "MISSING_PASSWORD"
  | "PRODUCTION_BLOCKED"
  | "INSUFFICIENT_PERMISSIONS"
  | "INVALID_PASSWORD"
  | "INVALID_SANDBOX_ROUTINE"
  | "EMAIL_DELIVERY_FAILED"
  | "SEND_ERROR"
  | "INTERNAL_ERROR";

export interface EmailErrorResponse {
  success: false;
  message: string;
  code?: EmailErrorCode;
  error?: string;
}

export interface EmailVerificationSuccess extends EmailSuccessResponse {
  redirectUrl: string;
  userId: string;
}

export type EmailVerificationResponse =
  | EmailVerificationSuccess
  | EmailErrorResponse;

export interface EmailResendVerificationSuccess extends EmailSuccessResponse {
  simulated: boolean;
  messageId: string;
}

export type EmailResendVerificationResponse =
  | EmailResendVerificationSuccess
  | EmailErrorResponse;

export interface EmailResendVerificationPayload {
  email: string;
}

export interface EmailVerificationStatus {
  userId: string;
  email: string;
  emailVerified: boolean;
  accountStatus: string;
  hasValidToken: boolean;
  tokenExpiration: string | null;
  emailVerification: {
    verified: boolean;
    verifiedAt: string | null;
    tokenExpiration: string | null;
    attempts: number;
    lastAttemptAt: string | null;
  };
}

export interface EmailStatusSuccessResponse {
  success: true;
  data: EmailVerificationStatus;
  message?: string;
}

export type EmailStatusResponse =
  | EmailStatusSuccessResponse
  | EmailErrorResponse;

// ----------------------------------------------------------------------------
// Informações do módulo (GET /api/v1/email)
// ----------------------------------------------------------------------------

export interface EmailModuleInfoResponse extends EmailSuccessResponse {
  module: string;
  version: string;
  timestamp: string;
  environment: string;
  features?: {
    emailVerification?: boolean;
    welcomeEmail?: boolean;
    testEndpoints?: boolean;
  };
  endpoints?: {
    base?: string;
    health?: string;
    config?: string;
    verification?: {
      verify?: string;
      resend?: string;
      statusByUserId?: string;
      statusByEmail?: string;
      alias?: {
        verify?: string;
        resend?: string;
      };
    };
    test?: {
      email?: string;
    };
  };
}

// ----------------------------------------------------------------------------
// Health check (GET /api/v1/email/health)
// ----------------------------------------------------------------------------

export interface EmailHealthSuccess extends EmailSuccessResponse {
  status: "HEALTHY" | "DEGRADED";
  uptime?: number;
  timestamp?: string;
  module?: string;
}

export type EmailHealthResponse = EmailHealthSuccess | EmailErrorResponse;

// ----------------------------------------------------------------------------
// Config (GET /api/v1/email/config) - somente dev
// ----------------------------------------------------------------------------

export interface EmailConfigStatusResponse {
  module: string;
  timestamp: string;
  configuration: {
    isConfigured: boolean;
    environment: string;
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    smtpPasswordProvided: boolean;
    fromEmail: string;
    fromName: string;
  };
  emailVerification: {
    enabled: boolean;
    tokenExpirationHours: number;
    maxResendAttempts: number;
    resendCooldownMinutes: number;
  };
  urls: {
    frontend: string;
    verification: string;
    passwordRecovery: string;
  };
  client: {
    operational: boolean;
    simulated: boolean;
  };
  healthInfo: any;
}

export type EmailConfigResponse =
  | EmailConfigStatusResponse
  | EmailErrorResponse;

// ----------------------------------------------------------------------------
// Testes (POST /api/v1/email/test/email)
// ----------------------------------------------------------------------------

export interface EmailTestEmailPayload {
  email: string;
  name?: string;
  type?: string;
}

export interface EmailTestSuccessResponse {
  success: true;
  message: string;
  data: {
    recipient: string;
    simulated: boolean;
    messageId: string;
    error: string | null;
  };
  timestamp: string;
}

export type EmailTestEmailResponse =
  | EmailTestSuccessResponse
  | EmailErrorResponse;

// ----------------------------------------------------------------------------
// Sandbox de emails (produção, somente ADMIN)
// ----------------------------------------------------------------------------

export type EmailSandboxEmailRotina =
  | "NOVO_CADASTRO"
  | "RECUPERACAO_SENHA"
  | "CREDENCIAIS_EMPRESA_ADMIN"
  | "PLANO_ATIVADO"
  | "PLANO_PAGAMENTO_RECUSADO"
  | "PLANO_UPGRADE"
  | "PLANO_DOWNGRADE"
  | "CURSO_PAGAMENTO_PENDENTE"
  | "CURSO_PAGAMENTO_PROCESSANDO"
  | "CURSO_PAGAMENTO_APROVADO"
  | "CURSO_PAGAMENTO_RECUSADO"
  | "CURSO_PAGAMENTO_CANCELADO"
  | "CURSO_PAGAMENTO_ESTORNADO"
  | "CURSO_PAGAMENTO_CONTESTADO"
  | "ESTAGIO_CONVOCACAO"
  | "ESTAGIO_ENCERRAMENTO"
  | "USUARIO_BLOQUEADO"
  | "USUARIO_DESBLOQUEADO";

export interface EmailSandboxEmailRotinaItem {
  value: EmailSandboxEmailRotina;
  label: string;
  group: string;
  description?: string;
}

export interface EmailSandboxEmailRotinasResponse {
  success: true;
  data: EmailSandboxEmailRotinaItem[];
}

export interface EmailSandboxEmailPayload {
  rotina: EmailSandboxEmailRotina;
  destinatarioEmail: string;
  senha: string;
}

export interface EmailSandboxEmailSuccessResponse {
  success: true;
  message: string;
  data: {
    rotina: EmailSandboxEmailRotina;
    recipient: string;
    simulated?: boolean;
    messageId?: string;
  };
}

export type EmailSandboxEmailResponse =
  | EmailSandboxEmailSuccessResponse
  | EmailErrorResponse;

// ---------------------------------------------------------------------------
// Comunicado de primeiro acesso (alunos migrados)
// ---------------------------------------------------------------------------

export type ComunicadoResultadoValidacao =
  | "VALIDO"
  | "INVALIDO"
  | "RISCO"
  | "DESCONHECIDO"
  | "TEMPORARIO"
  | "BLOQUEADO"
  | "PENDENTE"
  | "SEM_VALIDACAO";

export interface ComunicadoSituacao {
  codigo: string;
  titulo: string;
  detalhe: string;
  condicoesRetomada: string[];
}

export interface ComunicadoTaxaDevolucao {
  enviados: number;
  devolvidos: number;
  taxaPercentual: number;
  pausado: boolean;
}

export interface ComunicadoPainel {
  comunicado: string;
  geradoEm: string;
  situacao: ComunicadoSituacao;
  alertas: ComunicadoSituacao[];
  configuracao: {
    ativo: boolean;
    lotePorCiclo: number;
    maxDevolucao: number;
    rampaInicial: number;
    maxDiario: number;
    validador: string | null;
    validadorConfigurado: boolean;
  };
  totalAlunos: number;
  fila: {
    restantes: number;
    prontosParaEnvio: number;
    aguardandoValidacao: number;
    precisamCorrecao: number;
    senhasPossivelmenteExpostas: number;
  };
  validacao: Record<ComunicadoResultadoValidacao, number>;
  envios: {
    realizados: number;
    entregues: number;
    devolvidosDefinitivos: number;
    devolvidosTemporarios: number;
    falhas: number;
    incertos: number;
    reabertos: number;
    revogados: number;
    emProcessamento: number;
    porStatus: Record<string, number>;
  };
  devolucao: {
    ultimas24h: ComunicadoTaxaDevolucao & { previsaoFim: string | null };
    total: ComunicadoTaxaDevolucao;
    limite: number;
  };
  rampa: {
    diasComEnvio: number;
    enviadosHoje: number;
    limiteHoje: number;
    disponivelHoje: number;
    inicioDoDia: string;
  };
  brevo: {
    creditos: number | null;
    reserva: number;
    disponiveisParaComunicado: number | null;
    erro: string | null;
  };
  execucao: {
    emExecucao: boolean;
    validacaoEmExecucao: boolean;
    ultimaExecucao: {
      em: string;
      resultado: { enviados: number; interrompidoPor: string | null };
    } | null;
    ultimaSincronizacao: {
      em: string;
      ok: boolean;
      erro: string | null;
    } | null;
    ultimaValidacao: {
      em: string;
      resumo: {
        provedor: string | null;
        processados: number;
        porResultado: Partial<Record<ComunicadoResultadoValidacao, number>>;
        interrompidoPor: string | null;
        erro: string | null;
      } | null;
      erro: string | null;
    } | null;
  };
}

export type ComunicadoTipoPendencia =
  | "SENHA_POSSIVELMENTE_EXPOSTA"
  | "EMAIL_DEVOLVIDO"
  | "SENHA_REVOGADA"
  | "ENVIO_INCERTO"
  | "FALHA_NO_ENVIO"
  | "DEVOLUCAO_TEMPORARIA_PERSISTENTE"
  | "EMAIL_INVALIDO"
  | "EMAIL_BLOQUEADO"
  | "EMAIL_DE_RISCO"
  | "VALIDACAO_INCONCLUSIVA";

export interface ComunicadoPendencia {
  usuarioId: string;
  nomeCompleto: string;
  email: string;
  cpf: string | null;
  telefone: string | null;
  tipo: ComunicadoTipoPendencia;
  motivo: string;
  sugestao: string | null;
  senhaProvisoriaNaoRecebida: boolean;
  statusEnvio: string | null;
}

export interface ComunicadoPendencias {
  total: number;
  page: number;
  pageSize: number;
  porTipo: Record<ComunicadoTipoPendencia, number>;
  itens: ComunicadoPendencia[];
}

export interface ComunicadoAcaoAlunoResultado {
  email: string;
  reaberto?: boolean;
  validacao: {
    resultado: ComunicadoResultadoValidacao;
    motivo: string | null;
    sugestao: string | null;
    fonte: string;
  } | null;
  validadorIndisponivel: string | null;
  liberadoParaEnvio: boolean;
  envio: { enviados: number; interrompidoPor: string | null } | null;
}

export interface ComunicadoResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  code?: string;
}
