/**
 * Mock de pagamento para prova/atividade de recuperação
 * Regra: aluno reprovado (nota final <= 6) precisa pagar R$ 50 para responder.
 * Persistência: localStorage.
 */

export const RECUPERACAO_PAGAMENTO_VALOR_CENTS = 50_00;

export interface RecuperacaoPagamentoRef {
  cursoId: string | number;
  turmaId: string;
  provaId: string;
  inscricaoId: string;
}

export interface RecuperacaoPagamentoRecord extends RecuperacaoPagamentoRef {
  key: string;
  amountCents: number;
  paidAt: string;
  createdAt: string;
}

const STORAGE_KEY = "advancemais.recuperacao.pagamentos.v1";

function getStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function buildRecuperacaoPagamentoKey(ref: RecuperacaoPagamentoRef): string {
  return `${String(ref.cursoId)}::${String(ref.turmaId)}::${String(ref.provaId)}::${String(ref.inscricaoId)}`;
}

function normalizeRecord(value: unknown): RecuperacaoPagamentoRecord | null {
  if (!value || typeof value !== "object") return null;
  const v = value as Record<string, unknown>;
  if (typeof v.key !== "string") return null;
  if (typeof v.cursoId !== "string" && typeof v.cursoId !== "number") return null;
  if (typeof v.turmaId !== "string") return null;
  if (typeof v.provaId !== "string") return null;
  if (typeof v.inscricaoId !== "string") return null;
  if (typeof v.amountCents !== "number" || !Number.isFinite(v.amountCents)) return null;
  if (typeof v.paidAt !== "string") return null;
  if (typeof v.createdAt !== "string") return null;
  return {
    key: v.key,
    cursoId: v.cursoId,
    turmaId: v.turmaId,
    provaId: v.provaId,
    inscricaoId: v.inscricaoId,
    amountCents: v.amountCents,
    paidAt: v.paidAt,
    createdAt: v.createdAt,
  };
}

function readStore(): Record<string, RecuperacaoPagamentoRecord> {
  const storage = getStorage();
  if (!storage) return {};
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    if (!parsed || typeof parsed !== "object") return {};
    const out: Record<string, RecuperacaoPagamentoRecord> = {};
    Object.entries(parsed).forEach(([k, v]) => {
      const normalized = normalizeRecord(v);
      if (normalized) out[k] = normalized;
    });
    return out;
  } catch {
    return {};
  }
}

function writeStore(next: Record<string, RecuperacaoPagamentoRecord>) {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
}

export function getRecuperacaoPagamentoSnapshot(): Record<
  string,
  RecuperacaoPagamentoRecord
> {
  return readStore();
}

export function isRecuperacaoPagamentoPago(ref: RecuperacaoPagamentoRef): boolean {
  const key = buildRecuperacaoPagamentoKey(ref);
  const store = readStore();
  return Boolean(store[key]?.paidAt);
}

export function registrarRecuperacaoPagamento(
  ref: RecuperacaoPagamentoRef,
  params?: { amountCents?: number }
): RecuperacaoPagamentoRecord {
  const key = buildRecuperacaoPagamentoKey(ref);
  const store = readStore();
  const now = new Date().toISOString();
  const existing = store[key];
  const amountCents =
    params?.amountCents ?? existing?.amountCents ?? RECUPERACAO_PAGAMENTO_VALOR_CENTS;

  const record: RecuperacaoPagamentoRecord = {
    key,
    cursoId: String(ref.cursoId),
    turmaId: ref.turmaId,
    provaId: ref.provaId,
    inscricaoId: ref.inscricaoId,
    amountCents,
    paidAt: now,
    createdAt: existing?.createdAt ?? now,
  };

  store[key] = record;
  writeStore(store);
  return record;
}

