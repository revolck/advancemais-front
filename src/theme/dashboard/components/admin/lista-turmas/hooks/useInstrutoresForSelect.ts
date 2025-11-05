"use client";

import { useCallback, useEffect, useState } from "react";
import type { SelectOption } from "@/components/ui/custom/select/types";
import { apiFetch } from "@/api/client";
import { usuarioRoutes } from "@/api/routes";
import { apiConfig } from "@/lib/env";

function buildAuthHeaders(): Record<string, string> {
  if (typeof document === "undefined") return { Accept: apiConfig.headers.Accept };
  const token = document.cookie
    .split("; ")
    .find((row) => row.startsWith("token="))
    ?.split("=")[1];
  return token
    ? { Accept: apiConfig.headers.Accept, Authorization: `Bearer ${token}` }
    : { Accept: apiConfig.headers.Accept };
}

export function useInstrutoresForSelect() {
  const [options, setOptions] = useState<SelectOption[]>([]);
  const [raw, setRaw] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInstrutores = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const pageSize = 100;
      const sp = new URLSearchParams();
      sp.set("page", "1");
      sp.set("pageSize", String(pageSize));
      sp.set("role", "INSTRUTOR");
      sp.set("status", "ATIVO");
      const url = `${usuarioRoutes.admin.usuarios.list()}?${sp.toString()}`;
      const res = await apiFetch<any>(url, {
        init: { method: "GET", headers: buildAuthHeaders() },
        cache: "no-cache",
      });
      const data = Array.isArray(res) ? res : res?.data || [];
      const mapped = data
        .map((u: any) => ({ value: String(u.id), label: u.nome || u.email || u.codUsuario || u.id }))
        .sort((a: SelectOption, b: SelectOption) => a.label.localeCompare(b.label, "pt-BR"));
      setOptions(mapped);
      setRaw(
        data.map((u: any) => ({
          id: String(u.id),
          nome: u.nome || "—",
          email: u.email || "—",
          codUsuario: u.codUsuario || u.id,
        }))
      );
    } catch (err) {
      const status = (err as any)?.status as number | undefined;
      const msg = err instanceof Error ? err.message : String(err);
      // Evita overlay de erro no dev quando endpoint não existe
      if (status === 404 || /não encontrado|not found/i.test(msg)) {
        setError(null);
      } else {
        console.warn("Aviso: falha ao listar instrutores:", msg);
        setError(msg || "Erro ao carregar instrutores");
      }
      setOptions([]);
      setRaw([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInstrutores();
  }, [fetchInstrutores]);

  return { instrutores: options, rawInstrutores: raw, isLoading, error, refetch: fetchInstrutores };
}
