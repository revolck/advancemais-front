"use client";

import React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Eye } from "lucide-react";

import type { AuditoriaLog } from "@/api/auditoria/types";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TableCell, TableRow } from "@/components/ui/table";
import { AvatarCustom } from "@/components/ui/custom/avatar";
import { ButtonCustom } from "@/components/ui/custom/button";
import { cn } from "@/lib/utils";

interface HistoricoRowProps {
  log: AuditoriaLog;
  isDisabled?: boolean;
}

type ChangedField = {
  key?: string;
  label?: string;
  type?: string;
  secret?: boolean;
  before?: unknown;
  after?: unknown;
  sourceBefore?: string | null;
  sourceAfter?: string | null;
};

const getCategoriaColor = (categoria?: string) => {
  if (!categoria) return "bg-gray-100 text-gray-800 border-gray-200";

  switch (categoria) {
    case "SISTEMA":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "USUARIO":
      return "bg-green-100 text-green-800 border-green-200";
    case "EMPRESA":
      return "bg-purple-100 text-purple-800 border-purple-200";
    case "VAGA":
      return "bg-orange-100 text-orange-800 border-orange-200";
    case "CURSO":
      return "bg-indigo-100 text-indigo-800 border-indigo-200";
    case "PAGAMENTO":
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    case "SEGURANCA":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const getCategoriaLabel = (categoria?: string) => {
  if (!categoria) return "—";

  switch (categoria) {
    case "SISTEMA":
      return "Sistema";
    case "USUARIO":
      return "Usuário";
    case "EMPRESA":
      return "Empresa";
    case "VAGA":
      return "Vaga";
    case "CURSO":
      return "Curso";
    case "PAGAMENTO":
      return "Pagamento";
    case "SEGURANCA":
      return "Segurança";
    default:
      return categoria;
  }
};

const formatDate = (dateString?: string | null) => {
  if (!dateString) return "—";

  try {
    return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: ptBR });
  } catch {
    return dateString;
  }
};

const formatValue = (value: unknown) => {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "Sim" : "Não";
  if (typeof value === "string" || typeof value === "number")
    return String(value);

  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
};

const getChangedFields = (log: AuditoriaLog): ChangedField[] => {
  const maybeFields = log.meta?.changedFields;
  return Array.isArray(maybeFields) ? (maybeFields as ChangedField[]) : [];
};

const isJsonLike = (value: unknown) =>
  typeof value === "object" && value !== null && !Array.isArray(value);

function JsonBlock({ title, value }: { title: string; value: unknown }) {
  if (value === null || value === undefined) return null;

  return (
    <section className="space-y-2">
      <h4 className="text-sm font-semibold text-gray-900">{title}</h4>
      <pre className="max-h-72 overflow-auto rounded-xl bg-gray-50 p-4 text-xs leading-5 text-gray-700">
        {formatValue(value)}
      </pre>
    </section>
  );
}

export function HistoricoRow({ log, isDisabled = false }: HistoricoRowProps) {
  const [open, setOpen] = React.useState(false);
  const actorName = log.ator?.nome?.trim() || "Sistema";
  const actorRoleLabel = log.ator?.roleLabel?.trim() || "Sistema interno";
  const logIp = log.contexto?.ip ?? log.ip ?? null;
  const logDate = log.dataHora ?? log.criadoEm ?? "";
  const changedFields = getChangedFields(log);

  return (
    <>
      <TableRow
        className={cn(
          "border-gray-100 transition-colors",
          isDisabled ? "opacity-50 pointer-events-none" : "hover:bg-gray-50/50",
        )}
      >
        <TableCell className="py-4">
          <div className="min-w-0">
            <div className="max-w-[300px] truncate text-sm font-medium text-gray-900">
              {log.descricao || log.acao || "—"}
            </div>
            {log.tipo && (
              <div className="mt-0.5 max-w-[300px] truncate text-xs text-gray-500">
                {log.tipo}
              </div>
            )}
          </div>
        </TableCell>
        <TableCell className="py-4">
          {log.categoria ? (
            <Badge
              variant="outline"
              className={cn(
                "text-xs font-medium",
                getCategoriaColor(log.categoria),
              )}
            >
              {getCategoriaLabel(log.categoria)}
            </Badge>
          ) : (
            <div className="text-sm text-gray-500">—</div>
          )}
        </TableCell>
        <TableCell className="py-4">
          <div className="text-sm text-gray-900">{log.acao || "—"}</div>
        </TableCell>
        <TableCell className="py-4">
          <div className="flex items-center gap-3">
            <AvatarCustom
              name={actorName}
              src={log.ator?.avatarUrl || undefined}
              size="sm"
              showStatus={false}
            />
            <div className="min-w-0">
              <div
                className="max-w-[220px] truncate text-sm font-medium text-gray-900"
                title={actorName}
              >
                {actorName}
              </div>
              <div
                className="max-w-[220px] truncate text-xs text-gray-500"
                title={actorRoleLabel}
              >
                {actorRoleLabel}
              </div>
            </div>
          </div>
        </TableCell>
        <TableCell className="py-4">
          {logIp ? (
            <div className="font-mono text-sm text-gray-900">{logIp}</div>
          ) : (
            <div className="text-sm text-gray-500">—</div>
          )}
        </TableCell>
        <TableCell className="py-4">
          <div className="text-sm text-gray-600">{formatDate(logDate)}</div>
        </TableCell>
        <TableCell className="py-4 text-right">
          <ButtonCustom
            type="button"
            variant="outline"
            size="sm"
            withAnimation={false}
            onClick={() => setOpen(true)}
          >
            <Eye className="h-4 w-4" />
            Ver detalhes
          </ButtonCustom>
        </TableCell>
      </TableRow>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] max-w-5xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do registro de auditoria</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <section className="grid gap-4 rounded-2xl border border-gray-200 p-4 md:grid-cols-2 xl:grid-cols-3">
              <InfoItem
                label="Descrição"
                value={log.descricao || log.acao || "—"}
              />
              <InfoItem
                label="Categoria"
                value={getCategoriaLabel(log.categoria)}
              />
              <InfoItem label="Ação" value={log.acao || "—"} />
              <InfoItem label="Quem fez" value={actorName} />
              <InfoItem label="Perfil" value={actorRoleLabel} />
              <InfoItem label="Data e horário" value={formatDate(logDate)} />
              <InfoItem
                label="Entidade"
                value={log.entidade?.nomeExibicao || log.entidade?.tipo || "—"}
              />
              <InfoItem label="IP" value={logIp || "—"} />
              <InfoItem label="Origem" value={log.contexto?.origem || "—"} />
            </section>

            {changedFields.length > 0 && (
              <section className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-900">
                  O que mudou
                </h4>
                <div className="overflow-hidden rounded-2xl border border-gray-200">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
                      <tr>
                        <th className="px-4 py-3 font-medium">Campo</th>
                        <th className="px-4 py-3 font-medium">
                          Valor anterior
                        </th>
                        <th className="px-4 py-3 font-medium">Novo valor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {changedFields.map((field) => (
                        <tr
                          key={field.key || field.label}
                          className="border-t border-gray-100"
                        >
                          <td className="px-4 py-3 font-medium text-gray-900">
                            {field.label || field.key || "Campo"}
                          </td>
                          <td className="px-4 py-3 text-gray-600">
                            <span className={cn(field.secret && "font-mono")}>
                              {formatValue(field.before)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-900">
                            <span className={cn(field.secret && "font-mono")}>
                              {formatValue(field.after)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {isJsonLike(log.dadosAnteriores) && (
              <JsonBlock title="Dados anteriores" value={log.dadosAnteriores} />
            )}
            {isJsonLike(log.dadosNovos) && (
              <JsonBlock title="Dados novos" value={log.dadosNovos} />
            )}
            {isJsonLike(log.meta) && (
              <JsonBlock title="Informações extras" value={log.meta} />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </p>
      <p className="text-sm text-gray-900">{value || "—"}</p>
    </div>
  );
}
