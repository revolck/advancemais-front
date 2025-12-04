/**
 * Sistema de Sessões de Checkout
 * 
 * Gerencia sessões temporárias e seguras para o processo de checkout.
 * Cada sessão é única, expira após um tempo determinado e só pode ser
 * acessada pelo usuário que a criou.
 */

/**
 * Gera um UUID v4 usando crypto.randomUUID() nativo
 */
function generateUUID(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback para ambientes sem crypto.randomUUID
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Tipos de produto suportados pelo checkout
export type CheckoutProductType = "plano" | "curso" | "assinatura";

// Status da sessão de checkout
export type CheckoutSessionStatus = "pending" | "processing" | "completed" | "expired" | "cancelled";

// Dados da sessão de checkout
export interface CheckoutSession {
  /** ID único da sessão (UUID) */
  sessionId: string;
  /** Tipo do produto sendo comprado */
  productType: CheckoutProductType;
  /** ID do produto (plano, curso, etc) */
  productId: string;
  /** Nome do produto para exibição */
  productName: string;
  /** Valor do produto */
  productPrice: number;
  /** Moeda */
  currency: string;
  /** ID do usuário que criou a sessão */
  userId?: string;
  /** Status da sessão */
  status: CheckoutSessionStatus;
  /** Data de criação */
  createdAt: number;
  /** Data de expiração */
  expiresAt: number;
  /** IP do usuário (capturado no momento da criação) */
  userIp?: string;
  /** User Agent do navegador */
  userAgent?: string;
  /** URL de origem (para redirect em caso de expiração) */
  originUrl: string;
  /** Metadados adicionais */
  metadata?: Record<string, unknown>;
}

// Payload para criar uma sessão
export interface CreateCheckoutSessionPayload {
  productType: CheckoutProductType;
  productId: string;
  productName: string;
  productPrice: number;
  currency?: string;
  originUrl?: string;
  metadata?: Record<string, unknown>;
}

// Tempo de expiração padrão (30 minutos)
const SESSION_EXPIRATION_MS = 30 * 60 * 1000;

// Chave do localStorage para armazenar sessões
const STORAGE_KEY = "checkout_sessions";

/**
 * Obtém todas as sessões do storage
 */
function getStoredSessions(): Record<string, CheckoutSession> {
  if (typeof window === "undefined") return {};
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return {};
    return JSON.parse(stored);
  } catch {
    return {};
  }
}

/**
 * Salva sessões no storage
 */
function saveSessionsToStorage(sessions: Record<string, CheckoutSession>): void {
  if (typeof window === "undefined") return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  } catch {
    // Ignora erros de storage
  }
}

/**
 * Limpa sessões expiradas
 */
function cleanExpiredSessions(): void {
  const sessions = getStoredSessions();
  const now = Date.now();
  
  const activeSessions: Record<string, CheckoutSession> = {};
  
  for (const [id, session] of Object.entries(sessions)) {
    if (session.expiresAt > now && session.status === "pending") {
      activeSessions[id] = session;
    }
  }
  
  saveSessionsToStorage(activeSessions);
}

/**
 * Cria uma nova sessão de checkout
 */
export function createCheckoutSession(payload: CreateCheckoutSessionPayload): CheckoutSession {
  // Limpa sessões expiradas antes de criar nova
  cleanExpiredSessions();
  
  const now = Date.now();
  const sessionId = generateUUID();
  
  // Captura informações do navegador
  const userAgent = typeof navigator !== "undefined" ? navigator.userAgent : undefined;
  const originUrl = payload.originUrl || (typeof window !== "undefined" ? window.location.pathname : "/");
  
  const session: CheckoutSession = {
    sessionId,
    productType: payload.productType,
    productId: payload.productId,
    productName: payload.productName,
    productPrice: payload.productPrice,
    currency: payload.currency || "BRL",
    status: "pending",
    createdAt: now,
    expiresAt: now + SESSION_EXPIRATION_MS,
    userAgent,
    originUrl,
    metadata: payload.metadata,
  };
  
  // Salva no storage
  const sessions = getStoredSessions();
  sessions[sessionId] = session;
  saveSessionsToStorage(sessions);
  
  return session;
}

/**
 * Obtém uma sessão pelo ID
 */
export function getCheckoutSession(sessionId: string): CheckoutSession | null {
  if (!sessionId) return null;
  
  const sessions = getStoredSessions();
  const session = sessions[sessionId];
  
  if (!session) return null;
  
  // Verifica se expirou
  if (Date.now() > session.expiresAt) {
    // Marca como expirada
    session.status = "expired";
    sessions[sessionId] = session;
    saveSessionsToStorage(sessions);
    return null;
  }
  
  // Verifica se já foi usada
  if (session.status !== "pending") {
    return null;
  }
  
  return session;
}

/**
 * Valida se uma sessão é válida para uso
 */
export function validateCheckoutSession(sessionId: string): {
  valid: boolean;
  session: CheckoutSession | null;
  error?: string;
} {
  if (!sessionId) {
    return { valid: false, session: null, error: "Sessão não informada" };
  }
  
  const sessions = getStoredSessions();
  const session = sessions[sessionId];
  
  if (!session) {
    return { valid: false, session: null, error: "Sessão não encontrada" };
  }
  
  if (Date.now() > session.expiresAt) {
    return { valid: false, session: null, error: "Sessão expirada" };
  }
  
  if (session.status !== "pending") {
    return { valid: false, session: null, error: "Sessão já utilizada" };
  }
  
  return { valid: true, session };
}

/**
 * Atualiza o status de uma sessão
 */
export function updateCheckoutSessionStatus(
  sessionId: string,
  status: CheckoutSessionStatus
): CheckoutSession | null {
  const sessions = getStoredSessions();
  const session = sessions[sessionId];
  
  if (!session) return null;
  
  session.status = status;
  sessions[sessionId] = session;
  saveSessionsToStorage(sessions);
  
  return session;
}

/**
 * Marca uma sessão como em processamento
 */
export function markSessionAsProcessing(sessionId: string): CheckoutSession | null {
  return updateCheckoutSessionStatus(sessionId, "processing");
}

/**
 * Marca uma sessão como completada
 */
export function markSessionAsCompleted(sessionId: string): CheckoutSession | null {
  return updateCheckoutSessionStatus(sessionId, "completed");
}

/**
 * Cancela uma sessão
 */
export function cancelCheckoutSession(sessionId: string): CheckoutSession | null {
  return updateCheckoutSessionStatus(sessionId, "cancelled");
}

/**
 * Remove uma sessão do storage
 */
export function removeCheckoutSession(sessionId: string): void {
  const sessions = getStoredSessions();
  delete sessions[sessionId];
  saveSessionsToStorage(sessions);
}

/**
 * Gera um token de segurança único para a URL
 */
function generateSecurityToken(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);
  return `${timestamp}${random}`;
}

/**
 * Gera a URL de checkout para uma sessão
 * Formato: /checkout?sid={sessionId}&token={securityToken}&ref={timestamp}&plan={planSlug}
 */
export function getCheckoutUrl(session: CheckoutSession): string {
  const securityToken = generateSecurityToken();
  const timestamp = Date.now().toString(36);
  const planSlug = session.productName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  
  // Salva o token de segurança na sessão
  const sessions = getStoredSessions();
  if (sessions[session.sessionId]) {
    sessions[session.sessionId].metadata = {
      ...sessions[session.sessionId].metadata,
      securityToken,
    };
    saveSessionsToStorage(sessions);
  }
  
  const params = new URLSearchParams({
    sid: session.sessionId,
    token: securityToken,
    ref: timestamp,
    plan: planSlug,
  });
  
  return `/checkout?${params.toString()}`;
}

/**
 * Cria sessão e retorna a URL de checkout
 */
export function createCheckoutAndGetUrl(payload: CreateCheckoutSessionPayload): {
  session: CheckoutSession;
  url: string;
} {
  const session = createCheckoutSession(payload);
  const url = getCheckoutUrl(session);
  return { session, url };
}

/**
 * Valida o token de segurança da URL
 */
export function validateSecurityToken(sessionId: string, token: string): boolean {
  const sessions = getStoredSessions();
  const session = sessions[sessionId];
  
  if (!session) return false;
  
  const storedToken = session.metadata?.securityToken;
  return storedToken === token;
}

