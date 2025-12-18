/**
 * API Client para Respostas de Provas
 */

import { apiFetch } from "../client";
import { apiConfig } from "@/lib/env";
import { provasRoutes } from "./routes";
import type {
  RespostaComQuestao,
  RespostasListResponse,
  ListRespostasParams,
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

/**
 * Lista respostas de uma prova
 */
export async function listRespostas(
  cursoId: string | number,
  turmaId: string,
  provaId: string,
  params?: ListRespostasParams,
  options?: {
    headers?: HeadersInit;
    cache?: "no-cache" | "short" | "medium" | "long";
  }
): Promise<RespostaComQuestao[]> {
  const url = provasRoutes.respostas.list(cursoId, turmaId, provaId);
  
  // Constrói query string
  const queryParams = new URLSearchParams();
  if (params?.questaoId) {
    queryParams.append("questaoId", params.questaoId);
  }
  if (params?.inscricaoId) {
    queryParams.append("inscricaoId", params.inscricaoId);
  }
  
  const urlWithParams = queryParams.toString() 
    ? `${url}?${queryParams.toString()}`
    : url;
  
  const response = await apiFetch<RespostasListResponse>(
    urlWithParams,
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


