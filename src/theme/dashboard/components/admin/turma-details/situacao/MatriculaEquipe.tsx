"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { AlertTriangle, Check, Info, Search, X } from "lucide-react";

import { listCursos, listTurmas } from "@/api/cursos";
import type { Curso, CursoTurma } from "@/api/cursos";
import {
  adicionarAlunosTurma,
  removerAlunosTurma,
  type PagamentoMatricula,
  type ResultadoAdicao,
  type ResultadoRemocao,
} from "@/api/cursos/situacao";
import { listUsuarios } from "@/api/usuarios";
import type { UsuarioGenerico } from "@/api/usuarios/types";
import { AvatarCustom } from "@/components/ui/custom/avatar";
import { ButtonCustom } from "@/components/ui/custom/button";
import { InputCustom } from "@/components/ui/custom/input";
import {
  ModalBody,
  ModalContentWrapper,
  ModalCustom,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/custom/modal";
import { SelectCustom } from "@/components/ui/custom/select";
import { toastCustom } from "@/components/ui/custom/toast";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { formatCpf } from "@/lib/documentos";
import { cn } from "@/lib/utils";
import {
  CaixaPrevia,
  CampoAvisar,
  CampoMotivo,
  CampoPagamento,
  mensagemDoErro,
  motivoValido,
  nomesResumidos,
  PREVIA,
} from "./campos";
import {
  adicaoPedeCiencia,
  alertasDaAdicao,
  ehTurmaMigrada,
  frasesDaRemocao,
  motivoSemCobranca,
  termoDeBusca,
} from "./situacao.utils";

/** Mesmo limite da API por ação */
const MAX_ALUNOS = 200;

export interface TurmaDaAcao {
  id: string;
  nome?: string;
  codigo?: string;
  status?: string;
}

export interface AlunoEscolhido {
  id: string;
  nome: string;
  cpf?: string;
  email?: string;
}

const STATUS_TURMA: Record<string, string> = {
  RASCUNHO: "Rascunho",
  PUBLICADO: "Publicada",
  INSCRICOES_ABERTAS: "Inscrições abertas",
  INSCRICOES_ENCERRADAS: "Inscrições encerradas",
  EM_ANDAMENTO: "Em andamento",
  CONCLUIDO: "Concluída",
  SUSPENSO: "Suspensa",
  CANCELADO: "Cancelada",
};

const ROTULO_PAGAMENTO: Record<PagamentoMatricula, string> = {
  CONCEDIDO: "Concedido pela equipe",
  COBRANCA_PENDENTE: "Cobrança pendente",
};

const plural = (n: number, um: string, varios: string) =>
  `${n} ${n === 1 ? um : varios}`;

const mensagemDaAdicao = (r: ResultadoAdicao) => {
  const entraram = r.adicionar.length + r.reativar.length;
  return `${plural(entraram, "aluno", "alunos")} na turma.`;
};

// ---------------------------------------------------------------------------
// Peças do layout
// ---------------------------------------------------------------------------

/** Etapa numerada do formulário */
function Etapa({
  numero,
  titulo,
  dica,
  children,
}: {
  numero: number;
  titulo: string;
  dica?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section
      aria-label={titulo}
      className="space-y-3 py-5 first:pt-1 last:pb-1"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[var(--primary-color)]/10 text-xs font-semibold text-[var(--primary-color)]">
            {numero}
          </span>
          <span className="text-sm font-semibold text-gray-900">{titulo}</span>
        </div>
        {dica ? (
          <span className="text-right text-xs text-gray-500">{dica}</span>
        ) : null}
      </div>
      {children}
    </section>
  );
}

/** Nome, código e situação da turma logo abaixo do título */
function DadosDaTurma({ turma }: { turma: TurmaDaAcao }) {
  const status = (turma.status ?? "").toUpperCase();
  return (
    <ModalDescription asChild>
      <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-sm text-gray-600 sm:justify-start">
        <span className="font-medium text-gray-800">{turma.nome}</span>
        {turma.codigo ? (
          <code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs text-gray-600">
            {turma.codigo}
          </code>
        ) : null}
        {STATUS_TURMA[status] ? (
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700">
            {STATUS_TURMA[status]}
          </span>
        ) : null}
        {ehTurmaMigrada(turma.codigo) ? (
          <span className="rounded-full bg-violet-50 px-2 py-0.5 text-xs text-violet-700">
            Migrada do sistema antigo
          </span>
        ) : null}
      </div>
    </ModalDescription>
  );
}

/** Rodapé: o que falta para confirmar, ou o resumo do que vai acontecer */
function RodapeDaAcao({
  resumo,
  pendencias,
  children,
}: {
  resumo: string;
  pendencias: string[];
  children: ReactNode;
}) {
  return (
    <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-center text-xs text-gray-500 sm:text-left">
        {pendencias.length > 0 ? `Falta: ${pendencias.join(", ")}.` : resumo}
      </span>
      <div className="flex flex-col-reverse gap-2 sm:flex-row">{children}</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Prévia de quem entra
// ---------------------------------------------------------------------------

/**
 * Prévia de quem entra, refeita quando muda a turma, os alunos ou o pagamento.
 * Só vale a prévia da combinação atual (a anterior some enquanto a nova chega).
 */
function usePreviaAdicao(
  cursoId: number | string | null,
  turmaId: string | null,
  alunoIds: string[],
  pagamento: PagamentoMatricula | null,
) {
  const chave =
    cursoId && turmaId && alunoIds.length > 0
      ? JSON.stringify([
          String(cursoId),
          turmaId,
          pagamento ?? "CONCEDIDO",
          alunoIds,
        ])
      : "";
  const chaveAtrasada = useDebouncedValue(chave, 350);
  const [estado, setEstado] = useState<{
    chave: string;
    resultado: ResultadoAdicao | null;
    erro: string | null;
  }>({ chave: "", resultado: null, erro: null });

  useEffect(() => {
    if (!chaveAtrasada) return;
    let ativo = true;
    const [curso, turma, pag, ids] = JSON.parse(chaveAtrasada) as [
      string,
      string,
      PagamentoMatricula,
      string[],
    ];
    adicionarAlunosTurma(curso, turma, {
      alunoIds: ids,
      motivo: PREVIA,
      pagamento: pag,
      simular: true,
    })
      .then(
        (resultado) =>
          ativo && setEstado({ chave: chaveAtrasada, resultado, erro: null }),
      )
      .catch(
        (e) =>
          ativo &&
          setEstado({
            chave: chaveAtrasada,
            resultado: null,
            erro: mensagemDoErro(e),
          }),
      );
    return () => {
      ativo = false;
    };
  }, [chaveAtrasada]);

  const pronta = chave !== "" && estado.chave === chave;
  return {
    chave,
    resultado: pronta ? estado.resultado : null,
    erro: pronta ? estado.erro : null,
    carregando: chave !== "" && !pronta,
  };
}

type PreviaDeAdicao = ReturnType<typeof usePreviaAdicao>;

function Numero({
  rotulo,
  valor,
  dica,
  destaque,
  alerta,
  testId,
}: {
  rotulo: string;
  valor: ReactNode;
  dica?: string;
  destaque?: boolean;
  alerta?: boolean;
  testId: string;
}) {
  return (
    <div
      data-testid={testId}
      className={cn(
        "rounded-xl border px-3 py-2.5",
        alerta
          ? "border-amber-200 bg-amber-50"
          : destaque
            ? "border-[var(--primary-color)]/20 bg-[var(--primary-color)]/5"
            : "border-gray-200 bg-white",
      )}
    >
      <div className="text-xs text-gray-500">{rotulo}</div>
      <div
        className={cn(
          "mt-0.5 text-lg font-semibold leading-tight",
          alerta ? "text-amber-800" : "text-gray-900",
        )}
      >
        {valor}
      </div>
      {dica ? <div className="text-[11px] text-gray-500">{dica}</div> : null}
    </div>
  );
}

/** Prévia em números + avisos e confirmação (turma concluída ou vagas estouradas) */
function PreviaAdicao({
  previa,
  ciente,
  onCiente,
  vazio,
}: {
  previa: PreviaDeAdicao;
  ciente: boolean;
  onCiente: (v: boolean) => void;
  vazio: string;
}) {
  if (!previa.chave) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-dashed border-gray-200 px-3 py-4 text-sm text-gray-500">
        <Info className="size-4 shrink-0" />
        {vazio}
      </div>
    );
  }
  if (previa.carregando) {
    return (
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-[68px] rounded-xl" />
        ))}
      </div>
    );
  }
  if (previa.erro) {
    return (
      <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
        <AlertTriangle className="mt-0.5 size-4 shrink-0" />
        {previa.erro}
      </div>
    );
  }
  const r = previa.resultado!;
  const alertas = alertasDaAdicao(r);
  const pedeCiencia = adicaoPedeCiencia(r);
  return (
    <div className="space-y-3" data-testid="previa-adicao">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Numero
          testId="previa-entram"
          rotulo="Entram"
          valor={r.adicionar.length}
          destaque={r.adicionar.length > 0}
        />
        <Numero
          testId="previa-voltam"
          rotulo="Voltam"
          valor={r.reativar.length}
          dica="tinham sido removidos"
        />
        <Numero
          testId="previa-ja-na-turma"
          rotulo="Já na turma"
          valor={r.jaNaTurma.length}
          dica="ficam como estão"
        />
        <Numero
          testId="previa-vagas"
          rotulo="Vagas"
          valor={
            r.vagas.limite === null
              ? r.vagas.depois
              : `${r.vagas.depois}/${r.vagas.limite}`
          }
          dica={r.vagas.limite === null ? "ilimitadas" : "ocupadas depois"}
          alerta={r.avisos.excedeVagas}
        />
      </div>

      {r.recusados.length > 0 ? (
        <div className="rounded-xl border border-red-200 bg-red-50/70 p-3 text-sm text-red-900">
          <div className="font-medium">
            {plural(r.recusados.length, "aluno não pode", "alunos não podem")}{" "}
            entrar
          </div>
          <ul className="mt-1 space-y-0.5 text-red-800">
            {r.recusados.map((x) => (
              <li key={x.alunoId}>
                {x.nome ?? "Aluno"}: {x.motivo}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {alertas.length > 0 ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3 text-sm text-amber-950">
          <ul className="space-y-1.5">
            {alertas.map((alerta) => (
              <li key={alerta} className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600" />
                {alerta}
              </li>
            ))}
          </ul>
          {pedeCiencia ? (
            <label className="mt-3 flex cursor-pointer items-start gap-2 border-t border-amber-200 pt-3 font-medium">
              <input
                type="checkbox"
                className="mt-0.5 size-4 cursor-pointer accent-[var(--primary-color)]"
                checked={ciente}
                onChange={(event) => onCiente(event.target.checked)}
              />
              Estou ciente dos avisos acima e quero continuar.
            </label>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

/** O que ainda falta para poder confirmar (vazio = pronto) */
function pendenciasDaAdicao(
  previa: PreviaDeAdicao,
  ciente: boolean,
  pagamento: PagamentoMatricula | null,
  motivo: string,
  semAlunos: string,
) {
  const r = previa.resultado;
  const faltam: string[] = [];
  if (!previa.chave) faltam.push(semAlunos);
  else if (r && r.adicionar.length + r.reativar.length === 0) {
    faltam.push("alguém que possa entrar");
  }
  if (!pagamento) faltam.push("pagamento");
  if (!motivoValido(motivo)) faltam.push("motivo");
  if (r && adicaoPedeCiencia(r) && !ciente) faltam.push("confirmar os avisos");
  return faltam;
}

const podeConfirmarAdicao = (previa: PreviaDeAdicao, pendencias: string[]) =>
  Boolean(previa.resultado) && pendencias.length === 0;

// ---------------------------------------------------------------------------
// Adicionar alunos (pela turma)
// ---------------------------------------------------------------------------

function ResultadosDaBusca({
  termo,
  buscando,
  resultados,
  escolhidos,
  onAlternar,
}: {
  termo: string;
  buscando: boolean;
  resultados: UsuarioGenerico[] | null;
  escolhidos: AlunoEscolhido[];
  onAlternar: (u: UsuarioGenerico) => void;
}) {
  if (buscando) {
    return (
      <div className="space-y-1 rounded-xl border border-gray-200 p-2">
        {Array.from({ length: 3 }, (_, i) => (
          <Skeleton key={i} className="h-11 w-full rounded-lg" />
        ))}
      </div>
    );
  }
  if (!resultados) return null;
  if (resultados.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-200 px-3 py-4 text-center text-sm text-gray-500">
        Nenhum aluno encontrado com “{termo}”.
      </div>
    );
  }
  return (
    <ul
      className="max-h-64 space-y-0.5 overflow-y-auto rounded-xl border border-gray-200 p-1"
      aria-label="Alunos encontrados"
    >
      {resultados.map((u) => {
        const escolhido = escolhidos.some((a) => a.id === u.id);
        const inativo = Boolean(u.status && u.status !== "ATIVO");
        return (
          <li key={u.id}>
            <button
              type="button"
              onClick={() => onAlternar(u)}
              aria-pressed={escolhido}
              // A API recusa conta bloqueada ou não liberada: nem deixa marcar
              disabled={inativo && !escolhido}
              className={cn(
                "flex w-full cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2 text-left text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-60",
                escolhido
                  ? "bg-[var(--primary-color)]/5 ring-1 ring-[var(--primary-color)]/30"
                  : "hover:bg-gray-50",
              )}
            >
              <AvatarCustom
                name={u.nomeCompleto}
                size="sm"
                showStatus={false}
              />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium text-gray-900">
                  {u.nomeCompleto}
                </span>
                <span className="block truncate text-xs text-gray-500">
                  {[u.cpf ? formatCpf(u.cpf) : null, u.email]
                    .filter(Boolean)
                    .join(" · ")}
                </span>
              </span>
              {inativo ? (
                <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800">
                  {u.status === "PENDENTE"
                    ? "Conta não liberada"
                    : "Conta bloqueada"}
                </span>
              ) : null}
              <span
                aria-hidden
                className={cn(
                  inativo && !escolhido ? "hidden" : "flex",
                  "size-5 shrink-0 items-center justify-center rounded-full border transition-colors",
                  escolhido
                    ? "border-[var(--primary-color)] bg-[var(--primary-color)] text-white"
                    : "border-gray-300 bg-white",
                )}
              >
                {escolhido ? <Check className="size-3.5" /> : null}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export function ModalAdicionarAlunos({
  cursoId,
  turma,
  alunosIniciais = [],
  onFechar,
  onConcluido,
}: {
  cursoId: number | string;
  turma: TurmaDaAcao;
  /** Já escolhidos ao abrir (ex.: devolver um aluno removido) */
  alunosIniciais?: AlunoEscolhido[];
  onFechar: () => void;
  onConcluido: (mensagem: string) => void;
}) {
  const migrada = ehTurmaMigrada(turma.codigo);
  const semCobranca = motivoSemCobranca(turma.status);
  const [busca, setBusca] = useState("");
  const termo = useDebouncedValue(termoDeBusca(busca), 350);
  const [resultados, setResultados] = useState<UsuarioGenerico[] | null>(null);
  const [buscando, setBuscando] = useState(false);
  const [escolhidos, setEscolhidos] =
    useState<AlunoEscolhido[]>(alunosIniciais);
  const [pagamento, setPagamento] = useState<PagamentoMatricula | null>(null);
  const [motivo, setMotivo] = useState("");
  const [avisar, setAvisar] = useState(!migrada);
  const [cienteDe, setCienteDe] = useState("");
  const [aplicando, setAplicando] = useState(false);

  const alunoIds = useMemo(() => escolhidos.map((a) => a.id), [escolhidos]);
  const previa = usePreviaAdicao(cursoId, turma.id, alunoIds, pagamento);
  const ciente = cienteDe !== "" && cienteDe === previa.chave;
  const pendencias = pendenciasDaAdicao(
    previa,
    ciente,
    pagamento,
    motivo,
    "escolher os alunos",
  );

  useEffect(() => {
    if (termo.length < 3) {
      setResultados(null);
      return;
    }
    let ativo = true;
    setBuscando(true);
    listUsuarios({ role: "ALUNO_CANDIDATO", search: termo, limit: 8 })
      .then((r) => ativo && setResultados(r.usuarios ?? []))
      .catch(() => ativo && setResultados([]))
      .finally(() => ativo && setBuscando(false));
    return () => {
      ativo = false;
    };
  }, [termo]);

  const alternar = (u: UsuarioGenerico) =>
    setEscolhidos((atual) =>
      atual.some((a) => a.id === u.id)
        ? atual.filter((a) => a.id !== u.id)
        : atual.length >= MAX_ALUNOS
          ? atual
          : [
              ...atual,
              { id: u.id, nome: u.nomeCompleto, cpf: u.cpf, email: u.email },
            ],
    );

  const aplicar = async () => {
    if (!pagamento) return;
    setAplicando(true);
    try {
      const r = await adicionarAlunosTurma(cursoId, turma.id, {
        alunoIds,
        motivo: motivo.trim(),
        pagamento,
        avisar,
        origem: "TURMA",
      });
      onConcluido(mensagemDaAdicao(r));
    } catch (e) {
      toastCustom.error(mensagemDoErro(e));
    } finally {
      setAplicando(false);
    }
  };

  const entram = previa.resultado
    ? previa.resultado.adicionar.length + previa.resultado.reativar.length
    : 0;
  const curta = busca.trim().length > 0 && busca.trim().length < 3;

  return (
    <ModalCustom
      isOpen
      onOpenChange={(aberto) => !aberto && !aplicando && onFechar()}
      size="2xl"
      backdrop="blur"
      scrollBehavior="inside"
    >
      <ModalContentWrapper>
        <ModalHeader>
          <ModalTitle>Adicionar alunos à turma</ModalTitle>
          <DadosDaTurma turma={turma} />
        </ModalHeader>
        <ModalBody className="divide-y divide-gray-100 p-1">
          <Etapa
            numero={1}
            titulo="Alunos"
            dica={
              escolhidos.length > 0
                ? plural(escolhidos.length, "escolhido", "escolhidos")
                : "nome, CPF, e-mail ou código"
            }
          >
            <InputCustom
              label="Buscar aluno"
              placeholder="Ex.: Maria Silva ou 123.456.789-00"
              value={busca}
              onChange={(event) => setBusca(event.target.value)}
              icon="Search"
            />
            {curta ? (
              <div className="text-xs text-gray-500">
                Digite pelo menos 3 caracteres.
              </div>
            ) : null}
            <ResultadosDaBusca
              termo={termo}
              buscando={buscando}
              resultados={resultados}
              escolhidos={escolhidos}
              onAlternar={alternar}
            />
            {escolhidos.length > 0 ? (
              <div className="rounded-xl bg-gray-50 p-3">
                <div className="mb-2 flex items-center justify-between text-xs text-gray-600">
                  <span className="font-medium">Vão para a turma</span>
                  <button
                    type="button"
                    onClick={() => setEscolhidos([])}
                    className="cursor-pointer text-gray-500 underline-offset-2 hover:text-gray-800 hover:underline"
                  >
                    Limpar
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {escolhidos.map((a) => (
                    <span
                      key={a.id}
                      className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white py-1 pl-3 pr-1 text-xs text-gray-800"
                    >
                      {a.nome}
                      <button
                        type="button"
                        aria-label={`Tirar ${a.nome}`}
                        onClick={() =>
                          setEscolhidos((atual) =>
                            atual.filter((x) => x.id !== a.id),
                          )
                        }
                        className="cursor-pointer rounded-full p-0.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                      >
                        <X className="size-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            ) : !resultados && !buscando && !curta ? (
              <div className="flex items-center gap-2 rounded-xl border border-dashed border-gray-200 px-3 py-4 text-sm text-gray-500">
                <Search className="size-4 shrink-0" />
                Busque e marque os alunos que vão entrar. Dá para escolher
                vários.
              </div>
            ) : null}
          </Etapa>

          <Etapa numero={2} titulo="Pagamento">
            <CampoPagamento
              valor={pagamento}
              onChange={setPagamento}
              semCobranca={semCobranca}
            />
          </Etapa>

          <Etapa numero={3} titulo="Prévia">
            <PreviaAdicao
              previa={previa}
              ciente={ciente}
              onCiente={(v) => setCienteDe(v ? previa.chave : "")}
              vazio="A prévia aparece quando você escolher os alunos."
            />
          </Etapa>

          <Etapa numero={4} titulo="Registro">
            <CampoMotivo
              valor={motivo}
              onChange={setMotivo}
              placeholder="Ex.: aluno pagou presencialmente; transferido da turma da manhã"
            />
            <CampoAvisar
              valor={avisar}
              onChange={setAvisar}
              migrada={migrada}
              texto={
                pagamento === "COBRANCA_PENDENTE"
                  ? "Notificação no painel e e-mail com o link para pagar."
                  : "Notificação no painel e e-mail com o acesso à turma."
              }
            />
          </Etapa>
        </ModalBody>
        <ModalFooter>
          <RodapeDaAcao
            pendencias={pendencias}
            resumo={`${plural(entram, "aluno", "alunos")} · ${
              pagamento ? ROTULO_PAGAMENTO[pagamento] : ""
            }${avisar ? " · com aviso" : " · sem aviso"}`}
          >
            <ButtonCustom
              variant="outline"
              onClick={onFechar}
              disabled={aplicando}
            >
              Cancelar
            </ButtonCustom>
            <ButtonCustom
              variant="primary"
              onClick={aplicar}
              isLoading={aplicando}
              loadingText="Adicionando..."
              disabled={!podeConfirmarAdicao(previa, pendencias)}
            >
              Adicionar {plural(entram, "aluno", "alunos")}
            </ButtonCustom>
          </RodapeDaAcao>
        </ModalFooter>
      </ModalContentWrapper>
    </ModalCustom>
  );
}

// ---------------------------------------------------------------------------
// Associar o aluno a uma turma (pelo cadastro do aluno)
// ---------------------------------------------------------------------------

export function ModalAssociarTurma({
  aluno,
  onFechar,
  onConcluido,
}: {
  aluno: { id: string; nome: string };
  onFechar: () => void;
  onConcluido: (mensagem: string) => void;
}) {
  const [cursos, setCursos] = useState<Curso[] | null>(null);
  const [cursoId, setCursoId] = useState<string | null>(null);
  const [turmas, setTurmas] = useState<CursoTurma[] | null>(null);
  const [turmaId, setTurmaId] = useState<string | null>(null);
  const [pagamento, setPagamento] = useState<PagamentoMatricula | null>(null);
  const [motivo, setMotivo] = useState("");
  const [avisar, setAvisar] = useState(true);
  const [cienteDe, setCienteDe] = useState("");
  const [aplicando, setAplicando] = useState(false);

  useEffect(() => {
    let ativo = true;
    listCursos({ page: 1, pageSize: 500 })
      .then((r) => ativo && setCursos(r.data ?? []))
      .catch((e) => {
        if (!ativo) return;
        toastCustom.error(mensagemDoErro(e));
        setCursos([]);
      });
    return () => {
      ativo = false;
    };
  }, []);

  useEffect(() => {
    setTurmaId(null);
    setTurmas(null);
    if (!cursoId) return;
    let ativo = true;
    listTurmas(cursoId)
      .then((lista) => ativo && setTurmas(lista))
      .catch((e) => {
        if (!ativo) return;
        toastCustom.error(mensagemDoErro(e));
        setTurmas([]);
      });
    return () => {
      ativo = false;
    };
  }, [cursoId]);

  const turma = turmas?.find((t) => t.id === turmaId) ?? null;
  const semCobranca = motivoSemCobranca(turma?.status);
  const migrada = ehTurmaMigrada(turma?.codigo);

  // Trocou de turma: o aviso segue o padrão dela e a cobrança indisponível sai da escolha
  useEffect(() => {
    setAvisar(!ehTurmaMigrada(turma?.codigo));
    setPagamento((atual) =>
      atual === "COBRANCA_PENDENTE" && motivoSemCobranca(turma?.status)
        ? null
        : atual,
    );
  }, [turma?.codigo, turma?.status]);

  const alunoIds = useMemo(() => [aluno.id], [aluno.id]);
  const previa = usePreviaAdicao(
    cursoId,
    turmaId,
    turmaId ? alunoIds : [],
    pagamento,
  );
  const ciente = cienteDe !== "" && cienteDe === previa.chave;
  const pendencias = pendenciasDaAdicao(
    previa,
    ciente,
    pagamento,
    motivo,
    "escolher a turma",
  );

  const opcoesCursos = useMemo(
    () =>
      (cursos ?? []).map((c) => ({
        value: String(c.id),
        label: c.codigo ? `${c.nome} (${c.codigo})` : c.nome,
        searchKeywords: [c.codigo ?? ""],
      })),
    [cursos],
  );
  const opcoesTurmas = useMemo(
    () =>
      (turmas ?? []).map((t) => {
        const status = (t.status ?? "").toUpperCase();
        return {
          value: t.id,
          label: [t.nome, t.codigo, STATUS_TURMA[status] ?? status]
            .filter(Boolean)
            .join(" · "),
          disabled: status === "CANCELADO",
          searchKeywords: [t.codigo ?? ""],
        };
      }),
    [turmas],
  );

  const aplicar = async () => {
    if (!cursoId || !turmaId || !pagamento) return;
    setAplicando(true);
    try {
      const r = await adicionarAlunosTurma(cursoId, turmaId, {
        alunoIds,
        motivo: motivo.trim(),
        pagamento,
        avisar,
        origem: "ALUNO",
      });
      onConcluido(
        r.reativar.length > 0
          ? `${aluno.nome} voltou para a turma ${turma?.nome ?? ""}.`
          : `${aluno.nome} foi associado à turma ${turma?.nome ?? ""}.`,
      );
    } catch (e) {
      toastCustom.error(mensagemDoErro(e));
    } finally {
      setAplicando(false);
    }
  };

  return (
    <ModalCustom
      isOpen
      onOpenChange={(aberto) => !aberto && !aplicando && onFechar()}
      size="2xl"
      backdrop="blur"
      scrollBehavior="inside"
    >
      <ModalContentWrapper>
        <ModalHeader>
          <ModalTitle>Associar a uma turma</ModalTitle>
          <ModalDescription asChild>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600 sm:justify-start">
              <AvatarCustom name={aluno.nome} size="sm" showStatus={false} />
              <span className="font-medium text-gray-800">{aluno.nome}</span>
            </div>
          </ModalDescription>
        </ModalHeader>
        <ModalBody className="divide-y divide-gray-100 p-1">
          <Etapa
            numero={1}
            titulo="Turma"
            dica={
              turma
                ? [
                    turma.codigo,
                    STATUS_TURMA[(turma.status ?? "").toUpperCase()],
                  ]
                    .filter(Boolean)
                    .join(" · ")
                : undefined
            }
          >
            {cursos === null ? (
              <Skeleton className="h-12 w-full rounded-md" />
            ) : (
              <SelectCustom
                label="Curso"
                placeholder="Escolha o curso"
                options={opcoesCursos}
                value={cursoId}
                onChange={setCursoId}
                searchable
                required
              />
            )}
            {cursoId ? (
              turmas === null ? (
                <Skeleton className="h-12 w-full rounded-md" />
              ) : turmas.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-200 px-3 py-4 text-sm text-gray-500">
                  Este curso não tem turmas.
                </div>
              ) : (
                <SelectCustom
                  label="Turma"
                  placeholder="Escolha a turma"
                  options={opcoesTurmas}
                  value={turmaId}
                  onChange={setTurmaId}
                  searchable
                  required
                />
              )
            ) : null}
            {migrada ? (
              <div className="text-xs text-violet-700">
                Turma migrada do sistema antigo.
              </div>
            ) : null}
          </Etapa>

          <Etapa numero={2} titulo="Pagamento">
            <CampoPagamento
              valor={pagamento}
              onChange={setPagamento}
              semCobranca={semCobranca}
            />
          </Etapa>

          <Etapa numero={3} titulo="Prévia">
            <PreviaAdicao
              previa={previa}
              ciente={ciente}
              onCiente={(v) => setCienteDe(v ? previa.chave : "")}
              vazio="A prévia aparece quando você escolher a turma."
            />
          </Etapa>

          <Etapa numero={4} titulo="Registro">
            <CampoMotivo
              valor={motivo}
              onChange={setMotivo}
              placeholder="Ex.: aluno pagou presencialmente; regularização da turma migrada"
            />
            <CampoAvisar
              valor={avisar}
              onChange={setAvisar}
              migrada={migrada}
              texto={
                pagamento === "COBRANCA_PENDENTE"
                  ? "Notificação no painel e e-mail com o link para pagar."
                  : "Notificação no painel e e-mail com o acesso à turma."
              }
            />
          </Etapa>
        </ModalBody>
        <ModalFooter>
          <RodapeDaAcao
            pendencias={pendencias}
            resumo={`${turma?.nome ?? ""} · ${
              pagamento ? ROTULO_PAGAMENTO[pagamento] : ""
            }${avisar ? " · com aviso" : " · sem aviso"}`}
          >
            <ButtonCustom
              variant="outline"
              onClick={onFechar}
              disabled={aplicando}
            >
              Cancelar
            </ButtonCustom>
            <ButtonCustom
              variant="primary"
              onClick={aplicar}
              isLoading={aplicando}
              loadingText="Associando..."
              disabled={!podeConfirmarAdicao(previa, pendencias)}
            >
              Associar à turma
            </ButtonCustom>
          </RodapeDaAcao>
        </ModalFooter>
      </ModalContentWrapper>
    </ModalCustom>
  );
}

// ---------------------------------------------------------------------------
// Remover da turma (desvincula sem apagar)
// ---------------------------------------------------------------------------

export function ModalRemoverAlunos({
  cursoId,
  turma,
  inscricaoIds,
  onFechar,
  onConcluido,
}: {
  cursoId: number | string;
  turma: TurmaDaAcao;
  inscricaoIds: string[];
  onFechar: () => void;
  onConcluido: (mensagem: string) => void;
}) {
  const migrada = ehTurmaMigrada(turma.codigo);
  // Os escolhidos do momento em que o modal abriu (a lista ao fundo recarrega sozinha)
  const [ids] = useState(() => [...inscricaoIds]);
  const [previa, setPrevia] = useState<ResultadoRemocao | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [rodada, setRodada] = useState(0);
  const [motivo, setMotivo] = useState("");
  const [avisar, setAvisar] = useState(!migrada);
  const [aplicando, setAplicando] = useState(false);

  useEffect(() => {
    let ativo = true;
    setPrevia(null);
    setErro(null);
    removerAlunosTurma(cursoId, turma.id, {
      inscricaoIds: ids,
      motivo: PREVIA,
      simular: true,
    })
      .then((r) => ativo && setPrevia(r))
      .catch((e) => ativo && setErro(mensagemDoErro(e)));
    return () => {
      ativo = false;
    };
  }, [cursoId, turma.id, ids, rodada]);

  const aplicar = async () => {
    if (!previa) return;
    setAplicando(true);
    try {
      const r = await removerAlunosTurma(cursoId, turma.id, {
        inscricaoIds: ids,
        motivo: motivo.trim(),
        avisar,
        totalEsperado: previa.remover.length,
      });
      const total = r.remover.length;
      onConcluido(
        `${plural(total, "aluno removido", "alunos removidos")} da turma.`,
      );
    } catch (e) {
      toastCustom.error(mensagemDoErro(e));
      // A turma mudou desde a prévia: mostra a prévia nova
      setRodada((r) => r + 1);
    } finally {
      setAplicando(false);
    }
  };

  const total = previa?.remover.length ?? 0;
  const pendencias = [
    ...(previa && total === 0 ? ["alguém ativo na turma"] : []),
    ...(!motivoValido(motivo) ? ["motivo"] : []),
  ];

  return (
    <ModalCustom
      isOpen
      onOpenChange={(aberto) => !aberto && !aplicando && onFechar()}
      size="lg"
      backdrop="blur"
      scrollBehavior="inside"
    >
      <ModalContentWrapper>
        <ModalHeader>
          <ModalTitle>Remover da turma</ModalTitle>
          <DadosDaTurma turma={turma} />
        </ModalHeader>
        <ModalBody className="divide-y divide-gray-100 p-1">
          <Etapa numero={1} titulo="Prévia">
            <div className="flex items-start gap-2 text-sm text-gray-600">
              <Info className="mt-0.5 size-4 shrink-0" />
              <span>
                O aluno sai da lista da turma (fica em “Removidos”) e pode ser
                adicionado de volta depois. Nada é apagado.
              </span>
            </div>
            {erro ? (
              <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                {erro}
              </div>
            ) : previa ? (
              <div data-testid="previa-remocao">
                <CaixaPrevia
                  titulo={
                    total > 0
                      ? nomesResumidos(previa.remover.map((x) => x.nome))
                      : "Prévia"
                  }
                  frases={
                    frasesDaRemocao(previa).length > 0
                      ? frasesDaRemocao(previa)
                      : ["Nenhum dos escolhidos está ativo nesta turma."]
                  }
                />
              </div>
            ) : (
              <Skeleton className="h-16 w-full rounded-xl" />
            )}
          </Etapa>
          <Etapa numero={2} titulo="Registro">
            <CampoMotivo
              valor={motivo}
              onChange={setMotivo}
              placeholder="Ex.: matriculado na turma errada; desistiu antes de começar"
            />
            <CampoAvisar
              valor={avisar}
              onChange={setAvisar}
              migrada={migrada}
              texto="Notificação no painel do aluno."
            />
          </Etapa>
        </ModalBody>
        <ModalFooter>
          <RodapeDaAcao
            pendencias={pendencias}
            resumo={`${plural(total, "aluno sai", "alunos saem")} da turma${
              avisar ? " · com aviso" : " · sem aviso"
            }`}
          >
            <ButtonCustom
              variant="outline"
              onClick={onFechar}
              disabled={aplicando}
            >
              Cancelar
            </ButtonCustom>
            <ButtonCustom
              variant="danger"
              onClick={aplicar}
              isLoading={aplicando}
              loadingText="Removendo..."
              disabled={!previa || pendencias.length > 0}
            >
              Remover {plural(total, "aluno", "alunos")}
            </ButtonCustom>
          </RodapeDaAcao>
        </ModalFooter>
      </ModalContentWrapper>
    </ModalCustom>
  );
}
