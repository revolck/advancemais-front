"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Award,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  Info,
  UserX,
  X,
} from "lucide-react";

import {
  alterarSituacaoInscricoes,
  emitirCertificadosConcluintes,
  type AlterarSituacaoPayload,
  type ResultadoEmissaoConcluintes,
  type ResumoSituacao,
  type SituacaoInscricao,
} from "@/api/cursos/situacao";
import { ButtonCustom } from "@/components/ui/custom/button";
import {
  ModalBody,
  ModalContentWrapper,
  ModalCustom,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/custom/modal";
import { SimpleTextarea } from "@/components/ui/custom/text-area";
import { toastCustom } from "@/components/ui/custom/toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { extrairCpfs, frasesDoResumo, opcaoDa, OPCOES_SITUACAO } from "./situacao.utils";

interface GestaoSituacaoTurmaProps {
  cursoId: number | string;
  turmaId: string;
  selecionados: string[];
  onLimparSelecao: () => void;
  /** Recarrega a lista e os dados da turma depois de uma mudança */
  onAlterado: () => void;
}

type Modal =
  | { tipo: "selecionados"; situacao: SituacaoInscricao }
  | { tipo: "cpfs" }
  | { tipo: "emitir" }
  | null;

const mensagemDoErro = (erro: unknown) =>
  erro instanceof Error && erro.message ? erro.message : "Não foi possível concluir. Tente novamente.";

const PREVIA = "Prévia da alteração";

/** Caixa com as frases da prévia */
function Previa({ resumo, titulo }: { resumo: ResumoSituacao; titulo?: string }) {
  const revoga = resumo.certificadosARevogar > 0;
  return (
    <div
      className={cn(
        "rounded-xl border p-3 text-sm",
        revoga ? "border-amber-200 bg-amber-50/70 text-amber-950" : "border-gray-200 bg-gray-50 text-gray-800"
      )}
    >
      {titulo ? <div className="mb-1 font-semibold">{titulo}</div> : null}
      <ul className="space-y-1 pl-4 [list-style:disc]">
        {frasesDoResumo(resumo).map((frase) => (
          <li key={frase}>{frase}</li>
        ))}
      </ul>
    </div>
  );
}

function CampoMotivo({ valor, onChange }: { valor: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1.5">
      <div className="text-sm font-medium text-gray-900">
        Motivo <span className="text-red-500">*</span>
      </div>
      <SimpleTextarea
        value={valor}
        onChange={(event) => onChange(event.target.value.slice(0, 480))}
        placeholder="Ex.: não concluiu o curso na plataforma antiga"
        rows={2}
      />
      <div className="text-xs text-gray-500">Fica registrado no histórico de cada aluno.</div>
    </div>
  );
}

/**
 * Ações da equipe sobre os alunos da turma: mudar a situação (selecionados ou lista de
 * CPFs) e emitir os certificados de quem concluiu. Toda alteração mostra a prévia antes.
 */
export function GestaoSituacaoTurma({
  cursoId,
  turmaId,
  selecionados,
  onLimparSelecao,
  onAlterado,
}: GestaoSituacaoTurmaProps) {
  const [modal, setModal] = useState<Modal>(null);
  const fechar = () => setModal(null);
  const concluir = (mensagem: string) => {
    toastCustom.success(mensagem);
    onLimparSelecao();
    onAlterado();
    fechar();
  };

  return (
    <>
      <div className="flex flex-col gap-3 border-b border-gray-200 bg-gray-50/60 p-4 lg:flex-row lg:items-center lg:justify-between">
        {selecionados.length > 0 ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-[var(--primary-color)] px-3 py-1 text-xs font-semibold text-white">
              {selecionados.length} selecionado{selecionados.length === 1 ? "" : "s"}
            </span>
            <ButtonCustom
              size="sm"
              variant="outline"
              onClick={() => setModal({ tipo: "selecionados", situacao: "CONCLUIU" })}
            >
              <CheckCircle2 className="size-4 text-emerald-600" />
              Concluiu
            </ButtonCustom>
            <ButtonCustom
              size="sm"
              variant="outline"
              onClick={() => setModal({ tipo: "selecionados", situacao: "NAO_CONCLUIU" })}
            >
              <UserX className="size-4 text-red-600" />
              Não concluiu (desvincular)
            </ButtonCustom>
            <DropdownMenu>
              {/* Botão simples: o ButtonCustom (animado) dentro do gatilho do menu entra em laço */}
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-md border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                >
                  Outras situações
                  <ChevronDown className="size-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {OPCOES_SITUACAO.filter(
                  (o) => o.valor !== "CONCLUIU" && o.valor !== "NAO_CONCLUIU"
                ).map((o) => (
                  <DropdownMenuItem
                    key={o.valor}
                    className="cursor-pointer"
                    onSelect={() => setModal({ tipo: "selecionados", situacao: o.valor })}
                  >
                    {o.rotulo}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <ButtonCustom size="sm" variant="ghost" onClick={onLimparSelecao}>
              <X className="size-4" />
              Limpar seleção
            </ButtonCustom>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Info className="size-4 shrink-0" />
            Marque alunos na lista para mudar a situação, ou use uma lista de CPFs.
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          <ButtonCustom size="sm" variant="outline" onClick={() => setModal({ tipo: "cpfs" })}>
            <ClipboardList className="size-4" />
            Atualizar por lista de CPFs
          </ButtonCustom>
          <ButtonCustom size="sm" variant="primary" onClick={() => setModal({ tipo: "emitir" })}>
            <Award className="size-4" />
            Emitir certificados dos concluintes
          </ButtonCustom>
        </div>
      </div>

      {modal?.tipo === "selecionados" ? (
        <ModalSelecionados
          cursoId={cursoId}
          turmaId={turmaId}
          situacao={modal.situacao}
          inscricaoIds={selecionados}
          onFechar={fechar}
          onConcluido={concluir}
        />
      ) : null}
      {modal?.tipo === "cpfs" ? (
        <ModalListaCpfs cursoId={cursoId} turmaId={turmaId} onFechar={fechar} onConcluido={concluir} />
      ) : null}
      {modal?.tipo === "emitir" ? (
        <ModalEmitir
          cursoId={cursoId}
          turmaId={turmaId}
          onFechar={fechar}
          onConcluido={(mensagem) => {
            toastCustom.success(mensagem);
            onAlterado();
          }}
        />
      ) : null}
    </>
  );
}

// ---------------------------------------------------------------------------

function ModalSelecionados({
  cursoId,
  turmaId,
  situacao,
  inscricaoIds,
  onFechar,
  onConcluido,
}: {
  cursoId: number | string;
  turmaId: string;
  situacao: SituacaoInscricao;
  inscricaoIds: string[];
  onFechar: () => void;
  onConcluido: (mensagem: string) => void;
}) {
  const opcao = opcaoDa(situacao);
  // Os selecionados do momento em que o modal abriu (a lista ao fundo recarrega sozinha)
  const [ids] = useState(() => [...inscricaoIds]);
  const [motivo, setMotivo] = useState("");
  const [resumo, setResumo] = useState<ResumoSituacao | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [aplicando, setAplicando] = useState(false);

  useEffect(() => {
    let ativo = true;
    alterarSituacaoInscricoes(cursoId, turmaId, {
      inscricaoIds: ids,
      situacao,
      motivo: PREVIA,
      simular: true,
    })
      .then((r) => ativo && setResumo(r))
      .catch((e) => ativo && setErro(mensagemDoErro(e)));
    return () => {
      ativo = false;
    };
  }, [cursoId, turmaId, ids, situacao]);

  const aplicar = async () => {
    if (!resumo) return;
    setAplicando(true);
    try {
      const r = await alterarSituacaoInscricoes(cursoId, turmaId, {
        inscricaoIds: ids,
        situacao,
        motivo: motivo.trim(),
        totalEsperado: resumo.atingidos,
      });
      onConcluido(`${r.mudam} aluno(s) marcados como “${opcao.rotulo}”.`);
    } catch (e) {
      toastCustom.error(mensagemDoErro(e));
    } finally {
      setAplicando(false);
    }
  };

  return (
    <ModalCustom isOpen onOpenChange={(aberto) => !aberto && !aplicando && onFechar()} size="lg" backdrop="blur">
      <ModalContentWrapper>
        <ModalHeader>
          <ModalTitle>{opcao.rotulo}</ModalTitle>
        </ModalHeader>
        <ModalBody className="space-y-4">
          <div className="flex items-start gap-2 text-sm text-gray-600">
            <Info className="mt-0.5 size-4 shrink-0" />
            <span>{opcao.efeito}</span>
          </div>
          {erro ? (
            <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{erro}</div>
          ) : resumo ? (
            <Previa resumo={resumo} />
          ) : (
            <Skeleton className="h-16 w-full rounded-xl" />
          )}
          <CampoMotivo valor={motivo} onChange={setMotivo} />
        </ModalBody>
        <ModalFooter>
          <div className="flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <ButtonCustom variant="outline" onClick={onFechar} disabled={aplicando}>
              Cancelar
            </ButtonCustom>
            <ButtonCustom
              variant={opcao.revoga && (resumo?.certificadosARevogar ?? 0) > 0 ? "danger" : "primary"}
              onClick={aplicar}
              isLoading={aplicando}
              loadingText="Aplicando..."
              disabled={!resumo || resumo.mudam === 0 || motivo.trim().length < 3}
            >
              Aplicar para {resumo?.mudam ?? 0} aluno(s)
            </ButtonCustom>
          </div>
        </ModalFooter>
      </ModalContentWrapper>
    </ModalCustom>
  );
}

// ---------------------------------------------------------------------------

type ModoLista = "NAO_CONCLUIRAM" | "SO_ESTES_CONCLUIRAM" | "CONCLUIRAM";

const MODOS_LISTA: { valor: ModoLista; titulo: string; texto: string }[] = [
  {
    valor: "NAO_CONCLUIRAM",
    titulo: "Estes alunos NÃO concluíram",
    texto: "Os CPFs da lista saem da turma (sem apagar o histórico) e perdem o certificado.",
  },
  {
    valor: "SO_ESTES_CONCLUIRAM",
    titulo: "Somente estes concluíram",
    texto: "Os CPFs da lista ficam como concluídos; todos os outros da turma passam a “não concluiu”.",
  },
  {
    valor: "CONCLUIRAM",
    titulo: "Estes alunos concluíram",
    texto: "Os CPFs da lista ficam como concluídos. Os demais não mudam.",
  },
];

const operacoesDoModo = (
  modo: ModoLista,
  cpfs: string[]
): Omit<AlterarSituacaoPayload, "motivo">[] => {
  if (modo === "NAO_CONCLUIRAM") return [{ cpfs, situacao: "NAO_CONCLUIU" }];
  if (modo === "CONCLUIRAM") return [{ cpfs, situacao: "CONCLUIU" }];
  return [
    { cpfs, situacao: "CONCLUIU" },
    { cpfs, situacao: "NAO_CONCLUIU", aplicarAosDemais: true },
  ];
};

function ModalListaCpfs({
  cursoId,
  turmaId,
  onFechar,
  onConcluido,
}: {
  cursoId: number | string;
  turmaId: string;
  onFechar: () => void;
  onConcluido: (mensagem: string) => void;
}) {
  const [texto, setTexto] = useState("");
  const [modo, setModo] = useState<ModoLista>("NAO_CONCLUIRAM");
  const [motivo, setMotivo] = useState("");
  const [previas, setPrevias] = useState<ResumoSituacao[] | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [aplicando, setAplicando] = useState(false);
  const cpfs = useMemo(() => extrairCpfs(texto), [texto]);
  const operacoes = useMemo(() => operacoesDoModo(modo, cpfs), [modo, cpfs]);

  // Mudou a lista ou o modo: a prévia antiga não vale
  useEffect(() => setPrevias(null), [texto, modo]);

  const verPrevia = async () => {
    setCarregando(true);
    try {
      const resultados: ResumoSituacao[] = [];
      for (const op of operacoes) {
        resultados.push(
          await alterarSituacaoInscricoes(cursoId, turmaId, { ...op, motivo: PREVIA, simular: true })
        );
      }
      setPrevias(resultados);
    } catch (e) {
      toastCustom.error(mensagemDoErro(e));
    } finally {
      setCarregando(false);
    }
  };

  const aplicar = async () => {
    if (!previas) return;
    setAplicando(true);
    try {
      let total = 0;
      for (const [i, op] of operacoes.entries()) {
        if (previas[i].mudam === 0) continue;
        const r = await alterarSituacaoInscricoes(cursoId, turmaId, {
          ...op,
          motivo: motivo.trim(),
          totalEsperado: previas[i].atingidos,
        });
        total += r.mudam;
      }
      onConcluido(`Lista aplicada: ${total} aluno(s) atualizados.`);
    } catch (e) {
      toastCustom.error(mensagemDoErro(e));
    } finally {
      setAplicando(false);
    }
  };

  const naoEncontrados = previas?.[0]?.naoEncontrados ?? [];
  const invalidos = previas?.[0]?.cpfsInvalidos ?? [];
  const mudancas = previas?.reduce((soma, p) => soma + p.mudam, 0) ?? 0;

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
          <ModalTitle>Atualizar por lista de CPFs</ModalTitle>
        </ModalHeader>
        <ModalBody className="space-y-4">
          <div className="space-y-1.5">
            <div className="text-sm font-medium text-gray-900">CPFs</div>
            <SimpleTextarea
              value={texto}
              onChange={(event) => setTexto(event.target.value)}
              placeholder={"Cole a coluna de CPFs da planilha (um por linha)\n111.111.111-11\n22222222222"}
              rows={6}
            />
            <div className="text-xs text-gray-500">
              {cpfs.length} CPF(s) na lista. Pontos e traços são ignorados; zeros que o Excel tirou do
              começo são completados.
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-3">
            {MODOS_LISTA.map((m) => (
              <button
                key={m.valor}
                type="button"
                onClick={() => setModo(m.valor)}
                aria-pressed={modo === m.valor}
                className={cn(
                  "cursor-pointer rounded-xl border p-3 text-left text-sm transition-colors",
                  modo === m.valor
                    ? "border-[var(--primary-color)] bg-[var(--primary-color)]/5 ring-1 ring-[var(--primary-color)]"
                    : "border-gray-200 hover:bg-gray-50"
                )}
              >
                <div className="font-semibold text-gray-900">{m.titulo}</div>
                <div className="mt-1 text-xs leading-relaxed text-gray-600">{m.texto}</div>
              </button>
            ))}
          </div>

          {previas ? (
            <div className="space-y-2">
              {previas.map((p, i) => (
                <Previa
                  key={i}
                  resumo={p}
                  titulo={
                    operacoes[i].aplicarAosDemais
                      ? "Demais alunos da turma → Não concluiu"
                      : `CPFs da lista → ${opcaoDa(operacoes[i].situacao).rotulo}`
                  }
                />
              ))}
              {naoEncontrados.length > 0 || invalidos.length > 0 ? (
                <div className="flex items-start gap-2 rounded-xl border border-gray-200 p-3 text-xs text-gray-600">
                  <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-500" />
                  <div>
                    {naoEncontrados.length > 0 ? (
                      <div>
                        <strong>{naoEncontrados.length}</strong> CPF(s) não estão nesta turma:{" "}
                        {naoEncontrados.slice(0, 15).join(", ")}
                        {naoEncontrados.length > 15 ? "…" : ""}
                      </div>
                    ) : null}
                    {invalidos.length > 0 ? (
                      <div>
                        <strong>{invalidos.length}</strong> valor(es) não são CPF: {invalidos.slice(0, 10).join(", ")}
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}

          {previas ? <CampoMotivo valor={motivo} onChange={setMotivo} /> : null}
        </ModalBody>
        <ModalFooter>
          <div className="flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <ButtonCustom variant="outline" onClick={onFechar} disabled={aplicando}>
              Cancelar
            </ButtonCustom>
            {previas ? (
              <ButtonCustom
                variant={previas.some((p) => p.certificadosARevogar > 0) ? "danger" : "primary"}
                onClick={aplicar}
                isLoading={aplicando}
                loadingText="Aplicando..."
                disabled={mudancas === 0 || motivo.trim().length < 3}
              >
                Aplicar para {mudancas} aluno(s)
              </ButtonCustom>
            ) : (
              <ButtonCustom
                variant="primary"
                onClick={verPrevia}
                isLoading={carregando}
                loadingText="Conferindo..."
                disabled={cpfs.length === 0}
              >
                Ver prévia
              </ButtonCustom>
            )}
          </div>
        </ModalFooter>
      </ModalContentWrapper>
    </ModalCustom>
  );
}

// ---------------------------------------------------------------------------

const MOTIVOS_DE_FALHA: Record<string, string> = {
  ESTAGIO_NAO_CONCLUIDO: "estágio obrigatório não concluído",
  INVALID_CARGA_HORARIA: "curso sem carga horária",
  CERTIFICADO_JA_EXISTE: "já tinha certificado",
};

function ModalEmitir({
  cursoId,
  turmaId,
  onFechar,
  onConcluido,
}: {
  cursoId: number | string;
  turmaId: string;
  onFechar: () => void;
  onConcluido: (mensagem: string) => void;
}) {
  const [pendentes, setPendentes] = useState<number | null>(null);
  const [emitidos, setEmitidos] = useState(0);
  const [falhas, setFalhas] = useState<ResultadoEmissaoConcluintes["falhas"]>([]);
  const [emitindo, setEmitindo] = useState(false);
  const [terminou, setTerminou] = useState(false);

  useEffect(() => {
    emitirCertificadosConcluintes(cursoId, turmaId, { simular: true })
      .then((r) => setPendentes(r.pendentes))
      .catch((e) => {
        toastCustom.error(mensagemDoErro(e));
        setPendentes(0);
      });
  }, [cursoId, turmaId]);

  const emitir = async () => {
    setEmitindo(true);
    let total = 0;
    const todasFalhas: ResultadoEmissaoConcluintes["falhas"] = [];
    try {
      // Em lotes de 100; para quando acabar ou quando um lote não emitir nada (só falhas)
      for (;;) {
        const r = await emitirCertificadosConcluintes(cursoId, turmaId, { limite: 100 });
        total += r.emitidos;
        todasFalhas.push(...r.falhas);
        setEmitidos(total);
        setFalhas([...todasFalhas]);
        if (r.restantes === 0 || r.emitidos === 0) break;
      }
      setTerminou(true);
      if (total > 0) onConcluido(`${total} certificado(s) emitido(s).`);
    } catch (e) {
      toastCustom.error(mensagemDoErro(e));
    } finally {
      setEmitindo(false);
    }
  };

  const porMotivo = falhas.reduce<Record<string, number>>((acc, f) => {
    acc[f.codigo] = (acc[f.codigo] ?? 0) + 1;
    return acc;
  }, {});
  const progresso = pendentes ? Math.min(100, Math.round((emitidos / pendentes) * 100)) : 0;

  return (
    <ModalCustom isOpen onOpenChange={(aberto) => !aberto && !emitindo && onFechar()} size="lg" backdrop="blur">
      <ModalContentWrapper>
        <ModalHeader>
          <ModalTitle>Emitir certificados dos concluintes</ModalTitle>
        </ModalHeader>
        <ModalBody className="space-y-4 text-sm">
          {pendentes === null ? (
            <Skeleton className="h-12 w-full rounded-xl" />
          ) : pendentes === 0 && !terminou ? (
            <div className="flex items-start gap-2 rounded-xl bg-emerald-50 p-3 text-emerald-900">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
              Todos os alunos marcados como “Concluiu” já têm certificado.
            </div>
          ) : (
            <>
              <div className="text-gray-700">
                {terminou ? (
                  <>
                    <strong>{emitidos}</strong> certificado(s) emitido(s).
                  </>
                ) : (
                  <>
                    <strong>{pendentes}</strong> aluno(s) estão como “Concluiu” e ainda não têm certificado.
                    Só eles recebem: quem está como não concluiu, reprovado, trancado ou cursando fica de fora.
                  </>
                )}
              </div>
              {emitindo || terminou ? (
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-[var(--primary-color)] transition-all"
                    style={{ width: `${progresso}%` }}
                  />
                </div>
              ) : null}
            </>
          )}
          {falhas.length > 0 ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3 text-amber-950">
              <div className="font-semibold">{falhas.length} não puderam receber agora:</div>
              <ul className="mt-1 pl-4 [list-style:disc]">
                {Object.entries(porMotivo).map(([codigo, qtd]) => (
                  <li key={codigo}>
                    {qtd} — {MOTIVOS_DE_FALHA[codigo] ?? falhas.find((f) => f.codigo === codigo)?.motivo}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </ModalBody>
        <ModalFooter>
          <div className="flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <ButtonCustom variant="outline" onClick={onFechar} disabled={emitindo}>
              {terminou ? "Fechar" : "Cancelar"}
            </ButtonCustom>
            {!terminou ? (
              <ButtonCustom
                variant="primary"
                onClick={emitir}
                isLoading={emitindo}
                loadingText={`Emitindo... ${emitidos}/${pendentes ?? 0}`}
                disabled={!pendentes}
              >
                Emitir {pendentes ?? 0} certificado(s)
              </ButtonCustom>
            ) : null}
          </div>
        </ModalFooter>
      </ModalContentWrapper>
    </ModalCustom>
  );
}
