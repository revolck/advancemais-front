"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandList,
  CommandGroup,
  CommandItem,
  CommandEmpty,
} from "@/components/ui/command";
import { Check, Loader2, Search, X } from "lucide-react";
import { apiFetch } from "@/api/client";
import { usuarioRoutes } from "@/api/routes";

type Mode = "single" | "multiple";

export interface UserSearchInputProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  label?: string;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  fullWidth?: boolean;
  size?: "sm" | "md" | "lg";
  mode?: Mode;
  value: string | string[] | null;
  onChange: (value: string | string[] | null) => void;
  roles?: string[]; // ex.: ["ADMIN", "ALUNOS_CANDIDATOS"]
  status?: string; // ex.: "ATIVO"
  pageSize?: number;
  /** Recebe os objetos completos dos usuários selecionados sempre que mudar */
  onSelectionChange?: (users: BackendUser[]) => void;
  /** Lado do popover (padrão: bottom) */
  side?: "top" | "bottom" | "left" | "right";
  sideOffset?: number;
  /**
   * Variante de renderização:
   * - 'popover': lista abre em um popover (padrão)
   * - 'inline': lista é renderizada logo abaixo do campo (útil em modais)
   */
  variant?: "popover" | "inline";
}

interface BackendUser {
  id: string | number;
  nome?: string;
  email?: string;
  codUsuario?: string | number;
}

function initialsFrom(label: string) {
  const [a = "", b = ""] = label.trim().split(/\s+/);
  return (a[0] || "").toUpperCase() + (b[0] || "").toUpperCase();
}

export function UserSearchInput({
  label,
  placeholder = "Buscar por nome, email ou código",
  error,
  disabled,
  required,
  fullWidth = true,
  size = "md",
  mode = "single",
  value,
  onChange,
  roles,
  status = "ATIVO",
  pageSize = 10,
  onSelectionChange,
  side = "bottom",
  sideOffset = 0,
  variant = "popover",
  className,
  ...rest
}: UserSearchInputProps) {
  const [open, setOpen] = React.useState(false);
  const [q, setQ] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [items, setItems] = React.useState<BackendUser[]>([]);
  const [selectedUsers, setSelectedUsers] = React.useState<Record<string, BackendUser>>({});
  const overlayOffsetPx = size === "sm" ? 40 : size === "lg" ? 56 : 48;
  const [initialized, setInitialized] = React.useState(false);

  // Debounced search
  React.useEffect(() => {
    let active = true;
    const delay = initialized ? 300 : 0;
    const handler = setTimeout(async () => {
      setLoading(true);
      try {
        const headers: Record<string, string> = { Accept: "application/json" };
        if (typeof document !== "undefined") {
          const token = document.cookie
            .split("; ")
            .find((row) => row.startsWith("token="))
            ?.split("=")[1];
          if (token) headers.Authorization = `Bearer ${token}`;
        }
        const sp = new URLSearchParams();
        sp.set("page", "1");
        sp.set("pageSize", String(pageSize));
        if (q.trim()) sp.set("search", q.trim());
        if (status) sp.set("status", status);
        if (roles && roles.length > 0) {
          // usa múltiplos parâmetros role= para maior compatibilidade
          roles.forEach((r) => sp.append("role", r));
        }
        const url = `${usuarioRoutes.admin.usuarios.list()}?${sp.toString()}`;
        const res = await apiFetch<any>(url, {
          init: { method: "GET", headers },
          cache: "no-cache",
        });
        const data: BackendUser[] = Array.isArray(res) ? res : res?.data || [];
        if (active) setItems(data);
      } catch {
        if (active) setItems([]);
      } finally {
        if (active) setLoading(false);
      }
    }, 300);
    setInitialized(true);
    return () => {
      active = false;
      clearTimeout(handler);
    };
  }, [q, roles, status, pageSize, initialized]);

  const [selectedLabel, setSelectedLabel] = React.useState<string | null>(null);
  const selectedIds = React.useMemo<string[]>(() => {
    return Array.isArray(value) ? (value as string[]) : value ? [value as string] : [];
  }, [value]);

  // Resolve labels/objects para ids já selecionados (ex.: valor vindo de fora)
  React.useEffect(() => {
    let active = true;
    (async () => {
      if (selectedIds.length === 0) {
        setSelectedUsers({});
        onSelectionChange?.([]);
        return;
      }
      const headers: Record<string, string> = { Accept: "application/json" };
      if (typeof document !== "undefined") {
        const token = document.cookie
          .split("; ")
          .find((row) => row.startsWith("token="))
          ?.split("=")[1];
        if (token) headers.Authorization = `Bearer ${token}`;
      }
      try {
        const entries = await Promise.all(
          selectedIds.map(async (id) => {
            // evita refetch se já temos
            if (selectedUsers[id]) return [id, selectedUsers[id]] as const;
            try {
              const data = await apiFetch<any>(usuarioRoutes.admin.usuarios.get(String(id)), {
                init: { method: "GET", headers },
                cache: "short",
              });
              const u: BackendUser = {
                id: String(data?.id ?? id),
                nome: data?.nome || data?.email || String(data?.codUsuario || id),
                email: data?.email,
                codUsuario: data?.codUsuario,
              };
              return [String(id), u] as const;
            } catch {
              return [String(id), { id: String(id), nome: String(id) }] as const;
            }
          })
        );
        if (!active) return;
        const map: Record<string, BackendUser> = { ...selectedUsers };
        entries.forEach(([k, v]) => (map[k] = v));
        setSelectedUsers(map);
        onSelectionChange?.(selectedIds.map((i) => map[i]).filter(Boolean) as BackendUser[]);
      } catch {
        /* ignore */
      }
    })();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIds.join(",")]);

  const container = cn("space-y-2", fullWidth && "w-full", className);

  return (
    <div className={container} {...rest}>
      {label && (
        <Label className={cn("text-sm font-medium", error && "text-destructive", required && "required")}>{label}</Label>
      )}

      {variant === "popover" ? (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              disabled={disabled}
              className={cn(
                "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground border-input flex min-w-0 items-center justify-between rounded-md border bg-transparent px-3 py-1 text-base shadow-none transition-[color,box-shadow,border-radius] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm w-full text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] cursor-pointer",
                size === "sm" && "h-10",
                size === "md" && "h-12",
                size === "lg" && "h-14",
                error && "border-destructive",
                open && "rounded-b-none border-b-0"
              )}
              aria-expanded={open}
            >
            <span className={cn("min-w-0 flex-1", selectedIds.length === 0 && "text-muted-foreground")}
              style={{ display: "flex", alignItems: "center", gap: 6, overflowX: "auto" }}
            >
              {selectedIds.length === 0 ? (
                <span className="truncate">{placeholder}</span>
              ) : mode === "single" ? (
                <span className="truncate">
                  {selectedLabel || selectedUsers[selectedIds[0]]?.nome || items.find((u) => String(u.id) === String(selectedIds[0]))?.nome || "Usuário selecionado"}
                </span>
              ) : (
                selectedIds.map((id) => {
                  const u = selectedUsers[id];
                  const text = u?.nome || String(id);
                  return (
                    <span key={id} className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground whitespace-nowrap">
                      {text}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          const next = selectedIds.filter((v) => v !== id);
                          onChange(next);
                          onSelectionChange?.(next.map((i) => selectedUsers[i]).filter(Boolean) as BackendUser[]);
                        }}
                        className="hover:text-foreground"
                        aria-label={`Remover ${text}`}
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </span>
                  );
                })
              )}
            </span>
            <Search className="ml-2 size-4 opacity-60 shrink-0" />
            </button>
          </PopoverTrigger>
          <PopoverContent
            side={side}
            sideOffset={sideOffset}
            className="z-[120] rounded-md rounded-t-none border border-t-0 border-gray-200 bg-white p-0 shadow-lg box-border"
            style={{
              width: "var(--radix-popover-trigger-width)",
              minWidth: "var(--radix-popover-trigger-width)",
              maxWidth: "none",
              marginTop: `-${overlayOffsetPx}px`,
            }}
          >
          <Command className="bg-white text-foreground [&_[cmdk-group]]:gap-1 [&_[cmdk-item]]:rounded-md [&_[data-slot=command-input-wrapper]]:border-gray-500/10">
            <CommandInput placeholder={placeholder} className="h-10" value={q} onValueChange={setQ} />
            {!loading && (
              <CommandEmpty>
                <div className="py-6 text-center text-sm text-muted-foreground">Nenhum usuário encontrado</div>
              </CommandEmpty>
            )}
            <CommandList className="max-h-72 overflow-y-auto pr-0 pb-1.5 relative" aria-busy={loading}>
              {loading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/60">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Buscando...</span>
                </div>
              )}
              <CommandGroup>
                {items.map((u) => {
                  const id = String(u.id);
                  const checked = selectedIds.includes(id);
                  const label = u.nome || u.email || String(u.codUsuario || id);
                  const subtitle = `${u.codUsuario || ""}${u.codUsuario ? " • " : ""}${u.email || ""}`;
                  return (
                    <CommandItem
                      key={id}
                      value={label}
                      onSelect={() => {
                        if (mode === "single") {
                          onChange(id);
                          setSelectedLabel(label);
                          setOpen(false);
                        } else {
                          const next = checked
                            ? selectedIds.filter((v) => v !== id)
                            : [...selectedIds, id];
                          onChange(next);
                        }
                      }}
                      className="group cursor-pointer pl-3 pr-3 py-2.5 text-sm transition-colors hover:bg-[var(--primary-color)]/6"
                    >
                      <span className="mr-3 inline-flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                        {initialsFrom(label)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="truncate">{label}</div>
                        {subtitle && <div className="truncate text-xs text-muted-foreground">{subtitle}</div>}
                      </div>
                      {checked && <Check className="ml-2 size-4 text-[var(--primary-color)]" />}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      ) : (
        <div className="rounded-md border border-gray-200 overflow-hidden">
          <Command className="bg-white text-foreground [&_[cmdk-group]]:gap-1 [&_[cmdk-item]]:rounded-md [&_[data-slot=command-input-wrapper]]:border-gray-500/10">
            <CommandInput placeholder={placeholder} className="h-11" value={q} onValueChange={setQ} />
            {!loading && (
              <CommandEmpty>
                <div className="py-6 text-center text-sm text-muted-foreground">Nenhum usuário encontrado</div>
              </CommandEmpty>
            )}
            <CommandList className="max-h-72 overflow-y-auto pr-0 pb-1.5 relative" aria-busy={loading}>
              {loading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/60">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Buscando...</span>
                </div>
              )}
              <CommandGroup>
                {items.map((u) => {
                  const id = String(u.id);
                  const checked = selectedIds.includes(id);
                  const label = u.nome || u.email || String(u.codUsuario || id);
                  const subtitle = `${u.codUsuario || ""}${u.codUsuario ? " • " : ""}${u.email || ""}`;
                  return (
                    <CommandItem
                      key={id}
                      value={label}
                      onSelect={() => {
                        if (mode === "single") {
                          onChange(id);
                          setSelectedLabel(label);
                        } else {
                          const next = checked ? selectedIds.filter((v) => v !== id) : [...selectedIds, id];
                          onChange(next);
                        }
                      }}
                      className="group cursor-pointer pl-3 pr-3 py-2.5 text-sm transition-colors hover:bg-[var(--primary-color)]/6"
                    >
                      <span className="mr-3 inline-flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                        {initialsFrom(label)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="truncate">{label}</div>
                        {subtitle && <div className="truncate text-xs text-muted-foreground">{subtitle}</div>}
                      </div>
                      {checked && <Check className="ml-2 size-4 text-[var(--primary-color)]" />}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </div>
      )}
      {error && <p className="text-[11px] leading-4 text-destructive/90">{error}</p>}
    </div>
  );
}

export default UserSearchInput;
