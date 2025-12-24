/**
 * Mock de Notas
 * - Não existe API de notas ainda
 * - As notas são geradas deterministicamente por (cursoId, turmaId, alunoId)
 * - Alterações feitas pela UI são persistidas em localStorage
 */

export interface NotaEnrollmentRef {
  cursoId: string;
  turmaId: string;
  alunoId: string;
}

export type NotaOrigemTipo = "PROVA" | "ATIVIDADE" | "AULA" | "OUTRO";

export interface NotaOrigemRef {
  tipo: NotaOrigemTipo;
  id?: string | null;
  titulo?: string | null;
}

export interface NotaStorageRecord {
  nota: number | null;
  atualizadoEm: string;
  criadoEm?: string;
  motivo?: string | null;
  origem?: NotaOrigemRef | null;
}

export interface NotaForEnrollmentResult extends NotaStorageRecord {
  key: string;
}

const STORAGE_KEY = "advancemais.notas.v1";
const MANUAL_STORAGE_KEY = "advancemais.notas.manual.v1";
const HISTORY_STORAGE_KEY = "advancemais.notas.history.v1";
const SEED_STORAGE_KEY = "advancemais.notas.seed.v1";
const DEFAULT_BASE_DATE = new Date("2025-01-01T12:00:00.000Z");

export interface NotaManualEntry {
  id: string;
  at: string;
  nota: number;
  motivo?: string | null;
  origem?: NotaOrigemRef | null;
}

export interface MockAlunoRef {
  alunoId: string;
  alunoNome: string;
}

export type MockProvaTipo = "PROVA" | "ATIVIDADE";

export interface MockProvaRef {
  id: string;
  tipo: MockProvaTipo;
  titulo: string;
  etiqueta?: string;
}

export interface MockAulaRef {
  id: string;
  titulo: string;
  codigo?: string;
}

function getStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function normalizeOrigem(value: unknown): NotaOrigemRef | null {
  if (value === null) return null;
  if (!value || typeof value !== "object") return null;
  const v = value as Record<string, unknown>;
  const tipo = v.tipo;
  if (
    tipo !== "PROVA" &&
    tipo !== "ATIVIDADE" &&
    tipo !== "AULA" &&
    tipo !== "OUTRO"
  ) {
    return null;
  }

  const id = v.id;
  const titulo = v.titulo;

  return {
    tipo,
    id: typeof id === "string" ? id : id === null ? null : undefined,
    titulo:
      typeof titulo === "string" ? titulo : titulo === null ? null : undefined,
  };
}

function normalizeRecord(value: unknown): NotaStorageRecord | null {
  if (!value || typeof value !== "object") return null;
  const v = value as Record<string, unknown>;

  const atualizadoEm = v.atualizadoEm;
  if (typeof atualizadoEm !== "string") return null;

  const notaRaw = v.nota;
  const nota =
    typeof notaRaw === "number"
      ? Number.isFinite(notaRaw)
        ? notaRaw
        : null
      : notaRaw === null
      ? null
      : null;

  const criadoEm = v.criadoEm;
  const motivo = v.motivo;
  const origem = normalizeOrigem(v.origem);

  return {
    nota,
    atualizadoEm,
    ...(typeof criadoEm === "string" ? { criadoEm } : {}),
    ...(typeof motivo === "string" || motivo === null ? { motivo } : {}),
    ...(origem !== null ? { origem } : v.origem === null ? { origem: null } : {}),
  };
}

function readStore(): Record<string, NotaStorageRecord> {
  const storage = getStorage();
  if (!storage) return {};
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    if (!parsed || typeof parsed !== "object") return {};
    const out: Record<string, NotaStorageRecord> = {};
    Object.entries(parsed).forEach(([key, value]) => {
      const record = normalizeRecord(value);
      if (record) out[key] = record;
    });
    return out;
  } catch {
    return {};
  }
}

function writeStore(next: Record<string, NotaStorageRecord>): void {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
}

function normalizeManualEntry(value: unknown): NotaManualEntry | null {
  if (!value || typeof value !== "object") return null;
  const v = value as Record<string, unknown>;
  if (typeof v.id !== "string") return null;
  if (typeof v.at !== "string") return null;
  const notaRaw = v.nota;
  const nota =
    typeof notaRaw === "number"
      ? Number.isFinite(notaRaw)
        ? notaRaw
        : null
      : null;
  if (nota === null) return null;
  const motivo = v.motivo;
  const origem = normalizeOrigem(v.origem);
  return {
    id: v.id,
    at: v.at,
    nota,
    ...(typeof motivo === "string" || motivo === null ? { motivo } : {}),
    ...(origem !== null ? { origem } : v.origem === null ? { origem: null } : {}),
  };
}

function readManualStore(): Record<string, NotaManualEntry[]> {
  const storage = getStorage();
  if (!storage) return {};
  try {
    const raw = storage.getItem(MANUAL_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    if (!parsed || typeof parsed !== "object") return {};
    const out: Record<string, NotaManualEntry[]> = {};
    Object.entries(parsed).forEach(([k, v]) => {
      if (!Array.isArray(v)) return;
      const items: NotaManualEntry[] = [];
      v.forEach((entry) => {
        const normalized = normalizeManualEntry(entry);
        if (normalized) items.push(normalized);
      });
      if (items.length > 0) out[k] = items;
    });
    return out;
  } catch {
    return {};
  }
}

function writeManualStore(next: Record<string, NotaManualEntry[]>) {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.setItem(MANUAL_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
}

function readSeedStore(): Record<string, boolean> {
  const storage = getStorage();
  if (!storage) return {};
  try {
    const raw = storage.getItem(SEED_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    if (!parsed || typeof parsed !== "object") return {};
    const out: Record<string, boolean> = {};
    Object.entries(parsed).forEach(([k, v]) => {
      if (v === true) out[k] = true;
    });
    return out;
  } catch {
    return {};
  }
}

function writeSeedStore(next: Record<string, boolean>) {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.setItem(SEED_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
}

export type NotaHistoryAction = "ADDED" | "REMOVED";

export interface NotaHistoryEvent {
  id: string;
  action: NotaHistoryAction;
  at: string;
  nota: number | null;
  motivo?: string | null;
  origem?: NotaOrigemRef | null;
}

function readHistoryStore(): Record<string, NotaHistoryEvent[]> {
  const storage = getStorage();
  if (!storage) return {};
  try {
    const raw = storage.getItem(HISTORY_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    if (!parsed || typeof parsed !== "object") return {};

    const out: Record<string, NotaHistoryEvent[]> = {};
    Object.entries(parsed).forEach(([k, v]) => {
      if (!Array.isArray(v)) return;
      const events: NotaHistoryEvent[] = [];
      v.forEach((e) => {
        if (!e || typeof e !== "object") return;
        const obj = e as any;
        if (typeof obj.id !== "string") return;
        if (obj.action !== "ADDED" && obj.action !== "REMOVED") return;
        if (typeof obj.at !== "string") return;
        const notaRaw = obj.nota;
        const nota =
          typeof notaRaw === "number"
            ? Number.isFinite(notaRaw)
              ? notaRaw
              : null
            : notaRaw === null
            ? null
            : null;
        const motivo = obj.motivo;
        const origem = normalizeOrigem(obj.origem);

        events.push({
          id: obj.id,
          action: obj.action,
          at: obj.at,
          nota,
          ...(typeof motivo === "string" || motivo === null ? { motivo } : {}),
          ...(origem !== null ? { origem } : obj.origem === null ? { origem: null } : {}),
        });
      });
      if (events.length > 0) out[k] = events;
    });
    return out;
  } catch {
    return {};
  }
}

function writeHistoryStore(next: Record<string, NotaHistoryEvent[]>) {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
}

function appendHistoryEvent(params: {
  key: string;
  action: NotaHistoryAction;
  nota: number | null;
  motivo?: string | null;
  origem?: NotaOrigemRef | null;
}) {
  const { key, action, nota, motivo, origem } = params;
  const store = readHistoryStore();
  const now = new Date().toISOString();
  const id = `${now}::${Math.random().toString(16).slice(2)}`;
  const event: NotaHistoryEvent = {
    id,
    action,
    at: now,
    nota,
    ...(motivo !== undefined ? { motivo } : {}),
    ...(origem !== undefined ? { origem } : {}),
  };
  const existing = store[key] ?? [];
  store[key] = [event, ...existing].slice(0, 50);
  writeHistoryStore(store);
}

export function buildNotaKey({ cursoId, turmaId, alunoId }: NotaEnrollmentRef): string {
  return `${String(cursoId)}::${String(turmaId)}::${String(alunoId)}`;
}

function hashString(input: string): number {
  // FNV-1a 32-bit
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

const MOCK_FIRST_NAMES = [
  "Ana",
  "Bruno",
  "Carla",
  "Diego",
  "Eduarda",
  "Felipe",
  "Guilherme",
  "Helena",
  "Igor",
  "Juliana",
  "Kaique",
  "Larissa",
  "Marcos",
  "Natália",
  "Otávio",
  "Paula",
  "Rafael",
  "Sabrina",
  "Tiago",
  "Vanessa",
];

const MOCK_LAST_NAMES = [
  "Silva",
  "Santos",
  "Oliveira",
  "Souza",
  "Lima",
  "Ferreira",
  "Almeida",
  "Costa",
  "Gomes",
  "Ribeiro",
  "Carvalho",
  "Araujo",
  "Martins",
  "Rocha",
  "Barbosa",
];

const MOCK_PROVA_TOPICS = [
  "Módulo 1",
  "Módulo 2",
  "Módulo 3",
  "Introdução",
  "Backend",
  "Frontend",
  "Banco de Dados",
  "DevOps",
  "Projeto Final",
];

const MOCK_AULA_TOPICS = [
  "Boas-vindas",
  "Fundamentos",
  "Prática Guiada",
  "Exercícios",
  "Revisão",
  "Tira-dúvidas",
  "Avaliação",
  "Entrega do Projeto",
];

export function getMockAlunosForTurma(params: {
  cursoId: string;
  turmaId: string;
  count?: number;
}): MockAlunoRef[] {
  const { cursoId, turmaId, count = 10 } = params;
  const baseKey = `mock-alunos::${cursoId}::${turmaId}`;
  const base = hashString(baseKey);

  const out: MockAlunoRef[] = [];
  for (let i = 0; i < count; i += 1) {
    const h = hashString(`${baseKey}::${i}`);
    const first = MOCK_FIRST_NAMES[(base + i + h) % MOCK_FIRST_NAMES.length];
    const last = MOCK_LAST_NAMES[(base + h) % MOCK_LAST_NAMES.length];
    const alunoNome = `${first} ${last}`;
    const alunoId = `mock-${cursoId}-${turmaId}-${String(h).slice(0, 8)}`;
    out.push({ alunoId, alunoNome });
  }

  // Dedup básico
  const uniq = new Map<string, MockAlunoRef>();
  out.forEach((a) => uniq.set(a.alunoId, a));
  return Array.from(uniq.values());
}

export function getMockProvasAtividadesForTurma(params: {
  cursoId: string;
  turmaId: string;
  provasCount?: number;
  atividadesCount?: number;
}): MockProvaRef[] {
  const { cursoId, turmaId, provasCount = 4, atividadesCount = 6 } = params;
  const baseKey = `mock-provas::${cursoId}::${turmaId}`;
  const base = hashString(baseKey);

  const out: MockProvaRef[] = [];

  for (let i = 0; i < provasCount; i += 1) {
    const h = hashString(`${baseKey}::PROVA::${i}`);
    const topic = MOCK_PROVA_TOPICS[(base + i + h) % MOCK_PROVA_TOPICS.length];
    const n = i + 1;
    out.push({
      id: `mock-prova-${cursoId}-${turmaId}-${String(h).slice(0, 8)}`,
      tipo: "PROVA",
      titulo: `Prova ${n} • ${topic}`,
      etiqueta: `P${n}`,
    });
  }

  for (let i = 0; i < atividadesCount; i += 1) {
    const h = hashString(`${baseKey}::ATIVIDADE::${i}`);
    const topic = MOCK_PROVA_TOPICS[(base + i + h + 3) % MOCK_PROVA_TOPICS.length];
    const n = i + 1;
    out.push({
      id: `mock-atividade-${cursoId}-${turmaId}-${String(h).slice(0, 8)}`,
      tipo: "ATIVIDADE",
      titulo: `Atividade ${n} • ${topic}`,
      etiqueta: `A${n}`,
    });
  }

  return out;
}

export function getMockAulasForTurma(params: {
  turmaId: string;
  count?: number;
}): MockAulaRef[] {
  const { turmaId, count = 8 } = params;
  const baseKey = `mock-aulas::${turmaId}`;
  const base = hashString(baseKey);

  const out: MockAulaRef[] = [];
  for (let i = 0; i < count; i += 1) {
    const h = hashString(`${baseKey}::${i}`);
    const topic = MOCK_AULA_TOPICS[(base + i + h) % MOCK_AULA_TOPICS.length];
    const n = i + 1;
    out.push({
      id: `mock-aula-${turmaId}-${String(h).slice(0, 8)}`,
      titulo: `Aula ${n} • ${topic}`,
      codigo: `A${String(n).padStart(2, "0")}`,
    });
  }
  return out;
}

function getDefaultNotaForKey(key: string): NotaStorageRecord {
  const h = hashString(key);

  // 0..10 com 1 casa decimal
  const value = (h % 101) / 10;
  const nota = h % 17 === 0 ? null : Math.round(value * 10) / 10;

  // Data determinística no ano base
  const daysOffset = h % 365;
  const updated = new Date(DEFAULT_BASE_DATE.getTime() + daysOffset * 86400000);

  const iso = updated.toISOString();
  return { nota, atualizadoEm: iso, criadoEm: iso, motivo: null, origem: null };
}

export function getNotasStoreSnapshot(): Record<string, NotaStorageRecord> {
  return readStore();
}

export function getNotasManualSnapshot(): Record<string, NotaManualEntry[]> {
  return readManualStore();
}

export function getNotasHistorySnapshot(): Record<string, NotaHistoryEvent[]> {
  return readHistoryStore();
}

function isOverrideTombstone(record: NotaStorageRecord): boolean {
  return record.nota === null && (record.motivo ?? null) === null && (record.origem ?? null) === null;
}

function getBaseNotaForKey(params: {
  key: string;
  overrideStore: Record<string, NotaStorageRecord>;
}): { baseNota: number | null; baseMeta: NotaStorageRecord } {
  const { key, overrideStore } = params;
  const overrides = overrideStore[key];
  const system = getDefaultNotaForKey(key);

  // Tombstone: "sem nota do sistema"
  if (overrides && isOverrideTombstone(overrides)) {
    return { baseNota: null, baseMeta: overrides };
  }

  if (overrides && typeof overrides.nota === "number" && Number.isFinite(overrides.nota)) {
    return { baseNota: overrides.nota, baseMeta: overrides };
  }

  return { baseNota: system.nota, baseMeta: system };
}

function migrateLegacyManualIfNeeded(params: {
  key: string;
  overrideStore: Record<string, NotaStorageRecord>;
  manualStore: Record<string, NotaManualEntry[]>;
}) {
  const { key, overrideStore, manualStore } = params;
  const legacy = overrideStore[key];
  if (!legacy) return;
  if (legacy.nota === null) return; // tombstone/override
  const existingManual = manualStore[key];
  if (existingManual && existingManual.length > 0) return;

  const entry: NotaManualEntry = {
    id: `legacy::${legacy.atualizadoEm}`,
    at: legacy.atualizadoEm,
    nota: legacy.nota,
    ...(legacy.motivo !== undefined ? { motivo: legacy.motivo } : {}),
    ...(legacy.origem !== undefined ? { origem: legacy.origem } : {}),
  };

  manualStore[key] = [entry];
  delete overrideStore[key];
}

export function hasManualNotaInStore(
  overrideStore: Record<string, NotaStorageRecord>,
  ref: NotaEnrollmentRef
): boolean {
  const key = buildNotaKey(ref);
  const manualStore = readManualStore();
  const hasManual = Boolean(manualStore[key]?.length);
  if (hasManual) return true;
  const legacy = overrideStore[key];
  return Boolean(legacy && legacy.nota !== null);
}

export function getNotaForEnrollmentFromStore(
  overrideStore: Record<string, NotaStorageRecord>,
  ref: NotaEnrollmentRef
): NotaForEnrollmentResult {
  const key = buildNotaKey(ref);
  const manualStore = readManualStore();

  // Migra possíveis registros antigos (nota única) para a lista de lançamentos manuais
  const overrideStoreMutable = { ...overrideStore };
  const manualStoreMutable = { ...manualStore };
  migrateLegacyManualIfNeeded({
    key,
    overrideStore: overrideStoreMutable,
    manualStore: manualStoreMutable,
  });
  // Persistir migração apenas quando necessário
  if (overrideStoreMutable[key] !== overrideStore[key] || manualStoreMutable[key] !== manualStore[key]) {
    writeStore(overrideStoreMutable);
    writeManualStore(manualStoreMutable);
  }

  const entries = manualStoreMutable[key] ?? [];
  const manualTotalRaw = entries.reduce((acc, e) => acc + (Number.isFinite(e.nota) ? e.nota : 0), 0);
  const manualTotal = Math.round(manualTotalRaw * 100) / 100;
  const hasManual = entries.length > 0;

  const { baseNota, baseMeta } = getBaseNotaForKey({ key, overrideStore: overrideStoreMutable });

  // Regra: nota final = nota do sistema + lançamentos manuais (cap 10)
  const baseForSum = baseNota ?? 0;
  const total = baseForSum + manualTotal;
  const notaFinalNumber = Math.min(10, Math.max(0, Math.round(total * 100) / 100));
  const notaFinal = baseNota === null && !hasManual ? null : notaFinalNumber;

  const atualizadoEm = hasManual ? entries[0].at : baseMeta?.atualizadoEm;
  const criadoEm = hasManual ? entries[entries.length - 1].at : baseMeta?.criadoEm;
  const last = hasManual ? entries[0] : null;

  return {
    key,
    nota: notaFinal,
    atualizadoEm: atualizadoEm ?? baseMeta.atualizadoEm,
    ...(criadoEm ? { criadoEm } : {}),
    ...(last ? { motivo: last.motivo ?? null, origem: last.origem ?? null } : { motivo: null, origem: null }),
  };
}

export function getNotaForEnrollment(ref: NotaEnrollmentRef): NotaForEnrollmentResult {
  return getNotaForEnrollmentFromStore(getNotasStoreSnapshot(), ref);
}

export function upsertNotaForEnrollment({
  cursoId,
  turmaId,
  alunoId,
  nota,
}: NotaEnrollmentRef & { nota: number | null }): NotaStorageRecord {
  return upsertNotaWithContextForEnrollment({
    cursoId,
    turmaId,
    alunoId,
    nota,
  });
}

export function upsertNotaWithContextForEnrollment({
  cursoId,
  turmaId,
  alunoId,
  nota,
  motivo,
  origem,
}: NotaEnrollmentRef & {
  nota: number | null;
  motivo?: string | null;
  origem?: NotaOrigemRef | null;
}): NotaStorageRecord {
  const key = buildNotaKey({ cursoId, turmaId, alunoId });
  if (nota === null) {
    // manter compatibilidade: "nota null" aqui não adiciona lançamento
    return {
      nota: null,
      atualizadoEm: new Date().toISOString(),
      motivo: null,
      origem: null,
    };
  }

  const overrideStore = readStore();
  const manualStore = readManualStore();
  migrateLegacyManualIfNeeded({ key, overrideStore, manualStore });

  const existing = manualStore[key] ?? [];
  const manualTotal = existing.reduce((acc, e) => acc + (Number.isFinite(e.nota) ? e.nota : 0), 0);
  const { baseNota } = getBaseNotaForKey({ key, overrideStore });
  const baseForSum = baseNota ?? 0;
  const currentTotal = baseForSum + manualTotal;
  const remaining = Math.max(0, Math.round((10 - currentTotal) * 100) / 100);
  if (nota > remaining + 1e-9) {
    throw new Error(
      `A nota final não pode ultrapassar 10. Disponível: ${remaining.toLocaleString("pt-BR", {
        minimumFractionDigits: Number.isInteger(remaining) ? 0 : 1,
        maximumFractionDigits: 2,
      })}.`
    );
  }

  const now = new Date().toISOString();
  const entry: NotaManualEntry = {
    id: `${now}::${Math.random().toString(16).slice(2)}`,
    at: now,
    nota,
    ...(motivo !== undefined ? { motivo } : {}),
    ...(origem !== undefined ? { origem } : {}),
  };
  manualStore[key] = [entry, ...existing].slice(0, 100);
  writeManualStore(manualStore);

  appendHistoryEvent({
    key,
    action: "ADDED",
    nota,
    ...(motivo !== undefined ? { motivo } : {}),
    ...(origem !== undefined ? { origem } : {}),
  });

  const computed = getNotaForEnrollmentFromStore(readStore(), { cursoId, turmaId, alunoId });
  return {
    nota: computed.nota,
    atualizadoEm: computed.atualizadoEm,
    criadoEm: computed.criadoEm,
    motivo: computed.motivo,
    origem: computed.origem,
  };
}

function upsertTombstoneWithoutHistory(
  ref: NotaEnrollmentRef
): NotaStorageRecord {
  const key = buildNotaKey(ref);
  const store = readStore();
  const now = new Date().toISOString();
  const previous = store[key] ?? getDefaultNotaForKey(key);

  const record: NotaStorageRecord = {
    ...previous,
    nota: null,
    motivo: null,
    origem: null,
    atualizadoEm: now,
    criadoEm: previous.criadoEm ?? now,
  };

  store[key] = record;
  writeStore(store);
  return record;
}

export function deleteManualNotaForEnrollment(ref: NotaEnrollmentRef): NotaStorageRecord | null {
  const key = buildNotaKey(ref);
  const overrideStore = readStore();
  const manualStore = readManualStore();
  migrateLegacyManualIfNeeded({ key, overrideStore, manualStore });

  const existing = manualStore[key] ?? [];
  if (existing.length === 0) return null;

  const [removed, ...rest] = existing;
  if (rest.length === 0) {
    delete manualStore[key];
  } else {
    manualStore[key] = rest;
  }
  writeManualStore(manualStore);

  appendHistoryEvent({
    key,
    action: "REMOVED",
    nota: removed.nota,
    ...(removed.motivo !== undefined ? { motivo: removed.motivo } : {}),
    ...(removed.origem !== undefined ? { origem: removed.origem } : {}),
  });

  const computed = getNotaForEnrollmentFromStore(readStore(), ref);
  return {
    nota: computed.nota,
    atualizadoEm: computed.atualizadoEm,
    criadoEm: computed.criadoEm,
    motivo: computed.motivo,
    origem: computed.origem,
  };
}

export function ensureNotasSeededForTurma(params: {
  cursoId: string;
  turmaId: string;
  alunoIds: string[];
}) {
  const { cursoId, turmaId, alunoIds } = params;
  const storage = getStorage();
  if (!storage) return;

  const seedKey = `${cursoId}::${turmaId}`;
  const seeded = readSeedStore();
  if (seeded[seedKey]) return;

  const uniqAlunoIds = Array.from(
    new Set(alunoIds.map((id) => String(id).trim()).filter(Boolean))
  );
  if (uniqAlunoIds.length === 0) return;

  const provasAtividades = getMockProvasAtividadesForTurma({ cursoId, turmaId });
  const aulas = getMockAulasForTurma({ turmaId });

  const prova0 = provasAtividades.find((p) => p.tipo === "PROVA") ?? provasAtividades[0];
  const atividade0 =
    provasAtividades.find((p) => p.tipo === "ATIVIDADE") ?? provasAtividades[1];
  const aula0 = aulas[0];

  const overrideBefore = readStore();
  const manualBefore = readManualStore();

  // 1) Aluno 1 com nota manual (removível) + histórico
  const aluno1 = uniqAlunoIds[0];
  const key1 = buildNotaKey({ cursoId, turmaId, alunoId: aluno1 });
  const hasManual1 = Boolean(manualBefore[key1]?.length);
  if (!hasManual1) {
    const current = getNotaForEnrollmentFromStore(overrideBefore, {
      cursoId,
      turmaId,
      alunoId: aluno1,
    });
    const remaining = Math.max(0, Math.round((10 - (current.nota ?? 0)) * 100) / 100);
    const add = Math.min(1, remaining);
    if (add > 0) {
      upsertNotaWithContextForEnrollment({
        cursoId,
        turmaId,
        alunoId: aluno1,
        nota: add,
        motivo: "Bônus (mock) — participação e desempenho.",
        origem: prova0
          ? { tipo: prova0.tipo, id: prova0.id, titulo: prova0.titulo }
          : { tipo: "PROVA", id: null, titulo: "Prova 1 (mock)" },
      });
    }
  }

  // 2) Aluno 2 sem nota (não removível, sem histórico)
  if (uniqAlunoIds.length >= 2) {
    const aluno2 = uniqAlunoIds[1];
    const key2 = buildNotaKey({ cursoId, turmaId, alunoId: aluno2 });
    if (!overrideBefore[key2]) {
      upsertTombstoneWithoutHistory({ cursoId, turmaId, alunoId: aluno2 });
    }
  }

  // 3) Aluno 3 com histórico de adicionada+removida (sem nota atual)
  if (uniqAlunoIds.length >= 3) {
    const aluno3 = uniqAlunoIds[2];
    const key3 = buildNotaKey({ cursoId, turmaId, alunoId: aluno3 });
    const hasAny3 = Boolean(overrideBefore[key3] || manualBefore[key3]?.length);
    if (!hasAny3) {
      const current = getNotaForEnrollmentFromStore(overrideBefore, {
        cursoId,
        turmaId,
        alunoId: aluno3,
      });
      const remaining = Math.max(0, Math.round((10 - (current.nota ?? 0)) * 100) / 100);
      const add = Math.min(0.5, remaining);
      if (add > 0) {
        upsertNotaWithContextForEnrollment({
          cursoId,
          turmaId,
          alunoId: aluno3,
          nota: add,
          motivo: "Avaliação (mock) — atividade extra.",
          origem: atividade0
            ? { tipo: atividade0.tipo, id: atividade0.id, titulo: atividade0.titulo }
            : aula0
            ? { tipo: "AULA", id: aula0.id, titulo: aula0.titulo }
            : { tipo: "ATIVIDADE", id: null, titulo: "Atividade 1 (mock)" },
        });
      }
      deleteManualNotaForEnrollment({ cursoId, turmaId, alunoId: aluno3 });
    }
  }

  seeded[seedKey] = true;
  writeSeedStore(seeded);
}
