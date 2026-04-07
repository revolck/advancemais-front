"use client";

import { useCallback, useEffect, useState } from "react";
import type { SelectOption } from "@/components/ui/custom/select/types";
import { listInstrutores } from "@/api/usuarios";
import { UserRole } from "@/config/roles";
import { useUserRole } from "@/hooks/useUserRole";

export function useInstrutoresForSelect() {
  const userRole = useUserRole();
  const [options, setOptions] = useState<SelectOption[]>([]);
  const [raw, setRaw] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const canLoadInstrutores =
    userRole != null &&
    [UserRole.ADMIN, UserRole.MODERADOR, UserRole.PEDAGOGICO].includes(
      userRole
    );

  const fetchInstrutores = useCallback(async () => {
    if (!canLoadInstrutores) {
      setOptions([]);
      setRaw([]);
      setError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const res = await listInstrutores({ limit: 100, status: "ATIVO" });
      const data: any[] = Array.isArray(res?.data) ? res.data : [];

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
  }, [canLoadInstrutores]);

  useEffect(() => {
    void fetchInstrutores();
  }, [fetchInstrutores]);

  return { instrutores: options, rawInstrutores: raw, isLoading, error, refetch: fetchInstrutores };
}
