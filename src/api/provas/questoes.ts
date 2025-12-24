/**
 * API Client para Questões de Provas
 */

import { apiFetch } from "../client";
import { apiConfig } from "@/lib/env";
import { provasRoutes } from "./routes";
import type {
  Questao,
  QuestoesListResponse,
  QuestaoResponse,
  CreateQuestaoPayload,
  UpdateQuestaoPayload,
  ResponderQuestaoPayload,
  CorrigirRespostaPayload,
  RespostaResponse,
} from "./types";

function normalizeHeaders(headers?: HeadersInit): Record<string, string> {
  if (!headers) return {};
  if (headers instanceof Headers) return Object.fromEntries(headers.entries());
  if (Array.isArray(headers)) return Object.fromEntries(headers);
  return headers as Record<string, string>;
}

function getAuthHeader(): Record<string, string> {
  if (typeof document === "undefined") return {};
  const token = document.cookie
    .split("; ")
    .find((row) => row.startsWith("token="))
    ?.split("=")[1];
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function buildHeaders(
  additional?: HeadersInit,
  auth = true
): Record<string, string> {
  return {
    Accept: apiConfig.headers.Accept,
    "Content-Type": "application/json",
    ...(auth ? getAuthHeader() : {}),
    ...normalizeHeaders(additional),
  };
}

const JSON_HEADERS = { "Content-Type": "application/json" };

/**
 * Lista todas as questões de uma prova
 */
export async function listQuestoes(
  cursoId: string | number,
  turmaId: string,
  provaId: string,
  options?: {
    headers?: HeadersInit;
    cache?: "no-cache" | "short" | "medium" | "long";
  }
): Promise<Questao[]> {
  const url = provasRoutes.questoes.list(cursoId, turmaId, provaId);
  const response = await apiFetch<QuestoesListResponse>(
    url,
    {
      init: {
        method: "GET",
        headers: buildHeaders(options?.headers),
      },
      cache: options?.cache || "short",
    }
  );
  return response.data || [];
}

/**
 * Busca uma questão específica
 */
export async function getQuestaoById(
  cursoId: string | number,
  turmaId: string,
  provaId: string,
  questaoId: string,
  options?: {
    headers?: HeadersInit;
    cache?: "no-cache" | "short" | "medium" | "long";
  }
): Promise<Questao> {
  const url = provasRoutes.questoes.get(cursoId, turmaId, provaId, questaoId);
  const response = await apiFetch<QuestaoResponse>(
    url,
    {
      init: {
        method: "GET",
        headers: buildHeaders(options?.headers),
      },
      cache: options?.cache || "short",
    }
  );
  return response.data;
}

/**
 * Cria uma nova questão
 */
export async function createQuestao(
  cursoId: string | number,
  turmaId: string,
  provaId: string,
  payload: CreateQuestaoPayload,
  options?: {
    headers?: HeadersInit;
  }
): Promise<Questao> {
  const url = provasRoutes.questoes.create(cursoId, turmaId, provaId);
  const response = await apiFetch<QuestaoResponse>(
    url,
    {
      init: {
        method: "POST",
        body: JSON.stringify(payload),
        headers: buildHeaders(options?.headers, true),
      },
      cache: "no-cache",
    }
  );
  return response.data;
}

/**
 * Atualiza uma questão existente
 */
export async function updateQuestao(
  cursoId: string | number,
  turmaId: string,
  provaId: string,
  questaoId: string,
  payload: UpdateQuestaoPayload,
  options?: {
    headers?: HeadersInit;
  }
): Promise<Questao> {
  const url = provasRoutes.questoes.update(cursoId, turmaId, provaId, questaoId);
  const response = await apiFetch<QuestaoResponse>(
    url,
    {
      init: {
        method: "PUT",
        body: JSON.stringify(payload),
        headers: buildHeaders(options?.headers, true),
      },
      cache: "no-cache",
    }
  );
  return response.data;
}

/**
 * Remove uma questão
 */
export async function deleteQuestao(
  cursoId: string | number,
  turmaId: string,
  provaId: string,
  questaoId: string,
  options?: {
    headers?: HeadersInit;
  }
): Promise<{ success: boolean }> {
  const url = provasRoutes.questoes.delete(cursoId, turmaId, provaId, questaoId);
  return await apiFetch<{ success: boolean }>(
    url,
    {
      init: {
        method: "DELETE",
        headers: buildHeaders(options?.headers, true),
      },
      cache: "no-cache",
    }
  );
}

/**
 * Responde uma questão (aluno)
 */
export async function responderQuestao(
  cursoId: string | number,
  turmaId: string,
  provaId: string,
  questaoId: string,
  payload: ResponderQuestaoPayload,
  options?: {
    headers?: HeadersInit;
  }
): Promise<RespostaResponse["data"]> {
  const url = provasRoutes.questoes.responder(cursoId, turmaId, provaId, questaoId);
  const response = await apiFetch<RespostaResponse>(
    url,
    {
      init: {
        method: "PUT",
        body: JSON.stringify(payload),
        headers: buildHeaders(options?.headers, true),
      },
      cache: "no-cache",
    }
  );
  return response.data;
}

/**
 * Corrige uma resposta (instrutor)
 */
export async function corrigirResposta(
  cursoId: string | number,
  turmaId: string,
  provaId: string,
  questaoId: string,
  payload: CorrigirRespostaPayload,
  options?: {
    headers?: HeadersInit;
  }
): Promise<RespostaResponse["data"]> {
  const url = provasRoutes.questoes.corrigir(cursoId, turmaId, provaId, questaoId);
  const response = await apiFetch<RespostaResponse>(
    url,
    {
      init: {
        method: "PUT",
        body: JSON.stringify(payload),
        headers: buildHeaders(options?.headers, true),
      },
      cache: "no-cache",
    }
  );
  return response.data;
}




