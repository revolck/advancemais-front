"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Info, X } from "lucide-react";

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
import { ButtonCustom } from "@/components/ui/custom/button";
import { InputCustom } from "@/components/ui/custom/input";
import {
  ModalBody,
  ModalContentWrapper,
  ModalCustom,
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
  ehTurmaMigrada,
  frasesDaAdicao,
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

const mensagemDaAdicao = (r: ResultadoAdicao) => {
  const entraram = r.adicionar.length + r.reativar.length;
  return `${entraram} aluno${entraram === 1 ? "" : "s"} na turma.`;
};

/**
 * Prévia de quem entra, refeita quando muda a turma, os alunos ou o pagamento.
 * Só vale a prévia da combinação atual (a anterior some enquanto a nova chega).
 */
function usePreviaAdicao(
  cursoId: number | string | null,
  turmaId: string | null,
  alunoIds: string[],
  pagamento: PagamentoMatricula | null
) {
  const chave =
    cursoId && turmaId && alunoIds.length > 0
      ? JSON.stringify([String(cursoId), turmaId, pagamento ?? "CONCEDIDO", alunoIds])
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
    adicionarAlunosTurma(curso, turma, { alunoIds: ids, motivo: PREVIA, pagamento: pag, simular: true })
      .then((resultado) => ativo && setEstado({ chave: chaveAtrasada, resultado, erro: null }))
      .catch(
        (e) => ativo && setEstado({ chave: chaveAtrasada, resultado: null, erro: mensagemDoErro(e) })
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

/** Prévia + confirmação dos avisos (turma concluída ou vagas estouradas) */
function PreviaAdicao({
  previa,
  ciente,
  onCiente,
  vazio,
}: {
  previa: ReturnType<typeof usePreviaAdicao>;
  ciente: boolean;
  onCiente: (v: boolean) => void;
  vazio: string;
}) {
  if (!previa.chave) {
    return (
      <div className="flex items-start gap-2 rounded-xl border border-dashed border-gray-200 p-3 text-sm text-gray-500">
        <Info className="mt-0.5 size-4 shrink-0" />
        {vazio}
      </div>
    );
  }
  if (previa.carregando) return <Skeleton className="h-20 w-full rounded-xl" />;
  if (previa.erro) {
    return <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{previa.erro}</div>;
  }
  const r = previa.resultado!;
  const { frases, alertas } = frasesDaAdicao(r);
  return (
    <div className="space-y-2" data-testid="previa-adicao">
      <CaixaPrevia titulo="Prévia" frases={frases} alertas={alertas} />
      {r.recusados.length > 0 ? (
        <div className="rounded-xl border border-red-200 bg-red-50/60 p-3 text-sm text-red-900">
          <div className="font-semibold">Não podem entrar:</div>
          <ul className="mt-1 space-y-0.5">
            {r.recusados.map((x) => (
              <li key={x.alunoId}>
                {x.nome ?? "Aluno"}: {x.motivo}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {adicaoPedeCiencia(r) ? (
        <label className="flex cursor-pointer items-start gap-2 text-sm text-gray-800">
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
  );
}

const podeConfirmarAdicao = (
  previa: ReturnType<typeof usePreviaAdicao>,
  ciente: boolean,
  pagamento: PagamentoMatricula | null,
  motivo: string
) => {
  const r = previa.resultado;
  if (!r || !pagamento || !motivoValido(motivo)) return false;
  if (r.adicionar.length + r.reativar.length === 0) return false;
  return !adicaoPedeCiencia(r) || ciente;
};

// ---------------------------------------------------------------------------
// Adicionar alunos (pela turma)
// ---------------------------------------------------------------------------

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
  const [escolhidos, setEscolhidos] = useState<AlunoEscolhido[]>(alunosIniciais);
  const [pagamento, setPagamento] = useState<PagamentoMatricula | null>(null);
  const [motivo, setMotivo] = useState("");
  const [avisar, setAvisar] = useState(!migrada);
  const [cienteDe, setCienteDe] = useState("");
  const [aplicando, setAplicando] = useState(false);

  const alunoIds = useMemo(() => escolhidos.map((a) => a.id), [escolhidos]);
  const previa = usePreviaAdicao(cursoId, turma.id, alunoIds, pagamento);
  const ciente = cienteDe !== "" && cienteDe === previa.chave;

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
          : [...atual, { id: u.id, nome: u.nomeCompleto, cpf: u.cpf, email: u.email }]
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

  const entram = previa.resultado ? previa.resultado.adicionar.length + previa.resultado.reativar.length : 0;

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
        </ModalHeader>
        <ModalBody className="space-y-4">
          <div className="space-y-2">
            <InputCustom
              label="Buscar aluno"
              placeholder="Nome, CPF, e-mail ou código"
              value={busca}
              onChange={(event) => setBusca(event.target.value)}
              icon="Search"
            />
            {busca.trim().length > 0 && busca.trim().length < 3 ? (
              <div className="text-xs text-gray-500">Digite pelo menos 3 caracteres.</div>
            ) : null}
            {buscando ? (
              <Skeleton className="h-24 w-full rounded-xl" />
            ) : resultados ? (
              resultados.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-200 p-3 text-sm text-gray-500">
                  Nenhum aluno encontrado com “{termo}”.
                </div>
              ) : (
                <ul
                  className="max-h-60 divide-y divide-gray-100 overflow-y-auto rounded-xl border border-gray-200"
                  aria-label="Alunos encontrados"
                >
                  {resultados.map((u) => {
                    const escolhido = escolhidos.some((a) => a.id === u.id);
                    const inativo = u.status && u.status !== "ATIVO";
                    return (
                      <li key={u.id}>
                        <button
                          type="button"
                          onClick={() => alternar(u)}
                          aria-pressed={escolhido}
                          className={cn(
                            "flex w-full cursor-pointer items-center gap-3 px-3 py-2.5 text-left text-sm transition-colors hover:bg-gray-50",
                            escolhido && "bg-[var(--primary-color)]/5"
                          )}
                        >
                          <span
                            className={cn(
                              "flex size-5 shrink-0 items-center justify-center rounded border",
                              escolhido
                                ? "border-[var(--primary-color)] bg-[var(--primary-color)] text-white"
                                : "border-gray-300"
                            )}
                          >
                            {escolhido ? <Check className="size-3.5" /> : null}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate font-medium text-gray-900">
                              {u.nomeCompleto}
                            </span>
                            <span className="block truncate text-xs text-gray-500">
                              {[u.cpf ? formatCpf(u.cpf) : null, u.email].filter(Boolean).join(" · ")}
                            </span>
                          </span>
                          {inativo ? (
                            <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800">
                              {u.status === "PENDENTE" ? "Conta não liberada" : "Conta bloqueada"}
                            </span>
                          ) : null}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )
            ) : null}
          </div>

          {escolhidos.length > 0 ? (
            <div className="space-y-1.5">
              <div className="text-sm font-medium text-gray-900">
                Escolhidos ({escolhidos.length})
              </div>
              <div className="flex flex-wrap gap-1.5">
                {escolhidos.map((a) => (
                  <span
                    key={a.id}
                    className="inline-flex items-center gap-1 rounded-full bg-gray-100 py-1 pl-3 pr-1 text-xs text-gray-800"
                  >
                    {a.nome}
                    <button
                      type="button"
                      aria-label={`Tirar ${a.nome}`}
                      onClick={() => setEscolhidos((atual) => atual.filter((x) => x.id !== a.id))}
                      className="cursor-pointer rounded-full p-0.5 hover:bg-gray-200"
                    >
                      <X className="size-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          <CampoPagamento valor={pagamento} onChange={setPagamento} semCobranca={semCobranca} />
          <PreviaAdicao
            previa={previa}
            ciente={ciente}
            onCiente={(v) => setCienteDe(v ? previa.chave : "")}
            vazio="Escolha os alunos para ver a prévia."
          />
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
        </ModalBody>
        <ModalFooter>
          <div className="flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <ButtonCustom variant="outline" onClick={onFechar} disabled={aplicando}>
              Cancelar
            </ButtonCustom>
            <ButtonCustom
              variant="primary"
              onClick={aplicar}
              isLoading={aplicando}
              loadingText="Adicionando..."
              disabled={!podeConfirmarAdicao(previa, ciente, pagamento, motivo)}
            >
              Adicionar {entram} aluno{entram === 1 ? "" : "s"}
            </ButtonCustom>
          </div>
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
      atual === "COBRANCA_PENDENTE" && motivoSemCobranca(turma?.status) ? null : atual
    );
  }, [turma?.codigo, turma?.status]);

  const alunoIds = useMemo(() => [aluno.id], [aluno.id]);
  const previa = usePreviaAdicao(cursoId, turmaId, turmaId ? alunoIds : [], pagamento);
  const ciente = cienteDe !== "" && cienteDe === previa.chave;

  const opcoesCursos = useMemo(
    () =>
      (cursos ?? []).map((c) => ({
        value: String(c.id),
        label: c.codigo ? `${c.nome} (${c.codigo})` : c.nome,
        searchKeywords: [c.codigo ?? ""],
      })),
    [cursos]
  );
  const opcoesTurmas = useMemo(
    () =>
      (turmas ?? []).map((t) => {
        const status = (t.status ?? "").toUpperCase();
        return {
          value: t.id,
          label: [t.nome, t.codigo, STATUS_TURMA[status] ?? status].filter(Boolean).join(" · "),
          disabled: status === "CANCELADO",
          searchKeywords: [t.codigo ?? ""],
        };
      }),
    [turmas]
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
          : `${aluno.nome} foi associado à turma ${turma?.nome ?? ""}.`
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
        </ModalHeader>
        <ModalBody className="space-y-4">
          <div className="text-sm text-gray-600">
            Aluno: <strong className="text-gray-900">{aluno.nome}</strong>
          </div>
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
              <div className="rounded-xl border border-dashed border-gray-200 p-3 text-sm text-gray-500">
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

          {turma ? (
            <>
              <CampoPagamento valor={pagamento} onChange={setPagamento} semCobranca={semCobranca} />
              <PreviaAdicao
                previa={previa}
                ciente={ciente}
                onCiente={(v) => setCienteDe(v ? previa.chave : "")}
                vazio="Escolha a turma para ver a prévia."
              />
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
            </>
          ) : null}
        </ModalBody>
        <ModalFooter>
          <div className="flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <ButtonCustom variant="outline" onClick={onFechar} disabled={aplicando}>
              Cancelar
            </ButtonCustom>
            <ButtonCustom
              variant="primary"
              onClick={aplicar}
              isLoading={aplicando}
              loadingText="Associando..."
              disabled={!podeConfirmarAdicao(previa, ciente, pagamento, motivo)}
            >
              Associar à turma
            </ButtonCustom>
          </div>
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
    removerAlunosTurma(cursoId, turma.id, { inscricaoIds: ids, motivo: PREVIA, simular: true })
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
      onConcluido(`${total} aluno${total === 1 ? "" : "s"} removido${total === 1 ? "" : "s"} da turma.`);
    } catch (e) {
      toastCustom.error(mensagemDoErro(e));
      // A turma mudou desde a prévia: mostra a prévia nova
      setRodada((r) => r + 1);
    } finally {
      setAplicando(false);
    }
  };

  const total = previa?.remover.length ?? 0;

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
        </ModalHeader>
        <ModalBody className="space-y-4">
          <div className="flex items-start gap-2 text-sm text-gray-600">
            <Info className="mt-0.5 size-4 shrink-0" />
            <span>
              O aluno sai da lista da turma (fica em “Removidos”) e pode ser adicionado de volta depois.
              Nada é apagado.
            </span>
          </div>
          {erro ? (
            <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{erro}</div>
          ) : previa ? (
            <div data-testid="previa-remocao">
              <CaixaPrevia
                titulo={total > 0 ? nomesResumidos(previa.remover.map((x) => x.nome)) : "Prévia"}
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
        </ModalBody>
        <ModalFooter>
          <div className="flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <ButtonCustom variant="outline" onClick={onFechar} disabled={aplicando}>
              Cancelar
            </ButtonCustom>
            <ButtonCustom
              variant="danger"
              onClick={aplicar}
              isLoading={aplicando}
              loadingText="Removendo..."
              disabled={!previa || total === 0 || !motivoValido(motivo)}
            >
              Remover {total} aluno{total === 1 ? "" : "s"}
            </ButtonCustom>
          </div>
        </ModalFooter>
      </ModalContentWrapper>
    </ModalCustom>
  );
}
