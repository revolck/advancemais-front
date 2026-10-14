"use client";

import React from "react";
import {
  BadgeCheck,
  Building2,
  CalendarClock,
  CheckCircle2,
  CreditCard,
  FileText,
  Gift,
  Info,
  RefreshCcw,
  Sparkles,
  UserPlus,
} from "lucide-react";

import {
  aplicarBonificacaoInauguracao,
  getPreviaBonificacaoInauguracao,
  type PreviaBonificacaoInauguracao,
} from "@/api/empresas/bonificacao";
import { ButtonCustom } from "@/components/ui/custom";
import {
  ModalBody,
  ModalContentWrapper,
  ModalCustom,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/custom/modal";
import { Skeleton } from "@/components/ui/skeleton";
import { toastCustom } from "@/components/ui/custom/toast";
import { cn } from "@/lib/utils";
import { prazoCampanha } from "./comunicado.utils";

const numero = (valor: number) => valor.toLocaleString("pt-BR");
const data = (iso: string) =>
  new Date(iso).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });
const cnpjFormatado = (cnpj: string) => {
  const d = cnpj.replace(/\D/g, "");
  return d.length === 14
    ? d.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5")
    : cnpj;
};
const dataPorExtenso = (iso: string) =>
  new Date(iso).toLocaleDateString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "numeric",
    month: "long",
  });

/** Admin: prévia e aplicação do mês grátis de inauguração para as empresas */
export function BonificacaoInauguracaoAdminCard() {
  const [previa, setPrevia] = React.useState<PreviaBonificacaoInauguracao | null>(
    null
  );
  const [carregando, setCarregando] = React.useState(true);
  const [aplicando, setAplicando] = React.useState(false);
  const [confirmar, setConfirmar] = React.useState(false);

  const carregar = React.useCallback(async () => {
    try {
      setPrevia((await getPreviaBonificacaoInauguracao()).data);
    } catch (error) {
      toastCustom.error({
        title: "Prévia indisponível",
        description: error instanceof Error ? error.message : "Tente novamente.",
      });
    } finally {
      setCarregando(false);
    }
  }, []);

  React.useEffect(() => {
    void carregar();
  }, [carregar]);

  const aplicar = async () => {
    setAplicando(true);
    try {
      const { data: r } = await aplicarBonificacaoInauguracao();
      toastCustom.success({
        title: "Bonificação aplicada",
        description: `${numero(r.criadas)} empresa(s) receberam 1 mês grátis do plano ${r.plano}${
          r.convertidas
            ? ` e ${numero(r.convertidas)} empresa(s) que já tinham 1 mês grátis do admin entraram na bonificação`
            : ""
        }. Válido até ${data(r.validoAte)}.`,
      });
      setConfirmar(false);
      await carregar();
    } catch (error) {
      toastCustom.error({
        title: "Não foi possível aplicar",
        description: error instanceof Error ? error.message : "Tente novamente.",
      });
    } finally {
      setAplicando(false);
    }
  };

  if (carregando) {
    return (
      <div className="flex flex-col gap-4" aria-busy="true">
        <Skeleton className="h-52 w-full rounded-2xl" />
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }
  if (!previa) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-gray-200 bg-white py-10 text-center">
        <Info className="size-8 text-amber-500" />
        <div className="text-sm text-gray-600">
          Não foi possível carregar a bonificação das empresas.
        </div>
        <ButtonCustom variant="outline" size="sm" onClick={() => void carregar()}>
          Tentar de novo
        </ButtonCustom>
      </div>
    );
  }

  const pendentes = previa.elegiveis + previa.concessoesAdminParaConverter;
  const prazo = prazoCampanha(previa.inicio, previa.validoAte);
  const encerrada = previa.encerrada || prazo.encerrada;
  const vagas = previa.plano?.quantidadeVagas;

  const indicadores = [
    {
      rotulo: "Com a bonificação",
      valor: previa.jaBonificadas,
      detalhe: `1 mês grátis até ${data(previa.validoAte)}`,
      Icone: BadgeCheck,
      cor: "bg-emerald-50 text-emerald-600",
    },
    {
      rotulo: "Vão receber agora",
      valor: previa.elegiveis,
      detalhe: "Empresas novas, sem plano ativo",
      Icone: UserPlus,
      cor: "bg-sky-50 text-sky-600",
      destaque: previa.elegiveis > 0,
    },
    {
      rotulo: "Mês grátis do admin a ajustar",
      valor: previa.concessoesAdminParaConverter,
      detalhe: "Entram no mesmo prazo, sem cobrança",
      Icone: RefreshCcw,
      cor: "bg-amber-50 text-amber-600",
      destaque: previa.concessoesAdminParaConverter > 0,
    },
    {
      rotulo: "Com plano próprio",
      valor: previa.comPlanoAtivo,
      detalhe: "Plano mantido, sem alteração",
      Icone: CreditCard,
      cor: "bg-slate-100 text-slate-600",
    },
  ];

  const passos = [
    {
      Icone: Sparkles,
      titulo: "Boas-vindas com o presente",
      texto:
        "Ao entrar, a empresa é recebida pelo assistente, vê o mês grátis e pode fazer o tour da plataforma.",
    },
    {
      Icone: FileText,
      titulo: `Publica até ${vagas ?? "—"} vaga(s) sem custo`,
      texto: `Tudo liberado no plano ${previa.plano?.nome ?? "—"} até ${data(previa.validoAte)}.`,
    },
    {
      Icone: CalendarClock,
      titulo: "Fim do prazo",
      texto:
        "As vagas voltam para rascunho e a empresa recebe o aviso para contratar um plano e continuar.",
    },
  ];

  return (
    <div className="flex flex-col gap-4 sm:gap-5">
      {/* Destaque da campanha */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--primary-color)] via-[#00257d] to-[#0b3fa8] p-5 text-white sm:p-7">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-white/10 blur-2xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-20 right-24 size-40 rounded-full bg-sky-300/20 blur-2xl"
        />

        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/20">
              <Gift className="size-6" />
            </span>
            <div className="min-w-0">
              <span className="text-xs font-semibold uppercase tracking-wider text-white/70">
                Inauguração · Empresas
              </span>
              <div className="mt-1 text-xl font-bold leading-tight sm:text-2xl">
                1 mês grátis do plano {previa.plano?.nome ?? "—"}
              </div>
              <div className="mt-1.5 text-sm text-white/80">
                {vagas ? `Até ${vagas} vaga(s) publicadas por empresa · ` : ""}
                de {data(previa.inicio)} a {data(previa.validoAte)}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center lg:flex-col lg:items-end">
            {pendentes === 0 ? (
              <span className="inline-flex items-center justify-center gap-1.5 rounded-full bg-emerald-400/15 px-3 py-1.5 text-sm font-medium text-emerald-100 ring-1 ring-inset ring-emerald-300/30">
                <CheckCircle2 className="size-4" />
                Tudo aplicado
              </span>
            ) : (
              <ButtonCustom
                variant="default"
                size="md"
                className="!bg-white !text-[var(--primary-color)] hover:!bg-white/90"
                disabled={encerrada || !previa.plano}
                onClick={() => setConfirmar(true)}
              >
                <Gift className="size-4" />
                Aplicar para {numero(pendentes)} empresa(s)
              </ButtonCustom>
            )}
            {!encerrada && pendentes === 0 ? (
              <span className="text-center text-xs text-white/60 lg:text-right">
                Empresas novas aparecem aqui para aplicar
              </span>
            ) : null}
          </div>
        </div>

        <div className="relative mt-6">
          <div className="flex items-center justify-between text-xs text-white/75">
            <span>{data(previa.inicio)}</span>
            <span className="font-semibold text-white">
              {encerrada
                ? "Campanha encerrada"
                : prazo.faltam === 0
                  ? "Último dia"
                  : `Faltam ${prazo.faltam} dia(s)`}
            </span>
            <span>{data(previa.validoAte)}</span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/15">
            <div
              className="h-full rounded-full bg-white transition-all"
              style={{ width: `${encerrada ? 100 : Math.max(2, prazo.percentual)}%` }}
            />
          </div>
        </div>
      </section>

      {/* Números */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3 xl:grid-cols-4">
        {indicadores.map(({ rotulo, valor, detalhe, Icone, cor, destaque }) => (
          <div
            key={rotulo}
            className={cn(
              "flex h-full min-w-0 flex-col rounded-2xl border bg-white p-3 sm:p-5",
              destaque ? "border-[var(--primary-color)]/30" : "border-gray-200"
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
                {rotulo}
              </span>
              <span
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-lg",
                  cor
                )}
              >
                <Icone className="size-4" />
              </span>
            </div>
            <div className="mt-2 text-2xl font-bold tabular-nums text-gray-900 sm:text-[28px]">
              {numero(valor)}
            </div>
            <div className="mt-auto pt-2 text-xs text-gray-500">{detalhe}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 sm:gap-5 lg:grid-cols-5">
        {/* Como funciona */}
        <section className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 lg:col-span-3">
          <div className="text-base font-semibold text-gray-900">
            Como funciona para a empresa
          </div>
          <ol className="mt-4 space-y-4">
            {passos.map(({ Icone, titulo, texto }, indice) => (
              <li key={titulo} className="flex items-start gap-3">
                <span className="relative flex size-9 shrink-0 items-center justify-center rounded-full bg-[var(--primary-color)]/5 text-[var(--primary-color)]">
                  <Icone className="size-4" />
                  <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-[var(--primary-color)] text-[10px] font-bold text-white">
                    {indice + 1}
                  </span>
                </span>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-gray-900">{titulo}</div>
                  <div className="mt-0.5 text-sm leading-relaxed text-gray-600">
                    {texto}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Fora da campanha */}
        <section className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 lg:col-span-2">
          <div className="text-base font-semibold text-gray-900">Fora da bonificação</div>
          <div className="mt-0.5 text-sm text-gray-500">
            Não recebem o mês grátis.
          </div>
          {previa.excluidas.length > 0 ? (
            <ul className="mt-4 space-y-2">
              {previa.excluidas.map((empresa) => (
                <li
                  key={`${empresa.nomeCompleto}-${empresa.cnpj ?? ""}`}
                  className="flex items-center gap-3 rounded-xl bg-gray-50 p-3"
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white text-gray-500 ring-1 ring-gray-200">
                    <Building2 className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-gray-900">
                      {empresa.nomeCompleto}
                    </div>
                    {empresa.cnpj ? (
                      <div className="text-xs text-gray-500">
                        CNPJ {cnpjFormatado(empresa.cnpj)}
                      </div>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-4 text-sm text-gray-500">Nenhuma empresa.</div>
          )}
        </section>
      </div>

      <ModalCustom
        isOpen={confirmar}
        onClose={() => !aplicando && setConfirmar(false)}
        size="md"
        backdrop="blur"
      >
        <ModalContentWrapper>
          <ModalHeader>
            <ModalTitle>Aplicar o mês grátis?</ModalTitle>
          </ModalHeader>
          <ModalBody className="space-y-3 text-sm">
            <div className="flex items-start gap-3 rounded-xl bg-emerald-50 p-3 text-emerald-900">
              <Gift className="mt-0.5 size-4 shrink-0" />
              <span className="leading-relaxed">
                <strong>{numero(previa.elegiveis)}</strong> empresa(s) recebem{" "}
                <strong>1 mês grátis</strong> do plano {previa.plano?.nome}, até{" "}
                {dataPorExtenso(previa.validoAte)}.
                {previa.concessoesAdminParaConverter > 0 ? (
                  <>
                    {" "}
                    As <strong>{numero(previa.concessoesAdminParaConverter)}</strong>{" "}
                    empresa(s) que já tinham 1 mês grátis lançado pelo admin entram na
                    mesma bonificação (mesmo prazo, sem cobrança).
                  </>
                ) : null}
              </span>
            </div>
            <div className="flex items-start gap-3 text-gray-600">
              <Info className="mt-0.5 size-4 shrink-0" />
              <span className="leading-relaxed">
                Nenhum e-mail é enviado agora. A empresa vê o presente ao entrar na
                plataforma. Pode aplicar de novo depois para empresas novas.
              </span>
            </div>
          </ModalBody>
          <ModalFooter>
            <div className="flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
              <ButtonCustom
                variant="outline"
                onClick={() => setConfirmar(false)}
                disabled={aplicando}
              >
                Cancelar
              </ButtonCustom>
              <ButtonCustom
                variant="primary"
                onClick={() => void aplicar()}
                isLoading={aplicando}
                loadingText="Aplicando..."
              >
                Aplicar 1 mês grátis
              </ButtonCustom>
            </div>
          </ModalFooter>
        </ModalContentWrapper>
      </ModalCustom>
    </div>
  );
}
