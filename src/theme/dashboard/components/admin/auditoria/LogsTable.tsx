"use client";

import React, { useEffect, useMemo, useState } from "react";
import { listAuditoriaLogs } from "@/api/auditoria";
import type {
  AuditoriaLog,
  AuditoriaLogsListParams,
  AuditoriaLogsListResponse,
} from "@/api/auditoria";

type Props = {
  initialFilters?: AuditoriaLogsListParams;
};

export function LogsTable({ initialFilters }: Props) {
  const [data, setData] = useState<AuditoriaLog[]>([]);
  const [page, setPage] = useState(initialFilters?.page ?? 1);
  const [pageSize, setPageSize] = useState(initialFilters?.pageSize ?? 20);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<AuditoriaLogsListParams>({
    ...initialFilters,
    page,
    pageSize,
  });

  const totalPages = useMemo(
    () => (pageSize > 0 ? Math.max(1, Math.ceil(total / pageSize)) : 1),
    [total, pageSize],
  );

  useEffect(() => {
    let active = true;
    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const res: AuditoriaLogsListResponse = await listAuditoriaLogs({
          ...filters,
          page,
          pageSize,
        });
        if (!active) return;
        setData(res.items ?? []);
        setTotal(res.total ?? 0);
      } catch (err) {
        if (!active) return;
        setError((err as any)?.message ?? "Erro ao carregar logs");
      } finally {
        if (active) setIsLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [filters, page, pageSize]);

  return (
    <div className="flex flex-col gap-4">
      <header className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col">
          <label className="text-xs text-muted-foreground">Categoria</label>
          <input
            className="h-9 rounded-md border px-2"
            placeholder="USUARIO, SISTEMA..."
            defaultValue={filters.categoria ?? ""}
            onChange={(e) =>
              setFilters((f) => ({ ...f, categoria: e.target.value || undefined }))
            }
          />
        </div>
        <div className="flex flex-col">
          <label className="text-xs text-muted-foreground">Tipo</label>
          <input
            className="h-9 rounded-md border px-2"
            placeholder="LOGIN, ERRO..."
            defaultValue={filters.tipo ?? ""}
            onChange={(e) =>
              setFilters((f) => ({ ...f, tipo: e.target.value || undefined }))
            }
          />
        </div>
        <div className="flex flex-col">
          <label className="text-xs text-muted-foreground">Usuário</label>
          <input
            className="h-9 rounded-md border px-2"
            placeholder="usuarioId"
            defaultValue={filters.usuarioId ?? ""}
            onChange={(e) =>
              setFilters((f) => ({ ...f, usuarioId: e.target.value || undefined }))
            }
          />
        </div>
        <div className="flex flex-col">
          <label className="text-xs text-muted-foreground">Busca</label>
          <input
            className="h-9 rounded-md border px-2"
            placeholder="termo de busca"
            defaultValue={filters.search ?? ""}
            onChange={(e) =>
              setFilters((f) => ({ ...f, search: e.target.value || undefined }))
            }
          />
        </div>
      </header>

      <div className="rounded-md border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50 text-left">
              <th className="p-2">ID</th>
              <th className="p-2">Categoria</th>
              <th className="p-2">Tipo</th>
              <th className="p-2">Ação</th>
              <th className="p-2">Usuário</th>
              <th className="p-2">Data</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={6} className="p-4 text-center text-muted-foreground">
                  Carregando...
                </td>
              </tr>
            )}
            {!isLoading && error && (
              <tr>
                <td colSpan={6} className="p-4 text-center text-red-500">
                  {error}
                </td>
              </tr>
            )}
            {!isLoading && !error && data.length === 0 && (
              <tr>
                <td colSpan={6} className="p-4 text-center text-muted-foreground">
                  Nenhum registro encontrado.
                </td>
              </tr>
            )}
            {!isLoading && !error &&
              data.map((log) => (
                <tr key={log.id} className="border-t">
                  <td className="p-2 font-mono text-xs">{log.id}</td>
                  <td className="p-2">{log.categoria}</td>
                  <td className="p-2">{log.tipo}</td>
                  <td className="p-2">{log.acao}</td>
                  <td className="p-2 font-mono text-xs">{log.usuarioId ?? '-'}</td>
                  <td className="p-2">{new Date(log.criadoEm).toLocaleString()}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <footer className="flex items-center justify-between gap-3">
        <div className="text-sm text-muted-foreground">
          Página {page} de {totalPages} — {total} registros
        </div>
        <div className="flex items-center gap-2">
          <button
            className="rounded-md border px-3 py-1 text-sm disabled:opacity-50"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1 || isLoading}
          >
            Anterior
          </button>
          <button
            className="rounded-md border px-3 py-1 text-sm disabled:opacity-50"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages || isLoading}
          >
            Próxima
          </button>
          <select
            className="rounded-md border px-2 py-1 text-sm"
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            disabled={isLoading}
          >
            {[10, 20, 50, 100].map((n) => (
              <option key={n} value={n}>
                {n}/página
              </option>
            ))}
          </select>
        </div>
      </footer>
    </div>
  );
}

export default LogsTable;

