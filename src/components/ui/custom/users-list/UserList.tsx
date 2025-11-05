"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { InputCustom } from "@/components/ui/custom/input";
import { ButtonCustom } from "@/components/ui/custom/button";
import { Table, TableBody, TableHeader, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/radix-checkbox";
import { Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { apiFetch } from "@/api/client";
import { usuarioRoutes } from "@/api/routes";

type Mode = "single" | "multiple";

export interface UserListProps {
  roles?: string[];
  status?: string;
  pageSize?: number;
  mode?: Mode;
  value: string | string[] | null;
  onChange: (value: string | string[] | null) => void;
  onSelectionChange?: (users: BackendUser[]) => void;
  className?: string;
}

export interface BackendUser {
  id: string | number;
  nome?: string;
  email?: string;
  codUsuario?: string | number;
}

function buildHeaders() {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (typeof document !== "undefined") {
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1];
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

export function UserList({
  roles,
  status = "ATIVO",
  pageSize = 8,
  mode = "multiple",
  value,
  onChange,
  onSelectionChange,
  className,
}: UserListProps) {
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [loading, setLoading] = React.useState(true);
  const [items, setItems] = React.useState<BackendUser[]>([]);
  const [total, setTotal] = React.useState<number | null>(null);
  const selectedIds = React.useMemo<string[]>(() => {
    return Array.isArray(value) ? (value as string[]) : value ? [value as string] : [];
  }, [value]);
  const [selectedUsers, setSelectedUsers] = React.useState<Record<string, BackendUser>>({});

  const fetchUsers = React.useCallback(async () => {
    setLoading(true);
    try {
      const sp = new URLSearchParams();
      sp.set("page", String(page));
      sp.set("pageSize", String(pageSize));
      if (search.trim()) sp.set("search", search.trim());
      if (status) sp.set("status", status);
      if (roles && roles.length > 0) roles.forEach((r) => sp.append("role", r));
      const url = `${usuarioRoutes.admin.usuarios.list()}?${sp.toString()}`;
      const res = await apiFetch<any>(url, { init: { method: "GET", headers: buildHeaders() }, cache: "no-cache" });
      const data = Array.isArray(res) ? res : res?.data || [];
      setItems(data);
      const totalFromRes = (Array.isArray(res) ? null : res?.pagination?.total) ?? null;
      if (typeof totalFromRes === "number") setTotal(totalFromRes);
      // atualiza objetos selecionados presentes nesta página
      const map = { ...selectedUsers };
      data.forEach((u: BackendUser) => {
        const id = String(u.id);
        if (selectedIds.includes(id)) map[id] = u;
      });
      setSelectedUsers(map);
      onSelectionChange?.(selectedIds.map((id) => map[id]).filter(Boolean) as BackendUser[]);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, status, roles, selectedIds, onSelectionChange, selectedUsers]);

  React.useEffect(() => {
    const t = setTimeout(fetchUsers, 200);
    return () => clearTimeout(t);
  }, [fetchUsers]);

  const totalPages = React.useMemo(() => {
    if (!total) return null;
    return Math.max(1, Math.ceil(total / pageSize));
  }, [total, pageSize]);

  function toggle(id: string, user: BackendUser) {
    if (mode === "single") {
      onChange(id);
      setSelectedUsers((m) => ({ ...m, [id]: user }));
      onSelectionChange?.([user]);
      return;
    }
    const exists = selectedIds.includes(id);
    const next = exists ? selectedIds.filter((v) => v !== id) : [...selectedIds, id];
    onChange(next);
    const merged = { ...selectedUsers, [id]: user };
    setSelectedUsers(merged);
    onSelectionChange?.(next.map((i) => merged[i]).filter(Boolean) as BackendUser[]);
  }

  const currentPageIds = React.useMemo(() => items.map((u) => String(u.id)), [items]);
  const allPageSelected = React.useMemo(
    () => currentPageIds.length > 0 && currentPageIds.every((id) => selectedIds.includes(id)),
    [currentPageIds, selectedIds],
  );

  function toggleSelectAllPage(next: boolean) {
    if (currentPageIds.length === 0) return;
    if (mode === "single") {
      // Em modo single, selecionar todos não faz sentido; seleciona apenas o primeiro
      const first = currentPageIds[0];
      onChange(next ? first : null);
      const u = items.find((i) => String(i.id) === first);
      if (u) onSelectionChange?.([u]);
      return;
    }
    if (next) {
      const merged = Array.from(new Set([...selectedIds, ...currentPageIds]));
      onChange(merged);
      const map = { ...selectedUsers };
      items.forEach((u) => (map[String(u.id)] = u));
      setSelectedUsers(map);
      onSelectionChange?.(merged.map((i) => map[i]).filter(Boolean) as BackendUser[]);
    } else {
      const filtered = selectedIds.filter((id) => !currentPageIds.includes(id));
      onChange(filtered);
      onSelectionChange?.(filtered.map((i) => selectedUsers[i]).filter(Boolean) as BackendUser[]);
    }
  }

  const canPrev = !loading && items.length > 0 && page > 1;
  const canNext = !loading && items.length > 0 && (totalPages ? page < totalPages : items.length === pageSize);

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center gap-2">
        <InputCustom
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Buscar por nome, email ou código"
        />
      </div>
      <div className="flex items-center justify-between text-xs text-gray-600">
        {selectedIds.length > 0 ? (
          <span>
            {selectedIds.length} selecionado{selectedIds.length > 1 ? "s" : ""}
          </span>
        ) : <span />}
        {selectedIds.length > 0 && (
          <ButtonCustom
            size="sm"
            variant="ghost"
            onClick={() => {
              if (mode === "single") {
                onChange(null);
                onSelectionChange?.([]);
              } else {
                onChange([]);
                onSelectionChange?.([]);
              }
            }}
          >
            Limpar seleção
          </ButtonCustom>
        )}
      </div>
      <div className="relative bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <Table className="min-w-[760px] divide-y divide-gray-100">
            <TableHeader>
              <TableRow className="border-gray-200 bg-gray-50/50">
                <TableHead className="w-8">
                  <div onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={allPageSelected}
                      disabled={items.length === 0}
                      onCheckedChange={(v) => toggleSelectAllPage(v === true)}
                    />
                  </div>
                </TableHead>
                <TableHead className="font-medium text-gray-700 py-3">Nome</TableHead>
                <TableHead className="font-medium text-gray-700">Email</TableHead>
                <TableHead className="font-medium text-gray-700">Código</TableHead>
                <TableHead className="font-medium text-gray-700 text-right w-32">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && (
                <>
                  {Array.from({ length: Math.min(pageSize, 6) }).map((_, i) => (
                    <TableRow key={`sk-${i}`} className="border-gray-100 hover:bg-transparent">
                      <TableCell className="py-3">
                        <Skeleton className="h-4 w-4 rounded-full bg-gray-200" />
                      </TableCell>
                      <TableCell className="py-3">
                        <Skeleton className="h-3 w-48 rounded-md bg-gray-200" />
                      </TableCell>
                      <TableCell className="py-3">
                        <Skeleton className="h-3 w-64 rounded-md bg-gray-200" />
                      </TableCell>
                      <TableCell className="py-3">
                        <Skeleton className="h-3 w-24 rounded-md bg-gray-200" />
                      </TableCell>
                      <TableCell className="py-3 text-right pr-4">
                        <Skeleton className="h-6 w-20 rounded-md bg-gray-200 ml-auto" />
                      </TableCell>
                    </TableRow>
                  ))}
                </>
              )}
              {!loading && items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-sm text-gray-500 py-10">Nenhum usuário encontrado</TableCell>
                </TableRow>
              )}
              {!loading && items.map((u) => {
                const id = String(u.id);
                const checked = selectedIds.includes(id);
                return (
                  <TableRow key={id} className="cursor-pointer hover:bg-muted/40 border-gray-100" onClick={() => toggle(id, u)}>
                    <TableCell className="py-3" onClick={(e) => e.stopPropagation()}>
                      <Checkbox checked={checked} onCheckedChange={() => toggle(id, u)} className="translate-y-[1px]" />
                    </TableCell>
                    <TableCell className="py-3 font-medium truncate">{u.nome || u.email || u.codUsuario || id}</TableCell>
                    <TableCell className="py-3 truncate text-gray-600">{u.email || "—"}</TableCell>
                    <TableCell className="py-3 truncate text-gray-600">{String(u.codUsuario || "—")}</TableCell>
                    <TableCell className="py-2 pr-4 text-right">
                      {checked ? (
                        <ButtonCustom
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggle(id, u);
                          }}
                        >
                          Remover
                        </ButtonCustom>
                      ) : (
                        <ButtonCustom
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggle(id, u);
                          }}
                        >
                          Adicionar
                        </ButtonCustom>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
      <div className="flex items-center justify-between pt-1">
        <div className="text-xs text-gray-500">Página {page}{totalPages ? ` de ${totalPages}` : ""}</div>
        <div className="flex gap-2">
          <ButtonCustom size="sm" variant="outline" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={!canPrev}>Anterior</ButtonCustom>
          <ButtonCustom size="sm" variant="outline" onClick={() => setPage((p) => (totalPages ? Math.min(totalPages, p + 1) : p + 1))} disabled={!canNext}>Próxima</ButtonCustom>
        </div>
      </div>
    </div>
  );
}

export default UserList;
