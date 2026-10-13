"use client";

import React from "react";
import {
  AlertTriangle,
  CheckCircle2,
  PauseCircle,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
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
import {
  ButtonCustom,
  InputCustom,
  SelectCustom,
} from "@/components/ui/custom";
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
import {
  ACOES_POR_TIPO,
  RESULTADO_LABEL,
  TIPO_PENDENCIA_LABEL,
  descreverResultadoAcao,
  tonalidadeSituacao,
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

const mensagemDeErro = (error: unknown) =>
  error instanceof Error ? error.message : "Tente novamente.";

function Metrica({
  rotulo,
  valor,
  detalhe,
  destaque,
}: {
  rotulo: string;
  valor: React.ReactNode;
  detalhe?: React.ReactNode;
  destaque?: "alerta" | "perigo" | "ok";
}) {
  const cor =
    destaque === "perigo"
      ? "border-red-200 bg-red-50"
      : destaque === "alerta"
        ? "border-amber-200 bg-amber-50"
        : destaque === "ok"
          ? "border-emerald-200 bg-emerald-50"
          : "border-border bg-white";
  return (
    <div className={`rounded-xl border p-4 ${cor}`}>
      <p className="!mb-1 !text-xs text-muted-foreground">{rotulo}</p>
      <p className="!mb-0 text-2xl font-semibold text-gray-900">{valor}</p>
      {detalhe ? (
        <p className="!mb-0 !mt-1 !text-xs text-muted-foreground">{detalhe}</p>
      ) : null}
    </div>
  );
}

type Acao =
  | { tipo: "corrigir"; aluno: ComunicadoPendencia }
  | { tipo: "reenviar"; aluno: ComunicadoPendencia }
  | { tipo: "revogar"; aluno: ComunicadoPendencia };

export function ComunicadoPrimeiroAcessoPanel() {
  const role = useUserRole();
  const isAdmin = role === UserRole.ADMIN;
  const [painel, setPainel] = React.useState<ComunicadoPainel | null>(null);
  const [pendencias, setPendencias] =
    React.useState<ComunicadoPendencias | null>(null);
  const [carregando, setCarregando] = React.useState(true);
  const [ocupado, setOcupado] = React.useState<string | null>(null);
  const [tipo, setTipo] = React.useState<ComunicadoTipoPendencia | null>(null);
  const [busca, setBusca] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [acao, setAcao] = React.useState<Acao | null>(null);
  const [novoEmail, setNovoEmail] = React.useState("");
  const [enviarAgora, setEnviarAgora] = React.useState(true);

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

  const abrirAcao = (proxima: Acao) => {
    setNovoEmail("");
    setEnviarAgora(true);
    setAcao(proxima);
  };

  const confirmarAcao = async () => {
    if (!acao) return;
    const { aluno } = acao;
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
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(novoEmail.trim())) {
            toastCustom.error({ title: "Informe um e-mail válido" });
            return;
          }
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
      <div className="space-y-4">
        <Skeleton className="h-8 w-72" />
        <Skeleton className="h-28 w-full" />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    );
  }
  if (!painel) return null;

  const tom = tonalidadeSituacao(painel.situacao.codigo);
  const IconeSituacao =
    tom === "ok" ? CheckCircle2 : tom === "perigo" ? ShieldAlert : PauseCircle;
  const corSituacao =
    tom === "ok"
      ? "border-emerald-200 bg-emerald-50 text-emerald-900"
      : tom === "perigo"
        ? "border-red-200 bg-red-50 text-red-900"
        : tom === "alerta"
          ? "border-amber-200 bg-amber-50 text-amber-900"
          : "border-border bg-muted/30 text-gray-800";
  const taxa24h = painel.devolucao.ultimas24h;
  const ultimaValidacao = painel.execucao.ultimaValidacao;

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h4 className="!mb-1">Comunicado: primeiro acesso</h4>
          <p className="!mb-0 !text-sm text-muted-foreground">
            “A nova Advance+ está no ar” para os alunos migrados. Só recebem
            endereços confirmados pelo validador; devoluções e bloqueios da
            Brevo nunca são tentados de novo.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ButtonCustom
            variant="outline"
            size="sm"
            onClick={() => void carregar()}
            disabled={ocupado !== null}
          >
            <RefreshCw className="h-4 w-4" />
            Atualizar
          </ButtonCustom>
          {isAdmin ? (
            <>
              <ButtonCustom
                variant="outline"
                size="sm"
                isLoading={ocupado === "sincronizar"}
                disabled={ocupado !== null}
                onClick={() =>
                  void executar(
                    "sincronizar",
                    sincronizarComunicadoComBrevo,
                    "Devoluções e entregas atualizadas pela Brevo",
                  )
                }
              >
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
                onClick={() =>
                  void executar(
                    "validar",
                    () => validarFilaComunicado(),
                    "Validação iniciada; o painel atualiza sozinho",
                  )
                }
              >
                <ShieldCheck className="h-4 w-4" />
                Validar fila
              </ButtonCustom>
            </>
          ) : null}
        </div>
      </header>

      <div className={`rounded-xl border p-4 ${corSituacao}`}>
        <div className="flex items-start gap-3">
          <IconeSituacao className="mt-0.5 h-5 w-5 shrink-0" />
          <div className="space-y-1">
            <p className="!mb-0 font-semibold">{painel.situacao.titulo}</p>
            <p className="!mb-0 !text-sm">{painel.situacao.detalhe}</p>
            {painel.situacao.condicoesRetomada.length > 0 ? (
              <ul className="!mb-0 !mt-2 list-disc space-y-1 pl-5 !text-sm">
                {painel.situacao.condicoesRetomada.map((condicao) => (
                  <li key={condicao}>{condicao}</li>
                ))}
              </ul>
            ) : null}
            {painel.alertas.length > 0 ? (
              <p className="!mb-0 !mt-2 !text-xs opacity-80">
                Também:{" "}
                {painel.alertas.map((alerta) => alerta.titulo).join(" · ")}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      {painel.fila.senhasPossivelmenteExpostas > 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-900">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
            <p className="!mb-0 !text-sm">
              <strong>{painel.fila.senhasPossivelmenteExpostas}</strong>{" "}
              senha(s) provisória(s) foram entregues em domínios com erro de
              digitação e podem estar com terceiros. Revogue e corrija o e-mail.
            </p>
          </div>
          <ButtonCustom
            variant="outline"
            size="sm"
            onClick={() => {
              setTipo("SENHA_POSSIVELMENTE_EXPOSTA");
              setPage(1);
            }}
          >
            Ver alunos
          </ButtonCustom>
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Metrica
          rotulo="Alunos na campanha"
          valor={formatar(painel.totalAlunos)}
        />
        <Metrica
          rotulo="Envios realizados"
          valor={formatar(painel.envios.realizados)}
          detalhe={`${formatar(painel.envios.entregues)} entregues`}
        />
        <Metrica
          rotulo="Devoluções definitivas"
          valor={formatar(painel.envios.devolvidosDefinitivos)}
          detalhe={`${formatar(painel.envios.devolvidosTemporarios)} temporárias`}
          destaque={
            painel.envios.devolvidosDefinitivos > 0 ? "alerta" : undefined
          }
        />
        <Metrica
          rotulo="Devolução nas últimas 24h"
          valor={`${taxa24h.taxaPercentual.toLocaleString("pt-BR")}%`}
          detalhe={`${taxa24h.devolvidos} de ${taxa24h.enviados} · limite ${painel.devolucao.limite}%`}
          destaque={taxa24h.pausado ? "perigo" : "ok"}
        />
        <Metrica
          rotulo="Prontos para envio"
          valor={formatar(painel.fila.prontosParaEnvio)}
          detalhe={`${formatar(painel.fila.restantes)} na fila`}
        />
        <Metrica
          rotulo="Aguardando validação"
          valor={formatar(painel.fila.aguardandoValidacao)}
          detalhe={
            painel.configuracao.validadorConfigurado
              ? `Validador: ${painel.configuracao.validador}`
              : "Validador não configurado"
          }
          destaque={
            painel.configuracao.validadorConfigurado ? undefined : "alerta"
          }
        />
        <Metrica
          rotulo="Precisam de correção"
          valor={formatar(painel.fila.precisamCorrecao)}
          destaque={painel.fila.precisamCorrecao > 0 ? "alerta" : undefined}
        />
        <Metrica
          rotulo="Hoje (aquecimento)"
          valor={`${formatar(painel.rampa.enviadosHoje)} / ${formatar(painel.rampa.limiteHoje)}`}
          detalhe={`Créditos Brevo: ${formatar(painel.brevo.creditos)} (reserva ${formatar(
            painel.brevo.reserva,
          )})`}
        />
      </div>

      <div className="rounded-xl border border-border p-4">
        <p className="!mb-3 font-semibold">Validação dos e-mails da fila</p>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(RESULTADO_LABEL) as ComunicadoResultadoValidacao[]).map(
            (resultado) => (
              <span
                key={resultado}
                className="rounded-full border border-border bg-muted/30 px-3 py-1 text-xs text-gray-700"
              >
                {RESULTADO_LABEL[resultado]}:{" "}
                <strong>{formatar(painel.validacao[resultado])}</strong>
              </span>
            ),
          )}
        </div>
        <p className="!mb-0 !mt-3 !text-xs text-muted-foreground">
          Última validação: {dataHora(ultimaValidacao?.em)}
          {ultimaValidacao?.erro
            ? ` · interrompida: ${ultimaValidacao.erro}`
            : ""}{" "}
          · Última consulta à Brevo:{" "}
          {dataHora(painel.execucao.ultimaSincronizacao?.em)}
          {painel.execucao.ultimaSincronizacao?.ok === false
            ? ` · falhou: ${painel.execucao.ultimaSincronizacao.erro}`
            : ""}
        </p>
      </div>

      <div className="rounded-xl border border-border p-4">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="!mb-0 font-semibold">
              Alunos que precisam de atenção
            </p>
            <p className="!mb-0 !text-xs text-muted-foreground">
              Confirme o e-mail com o aluno (telefone ou atendimento). A senha
              nunca aparece aqui: ela vai só por e-mail, depois da correção.
            </p>
          </div>
          <div className="flex w-full flex-wrap gap-3 md:w-auto">
            <div className="w-full md:w-64">
              <SelectCustom
                mode="single"
                label="Tipo"
                value={tipo}
                onChange={(valor) => {
                  setTipo(valor as ComunicadoTipoPendencia | null);
                  setPage(1);
                }}
                options={(
                  Object.keys(TIPO_PENDENCIA_LABEL) as ComunicadoTipoPendencia[]
                ).map((valor) => ({
                  value: valor,
                  label: `${TIPO_PENDENCIA_LABEL[valor]} (${pendencias?.porTipo[valor] ?? 0})`,
                }))}
                placeholder="Todos"
                clearable
              />
            </div>
            <div className="w-full md:w-64">
              <InputCustom
                label="Buscar"
                value={busca}
                onChange={(event) => {
                  setBusca(event.target.value);
                  setPage(1);
                }}
                placeholder="Nome, e-mail ou CPF"
              />
            </div>
          </div>
        </div>

        {pendencias && pendencias.itens.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="py-2 pr-3">Aluno</th>
                  <th className="py-2 pr-3">E-mail atual</th>
                  <th className="py-2 pr-3">Situação</th>
                  <th className="py-2 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {pendencias.itens.map((aluno) => (
                  <tr
                    key={aluno.usuarioId}
                    className="border-t border-border align-top"
                  >
                    <td className="py-3 pr-3">
                      <p className="!mb-0 font-medium text-gray-900">
                        {aluno.nomeCompleto}
                      </p>
                      <p className="!mb-0 !text-xs text-muted-foreground">
                        CPF {aluno.cpf ?? "—"} · Tel. {aluno.telefone ?? "—"}
                      </p>
                    </td>
                    <td className="py-3 pr-3">
                      <p className="!mb-0 break-all">{aluno.email}</p>
                      {aluno.sugestao ? (
                        <p className="!mb-0 !text-xs text-muted-foreground">
                          Sugestão: {aluno.sugestao} (confirmar com o aluno)
                        </p>
                      ) : null}
                    </td>
                    <td className="py-3 pr-3">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                          aluno.tipo === "SENHA_POSSIVELMENTE_EXPOSTA"
                            ? "bg-red-100 text-red-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {TIPO_PENDENCIA_LABEL[aluno.tipo]}
                      </span>
                      <p className="!mb-0 !mt-1 !text-xs text-muted-foreground">
                        {aluno.motivo}
                      </p>
                      {aluno.senhaProvisoriaNaoRecebida ? (
                        <p className="!mb-0 !text-xs text-red-700">
                          Está com senha provisória que não recebeu
                        </p>
                      ) : null}
                    </td>
                    <td className="py-3">
                      <div className="flex flex-wrap justify-end gap-2">
                        {ACOES_POR_TIPO[aluno.tipo].includes("revogar") ? (
                          <ButtonCustom
                            variant="outline"
                            size="xs"
                            onClick={() =>
                              abrirAcao({ tipo: "revogar", aluno })
                            }
                          >
                            Revogar senha
                          </ButtonCustom>
                        ) : null}
                        {ACOES_POR_TIPO[aluno.tipo].includes("reenviar") ? (
                          <ButtonCustom
                            variant="outline"
                            size="xs"
                            onClick={() =>
                              abrirAcao({ tipo: "reenviar", aluno })
                            }
                          >
                            Reenviar
                          </ButtonCustom>
                        ) : null}
                        <ButtonCustom
                          variant="primary"
                          size="xs"
                          onClick={() => abrirAcao({ tipo: "corrigir", aluno })}
                        >
                          Corrigir e-mail
                        </ButtonCustom>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="!mb-0 py-6 text-center !text-sm text-muted-foreground">
            Nenhum aluno nesta situação.
          </p>
        )}

        {pendencias && pendencias.total > pendencias.pageSize ? (
          <div className="mt-4 flex items-center justify-end gap-3 text-sm">
            <span className="text-muted-foreground">
              Página {pendencias.page} de{" "}
              {Math.ceil(pendencias.total / pendencias.pageSize)} ·{" "}
              {pendencias.total} alunos
            </span>
            <ButtonCustom
              variant="outline"
              size="xs"
              disabled={page <= 1}
              onClick={() => setPage((atual) => Math.max(1, atual - 1))}
            >
              Anterior
            </ButtonCustom>
            <ButtonCustom
              variant="outline"
              size="xs"
              disabled={page * pendencias.pageSize >= pendencias.total}
              onClick={() => setPage((atual) => atual + 1)}
            >
              Próxima
            </ButtonCustom>
          </div>
        ) : null}
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
            <ModalTitle>
              {acao?.tipo === "revogar"
                ? "Revogar senha provisória"
                : acao?.tipo === "reenviar"
                  ? "Reenviar comunicado"
                  : "Corrigir e-mail"}
            </ModalTitle>
          </ModalHeader>
          <ModalBody className="space-y-4 pt-1 text-sm">
            <p className="!mb-0">
              <strong>{acao?.aluno.nomeCompleto}</strong> · {acao?.aluno.email}
            </p>
            {acao?.tipo === "revogar" ? (
              <p className="!mb-0 text-muted-foreground">
                A senha provisória atual deixa de funcionar e as sessões abertas
                são encerradas. O aluno volta a ter acesso quando o e-mail for
                corrigido e ele receber uma nova senha.
              </p>
            ) : null}
            {acao?.tipo === "reenviar" ? (
              <p className="!mb-0 text-muted-foreground">
                O e-mail é validado de novo. Se estiver confirmado, o aluno
                recebe uma nova senha provisória e a anterior deixa de valer.
              </p>
            ) : null}
            {acao?.tipo === "corrigir" ? (
              <>
                <InputCustom
                  label="E-mail correto (confirmado com o aluno)"
                  type="email"
                  value={novoEmail}
                  onChange={(event) => setNovoEmail(event.target.value)}
                  placeholder="nome@provedor.com"
                  required
                />
                {acao.aluno.sugestao ? (
                  <p className="!mb-0 !text-xs text-muted-foreground">
                    Sugestão automática: {acao.aluno.sugestao}. Use só se o
                    aluno confirmar.
                  </p>
                ) : null}
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={enviarAgora}
                    onChange={(event) => setEnviarAgora(event.target.checked)}
                  />
                  Enviar o comunicado agora se o novo e-mail for confirmado pelo
                  validador
                </label>
              </>
            ) : null}
          </ModalBody>
          <ModalFooter className="pt-2">
            <div className="flex w-full justify-end gap-3">
              <ButtonCustom
                variant="outline"
                onClick={() => setAcao(null)}
                disabled={ocupado !== null}
              >
                Cancelar
              </ButtonCustom>
              <ButtonCustom
                variant="primary"
                onClick={() => void confirmarAcao()}
                isLoading={ocupado === "acao"}
                loadingText="Processando..."
              >
                Confirmar
              </ButtonCustom>
            </div>
          </ModalFooter>
        </ModalContentWrapper>
      </ModalCustom>
    </section>
  );
}
