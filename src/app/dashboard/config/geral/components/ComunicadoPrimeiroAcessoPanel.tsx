"use client";

import React from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CloudDownload,
  Info,
  MailCheck,
  MailX,
  PauseCircle,
  RefreshCw,
  Send,
  ShieldAlert,
  ShieldCheck,
  SearchX,
  UsersRound,
} from "lucide-react";

import {
  corrigirEmailComunicado,
  getComunicadoPainel,
  getComunicadoPendencias,
  reenviarComunicado,
  revogarSenhaComunicado,
  sincronizarComunicadoComBrevo,
  validarFilaComunicado,
} from "@/api/email";
import type {
  ComunicadoAcaoAlunoResultado,
  ComunicadoPainel,
  ComunicadoPendencia,
  ComunicadoPendencias,
  ComunicadoResultadoValidacao,
  ComunicadoTipoPendencia,
} from "@/api/email/types";
import { ButtonCustom, InputCustom } from "@/components/ui/custom";
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
import { UserRole } from "@/config/roles";
import { useUserRole } from "@/hooks/useUserRole";
import { cn } from "@/lib/utils";
import {
  ACOES_POR_TIPO,
  GRAVIDADE_PENDENCIA,
  RESULTADO_LABEL,
  TIPO_PENDENCIA_LABEL,
  descreverResultadoAcao,
  formatarPercentual,
  iniciais,
  percentual,
  segmentosProgresso,
  tonalidadeSituacao,
  type Gravidade,
} from "./comunicado.utils";

const formatar = (valor: number | null | undefined) =>
  valor === null || valor === undefined ? "—" : valor.toLocaleString("pt-BR");

const dataHora = (iso: string | null | undefined) =>
  iso
    ? new Date(iso).toLocaleString("pt-BR", {
        timeZone: "America/Sao_Paulo",
        dateStyle: "short",
        timeStyle: "short",
      })
    : "—";

const hora = (iso: string) =>
  new Date(iso).toLocaleTimeString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    hour: "2-digit",
    minute: "2-digit",
  });

const mensagemDeErro = (error: unknown) =>
  error instanceof Error ? error.message : "Tente novamente.";

const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ---------------------------------------------------------------------------
// Peças visuais
// ---------------------------------------------------------------------------

type Tom = "ok" | "alerta" | "perigo" | "neutro";

const TOM_SITUACAO: Record<
  Tom,
  { caixa: string; icone: string; Icone: typeof CheckCircle2 }
> = {
  ok: {
    caixa: "border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-white",
    icone: "bg-emerald-100 text-emerald-700",
    Icone: CheckCircle2,
  },
  alerta: {
    caixa: "border-amber-200 bg-gradient-to-br from-amber-50 via-white to-white",
    icone: "bg-amber-100 text-amber-700",
    Icone: PauseCircle,
  },
  perigo: {
    caixa: "border-red-200 bg-gradient-to-br from-red-50 via-white to-white",
    icone: "bg-red-100 text-red-700",
    Icone: ShieldAlert,
  },
  neutro: {
    caixa: "border-gray-200 bg-gradient-to-br from-slate-50 via-white to-white",
    icone: "bg-slate-100 text-slate-600",
    Icone: PauseCircle,
  },
};

const SELO_GRAVIDADE: Record<Gravidade, string> = {
  critica: "bg-red-50 text-red-700 ring-red-200",
  alta: "bg-amber-50 text-amber-800 ring-amber-200",
  media: "bg-slate-100 text-slate-700 ring-slate-200",
};

const COR_VALIDACAO: Record<ComunicadoResultadoValidacao, string> = {
  VALIDO: "bg-emerald-500",
  INVALIDO: "bg-red-500",
  BLOQUEADO: "bg-rose-400",
  RISCO: "bg-orange-400",
  DESCONHECIDO: "bg-amber-400",
  TEMPORARIO: "bg-sky-400",
  PENDENTE: "bg-slate-400",
  SEM_VALIDACAO: "bg-slate-300",
};

function Cartao({
  titulo,
  subtitulo,
  icone: Icone,
  acao,
  className,
  children,
}: {
  titulo?: React.ReactNode;
  subtitulo?: React.ReactNode;
  icone?: typeof Info;
  acao?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-gray-200 bg-white p-4 sm:p-6",
        className,
      )}
    >
      {titulo ? (
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            {Icone ? (
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[var(--primary-color)]/5 text-[var(--primary-color)]">
                <Icone className="size-[18px]" />
              </span>
            ) : null}
            <div className="min-w-0">
              <div className="text-base font-semibold text-gray-900">
                {titulo}
              </div>
              {subtitulo ? (
                <div className="mt-0.5 text-sm text-gray-500">{subtitulo}</div>
              ) : null}
            </div>
          </div>
          {acao}
        </div>
      ) : null}
      {children}
    </section>
  );
}

function Indicador({
  rotulo,
  valor,
  detalhe,
  icone: Icone,
  tom = "neutro",
  medidor,
}: {
  rotulo: string;
  valor: React.ReactNode;
  detalhe?: React.ReactNode;
  icone: typeof Info;
  tom?: Tom;
  /** 0 a 100: barra discreta abaixo do valor */
  medidor?: { valor: number; cor: string };
}) {
  const corIcone = {
    ok: "bg-emerald-50 text-emerald-600",
    alerta: "bg-amber-50 text-amber-600",
    perigo: "bg-red-50 text-red-600",
    neutro: "bg-[var(--primary-color)]/5 text-[var(--primary-color)]",
  }[tom];
  return (
    <div className="flex h-full min-w-0 flex-col rounded-2xl border border-gray-200 bg-white p-3 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <span className="text-[11px] font-medium uppercase tracking-wide text-gray-500 sm:text-xs">
          {rotulo}
        </span>
        <span
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-lg",
            corIcone,
          )}
        >
          <Icone className="size-4" />
        </span>
      </div>
      <div className="mt-2 text-2xl font-bold tabular-nums text-gray-900 sm:text-[28px]">
        {valor}
      </div>
      {medidor ? (
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
          <div
            className={cn("h-full rounded-full transition-all", medidor.cor)}
            style={{ width: `${Math.min(100, Math.max(0, medidor.valor))}%` }}
          />
        </div>
      ) : null}
      {detalhe ? (
        <div className="mt-auto pt-2 text-xs leading-relaxed text-gray-500">
          {detalhe}
        </div>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Painel
// ---------------------------------------------------------------------------

type Acao =
  | { tipo: "corrigir"; aluno: ComunicadoPendencia }
  | { tipo: "reenviar"; aluno: ComunicadoPendencia }
  | { tipo: "revogar"; aluno: ComunicadoPendencia };

const TITULO_ACAO: Record<Acao["tipo"], string> = {
  corrigir: "Corrigir e-mail do aluno",
  reenviar: "Reenviar comunicado",
  revogar: "Revogar senha provisória",
};

const CONFIRMAR_ACAO: Record<Acao["tipo"], string> = {
  corrigir: "Salvar e-mail",
  reenviar: "Reenviar",
  revogar: "Revogar senha",
};

export function ComunicadoPrimeiroAcessoPanel() {
  const role = useUserRole();
  const isAdmin = role === UserRole.ADMIN;
  const [painel, setPainel] = React.useState<ComunicadoPainel | null>(null);
  const [pendencias, setPendencias] =
    React.useState<ComunicadoPendencias | null>(null);
  const [carregando, setCarregando] = React.useState(true);
  const [atualizando, setAtualizando] = React.useState(false);
  const [ocupado, setOcupado] = React.useState<string | null>(null);
  const [tipo, setTipo] = React.useState<ComunicadoTipoPendencia | null>(null);
  const [busca, setBusca] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [acao, setAcao] = React.useState<Acao | null>(null);
  const [novoEmail, setNovoEmail] = React.useState("");
  const [enviarAgora, setEnviarAgora] = React.useState(true);
  const listaRef = React.useRef<HTMLDivElement>(null);

  const carregarPendencias = React.useCallback(async () => {
    const response = await getComunicadoPendencias({
      tipo,
      busca,
      page,
      pageSize: 20,
    });
    setPendencias(response.data);
  }, [tipo, busca, page]);

  const carregar = React.useCallback(async () => {
    setAtualizando(true);
    try {
      const [painelResponse] = await Promise.all([
        getComunicadoPainel(),
        carregarPendencias(),
      ]);
      setPainel(painelResponse.data);
    } catch (error) {
      toastCustom.error({
        title: "Painel indisponível",
        description: mensagemDeErro(error),
      });
    } finally {
      setCarregando(false);
      setAtualizando(false);
    }
  }, [carregarPendencias]);

  React.useEffect(() => {
    const timer = setTimeout(() => void carregar(), busca ? 350 : 0);
    return () => clearTimeout(timer);
  }, [carregar, busca]);

  // Enquanto a validação roda em segundo plano, atualiza sozinho
  React.useEffect(() => {
    if (!painel?.execucao.validacaoEmExecucao) return;
    const timer = setInterval(() => void carregar(), 15_000);
    return () => clearInterval(timer);
  }, [painel?.execucao.validacaoEmExecucao, carregar]);

  const executar = async (
    nome: string,
    fn: () => Promise<unknown>,
    sucesso: string,
  ) => {
    setOcupado(nome);
    try {
      await fn();
      toastCustom.success({ title: sucesso });
      await carregar();
    } catch (error) {
      toastCustom.error({
        title: "Não foi possível concluir",
        description: mensagemDeErro(error),
      });
    } finally {
      setOcupado(null);
    }
  };

  const filtrarPorTipo = (proximo: ComunicadoTipoPendencia | null) => {
    setTipo(proximo);
    setPage(1);
  };

  const verAlunosExpostos = () => {
    filtrarPorTipo("SENHA_POSSIVELMENTE_EXPOSTA");
    listaRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const abrirAcao = (proxima: Acao) => {
    setNovoEmail("");
    setEnviarAgora(true);
    setAcao(proxima);
  };

  const confirmarAcao = async () => {
    if (!acao) return;
    const { aluno } = acao;
    if (acao.tipo === "corrigir" && !EMAIL_VALIDO.test(novoEmail.trim())) {
      toastCustom.error({ title: "Informe um e-mail válido" });
      return;
    }
    setOcupado("acao");
    try {
      if (acao.tipo === "revogar") {
        await revogarSenhaComunicado(
          aluno.usuarioId,
          "senha provisória possivelmente entregue a terceiros (domínio com erro de digitação)",
        );
        toastCustom.success({
          title: "Senha provisória revogada",
          description: "Corrija o e-mail para o aluno receber uma nova senha.",
        });
      } else {
        let resultado: ComunicadoAcaoAlunoResultado;
        if (acao.tipo === "corrigir") {
          resultado = (
            await corrigirEmailComunicado(aluno.usuarioId, {
              email: novoEmail.trim(),
              enviarAgora,
            })
          ).data;
        } else {
          resultado = (await reenviarComunicado(aluno.usuarioId)).data;
        }
        const { titulo, descricao, sucesso } =
          descreverResultadoAcao(resultado);
        (sucesso ? toastCustom.success : toastCustom.info)({
          title: titulo,
          description: descricao,
        });
      }
      setAcao(null);
      await carregar();
    } catch (error) {
      toastCustom.error({
        title: "Não foi possível concluir",
        description: mensagemDeErro(error),
      });
    } finally {
      setOcupado(null);
    }
  };

  if (carregando && !painel) {
    return (
      <div className="flex flex-col gap-4" aria-busy="true">
        <Skeleton className="h-40 w-full rounded-2xl" />
        <Skeleton className="h-44 w-full rounded-2xl" />
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-72 w-full rounded-2xl" />
      </div>
    );
  }
  if (!painel) {
    return (
      <Cartao>
        <div className="flex flex-col items-center gap-3 py-8 text-center">
          <AlertTriangle className="size-8 text-amber-500" />
          <div className="text-sm text-gray-600">
            Não foi possível carregar o painel do comunicado.
          </div>
          <ButtonCustom
            variant="outline"
            size="sm"
            onClick={() => void carregar()}
          >
            Tentar de novo
          </ButtonCustom>
        </div>
      </Cartao>
    );
  }

  const tom = tonalidadeSituacao(painel.situacao.codigo);
  const visual = TOM_SITUACAO[tom];
  const taxa24h = painel.devolucao.ultimas24h;
  const usoDoLimite = percentual(taxa24h.taxaPercentual, painel.devolucao.limite);
  // "Desligado" já aparece no selo do envio automático
  const alertas = painel.alertas.filter((alerta) => alerta.codigo !== "DESLIGADO");
  const ultimaValidacao = painel.execucao.ultimaValidacao;
  const ultimaSincronizacao = painel.execucao.ultimaSincronizacao;
  const segmentos = painel.progresso
    ? segmentosProgresso(painel.progresso)
    : null;
  const jaAcessaram = painel.progresso?.jaAcessaram ?? 0;
  const totalValidacao = Object.values(painel.validacao).reduce(
    (soma, valor) => soma + valor,
    0,
  );
  const tiposComAlunos = (
    Object.keys(TIPO_PENDENCIA_LABEL) as ComunicadoTipoPendencia[]
  ).filter((valor) => (pendencias?.porTipo[valor] ?? 0) > 0 || valor === tipo);
  const totalPendencias = pendencias
    ? Object.values(pendencias.porTipo).reduce((soma, v) => soma + v, 0)
    : 0;
  const primeiroItem = pendencias
    ? (pendencias.page - 1) * pendencias.pageSize + 1
    : 0;
  const ultimoItem = pendencias
    ? Math.min(pendencias.page * pendencias.pageSize, pendencias.total)
    : 0;

  return (
    <div className="flex flex-col gap-4 sm:gap-5">
      {/* Barra de atualização */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs text-gray-500">
          Atualizado às {hora(painel.geradoEm)}
          {painel.execucao.validacaoEmExecucao
            ? " · validação em andamento, o painel atualiza sozinho"
            : ""}
        </span>
        <ButtonCustom
          variant="ghost"
          size="sm"
          onClick={() => void carregar()}
          disabled={ocupado !== null || atualizando}
          aria-label="Atualizar painel"
        >
          <RefreshCw className={cn("size-4", atualizando && "animate-spin")} />
          Atualizar
        </ButtonCustom>
      </div>

      {/* Urgente: senhas que podem estar com terceiros */}
      {painel.fila.senhasPossivelmenteExpostas > 0 ? (
        <div
          role="alert"
          className="flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-start gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-700">
              <AlertTriangle className="size-[18px]" />
            </span>
            <div className="text-sm text-red-900">
              <div className="font-semibold">
                {formatar(painel.fila.senhasPossivelmenteExpostas)} senha(s)
                provisória(s) podem estar com terceiros
              </div>
              <div className="mt-0.5 text-red-800/90">
                Foram entregues em domínios com erro de digitação. Revogue a
                senha e corrija o e-mail com o aluno.
              </div>
            </div>
          </div>
          <ButtonCustom
            variant="danger"
            size="sm"
            className="w-full sm:w-auto"
            onClick={verAlunosExpostos}
          >
            Ver alunos
          </ButtonCustom>
        </div>
      ) : null}

      {/* Progresso dos alunos */}
      {segmentos ? (
        <Cartao
          titulo="Primeiro acesso dos alunos migrados"
          subtitulo="Cada aluno aparece em uma única faixa."
          icone={UsersRound}
        >
          <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-1">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold tabular-nums text-gray-900 sm:text-4xl">
                {formatar(jaAcessaram)}
              </span>
              <span className="text-sm text-gray-500">
                de {formatar(painel.totalAlunos)} já acessaram
              </span>
            </div>
            <span className="text-sm font-semibold text-emerald-700">
              {formatarPercentual(percentual(jaAcessaram, painel.totalAlunos))}
            </span>
          </div>

          <div
            className="mt-4 flex h-3 w-full gap-0.5 overflow-hidden rounded-full bg-gray-100"
            role="img"
            aria-label={segmentos
              .map((s) => `${s.rotulo}: ${s.valor}`)
              .join(", ")}
          >
            {segmentos
              .filter((s) => s.valor > 0)
              .map((s) => (
                <div
                  key={s.chave}
                  className={cn("h-full first:rounded-l-full last:rounded-r-full", s.cor)}
                  style={{ width: `${s.percentual}%`, minWidth: "4px" }}
                  title={`${s.rotulo}: ${formatar(s.valor)}`}
                />
              ))}
          </div>

          <ul className="mt-5 grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-3 xl:grid-cols-5">
            {segmentos.map((s) => {
              const clicavel = s.chave === "precisamAtencao" && s.valor > 0;
              const conteudo = (
                <>
                  <span className="flex items-center gap-2 text-xs font-medium text-gray-600">
                    <span className={cn("size-2.5 rounded-full", s.cor)} />
                    {s.rotulo}
                  </span>
                  <span className="mt-1 flex items-baseline gap-1.5">
                    <span className="text-lg font-semibold tabular-nums text-gray-900">
                      {formatar(s.valor)}
                    </span>
                    <span className="text-xs text-gray-400">
                      {formatarPercentual(s.percentual)}
                    </span>
                  </span>
                  <span className="mt-0.5 text-xs leading-snug text-gray-500">
                    {s.descricao}
                  </span>
                </>
              );
              return (
                <li
                  key={s.chave}
                  className={cn(s.chave === "precisamAtencao" && "col-span-2 md:col-span-1")}
                >
                  {clicavel ? (
                    <button
                      type="button"
                      onClick={() => {
                        filtrarPorTipo(null);
                        listaRef.current?.scrollIntoView({
                          behavior: "smooth",
                          block: "start",
                        });
                      }}
                      className="flex h-full w-full cursor-pointer flex-col rounded-xl border border-amber-200 bg-amber-50/50 p-3 text-left transition-colors hover:bg-amber-50"
                    >
                      {conteudo}
                    </button>
                  ) : (
                    <div className="flex h-full flex-col rounded-xl border border-gray-100 bg-gray-50/60 p-3">
                      {conteudo}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </Cartao>
      ) : null}

      {/* Situação do envio */}
      <section className={cn("rounded-2xl border p-4 sm:p-6", visual.caixa)}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 items-start gap-3 sm:gap-4">
            <span
              className={cn(
                "flex size-11 shrink-0 items-center justify-center rounded-xl",
                visual.icone,
              )}
            >
              <visual.Icone className="size-5" />
            </span>
            <div className="min-w-0">
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
                  painel.configuracao.ativo
                    ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                    : "bg-white text-gray-600 ring-gray-200",
                )}
              >
                <span
                  className={cn(
                    "size-1.5 rounded-full",
                    painel.configuracao.ativo
                      ? "animate-pulse bg-emerald-500"
                      : "bg-gray-400",
                  )}
                />
                Envio automático{" "}
                {painel.configuracao.ativo ? "ligado" : "desligado"}
              </span>
              <div className="mt-2 text-lg font-semibold leading-snug text-gray-900">
                {painel.situacao.titulo}
              </div>
              <div className="mt-1 text-sm leading-relaxed text-gray-600">
                {painel.situacao.detalhe}
              </div>
              {painel.situacao.condicoesRetomada.length > 0 ? (
                <div className="mt-3">
                  <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Para continuar
                  </div>
                  <ul className="mt-1.5 space-y-1.5">
                    {painel.situacao.condicoesRetomada.map((condicao) => (
                      <li
                        key={condicao}
                        className="flex items-start gap-2 text-sm text-gray-700"
                      >
                        <ChevronRight className="mt-0.5 size-4 shrink-0 text-gray-400" />
                        <span>{condicao}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {alertas.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {alertas.map((alerta) => (
                    <span
                      key={alerta.codigo}
                      title={alerta.detalhe}
                      className="rounded-full bg-white px-2.5 py-1 text-xs text-gray-600 ring-1 ring-inset ring-gray-200"
                    >
                      {alerta.titulo}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          </div>

          {isAdmin ? (
            <div className="grid grid-cols-1 gap-2 sm:flex sm:flex-wrap lg:shrink-0 lg:justify-end">
              <ButtonCustom
                variant="outline"
                size="sm"
                className="bg-white"
                isLoading={ocupado === "sincronizar"}
                loadingText="Sincronizando..."
                disabled={ocupado !== null}
                onClick={() =>
                  void executar(
                    "sincronizar",
                    sincronizarComunicadoComBrevo,
                    "Devoluções e entregas atualizadas pela Brevo",
                  )
                }
              >
                <CloudDownload className="size-4" />
                Sincronizar com a Brevo
              </ButtonCustom>
              <ButtonCustom
                variant="primary"
                size="sm"
                isLoading={
                  ocupado === "validar" || painel.execucao.validacaoEmExecucao
                }
                loadingText="Validando..."
                disabled={
                  ocupado !== null || !painel.configuracao.validadorConfigurado
                }
                title={
                  painel.configuracao.validadorConfigurado
                    ? undefined
                    : "Configure um validador de e-mails para usar"
                }
                onClick={() =>
                  void executar(
                    "validar",
                    () => validarFilaComunicado(),
                    "Validação iniciada; o painel atualiza sozinho",
                  )
                }
              >
                <ShieldCheck className="size-4" />
                Validar fila
              </ButtonCustom>
            </div>
          ) : null}
        </div>

        <div className="mt-5 grid gap-x-6 gap-y-1 border-t border-gray-200/70 pt-4 text-xs text-gray-500 sm:grid-cols-3">
          <span>
            Brevo: {dataHora(ultimaSincronizacao?.em)}
            {ultimaSincronizacao?.ok === false ? (
              <span className="text-red-600"> · falhou</span>
            ) : null}
          </span>
          <span>
            Validação: {dataHora(ultimaValidacao?.em)}
            {ultimaValidacao?.erro ? (
              <span className="text-red-600"> · interrompida</span>
            ) : null}
          </span>
          <span>
            Validador:{" "}
            {painel.configuracao.validadorConfigurado
              ? painel.configuracao.validador
              : "não configurado"}
          </span>
        </div>
      </section>

      {/* Indicadores de envio */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3 xl:grid-cols-4">
        <Indicador
          rotulo="Entregues"
          icone={MailCheck}
          tom="ok"
          valor={formatar(painel.envios.entregues)}
          detalhe={`de ${formatar(painel.envios.realizados)} comunicado(s) enviados`}
        />
        <Indicador
          rotulo="Devoluções"
          icone={MailX}
          tom={painel.envios.devolvidosDefinitivos > 0 ? "alerta" : "neutro"}
          valor={formatar(painel.envios.devolvidosDefinitivos)}
          detalhe={`${formatarPercentual(painel.devolucao.total.taxaPercentual)} dos envios · ${formatar(
            painel.envios.devolvidosTemporarios,
          )} temporária(s)`}
        />
        <Indicador
          rotulo="Devolução em 24h"
          icone={Activity}
          tom={taxa24h.pausado ? "perigo" : usoDoLimite >= 70 ? "alerta" : "ok"}
          valor={formatarPercentual(taxa24h.taxaPercentual)}
          medidor={{
            valor: usoDoLimite,
            cor: taxa24h.pausado
              ? "bg-red-500"
              : usoDoLimite >= 70
                ? "bg-amber-500"
                : "bg-emerald-500",
          }}
          detalhe={`${formatar(taxa24h.devolvidos)} de ${formatar(taxa24h.enviados)} · pausa em ${painel.devolucao.limite}%`}
        />
        <Indicador
          rotulo="Envios hoje"
          icone={Send}
          valor={
            <>
              {formatar(painel.rampa.enviadosHoje)}
              <span className="text-base font-medium text-gray-400">
                {" "}
                / {formatar(painel.rampa.limiteHoje)}
              </span>
            </>
          }
          medidor={{
            valor: percentual(painel.rampa.enviadosHoje, painel.rampa.limiteHoje),
            cor: "bg-[var(--primary-color)]",
          }}
          detalhe={
            painel.brevo.erro
              ? "Créditos da Brevo indisponíveis"
              : `Créditos Brevo: ${formatar(painel.brevo.creditos)} (reserva ${formatar(painel.brevo.reserva)})`
          }
        />
      </div>

      {/* Fila e regras de segurança */}
      <div className="grid gap-4 sm:gap-5 lg:grid-cols-5">
        <Cartao
          className="lg:col-span-3"
          titulo="Qualidade dos e-mails na fila"
          subtitulo={`${formatar(painel.fila.restantes)} aluno(s) na fila · ${formatar(
            painel.fila.prontosParaEnvio,
          )} pronto(s) para envio`}
          icone={ShieldCheck}
        >
          <ul className="space-y-3">
            {(Object.keys(RESULTADO_LABEL) as ComunicadoResultadoValidacao[]).map(
              (resultado) => {
                const valor = painel.validacao[resultado] ?? 0;
                const parte = percentual(valor, totalValidacao);
                return (
                  <li
                    key={resultado}
                    className={cn(
                      "grid grid-cols-[minmax(0,8.5rem)_1fr_auto] items-center gap-2 text-sm sm:grid-cols-[minmax(0,11rem)_1fr_auto] sm:gap-3",
                      valor === 0 && "opacity-50",
                    )}
                  >
                    <span className="flex min-w-0 items-center gap-2 text-gray-700">
                      <span
                        className={cn(
                          "size-2 shrink-0 rounded-full",
                          COR_VALIDACAO[resultado],
                        )}
                      />
                      <span className="truncate">{RESULTADO_LABEL[resultado]}</span>
                    </span>
                    <span className="h-2 overflow-hidden rounded-full bg-gray-100">
                      <span
                        className={cn("block h-full rounded-full", COR_VALIDACAO[resultado])}
                        style={{ width: `${parte}%` }}
                      />
                    </span>
                    <span className="w-12 text-right font-medium tabular-nums text-gray-900 sm:w-14">
                      {formatar(valor)}
                    </span>
                  </li>
                );
              },
            )}
          </ul>
          {ultimaValidacao?.erro ? (
            <div className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
              Última validação interrompida: {ultimaValidacao.erro}
            </div>
          ) : null}
        </Cartao>

        <Cartao
          className="lg:col-span-2"
          titulo="Proteções do envio"
          subtitulo="Valem para todo envio automático."
          icone={ShieldAlert}
        >
          <ul className="space-y-3 text-sm text-gray-700">
            {[
              `Pausa sozinho se a devolução passar de ${painel.devolucao.limite}% em 24h.`,
              "Nunca reenvia para endereços devolvidos ou bloqueados na Brevo.",
              "Só envia para e-mails confirmados pelo validador.",
              `Aquecimento: começa com ${formatar(painel.configuracao.rampaInicial)} por dia, até ${formatar(
                painel.configuracao.maxDiario,
              )}; ${formatar(painel.configuracao.lotePorCiclo)} por ciclo.`,
              `Mantém ${formatar(painel.brevo.reserva)} créditos da Brevo para os e-mails do dia a dia.`,
            ].map((regra) => (
              <li key={regra} className="flex items-start gap-2.5">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                <span className="leading-relaxed">{regra}</span>
              </li>
            ))}
          </ul>
        </Cartao>
      </div>

      {/* Pendências */}
      <div ref={listaRef} className="scroll-mt-4">
        <Cartao
          titulo={
            <span className="flex items-center gap-2">
              Alunos que precisam de atenção
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
                {formatar(totalPendencias)}
              </span>
            </span>
          }
          subtitulo="Confirme o e-mail com o aluno por telefone ou atendimento. A senha nunca aparece aqui: ela vai só por e-mail."
          icone={AlertTriangle}
        >
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div
              className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 lg:flex-wrap lg:overflow-visible lg:pb-0"
              role="group"
              aria-label="Filtrar por situação"
            >
              <button
                type="button"
                aria-pressed={tipo === null}
                onClick={() => filtrarPorTipo(null)}
                className={cn(
                  "shrink-0 cursor-pointer rounded-full px-3 py-1.5 text-xs font-medium ring-1 ring-inset transition-colors",
                  tipo === null
                    ? "bg-[var(--primary-color)] text-white ring-[var(--primary-color)]"
                    : "bg-white text-gray-600 ring-gray-200 hover:bg-gray-50",
                )}
              >
                Todos · {formatar(totalPendencias)}
              </button>
              {tiposComAlunos.map((valor) => (
                <button
                  key={valor}
                  type="button"
                  aria-pressed={tipo === valor}
                  onClick={() => filtrarPorTipo(tipo === valor ? null : valor)}
                  className={cn(
                    "shrink-0 cursor-pointer rounded-full px-3 py-1.5 text-xs font-medium ring-1 ring-inset transition-colors",
                    tipo === valor
                      ? "bg-[var(--primary-color)] text-white ring-[var(--primary-color)]"
                      : "bg-white text-gray-600 ring-gray-200 hover:bg-gray-50",
                  )}
                >
                  {TIPO_PENDENCIA_LABEL[valor]} ·{" "}
                  {formatar(pendencias?.porTipo[valor] ?? 0)}
                </button>
              ))}
            </div>
            <div className="w-full lg:w-72 lg:shrink-0">
              <InputCustom
                aria-label="Buscar aluno"
                icon="Search"
                size="sm"
                value={busca}
                onChange={(event) => {
                  setBusca(event.target.value);
                  setPage(1);
                }}
                placeholder="Nome, e-mail ou CPF"
              />
            </div>
          </div>

          {pendencias && pendencias.itens.length > 0 ? (
            <div className="mt-4">
              <div className="hidden grid-cols-[minmax(0,1.2fr)_minmax(0,1.3fr)_minmax(0,1.2fr)_auto] gap-4 border-b border-gray-100 px-2 pb-2 text-xs font-semibold uppercase tracking-wide text-gray-400 lg:grid">
                <span>Aluno</span>
                <span>E-mail atual</span>
                <span>Situação</span>
                <span className="w-[260px] text-right">Ações</span>
              </div>
              <ul className="flex flex-col gap-3 lg:gap-0">
                {pendencias.itens.map((aluno) => {
                  const acoes = ACOES_POR_TIPO[aluno.tipo];
                  return (
                    <li
                      key={aluno.usuarioId}
                      className="grid gap-3 rounded-xl border border-gray-200 p-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1.3fr)_minmax(0,1.2fr)_auto] lg:items-center lg:gap-4 lg:rounded-none lg:border-0 lg:border-b lg:border-gray-100 lg:px-2 lg:py-4 lg:last:border-b-0"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[var(--primary-color)]/10 text-xs font-semibold text-[var(--primary-color)]">
                          {iniciais(aluno.nomeCompleto)}
                        </span>
                        <div className="min-w-0">
                          <div className="truncate text-sm font-semibold text-gray-900">
                            {aluno.nomeCompleto}
                          </div>
                          <div className="truncate text-xs text-gray-500">
                            CPF {aluno.cpf ?? "—"} · {aluno.telefone ?? "sem telefone"}
                          </div>
                        </div>
                      </div>

                      <div className="min-w-0 text-sm">
                        <span className="text-xs text-gray-400 lg:hidden">
                          E-mail atual
                        </span>
                        <div className="break-all text-gray-800">{aluno.email}</div>
                        {aluno.sugestao ? (
                          <div className="mt-1 text-xs text-gray-500">
                            Sugestão:{" "}
                            <span className="font-medium text-gray-700">
                              {aluno.sugestao}
                            </span>{" "}
                            (confirmar com o aluno)
                          </div>
                        ) : null}
                      </div>

                      <div className="min-w-0">
                        <span
                          className={cn(
                            "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
                            SELO_GRAVIDADE[GRAVIDADE_PENDENCIA[aluno.tipo]],
                          )}
                        >
                          {TIPO_PENDENCIA_LABEL[aluno.tipo]}
                        </span>
                        <div className="mt-1 line-clamp-2 text-xs text-gray-500" title={aluno.motivo}>
                          {aluno.motivo}
                        </div>
                        {aluno.senhaProvisoriaNaoRecebida ? (
                          <div className="mt-0.5 text-xs font-medium text-red-700">
                            Ficou com uma senha provisória que não recebeu
                          </div>
                        ) : null}
                      </div>

                      <div className="flex flex-wrap gap-2 lg:w-[260px] lg:justify-end">
                        {acoes.includes("revogar") ? (
                          <ButtonCustom
                            variant="outline"
                            size="xs"
                            className="flex-1 border-red-200 text-red-700 hover:bg-red-50 lg:flex-none"
                            onClick={() => abrirAcao({ tipo: "revogar", aluno })}
                          >
                            Revogar senha
                          </ButtonCustom>
                        ) : null}
                        {acoes.includes("reenviar") ? (
                          <ButtonCustom
                            variant="outline"
                            size="xs"
                            className="flex-1 lg:flex-none"
                            onClick={() => abrirAcao({ tipo: "reenviar", aluno })}
                          >
                            Reenviar
                          </ButtonCustom>
                        ) : null}
                        <ButtonCustom
                          variant="primary"
                          size="xs"
                          className="flex-1 lg:flex-none"
                          onClick={() => abrirAcao({ tipo: "corrigir", aluno })}
                        >
                          Corrigir e-mail
                        </ButtonCustom>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : (
            <div className="mt-4 flex flex-col items-center gap-2 rounded-xl border border-dashed border-gray-200 py-10 text-center">
              {busca || tipo ? (
                <>
                  <SearchX className="size-8 text-gray-300" />
                  <div className="text-sm font-medium text-gray-700">
                    Nenhum aluno encontrado
                  </div>
                  <div className="text-xs text-gray-500">
                    Ajuste a busca ou o filtro de situação.
                  </div>
                </>
              ) : (
                <>
                  <CheckCircle2 className="size-8 text-emerald-500" />
                  <div className="text-sm font-medium text-gray-700">
                    Nenhum aluno precisa de atenção
                  </div>
                  <div className="text-xs text-gray-500">
                    Quando um e-mail voltar ou for recusado, o aluno aparece aqui.
                  </div>
                </>
              )}
            </div>
          )}

          {pendencias && pendencias.total > pendencias.pageSize ? (
            <div className="mt-4 flex flex-col items-center justify-between gap-3 border-t border-gray-100 pt-4 sm:flex-row">
              <span className="text-xs text-gray-500">
                Mostrando {formatar(primeiroItem)}–{formatar(ultimoItem)} de{" "}
                {formatar(pendencias.total)} alunos
              </span>
              <div className="flex gap-2">
                <ButtonCustom
                  variant="outline"
                  size="xs"
                  disabled={page <= 1}
                  onClick={() => setPage((atual) => Math.max(1, atual - 1))}
                >
                  <ChevronLeft className="size-3.5" />
                  Anterior
                </ButtonCustom>
                <ButtonCustom
                  variant="outline"
                  size="xs"
                  disabled={page * pendencias.pageSize >= pendencias.total}
                  onClick={() => setPage((atual) => atual + 1)}
                >
                  Próxima
                  <ChevronRight className="size-3.5" />
                </ButtonCustom>
              </div>
            </div>
          ) : null}
        </Cartao>
      </div>

      <ModalCustom
        isOpen={acao !== null}
        onOpenChange={(open) => !open && ocupado === null && setAcao(null)}
        onClose={() => ocupado === null && setAcao(null)}
        size="md"
        backdrop="blur"
      >
        <ModalContentWrapper>
          <ModalHeader>
            <ModalTitle>{acao ? TITULO_ACAO[acao.tipo] : ""}</ModalTitle>
          </ModalHeader>
          <ModalBody className="space-y-4 pt-1 text-sm">
            {acao ? (
              <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[var(--primary-color)]/10 text-sm font-semibold text-[var(--primary-color)]">
                  {iniciais(acao.aluno.nomeCompleto)}
                </span>
                <div className="min-w-0">
                  <div className="truncate font-semibold text-gray-900">
                    {acao.aluno.nomeCompleto}
                  </div>
                  <div className="break-all text-xs text-gray-500">
                    {acao.aluno.email}
                  </div>
                </div>
              </div>
            ) : null}

            {acao?.tipo === "revogar" ? (
              <div className="flex items-start gap-2.5 rounded-xl border border-red-100 bg-red-50/60 p-3 text-red-900">
                <ShieldAlert className="mt-0.5 size-4 shrink-0" />
                <span className="leading-relaxed">
                  A senha provisória deixa de funcionar e as sessões abertas são
                  encerradas. O aluno volta a ter acesso quando o e-mail for
                  corrigido e ele receber uma nova senha.
                </span>
              </div>
            ) : null}

            {acao?.tipo === "reenviar" ? (
              <div className="flex items-start gap-2.5 rounded-xl border border-sky-100 bg-sky-50/60 p-3 text-sky-900">
                <Info className="mt-0.5 size-4 shrink-0" />
                <span className="leading-relaxed">
                  O e-mail é validado de novo. Se for confirmado, o aluno recebe
                  uma nova senha provisória e a anterior deixa de valer.
                </span>
              </div>
            ) : null}

            {acao?.tipo === "corrigir" ? (
              <>
                <InputCustom
                  label="E-mail correto (confirmado com o aluno)"
                  type="email"
                  value={novoEmail}
                  onChange={(event) => setNovoEmail(event.target.value)}
                  placeholder="nome@provedor.com"
                  error={
                    novoEmail && !EMAIL_VALIDO.test(novoEmail.trim())
                      ? "Digite um e-mail válido"
                      : undefined
                  }
                  required
                />
                {acao.aluno.sugestao ? (
                  <div className="flex items-start gap-2 text-xs text-gray-500">
                    <Info className="mt-0.5 size-3.5 shrink-0" />
                    <span>
                      Sugestão automática:{" "}
                      <strong className="text-gray-700">{acao.aluno.sugestao}</strong>
                      . Use só se o aluno confirmar.
                    </span>
                  </div>
                ) : null}
                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-gray-200 p-3 transition-colors hover:bg-gray-50">
                  <input
                    type="checkbox"
                    className="mt-0.5 size-4 cursor-pointer accent-[var(--primary-color)]"
                    checked={enviarAgora}
                    onChange={(event) => setEnviarAgora(event.target.checked)}
                  />
                  <span>
                    <span className="block font-medium text-gray-900">
                      Enviar o comunicado agora
                    </span>
                    <span className="block text-xs text-gray-500">
                      Só sai se o novo e-mail for confirmado pelo validador.
                    </span>
                  </span>
                </label>
              </>
            ) : null}
          </ModalBody>
          <ModalFooter className="pt-2">
            <div className="flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
              <ButtonCustom
                variant="outline"
                onClick={() => setAcao(null)}
                disabled={ocupado !== null}
              >
                Cancelar
              </ButtonCustom>
              <ButtonCustom
                variant={acao?.tipo === "revogar" ? "danger" : "primary"}
                onClick={() => void confirmarAcao()}
                isLoading={ocupado === "acao"}
                loadingText="Processando..."
                disabled={
                  acao?.tipo === "corrigir" && !EMAIL_VALIDO.test(novoEmail.trim())
                }
              >
                {acao ? CONFIRMAR_ACAO[acao.tipo] : "Confirmar"}
              </ButtonCustom>
            </div>
          </ModalFooter>
        </ModalContentWrapper>
      </ModalCustom>
    </div>
  );
}
