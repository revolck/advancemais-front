"use client";

import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  CheckCircle2,
  EyeOff,
  FilePlus2,
  PencilLine,
  Send,
  Trash2,
  Undo2,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { EmptyState } from "@/components/ui/custom";
import { Skeleton } from "@/components/ui/skeleton";
import { getHistoricoVaga } from "@/api/vagas/admin";
import type { EntradaHistoricoVaga } from "@/api/vagas/admin/types";
import { cn } from "@/lib/utils";
import { formatVagaStatus, getVagaStatusBadgeClasses } from "../utils";

export const historicoVagaQueryKey = (vagaId: string) =>
  ["vaga-historico", vagaId] as const;

const ACOES: Record<string, { titulo: string; icone: LucideIcon; cor: string }> = {
  VAGA_CRIADA: { titulo: "Vaga criada", icone: FilePlus2, cor: "bg-sky-50 text-sky-600" },
  VAGA_EDITADA: { titulo: "Vaga editada", icone: PencilLine, cor: "bg-slate-100 text-slate-600" },
  VAGA_ENVIADA_PARA_ANALISE: {
    titulo: "Enviada para aprovação",
    icone: Send,
    cor: "bg-amber-50 text-amber-600",
  },
  VAGA_APROVADA: {
    titulo: "Aprovada e publicada",
    icone: CheckCircle2,
    cor: "bg-emerald-50 text-emerald-600",
  },
  VAGA_REJEITADA: { titulo: "Rejeitada", icone: XCircle, cor: "bg-red-50 text-red-600" },
  VAGA_DESPUBLICADA: { titulo: "Despublicada", icone: EyeOff, cor: "bg-orange-50 text-orange-600" },
  VAGA_ENVIO_CANCELADO: {
    titulo: "Envio para aprovação cancelado",
    icone: Undo2,
    cor: "bg-slate-100 text-slate-600",
  },
  VAGA_EXCLUIDA: { titulo: "Vaga excluída", icone: Trash2, cor: "bg-red-50 text-red-600" },
};

const PAPEIS: Record<string, string> = {
  ADMIN: "Administrador",
  MODERADOR: "Moderador",
  SETOR_DE_VAGAS: "Setor de vagas",
  EMPRESA: "Empresa",
  RECRUTADOR: "Recrutador",
};

const dataHora = (iso: string) =>
  new Date(iso).toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

function SeloStatus({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
        getVagaStatusBadgeClasses(status),
      )}
    >
      {formatVagaStatus(status)}
    </span>
  );
}

function Autor({ entrada }: { entrada: EntradaHistoricoVaga }) {
  if (!entrada.autor) {
    return (
      <span className="text-gray-400">
        Autor não registrado (antes do histórico da vaga)
      </span>
    );
  }
  const papel = PAPEIS[entrada.autor.papel];
  return (
    <span>
      por <span className="font-medium text-gray-700">{entrada.autor.nome}</span>
      {papel && papel !== entrada.autor.nome ? ` · ${papel}` : ""}
    </span>
  );
}

function ItemHistorico({
  entrada,
  ultimo,
}: {
  entrada: EntradaHistoricoVaga;
  ultimo: boolean;
}) {
  const acao = ACOES[entrada.acao] ?? {
    titulo: entrada.descricao,
    icone: PencilLine,
    cor: "bg-slate-100 text-slate-600",
  };
  const Icone = acao.icone;
  const mudouStatus = entrada.de && entrada.para && entrada.de !== entrada.para;

  return (
    <li className="relative flex gap-4 pb-6">
      {!ultimo && (
        <span
          className="absolute left-5 top-11 -bottom-1 w-px bg-gray-200"
          aria-hidden="true"
        />
      )}
      <span
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
          acao.cor,
        )}
      >
        <Icone className="h-5 w-5" aria-hidden="true" />
      </span>

      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
          <p className="!mb-0 font-semibold text-gray-900">{acao.titulo}</p>
          <time
            dateTime={entrada.criadoEm}
            className="shrink-0 text-xs text-gray-500"
          >
            {dataHora(entrada.criadoEm)}
          </time>
        </div>

        {entrada.descricao && entrada.descricao !== acao.titulo && (
          <p className="!mb-0 !text-sm text-gray-600">{entrada.descricao}</p>
        )}

        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
          <Autor entrada={entrada} />
          {mudouStatus && (
            <span className="flex items-center gap-1.5">
              <SeloStatus status={entrada.de!} />
              <ArrowRight className="h-3 w-3" aria-hidden="true" />
              <SeloStatus status={entrada.para!} />
            </span>
          )}
        </div>

        {entrada.detalhes.motivoRejeicao && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2">
            <p className="!mb-0 !text-xs font-semibold text-red-800">
              Motivo da rejeição
            </p>
            <p className="!mb-0 !text-sm text-red-900 whitespace-pre-line">
              {entrada.detalhes.motivoRejeicao}
            </p>
          </div>
        )}
        {entrada.detalhes.observacoes && (
          <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">
            <p className="!mb-0 !text-xs font-semibold text-gray-700">
              Observações do setor de vagas
            </p>
            <p className="!mb-0 !text-sm text-gray-800 whitespace-pre-line">
              {entrada.detalhes.observacoes}
            </p>
          </div>
        )}
      </div>
    </li>
  );
}

/** Linha do tempo da vaga: quem criou, enviou, aprovou, rejeitou, despublicou ou editou */
export function HistoricoTab({ vagaId }: { vagaId: string }) {
  const { data, status, error } = useQuery({
    queryKey: historicoVagaQueryKey(vagaId),
    queryFn: () => getHistoricoVaga(vagaId),
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });

  return (
    <div className="space-y-6">
      <div>
        <h5 className="!mb-0">Histórico</h5>
        <p>Tudo o que aconteceu com esta vaga, do mais recente para o mais antigo.</p>
      </div>

      {status === "pending" && (
        <div className="space-y-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="h-10 w-10 rounded-full bg-gray-200" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-48 bg-gray-200" />
                <Skeleton className="h-3 w-72 bg-gray-200" />
              </div>
            </div>
          ))}
        </div>
      )}

      {status === "error" && (
        <Alert variant="destructive">
          <AlertDescription>
            {error instanceof Error && error.message
              ? error.message
              : "Não foi possível carregar o histórico da vaga."}
          </AlertDescription>
        </Alert>
      )}

      {status === "success" && data.length === 0 && (
        <EmptyState
          illustration="companyDetails"
          illustrationAlt="Ilustração de histórico vazio"
          title="Sem histórico"
          description="Nenhuma ação foi registrada nesta vaga ainda."
          maxContentWidth="md"
        />
      )}

      {status === "success" && data.length > 0 && (
        <ol className="max-w-3xl">
          {data.map((entrada, i) => (
            <ItemHistorico
              key={entrada.id}
              entrada={entrada}
              ultimo={i === data.length - 1}
            />
          ))}
        </ol>
      )}
    </div>
  );
}
