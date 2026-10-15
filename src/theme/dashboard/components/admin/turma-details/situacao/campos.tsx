"use client";

import { AlertTriangle, BadgeCheck, CreditCard } from "lucide-react";

import type { PagamentoMatricula } from "@/api/cursos/situacao";
import { SimpleTextarea } from "@/components/ui/custom/text-area";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

/** Motivo enviado nas prévias (a API pede um motivo mesmo quando só simula) */
export const PREVIA = "Prévia da alteração";
export const MOTIVO_MINIMO = 5;

export const mensagemDoErro = (erro: unknown) =>
  erro instanceof Error && erro.message
    ? erro.message
    : "Não foi possível concluir. Tente novamente.";

export const motivoValido = (motivo: string) =>
  motivo.trim().length >= MOTIVO_MINIMO;

export function CampoMotivo({
  valor,
  onChange,
  placeholder = "Ex.: não concluiu o curso na plataforma antiga",
}: {
  valor: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const curto = valor.trim().length > 0 && !motivoValido(valor);
  return (
    <div className="space-y-1.5">
      <div className="text-sm font-medium text-gray-900">
        Motivo <span className="text-red-500">*</span>
      </div>
      <SimpleTextarea
        value={valor}
        onChange={(event) => onChange(event.target.value.slice(0, 480))}
        placeholder={placeholder}
        rows={2}
        aria-label="Motivo"
      />
      <div
        className={cn("text-xs", curto ? "text-amber-700" : "text-gray-500")}
      >
        {curto
          ? `Escreva pelo menos ${MOTIVO_MINIMO} caracteres.`
          : "Fica registrado no histórico de cada aluno."}
      </div>
    </div>
  );
}

export function CampoAvisar({
  valor,
  onChange,
  texto,
  migrada,
}: {
  valor: boolean;
  onChange: (v: boolean) => void;
  /** O que o aluno recebe */
  texto: string;
  /** Turma migrada: explica por que veio desligado */
  migrada?: boolean;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-gray-200 p-3">
      <Switch
        checked={valor}
        onCheckedChange={onChange}
        aria-label="Avisar o aluno"
        className="mt-0.5"
      />
      <span className="text-sm">
        <span className="font-medium text-gray-900">Avisar o aluno</span>
        <span className="block text-xs text-gray-500">
          {texto}
          {migrada ? " Turma migrada do sistema antigo: vem desligado." : ""}
        </span>
      </span>
    </label>
  );
}

const OPCOES_PAGAMENTO: {
  valor: PagamentoMatricula;
  titulo: string;
  texto: string;
  Icone: typeof BadgeCheck;
}[] = [
  {
    valor: "CONCEDIDO",
    titulo: "Concedido pela equipe",
    texto: "Acesso liberado na hora, sem cobrança.",
    Icone: BadgeCheck,
  },
  {
    valor: "COBRANCA_PENDENTE",
    titulo: "Cobrança pendente",
    texto:
      "A vaga fica reservada; o acesso libera quando o aluno pagar pelo site.",
    Icone: CreditCard,
  },
];

export function CampoPagamento({
  valor,
  onChange,
  semCobranca,
}: {
  valor: PagamentoMatricula | null;
  onChange: (v: PagamentoMatricula) => void;
  /** Motivo de a cobrança não estar disponível nesta turma */
  semCobranca?: string | null;
}) {
  return (
    <fieldset>
      {/* O título visível é o da etapa */}
      <legend className="sr-only">Pagamento</legend>
      <div
        role="radiogroup"
        aria-label="Pagamento"
        className="grid gap-2 sm:grid-cols-2"
      >
        {OPCOES_PAGAMENTO.map(({ valor: opcao, titulo, texto, Icone }) => {
          const bloqueada =
            opcao === "COBRANCA_PENDENTE" && Boolean(semCobranca);
          const marcada = valor === opcao;
          return (
            <button
              key={opcao}
              type="button"
              role="radio"
              aria-checked={marcada}
              disabled={bloqueada}
              onClick={() => onChange(opcao)}
              className={cn(
                "relative flex cursor-pointer items-start gap-3 rounded-xl border p-3 pr-9 text-left text-sm transition-colors disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-70",
                marcada
                  ? "border-[var(--primary-color)] bg-[var(--primary-color)]/5 ring-1 ring-[var(--primary-color)]"
                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50",
              )}
            >
              <span
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-lg",
                  marcada
                    ? "bg-[var(--primary-color)] text-white"
                    : "bg-gray-100 text-gray-500",
                )}
              >
                <Icone className="size-4" />
              </span>
              <span>
                <span className="block font-semibold text-gray-900">
                  {titulo}
                </span>
                <span
                  className={cn(
                    "mt-0.5 block text-xs leading-relaxed",
                    bloqueada ? "text-amber-700" : "text-gray-600",
                  )}
                >
                  {bloqueada ? semCobranca : texto}
                </span>
              </span>
              <span
                aria-hidden
                className={cn(
                  "absolute right-3 top-3 flex size-4 items-center justify-center rounded-full border",
                  marcada ? "border-[var(--primary-color)]" : "border-gray-300",
                )}
              >
                {marcada ? (
                  <span className="size-2 rounded-full bg-[var(--primary-color)]" />
                ) : null}
              </span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

/** Caixa com as frases de uma prévia; em âmbar quando algo pede atenção */
export function CaixaPrevia({
  frases,
  alertas = [],
  titulo,
}: {
  frases: string[];
  alertas?: string[];
  titulo?: string;
}) {
  return (
    <div className="space-y-2">
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm text-gray-800">
        {titulo ? <div className="mb-1 font-semibold">{titulo}</div> : null}
        <ul className="space-y-1 pl-4 [list-style:disc]">
          {frases.map((frase) => (
            <li key={frase}>{frase}</li>
          ))}
        </ul>
      </div>
      {alertas.length > 0 ? (
        <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50/70 p-3 text-sm text-amber-950">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600" />
          <ul className="space-y-1">
            {alertas.map((alerta) => (
              <li key={alerta}>{alerta}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

/** Lista curta de nomes ("Ana, Bia e mais 3") */
export function nomesResumidos(
  nomes: (string | null | undefined)[],
  limite = 6,
): string {
  const validos = nomes.map((nome) => nome?.trim()).filter(Boolean) as string[];
  if (validos.length <= limite) return validos.join(", ");
  return `${validos.slice(0, limite).join(", ")} e mais ${validos.length - limite}`;
}
