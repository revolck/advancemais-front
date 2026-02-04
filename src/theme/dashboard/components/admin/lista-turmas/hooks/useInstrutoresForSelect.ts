"use client";

import { useCallback, useEffect, useState } from "react";
import type { SelectOption } from "@/components/ui/custom/select/types";
import { listUsuarios } from "@/api/usuarios";

function getTokenFromCookie(): string | undefined {
  if (typeof document === "undefined") return undefined;
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith("token="))
    ?.split("=")[1];
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
      const token = getTokenFromCookie();
      const res = await listUsuarios(
        { page: 1, pageSize: 100, role: "INSTRUTOR", status: "ATIVO" },
        token
      );

      const data: any[] = Array.isArray((res as any)?.usuarios)
        ? (res as any).usuarios
        : Array.isArray((res as any)?.data)
        ? (res as any).data
        : Array.isArray(res as any)
        ? (res as any)
        : [];

      const mapped = data
        .map((u: any) => ({
          value: String(u.id),
          label:
            u.nomeCompleto ||
            u.nome ||
            u.email ||
            u.codUsuario ||
            u.id,
        }))
        .sort((a: SelectOption, b: SelectOption) => a.label.localeCompare(b.label, "pt-BR"));
      setOptions(mapped);
      setRaw(
        data.map((u: any) => ({
          id: String(u.id),
          nome: u.nomeCompleto || u.nome || "—",
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
