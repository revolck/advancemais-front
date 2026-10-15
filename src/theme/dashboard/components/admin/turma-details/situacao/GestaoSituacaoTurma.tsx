"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Award,
  CheckCircle2,
  ChevronDown,
  History,
  Info,
  MoreVertical,
  RotateCcw,
  UserMinus,
  UserPlus,
  UserX,
  X,
} from "lucide-react";

import { createCertificado } from "@/api/cursos";
import type { TurmaInscricao } from "@/api/cursos";
import {
  alterarSituacaoInscricoes,
  emitirCertificadosConcluintes,
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
import { toastCustom } from "@/components/ui/custom/toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { CampoAvisar, CampoMotivo, mensagemDoErro, motivoValido, PREVIA } from "./campos";
import {
  ModalAdicionarAlunos,
  ModalRemoverAlunos,
  type AlunoEscolhido,
  type TurmaDaAcao,
} from "./MatriculaEquipe";
import { ehTurmaMigrada, frasesDoResumo, opcaoDa, OPCOES_SITUACAO } from "./situacao.utils";

interface GestaoSituacaoTurmaProps {
  cursoId: number | string;
  turma: TurmaDaAcao;
  selecionados: string[];
  onLimparSelecao: () => void;
  /** Recarrega a lista e os dados da turma depois de uma mudança */
  onAlterado: () => void;
}

type Modal =
  | { tipo: "situacao"; situacao: SituacaoInscricao }
  | { tipo: "remover" }
  | { tipo: "adicionar" }
  | { tipo: "emitir" }
  | null;

/** Situação que a equipe escolhe, a partir do status da inscrição */
const SITUACAO_DO_STATUS: Record<string, SituacaoInscricao> = {
  CONCLUIDO: "CONCLUIU",
  CANCELADO: "NAO_CONCLUIU",
  REPROVADO: "REPROVADO",
  TRANCADO: "TRANCADO",
  INSCRITO: "CURSANDO",
  EM_ANDAMENTO: "CURSANDO",
};

/** Caixa com as frases da prévia de situação */
function Previa({ resumo }: { resumo: ResumoSituacao }) {
  const revoga = resumo.certificadosARevogar > 0;
  return (
    <div
      className={cn(
        "rounded-xl border p-3 text-sm",
        revoga ? "border-amber-200 bg-amber-50/70 text-amber-950" : "border-gray-200 bg-gray-50 text-gray-800"
      )}
    >
      <ul className="space-y-1 pl-4 [list-style:disc]">
        {frasesDoResumo(resumo).map((frase) => (
          <li key={frase}>{frase}</li>
        ))}
      </ul>
    </div>
  );
}

/** Botão simples: o ButtonCustom (animado) dentro do gatilho do menu entra em laço */
const GATILHO =
  "inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-md border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50";

/**
 * Ações da equipe sobre os alunos da turma: adicionar, remover, mudar a situação dos
 * selecionados e emitir os certificados de quem concluiu. Toda alteração mostra a prévia antes.
 */
export function GestaoSituacaoTurma({
  cursoId,
  turma,
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
              onClick={() => setModal({ tipo: "situacao", situacao: "CONCLUIU" })}
            >
              <CheckCircle2 className="size-4 text-emerald-600" />
              Concluiu
            </ButtonCustom>
            <ButtonCustom
              size="sm"
              variant="outline"
              onClick={() => setModal({ tipo: "situacao", situacao: "NAO_CONCLUIU" })}
            >
              <UserX className="size-4 text-red-600" />
              Não concluiu
            </ButtonCustom>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button type="button" className={GATILHO}>
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
                    onSelect={() => setModal({ tipo: "situacao", situacao: o.valor })}
                  >
                    {o.rotulo}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <ButtonCustom size="sm" variant="outline" onClick={() => setModal({ tipo: "remover" })}>
              <UserMinus className="size-4 text-red-600" />
              Remover da turma
            </ButtonCustom>
            <ButtonCustom size="sm" variant="ghost" onClick={onLimparSelecao}>
              <X className="size-4" />
              Limpar seleção
            </ButtonCustom>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Info className="size-4 shrink-0" />
            Marque alunos na lista para mudar a situação ou remover da turma.
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          <ButtonCustom size="sm" variant="outline" onClick={() => setModal({ tipo: "adicionar" })}>
            <UserPlus className="size-4" />
            Adicionar alunos
          </ButtonCustom>
          <ButtonCustom size="sm" variant="primary" onClick={() => setModal({ tipo: "emitir" })}>
            <Award className="size-4" />
            Emitir certificados dos concluintes
          </ButtonCustom>
        </div>
      </div>

      {modal?.tipo === "situacao" ? (
        <ModalSituacao
          cursoId={cursoId}
          turma={turma}
          situacao={modal.situacao}
          inscricaoIds={selecionados}
          onFechar={fechar}
          onConcluido={concluir}
        />
      ) : null}
      {modal?.tipo === "remover" ? (
        <ModalRemoverAlunos
          cursoId={cursoId}
          turma={turma}
          inscricaoIds={selecionados}
          onFechar={fechar}
          onConcluido={concluir}
        />
      ) : null}
      {modal?.tipo === "adicionar" ? (
        <ModalAdicionarAlunos
          cursoId={cursoId}
          turma={turma}
          onFechar={fechar}
          onConcluido={(mensagem) => {
            toastCustom.success(mensagem);
            onAlterado();
            fechar();
          }}
        />
      ) : null}
      {modal?.tipo === "emitir" ? (
        <ModalEmitir
          cursoId={cursoId}
          turmaId={turma.id}
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
// Ações de um aluno (menu da linha)
// ---------------------------------------------------------------------------

type ModalDaLinha =
  | { tipo: "situacao"; situacao: SituacaoInscricao }
  | { tipo: "remover" }
  | { tipo: "devolver" }
  | { tipo: "certificado" }
  | null;

export function AcoesDoAluno({
  cursoId,
  turma,
  inscricao,
  onAlterado,
  mostrarHistorico = true,
  className,
}: {
  cursoId: number | string;
  turma: TurmaDaAcao;
  inscricao: TurmaInscricao;
  onAlterado: () => void;
  /** Link para o histórico do aluno (dispensável quando já se está na página dele) */
  mostrarHistorico?: boolean;
  className?: string;
}) {
  const [modal, setModal] = useState<ModalDaLinha>(null);
  const fechar = () => setModal(null);
  const concluir = (mensagem: string) => {
    toastCustom.success(mensagem);
    onAlterado();
    fechar();
  };

  const nome = inscricao.aluno?.nomeCompleto || inscricao.aluno?.nome || "Aluno";
  const alunoId = inscricao.alunoId || inscricao.aluno?.id || "";
  const status = (inscricao.statusInscricao || inscricao.status || "").toUpperCase();
  const situacaoAtual = SITUACAO_DO_STATUS[status];
  const removida = Boolean(inscricao.removidaEm);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label={`Ações para ${nome}`}
            className={cn(
              "inline-flex size-8 cursor-pointer items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900",
              className
            )}
          >
            <MoreVertical className="size-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-56">
          <DropdownMenuLabel className="truncate text-xs font-normal text-gray-500">{nome}</DropdownMenuLabel>
          {removida ? (
            <DropdownMenuItem className="cursor-pointer" onSelect={() => setModal({ tipo: "devolver" })}>
              <RotateCcw className="size-4" />
              Adicionar de volta à turma
            </DropdownMenuItem>
          ) : (
            <>
              {OPCOES_SITUACAO.filter((o) => o.valor !== situacaoAtual).map((o) => (
                <DropdownMenuItem
                  key={o.valor}
                  className="cursor-pointer"
                  onSelect={() => setModal({ tipo: "situacao", situacao: o.valor })}
                >
                  {o.valor === "CONCLUIU" ? (
                    <CheckCircle2 className="size-4 text-emerald-600" />
                  ) : o.valor === "NAO_CONCLUIU" ? (
                    <UserX className="size-4 text-red-600" />
                  ) : (
                    <span className="size-4" />
                  )}
                  {o.rotulo}
                </DropdownMenuItem>
              ))}
              {status === "CONCLUIDO" ? (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onSelect={() => setModal({ tipo: "certificado" })}
                  >
                    <Award className="size-4" />
                    Emitir certificado
                  </DropdownMenuItem>
                </>
              ) : null}
            </>
          )}
          <DropdownMenuSeparator />
          {alunoId && mostrarHistorico ? (
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link href={`/dashboard/cursos/alunos/${alunoId}?tab=historico`}>
                <History className="size-4" />
                Ver histórico do aluno
              </Link>
            </DropdownMenuItem>
          ) : null}
          {!removida ? (
            <DropdownMenuItem
              variant="destructive"
              className="cursor-pointer"
              onSelect={() => setModal({ tipo: "remover" })}
            >
              <UserMinus className="size-4" />
              Remover da turma
            </DropdownMenuItem>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>

      {modal?.tipo === "situacao" ? (
        <ModalSituacao
          cursoId={cursoId}
          turma={turma}
          situacao={modal.situacao}
          inscricaoIds={[inscricao.id]}
          nomeDoAluno={nome}
          onFechar={fechar}
          onConcluido={concluir}
        />
      ) : null}
      {modal?.tipo === "remover" ? (
        <ModalRemoverAlunos
          cursoId={cursoId}
          turma={turma}
          inscricaoIds={[inscricao.id]}
          onFechar={fechar}
          onConcluido={concluir}
        />
      ) : null}
      {modal?.tipo === "devolver" ? (
        <ModalAdicionarAlunos
          cursoId={cursoId}
          turma={turma}
          alunosIniciais={[{ id: alunoId, nome } satisfies AlunoEscolhido]}
          onFechar={fechar}
          onConcluido={concluir}
        />
      ) : null}
      {modal?.tipo === "certificado" ? (
        <ModalCertificadoDoAluno
          cursoId={cursoId}
          turmaId={turma.id}
          alunoId={alunoId}
          nome={nome}
          onFechar={fechar}
          onConcluido={concluir}
        />
      ) : null}
    </>
  );
}

// ---------------------------------------------------------------------------

function ModalSituacao({
  cursoId,
  turma,
  situacao,
  inscricaoIds,
  nomeDoAluno,
  onFechar,
  onConcluido,
}: {
  cursoId: number | string;
  turma: TurmaDaAcao;
  situacao: SituacaoInscricao;
  inscricaoIds: string[];
  /** Ação de um aluno só (menu da linha) */
  nomeDoAluno?: string;
  onFechar: () => void;
  onConcluido: (mensagem: string) => void;
}) {
  const opcao = opcaoDa(situacao);
  const migrada = ehTurmaMigrada(turma.codigo);
  // Os selecionados do momento em que o modal abriu (a lista ao fundo recarrega sozinha)
  const [ids] = useState(() => [...inscricaoIds]);
  const [motivo, setMotivo] = useState("");
  const [avisar, setAvisar] = useState(!migrada);
  const [resumo, setResumo] = useState<ResumoSituacao | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [aplicando, setAplicando] = useState(false);

  useEffect(() => {
    let ativo = true;
    alterarSituacaoInscricoes(cursoId, turma.id, {
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
  }, [cursoId, turma.id, ids, situacao]);

  const aplicar = async () => {
    if (!resumo) return;
    setAplicando(true);
    try {
      const r = await alterarSituacaoInscricoes(cursoId, turma.id, {
        inscricaoIds: ids,
        situacao,
        motivo: motivo.trim(),
        avisar,
        totalEsperado: resumo.atingidos,
      });
      onConcluido(
        nomeDoAluno
          ? `${nomeDoAluno} marcado como “${opcao.rotulo}”.`
          : `${r.mudam} aluno(s) marcados como “${opcao.rotulo}”.`
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
      size="lg"
      backdrop="blur"
      scrollBehavior="inside"
    >
      <ModalContentWrapper>
        <ModalHeader>
          <ModalTitle>{nomeDoAluno ? `${opcao.rotulo}: ${nomeDoAluno}` : opcao.rotulo}</ModalTitle>
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
          <CampoAvisar
            valor={avisar}
            onChange={setAvisar}
            migrada={migrada}
            texto="Notificação no painel do aluno com a nova situação."
          />
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
              disabled={!resumo || resumo.mudam === 0 || !motivoValido(motivo)}
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

function ModalCertificadoDoAluno({
  cursoId,
  turmaId,
  alunoId,
  nome,
  onFechar,
  onConcluido,
}: {
  cursoId: number | string;
  turmaId: string;
  alunoId: string;
  nome: string;
  onFechar: () => void;
  onConcluido: (mensagem: string) => void;
}) {
  const [emitindo, setEmitindo] = useState(false);

  const emitir = async () => {
    setEmitindo(true);
    try {
      await createCertificado(cursoId, turmaId, { alunoId });
      onConcluido(`Certificado de ${nome} emitido.`);
    } catch (e) {
      toastCustom.error(mensagemDoErro(e));
    } finally {
      setEmitindo(false);
    }
  };

  return (
    <ModalCustom isOpen onOpenChange={(aberto) => !aberto && !emitindo && onFechar()} size="md" backdrop="blur">
      <ModalContentWrapper>
        <ModalHeader>
          <ModalTitle>Emitir certificado</ModalTitle>
        </ModalHeader>
        <ModalBody className="text-sm text-gray-700">
          Emitir o certificado de <strong>{nome}</strong> nesta turma? Ele passa a valer na consulta pública
          e o aluno pode baixar pelo painel.
        </ModalBody>
        <ModalFooter>
          <div className="flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <ButtonCustom variant="outline" onClick={onFechar} disabled={emitindo}>
              Cancelar
            </ButtonCustom>
            <ButtonCustom variant="primary" onClick={emitir} isLoading={emitindo} loadingText="Emitindo...">
              Emitir certificado
            </ButtonCustom>
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
