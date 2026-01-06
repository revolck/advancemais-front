/**
 * Mock de Frequência
 * - Não existe API de frequência ainda
 * - Sugestões são calculadas a partir do contexto da aula + evidências mockadas
 * - Confirmações manuais são persistidas em localStorage
 */

import type { Aula, Modalidade } from "@/api/aulas";

export type FrequenciaStatus = "PENDENTE" | "PRESENTE" | "FALTA" | "JUSTIFICADA";
export type FrequenciaFonte = "AUTO" | "MANUAL";

export interface MockFrequenciaCursoRef {
  id: string;
  nome: string;
}

export interface MockFrequenciaTurmaRef {
  id: string;
  cursoId: string;
  nome: string;
  modalidade: Modalidade;
}

export interface FrequenciaRef {
  cursoId: string;
  turmaId: string;
  aulaId: string;
  alunoId: string;
}

export interface FrequenciaEvidence {
  ultimoLogin?: string | null; // ISO
  tempoAoVivoMin?: number | null;
}

export interface FrequenciaStorageRecord {
  status: FrequenciaStatus;
  motivo?: string | null;
  fonte: FrequenciaFonte;
  marcadoEm: string;
}

export interface FrequenciaComputed {
  key: string;
  statusAtual: FrequenciaStatus;
  motivo?: string | null;
  sugestaoStatus: FrequenciaStatus;
  evidence: FrequenciaEvidence;
}

const STORAGE_KEY = "advancemais.frequencia.v1";
const HISTORY_KEY = "advancemais.frequencia.history.v1";

const OVERRIDE_ROLES = new Set(["ADMIN", "MODERADOR", "PEDAGOGICO"]);

export interface FrequenciaHistoryEntry {
  fromStatus: FrequenciaStatus;
  toStatus: FrequenciaStatus;
  fromMotivo?: string | null;
  toMotivo?: string | null;
  changedAt: string;
  actorRole?: string | null;
  actorName?: string | null;
  overrideReason?: string | null;
}

const MOCK_CURSOS: MockFrequenciaCursoRef[] = [
  { id: "mock-curso-presencial", nome: "Curso Presencial (Mock)" },
  { id: "mock-curso-online", nome: "Curso Online (Mock)" },
  { id: "mock-curso-ao-vivo", nome: "Curso Ao Vivo (Mock)" },
  { id: "mock-curso-semipresencial", nome: "Curso Semipresencial (Mock)" },
];

const MOCK_TURMAS: MockFrequenciaTurmaRef[] = [
  {
    id: "mock-turma-presencial-1",
    cursoId: "mock-curso-presencial",
    nome: "Turma 1 • Presencial (Mock)",
    modalidade: "PRESENCIAL",
  },
  {
    id: "mock-turma-presencial-2",
    cursoId: "mock-curso-presencial",
    nome: "Turma 2 • Presencial (Mock)",
    modalidade: "PRESENCIAL",
  },
  {
    id: "mock-turma-online-1",
    cursoId: "mock-curso-online",
    nome: "Turma 1 • Online (Mock)",
    modalidade: "ONLINE",
  },
  {
    id: "mock-turma-online-2",
    cursoId: "mock-curso-online",
    nome: "Turma 2 • Online (Mock)",
    modalidade: "ONLINE",
  },
  {
    id: "mock-turma-ao-vivo-1",
    cursoId: "mock-curso-ao-vivo",
    nome: "Turma 1 • Ao Vivo (Mock)",
    modalidade: "AO_VIVO",
  },
  {
    id: "mock-turma-ao-vivo-2",
    cursoId: "mock-curso-ao-vivo",
    nome: "Turma 2 • Ao Vivo (Mock)",
    modalidade: "AO_VIVO",
  },
  {
    id: "mock-turma-semipresencial-1",
    cursoId: "mock-curso-semipresencial",
    nome: "Turma 1 • Semipresencial (Mock)",
    modalidade: "SEMIPRESENCIAL",
  },
  {
    id: "mock-turma-semipresencial-2",
    cursoId: "mock-curso-semipresencial",
    nome: "Turma 2 • Semipresencial (Mock)",
    modalidade: "SEMIPRESENCIAL",
  },
];

function getStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function readStore(): Record<string, FrequenciaStorageRecord> {
  const storage = getStorage();
  if (!storage) return {};
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    if (!parsed || typeof parsed !== "object") return {};
    const out: Record<string, FrequenciaStorageRecord> = {};
    Object.entries(parsed).forEach(([k, v]) => {
      if (!v || typeof v !== "object") return;
      const obj = v as any;
      if (
        obj.status !== "PENDENTE" &&
        obj.status !== "PRESENTE" &&
        obj.status !== "FALTA" &&
        obj.status !== "JUSTIFICADA"
      ) {
        return;
      }
      if (obj.fonte !== "AUTO" && obj.fonte !== "MANUAL") return;
      if (typeof obj.marcadoEm !== "string") return;
      out[k] = {
        status: obj.status,
        fonte: obj.fonte,
        marcadoEm: obj.marcadoEm,
        ...(typeof obj.motivo === "string" || obj.motivo === null
          ? { motivo: obj.motivo }
          : {}),
      };
    });
    return out;
  } catch {
    return {};
  }
}

function writeStore(next: Record<string, FrequenciaStorageRecord>) {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
}

function readHistoryStore(): Record<string, FrequenciaHistoryEntry[]> {
  const storage = getStorage();
  if (!storage) return {};
  try {
    const raw = storage.getItem(HISTORY_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    if (!parsed || typeof parsed !== "object") return {};
    const out: Record<string, FrequenciaHistoryEntry[]> = {};

    Object.entries(parsed).forEach(([k, v]) => {
      if (!Array.isArray(v)) return;
      const entries: FrequenciaHistoryEntry[] = [];
      v.forEach((row) => {
        if (!row || typeof row !== "object") return;
        const obj = row as any;
        const fromStatus = obj.fromStatus as FrequenciaStatus;
        const toStatus = obj.toStatus as FrequenciaStatus;
        const changedAt = obj.changedAt;
        if (
          (fromStatus !== "PENDENTE" &&
            fromStatus !== "PRESENTE" &&
            fromStatus !== "FALTA" &&
            fromStatus !== "JUSTIFICADA") ||
          (toStatus !== "PENDENTE" &&
            toStatus !== "PRESENTE" &&
            toStatus !== "FALTA" &&
            toStatus !== "JUSTIFICADA") ||
          typeof changedAt !== "string"
        ) {
          return;
        }
        entries.push({
          fromStatus,
          toStatus,
          changedAt,
          ...(typeof obj.fromMotivo === "string" || obj.fromMotivo === null
            ? { fromMotivo: obj.fromMotivo }
            : {}),
          ...(typeof obj.toMotivo === "string" || obj.toMotivo === null
            ? { toMotivo: obj.toMotivo }
            : {}),
          ...(typeof obj.actorRole === "string" || obj.actorRole === null
            ? { actorRole: obj.actorRole }
            : {}),
          ...(typeof obj.actorName === "string" || obj.actorName === null
            ? { actorName: obj.actorName }
            : {}),
          ...(typeof obj.overrideReason === "string" || obj.overrideReason === null
            ? { overrideReason: obj.overrideReason }
            : {}),
        });
      });
      out[k] = entries;
    });

    return out;
  } catch {
    return {};
  }
}

function writeHistoryStore(next: Record<string, FrequenciaHistoryEntry[]>) {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.setItem(HISTORY_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
}

export function buildFrequenciaKey(ref: FrequenciaRef): string {
  return `${ref.cursoId}::${ref.turmaId}::${ref.aulaId}::${ref.alunoId}`;
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

export function getMockCursosForFrequencia(): MockFrequenciaCursoRef[] {
  return MOCK_CURSOS.slice();
}

export function getMockTurmasForFrequencia(cursoId: string): MockFrequenciaTurmaRef[] {
  return MOCK_TURMAS.filter((t) => t.cursoId === cursoId);
}

export function getMockModalidadeForTurmaId(turmaId: string): Modalidade {
  const found = MOCK_TURMAS.find((t) => t.id === turmaId);
  if (found) return found.modalidade;

  const h = hashString(turmaId) % 4;
  if (h === 0) return "PRESENCIAL";
  if (h === 1) return "ONLINE";
  if (h === 2) return "AO_VIVO";
  return "SEMIPRESENCIAL";
}

function getAulaEndDate(aula: Pick<Aula, "dataFim" | "dataInicio" | "duracaoMinutos">): Date | null {
  const end = aula.dataFim ? new Date(aula.dataFim) : null;
  if (end && !Number.isNaN(end.getTime())) return end;
  if (aula.dataInicio) {
    const start = new Date(aula.dataInicio);
    if (Number.isNaN(start.getTime())) return null;
    const dur = Number(aula.duracaoMinutos ?? 0);
    if (Number.isFinite(dur) && dur > 0) {
      return new Date(start.getTime() + dur * 60000);
    }
    return start;
  }
  return null;
}

export function didAulaHappen(aula: Pick<Aula, "dataFim" | "dataInicio" | "duracaoMinutos">, toleranceMinutes = 10): boolean {
  const end = getAulaEndDate(aula);
  if (!end) return false;
  return Date.now() >= end.getTime() + toleranceMinutes * 60000;
}

export function getMockEvidence(params: {
  alunoId: string;
  aula: Pick<Aula, "id" | "dataFim" | "dataInicio" | "duracaoMinutos" | "modalidade">;
}): FrequenciaEvidence {
  const { alunoId, aula } = params;
  const key = `${aula.id}::${alunoId}`;
  const h = hashString(key);

  const end = getAulaEndDate(aula) ?? new Date();
  const endTime = end.getTime();

  // Ultimo login: +/- até 3 dias ao redor do fim
  const offsetHours = (h % 72) - 24; // -24..47
  const ultimoLogin = new Date(endTime + offsetHours * 3600000).toISOString();

  // Tempo ao vivo: 0..duracaoMinutos
  const dur = Math.max(0, Number(aula.duracaoMinutos ?? 60));
  const tempoAoVivoMin = Math.round(((h % 101) / 100) * dur);

  return {
    ultimoLogin,
    tempoAoVivoMin,
  };
}

export function getSuggestedStatus(params: {
  aula: Pick<Aula, "dataFim" | "dataInicio" | "duracaoMinutos" | "modalidade">;
  evidence: FrequenciaEvidence;
  presenceWindowDays?: number;
}): FrequenciaStatus {
  const { aula, evidence, presenceWindowDays = 7 } = params;
  const end = getAulaEndDate(aula);
  if (!end) return "PENDENTE";

  const happened = didAulaHappen(aula);
  if (!happened) return "PENDENTE";

  const modalidade: Modalidade = aula.modalidade;
  if (modalidade === "PRESENCIAL") {
    return "PENDENTE";
  }

  if (modalidade === "AO_VIVO") {
    const dur = Math.max(1, Number(aula.duracaoMinutos ?? 60));
    const minRequired = Math.min(Math.round(dur * 0.7), 45);
    const watched = Number(evidence.tempoAoVivoMin ?? 0);
    return watched >= minRequired ? "PRESENTE" : "FALTA";
  }

  // ONLINE / SEMIPRESENCIAL: usar ultimoLogin como evidência
  const ultimoLogin = evidence.ultimoLogin ? new Date(evidence.ultimoLogin) : null;
  if (!ultimoLogin || Number.isNaN(ultimoLogin.getTime())) return "PENDENTE";
  const windowEnd = new Date(end.getTime() + presenceWindowDays * 86400000);
  if (ultimoLogin.getTime() >= end.getTime() && ultimoLogin.getTime() <= windowEnd.getTime()) {
    return "PRESENTE";
  }
  return "FALTA";
}

export function getFrequenciaComputed(params: {
  cursoId: string;
  turmaId: string;
  aula: Pick<Aula, "id" | "dataFim" | "dataInicio" | "duracaoMinutos" | "modalidade">;
  alunoId: string;
}): FrequenciaComputed {
  const { cursoId, turmaId, aula, alunoId } = params;
  const key = buildFrequenciaKey({ cursoId, turmaId, aulaId: aula.id, alunoId });
  const store = readStore();
  const evidence = getMockEvidence({ alunoId, aula });
  const sugestaoStatus = getSuggestedStatus({ aula, evidence });
  const stored = store[key];
  const statusAtual = stored?.status ?? "PENDENTE";

  return {
    key,
    statusAtual,
    motivo: stored?.motivo ?? null,
    sugestaoStatus,
    evidence,
  };
}

export function upsertFrequencia(params: {
  cursoId: string;
  turmaId: string;
  aulaId: string;
  alunoId: string;
  status: FrequenciaStatus;
  motivo?: string | null;
  actorRole?: string | null;
  actorName?: string | null;
  overrideReason?: string | null;
}): FrequenciaStorageRecord {
  const { cursoId, turmaId, aulaId, alunoId, status, motivo } = params;
  const key = buildFrequenciaKey({ cursoId, turmaId, aulaId, alunoId });
  const store = readStore();
  const previous = store[key];
  const fromStatus = previous?.status ?? "PENDENTE";
  const fromMotivo = previous?.motivo ?? null;

  const actorRole = params.actorRole ?? null;
  const canOverride = actorRole ? OVERRIDE_ROLES.has(actorRole) : false;

  if (fromStatus !== "PENDENTE" && !canOverride) {
    throw new Error("Frequência já lançada e não pode ser alterada.");
  }

  const motivoNormalized = typeof motivo === "string" ? motivo.trim() : motivo ?? null;
  const toMotivo =
    status === "FALTA" || status === "JUSTIFICADA"
      ? motivoNormalized || null
      : null;

  if (status === "FALTA" && !toMotivo) {
    throw new Error("Informe o motivo da falta.");
  }

  const isNoop =
    fromStatus === status && (fromMotivo ?? null) === (toMotivo ?? null) && previous;
  if (isNoop) return previous;

  const nowIso = new Date().toISOString();
  const record: FrequenciaStorageRecord = {
    status,
    fonte: "MANUAL",
    marcadoEm: nowIso,
    ...(toMotivo !== undefined ? { motivo: toMotivo } : {}),
  };
  store[key] = record;
  writeStore(store);

  const historyStore = readHistoryStore();
  const entries = historyStore[key] ?? [];
  entries.push({
    fromStatus,
    toStatus: status,
    fromMotivo,
    toMotivo,
    changedAt: nowIso,
    actorRole,
    actorName: params.actorName ?? null,
    overrideReason: params.overrideReason ?? null,
  });
  historyStore[key] = entries;
  writeHistoryStore(historyStore);

  return record;
}

export function listFrequenciaHistory(ref: FrequenciaRef): FrequenciaHistoryEntry[] {
  const key = buildFrequenciaKey(ref);
  const store = readHistoryStore();
  const items = store[key] ?? [];
  return items.slice().sort((a, b) => b.changedAt.localeCompare(a.changedAt));
}
