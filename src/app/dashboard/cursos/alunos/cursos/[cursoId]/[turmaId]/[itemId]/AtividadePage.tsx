"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ButtonCustom, SimpleTextarea } from "@/components/ui/custom";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  XCircle,
  FileQuestion,
  Send,
  Lock,
  Calendar,
  Award,
} from "lucide-react";
import { ConfirmarEnvioModal } from "@/theme/dashboard/components/aluno-candidato/atividades/ConfirmarEnvioModal";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/custom";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  getMockAtividadeById,
  getMockProvaById,
  getMockTurmaEstrutura,
  getMockTurmaProgresso,
  getMockAlunoCursos,
  MockAtividadeQuestoes,
} from "@/mockData/aluno-candidato";
import { cn } from "@/lib/utils";
import { format, isWithinInterval, parse, isBefore, isAfter } from "date-fns";
import { ptBR } from "date-fns/locale";

interface AtividadePageProps {
  params: Promise<{
    cursoId: string;
    turmaId: string;
    atividadeId: string;
  }>;
}

type RespostaQuestao = {
  questaoId: string;
  alternativaId: string | null;
};

type RespostaPergunta = {
  perguntaId: string;
  respostaTexto: string;
  dataEnvio?: string;
};

type EstadoAtividade = "RESPONDENDO" | "REVISAO" | "CORRIGIDA" | "ENVIADA";

export default function AtividadePage({ params }: AtividadePageProps) {
  const router = useRouter();
  const [resolvedParams, setResolvedParams] = useState<{
    cursoId: string;
    turmaId: string;
    atividadeId: string;
  } | null>(null);
  const [atividade, setAtividade] = useState<MockAtividadeQuestoes | null>(
    null
  );
  const [questaoAtual, setQuestaoAtual] = useState(0);
  const [respostasQuestoes, setRespostasQuestoes] = useState<
    Record<string, RespostaQuestao>
  >({});
  const [respostasPerguntas, setRespostasPerguntas] = useState<
    Record<string, RespostaPergunta>
  >({});
  const [estado, setEstado] = useState<EstadoAtividade>("RESPONDENDO");
  const [resultado, setResultado] = useState<{
    acertos: number;
    total: number;
    percentual: number;
    nota?: number; // Nota final do aluno
    valorPorQuestao?: number; // Valor de cada questão
    notaTotal?: number; // Nota total da atividade
  } | null>(null);
  const [isModalConfirmacaoOpen, setIsModalConfirmacaoOpen] = useState(false);
  const [isProvaForaDoPeriodo, setIsProvaForaDoPeriodo] = useState(false);
  const [mensagemPeriodo, setMensagemPeriodo] = useState<string>("");
  const [atividadeEncerrada, setAtividadeEncerrada] = useState(false); // Nova flag para atividades encerradas mas acessíveis
  const [turmaTipo, setTurmaTipo] = useState<
    "ONLINE" | "AO_VIVO" | "PRESENCIAL" | "SEMIPRESENCIAL" | null
  >(null);

  useEffect(() => {
    params.then(setResolvedParams);
  }, [params]);

  useEffect(() => {
    if (
      resolvedParams?.atividadeId &&
      resolvedParams?.cursoId &&
      resolvedParams?.turmaId
    ) {
      // Tentar buscar como atividade primeiro
      let mockAtividade = getMockAtividadeById(resolvedParams.atividadeId);
      let isProva = false;

      // Se não encontrar como atividade, tentar como prova
      if (!mockAtividade) {
        mockAtividade = getMockProvaById(resolvedParams.atividadeId);
        isProva = !!mockAtividade;
      }

      if (mockAtividade) {
        setAtividade(mockAtividade);

        // Buscar tipo da turma para determinar regras de acesso
        const cursos = getMockAlunoCursos(resolvedParams.cursoId);
        const curso = cursos.find(
          (c) =>
            c.cursoId === resolvedParams.cursoId &&
            c.turmaId === resolvedParams.turmaId
        );
        const tipoTurma = curso?.turmaTipo || null;
        setTurmaTipo(tipoTurma);

        // Buscar estrutura para encontrar o itemId correto
        const estrutura = getMockTurmaEstrutura(
          resolvedParams.cursoId,
          resolvedParams.turmaId
        );
        let itemId: string | null = null;

        if (estrutura) {
          // Buscar em todos os módulos
          for (const modulo of estrutura.modules || []) {
            // Para atividades, buscar por platformActivityId
            // Para provas, buscar por id do item
            const item = modulo.items.find(
              (i: any) =>
                i.platformActivityId === resolvedParams.atividadeId ||
                (i.type === "PROVA" && i.id === resolvedParams.atividadeId) ||
                i.id === resolvedParams.atividadeId
            );
            if (item) {
              itemId = item.id;
              break;
            }
          }

          // Se não encontrou nos módulos, buscar nos itens avulsos
          if (!itemId && estrutura.standaloneItems) {
            const item = estrutura.standaloneItems.find(
              (i: any) =>
                i.platformActivityId === resolvedParams.atividadeId ||
                (i.type === "PROVA" && i.id === resolvedParams.atividadeId) ||
                i.id === resolvedParams.atividadeId
            );
            if (item) {
              itemId = item.id;
            }
          }
        }

        // Buscar progresso da atividade/prova primeiro (para verificar se já foi concluída)
        const progressoId = itemId || resolvedParams.atividadeId;
        const progressoMap = getMockTurmaProgresso(
          resolvedParams.cursoId,
          resolvedParams.turmaId
        );
        const progresso = progressoMap[progressoId];
        const jaConcluida = progresso?.status === "CONCLUIDO";

        // Buscar estrutura da turma para obter datas do item se não tiver no mock
        let dataInicioItem = mockAtividade.dataInicio;
        let dataFimItem = mockAtividade.dataFim;
        let horaInicioItem = mockAtividade.horaInicio;
        let horaFimItem = mockAtividade.horaFim;

        // Se não tiver datas no mock, buscar da estrutura (para provas e atividades)
        if (estrutura && !dataInicioItem) {
          const itemEstrutura = estrutura.modules
            .flatMap((mod) => mod.items)
            .concat(estrutura.standaloneItems || [])
            .find(
              (i: any) =>
                (i.type === "PROVA" || i.type === "ATIVIDADE") &&
                (i.id === resolvedParams.atividadeId ||
                  i.id === itemId ||
                  i.platformActivityId === resolvedParams.atividadeId)
            );
          if (itemEstrutura) {
            dataInicioItem = itemEstrutura.startDate || undefined;
            dataFimItem = itemEstrutura.endDate || undefined;
          }
        }

        // Validação de período para provas e atividades
        // Para PRESENCIAL: bloqueia se fora do período e não foi concluída
        // Para ONLINE/AO_VIVO: permite acesso mesmo após encerrar (mas não permite submeter se não respondeu)
        if (dataInicioItem && dataFimItem && horaInicioItem && horaFimItem) {
          const agora = new Date();

          // Criar datas completas com hora
          const dataHoraInicio = parse(
            `${dataInicioItem} ${horaInicioItem}`,
            "yyyy-MM-dd HH:mm",
            new Date()
          );
          const dataHoraFim = parse(
            `${dataFimItem} ${horaFimItem}`,
            "yyyy-MM-dd HH:mm",
            new Date()
          );

          // Verificar se está dentro do período
          const estaDentroDoPeriodo = isWithinInterval(agora, {
            start: dataHoraInicio,
            end: dataHoraFim,
          });

          const estaAntes = isBefore(agora, dataHoraInicio);
          const estaDepois = isAfter(agora, dataHoraFim);
          const tipoItem = isProva ? "prova" : "atividade";

          // Se está antes do período, sempre bloquear (independente do tipo)
          if (estaAntes) {
            const tipoItemLocal = isProva ? "prova" : "atividade";
            setIsProvaForaDoPeriodo(true);
            setMensagemPeriodo(
              `Esta ${tipoItemLocal} estará disponível a partir de ${format(
                dataHoraInicio,
                "dd/MM/yyyy 'às' HH:mm",
                { locale: ptBR }
              )}.`
            );
            setAtividadeEncerrada(false);
            return; // Não continuar - item ainda não disponível
          }

          // Se está depois do período (encerrado)
          if (estaDepois) {
            const tipoItemLocal = isProva ? "prova" : "atividade";

            // Para PRESENCIAL: bloquear se não foi concluída
            if (tipoTurma === "PRESENCIAL" && !jaConcluida) {
              setIsProvaForaDoPeriodo(true);
              setMensagemPeriodo(
                `O período desta ${tipoItemLocal} encerrou em ${format(
                  dataHoraFim,
                  "dd/MM/yyyy 'às' HH:mm",
                  { locale: ptBR }
                )}.`
              );
              setAtividadeEncerrada(false);
              return; // Não continuar - PRESENCIAL fora do período não pode acessar
            }

            // Para ONLINE/AO_VIVO: permitir acesso (pode ver conteúdo, mas não pode submeter se não respondeu)
            if (tipoTurma === "ONLINE" || tipoTurma === "AO_VIVO") {
              setIsProvaForaDoPeriodo(false); // Permite acessar
              setAtividadeEncerrada(true); // Marca como encerrada (mas acessível)
              setMensagemPeriodo(
                `O período desta ${tipoItemLocal} encerrou em ${format(
                  dataHoraFim,
                  "dd/MM/yyyy 'às' HH:mm",
                  { locale: ptBR }
                )}. ${
                  jaConcluida
                    ? "Você pode revisar suas respostas e ver a nota."
                    : "Você pode visualizar o conteúdo, mas não poderá submeter respostas."
                }`
              );
              // Não return - permite continuar para ver o conteúdo
            } else {
              // Para outros tipos ou sem tipo definido, bloquear
              setIsProvaForaDoPeriodo(true);
              setMensagemPeriodo(
                `O período desta ${tipoItemLocal} encerrou em ${format(
                  dataHoraFim,
                  "dd/MM/yyyy 'às' HH:mm",
                  { locale: ptBR }
                )}.`
              );
              setAtividadeEncerrada(false);
              return;
            }
          } else {
            // Dentro do período
            setIsProvaForaDoPeriodo(false);
            setAtividadeEncerrada(false);
            setMensagemPeriodo("");
          }
        } else {
          // Sem período definido, permite acesso
          setIsProvaForaDoPeriodo(false);
          setAtividadeEncerrada(false);
          setMensagemPeriodo("");
        }

        // Se a atividade/prova estiver CONCLUIDA e tiver nota, bloquear edição
        if (
          progresso?.status === "CONCLUIDO" &&
          progresso?.nota !== null &&
          progresso?.nota !== undefined
        ) {
          if (mockAtividade.tipo === "MULTIPLA_ESCOLHA") {
            // Para múltipla escolha, calcular resultado e mostrar tela de correção
            let totalQuestoes = mockAtividade.questoes.length;
            // Limitar totalQuestoes a 10 (validação de segurança)
            totalQuestoes = Math.min(totalQuestoes, 10);

            // Se não houver questões, não pode calcular
            if (totalQuestoes === 0) {
              return;
            }

            // Buscar respostas já respondidas (simulando - na prática viria da API)
            // Por enquanto, vamos apenas definir o estado como CORRIGIDA
            setEstado("CORRIGIDA");

            // Calcular nota e acertos corretamente
            let nota: number | undefined;
            let valorPorQuestao: number | undefined;
            let acertos: number;

            if (mockAtividade.notaTotal) {
              // A atividade tem uma notaTotal específica (ex: 2 pontos)
              valorPorQuestao = mockAtividade.notaTotal / totalQuestoes;

              // A nota do progresso pode estar em escala 0-10, então precisamos normalizar
              // Se a nota do progresso for maior que notaTotal, assume que está em escala 0-10
              let notaNormalizada: number;
              if (progresso.nota > mockAtividade.notaTotal) {
                // Converter de escala 0-10 para escala 0-notaTotal
                notaNormalizada =
                  (progresso.nota / 10) * mockAtividade.notaTotal;
              } else {
                // A nota já está na escala correta
                notaNormalizada = progresso.nota;
              }

              // Limitar a nota ao máximo permitido e mínimo 0
              nota = Math.max(
                0,
                Math.min(notaNormalizada, mockAtividade.notaTotal)
              );

              // Calcular acertos baseado na nota normalizada
              acertos = Math.round(nota / valorPorQuestao);
              // Garantir que acertos não ultrapasse o total de questões e seja no mínimo 0
              acertos = Math.max(0, Math.min(acertos, totalQuestoes));
            } else {
              // Se não tiver notaTotal, usar a nota do progresso diretamente (assumindo escala 0-10)
              nota = Math.max(0, Math.min(progresso.nota, 10));
              acertos = Math.round((nota / 10) * totalQuestoes);
              // Garantir que acertos não ultrapasse o total de questões e seja no mínimo 0
              acertos = Math.max(0, Math.min(acertos, totalQuestoes));
            }

            // Calcular percentual (limitado entre 0% e 100%)
            const percentual = Math.max(
              0,
              Math.min((acertos / totalQuestoes) * 100, 100)
            );

            setResultado({
              acertos,
              total: totalQuestoes,
              percentual,
              nota,
              valorPorQuestao,
              notaTotal: mockAtividade.notaTotal,
            });
          } else if (
            mockAtividade.tipo === "PERGUNTA_RESPOSTA" &&
            mockAtividade.perguntas
          ) {
            // Para pergunta e resposta, verificar se já foi enviada e não pode editar
            const respostasIniciais: Record<string, RespostaPergunta> = {};
            mockAtividade.perguntas.forEach((pergunta) => {
              if (pergunta.respostaEnviada) {
                respostasIniciais[pergunta.id] = {
                  perguntaId: pergunta.id,
                  respostaTexto: pergunta.respostaEnviada,
                  dataEnvio: pergunta.dataEnvio,
                };
              }
            });
            setRespostasPerguntas(respostasIniciais);

            // Se todas as perguntas já foram enviadas e não podem editar, definir estado como ENVIADA
            const todasEnviadas = mockAtividade.perguntas.every(
              (p) => p.respostaEnviada && !p.podeEditar
            );
            if (todasEnviadas) {
              setEstado("ENVIADA");
            }
          }
          return; // Não continuar para não resetar o estado - atividade/prova já bloqueada
        }

        // Se chegou aqui, a atividade não está bloqueada pelo progresso
        // Inicializar respostas de perguntas com dados existentes (se já foram enviadas)
        if (
          mockAtividade.tipo === "PERGUNTA_RESPOSTA" &&
          mockAtividade.perguntas
        ) {
          const respostasIniciais: Record<string, RespostaPergunta> = {};
          mockAtividade.perguntas.forEach((pergunta) => {
            if (pergunta.respostaEnviada) {
              respostasIniciais[pergunta.id] = {
                perguntaId: pergunta.id,
                respostaTexto: pergunta.respostaEnviada,
                dataEnvio: pergunta.dataEnvio,
              };
            }
          });
          setRespostasPerguntas(respostasIniciais);
          // Se todas as perguntas já foram enviadas e não podem editar, definir estado como ENVIADA
          const todasEnviadas = mockAtividade.perguntas.every(
            (p) => p.respostaEnviada && !p.podeEditar
          );
          if (todasEnviadas) {
            setEstado("ENVIADA");
            return; // Não continuar - atividade já enviada e bloqueada
          }
        }
      } else {
        // Se não encontrou a atividade, definir como null explicitamente
        setAtividade(null);
      }
    }
  }, [
    resolvedParams?.atividadeId,
    resolvedParams?.cursoId,
    resolvedParams?.turmaId,
  ]);

  if (!resolvedParams) {
    return (
      <div className="h-screen w-full bg-white flex items-center justify-center">
        <Skeleton className="h-full w-full" />
      </div>
    );
  }

  // Se ainda não carregou a atividade mas temos o ID, mostrar loading
  if (!atividade && resolvedParams?.atividadeId) {
    return (
      <div className="h-screen w-full bg-white flex items-center justify-center">
        <Skeleton className="h-full w-full" />
      </div>
    );
  }

  if (!atividade) {
    return (
      <div className="h-screen w-full bg-white flex items-center justify-center">
        <EmptyState
          title="Atividade não encontrada"
          description="A atividade que você procura não existe ou não está disponível."
          illustration="pass"
          actions={
            <ButtonCustom
              onClick={() =>
                router.push(
                  `/dashboard/cursos/alunos/cursos/${resolvedParams.cursoId}/${resolvedParams.turmaId}`
                )
              }
              variant="default"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </ButtonCustom>
          }
        />
      </div>
    );
  }

  // Verificar se o item (prova ou atividade) está fora do período permitido
  // Para ONLINE/AO_VIVO, permite acesso mesmo após encerrar (mas não pode submeter)
  // Para PRESENCIAL, bloqueia completamente se não foi concluída
  if (isProvaForaDoPeriodo && !atividadeEncerrada) {
    // Determinar se é prova ou atividade (verificar se existe no mock de provas)
    const tipoItem =
      atividade &&
      resolvedParams?.atividadeId &&
      getMockProvaById(resolvedParams.atividadeId)
        ? "prova"
        : "atividade";

    return (
      <div className="container w-full bg-white rounded-xl">
        <div className="w-full px-4 md:px-6 lg:px-8 py-6 pt-8 pb-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                  <Lock className="h-6 w-6 text-amber-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg! font-semibold text-amber-900 mb-2! flex items-center gap-2">
                    <Calendar className="h-5 w-5 shrink-0" />
                    {tipoItem === "prova" ? "Prova" : "Atividade"} indisponível
                    no momento
                  </h2>
                  <p className="text-sm! text-amber-800 mb-0! leading-relaxed">
                    {mensagemPeriodo ||
                      `Esta ${tipoItem} não está disponível no momento.`}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-end pt-4 border-t border-amber-200">
                <ButtonCustom
                  onClick={() =>
                    router.push(
                      `/dashboard/cursos/alunos/cursos/${resolvedParams.cursoId}/${resolvedParams.turmaId}`
                    )
                  }
                  variant="default"
                  withAnimation={false}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar para o curso
                </ButtonCustom>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ========== LÓGICA PARA ATIVIDADES DE MÚLTIPLA ESCOLHA ==========
  if (atividade.tipo === "MULTIPLA_ESCOLHA") {
    const totalQuestoes = atividade.questoes.length;
    const questao = atividade.questoes[questaoAtual];
    const respostaAtual = respostasQuestoes[questao.id];

    // Verificar se a atividade está encerrada mas ainda é acessível (ONLINE/AO_VIVO)
    const podeSubmeter = !atividadeEncerrada || estado === "CORRIGIDA";

    const handleSelecionarAlternativa = (alternativaId: string) => {
      setRespostasQuestoes((prev) => ({
        ...prev,
        [questao.id]: {
          questaoId: questao.id,
          alternativaId,
        },
      }));
    };

    const handleProximaQuestao = () => {
      if (questaoAtual < totalQuestoes - 1 && respostaAtual?.alternativaId) {
        setQuestaoAtual(questaoAtual + 1);
      }
    };

    const handleQuestaoAnterior = () => {
      if (questaoAtual > 0) {
        setQuestaoAtual(questaoAtual - 1);
      }
    };

    const handleIrParaQuestao = (index: number) => {
      setQuestaoAtual(index);
    };

    const handleRevisar = () => {
      if (respostaAtual?.alternativaId) {
        setEstado("REVISAO");
      }
    };

    const handleConfirmar = () => {
      // Abrir modal de confirmação
      setIsModalConfirmacaoOpen(true);
    };

    const handleConfirmarEnvio = () => {
      let acertos = 0;
      atividade.questoes.forEach((q) => {
        const resposta = respostasQuestoes[q.id];
        if (resposta?.alternativaId && q.alternativas) {
          const alternativaSelecionada = q.alternativas.find(
            (a) => a.id === resposta.alternativaId
          );
          if (alternativaSelecionada?.correta) {
            acertos++;
          }
        }
      });

      const percentual = (acertos / totalQuestoes) * 100;

      // Calcular nota se a atividade tiver notaTotal definida
      let nota: number | undefined;
      let valorPorQuestao: number | undefined;
      if (atividade.notaTotal) {
        valorPorQuestao = atividade.notaTotal / totalQuestoes;
        nota = acertos * valorPorQuestao;
      }

      setResultado({
        acertos,
        total: totalQuestoes,
        percentual,
        nota,
        valorPorQuestao,
        notaTotal: atividade.notaTotal,
      });
      setEstado("CORRIGIDA");
      setIsModalConfirmacaoOpen(false);
    };

    const handleVoltarParaResponder = () => {
      setEstado("RESPONDENDO");
    };

    // Tela de correção e resultados
    if (estado === "CORRIGIDA" && resultado) {
      return (
        <div className="container w-full bg-white rounded-xl">
          <div className="w-full px-4 md:px-6 lg:px-8 py-6 pt-8 pb-8">
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="text-center mb-6">
                  <div
                    className={cn(
                      "w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4",
                      resultado.percentual >= 70
                        ? "bg-green-100"
                        : resultado.percentual >= 50
                        ? "bg-yellow-100"
                        : "bg-red-100"
                    )}
                  >
                    <span
                      className={cn(
                        "text-3xl! font-bold",
                        resultado.percentual >= 70
                          ? "text-green-700"
                          : resultado.percentual >= 50
                          ? "text-yellow-700"
                          : "text-red-700"
                      )}
                    >
                      {Math.round(resultado.percentual)}%
                    </span>
                  </div>
                  <p className="text-lg! font-semibold text-gray-900 mb-0!">
                    Você acertou {resultado.acertos} de {resultado.total}{" "}
                    questões
                  </p>
                  {resultado.notaTotal && resultado.valorPorQuestao && (
                    <p className="text-sm! font-semibold text-gray-700 mb-1!">
                      Nota: {resultado.nota?.toFixed(2).replace(".", ",")} de{" "}
                      {resultado.notaTotal.toFixed(2).replace(".", ",")} pontos
                      <span className="text-xs! text-gray-500 font-normal ml-2">
                        (
                        {resultado.valorPorQuestao.toFixed(2).replace(".", ",")}{" "}
                        pontos por questão)
                      </span>
                    </p>
                  )}
                  <p className="text-sm! text-gray-600 mb-0!">
                    {resultado.percentual >= 70
                      ? "Parabéns! Você foi aprovado!"
                      : resultado.percentual >= 50
                      ? "Bom trabalho! Continue estudando."
                      : "Não desista! Revise o conteúdo e tente novamente."}
                  </p>
                </div>

                <div className="space-y-4">
                  {atividade.questoes.map((q, index) => {
                    const resposta = respostasQuestoes[q.id];
                    const alternativaSelecionada = resposta?.alternativaId
                      ? q.alternativas?.find(
                          (a) => a.id === resposta.alternativaId
                        )
                      : null;
                    const acertou = alternativaSelecionada?.correta || false;

                    return (
                      <div
                        key={q.id}
                        className={cn(
                          "border rounded-lg p-4",
                          acertou
                            ? "border-green-200 bg-green-50"
                            : "border-red-200 bg-red-50"
                        )}
                      >
                        <div className="flex items-start gap-3 mb-3">
                          {acertou ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                          )}
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <p className="text-sm! font-semibold text-gray-900 mb-0!">
                                Questão {index + 1} - {q.enunciado}
                              </p>
                              {!acertou && alternativaSelecionada && (
                                <span className="px-2 py-1 text-xs! font-semibold bg-red-100 text-red-700 border border-red-300 rounded">
                                  Você marcou:{" "}
                                  {String.fromCharCode(
                                    65 +
                                      (q.alternativas?.indexOf(
                                        alternativaSelecionada
                                      ) || 0)
                                  )}
                                </span>
                              )}
                            </div>
                            <div className="space-y-2">
                              {q.alternativas?.map((alt) => {
                                const isSelecionada =
                                  alt.id === resposta?.alternativaId;
                                const isCorreta = alt.correta;

                                return (
                                  <div
                                    key={alt.id}
                                    className={cn(
                                      "p-3 rounded-lg border flex items-center gap-3",
                                      isCorreta
                                        ? "border-green-500 bg-green-100"
                                        : isSelecionada && !isCorreta
                                        ? "border-red-500 bg-red-100"
                                        : "border-gray-200 bg-white"
                                    )}
                                  >
                                    <div
                                      className={cn(
                                        "w-6 h-6 rounded-full flex items-center justify-center shrink-0 !text-xs font-semibold",
                                        isCorreta
                                          ? "bg-green-600 text-white"
                                          : isSelecionada && !isCorreta
                                          ? "bg-red-600 text-white"
                                          : "bg-gray-200 text-gray-700"
                                      )}
                                    >
                                      {String.fromCharCode(
                                        65 + (q.alternativas?.indexOf(alt) || 0)
                                      )}
                                    </div>
                                    <span
                                      className={cn(
                                        "text-sm! flex-1",
                                        isCorreta
                                          ? "text-green-900 font-semibold"
                                          : isSelecionada && !isCorreta
                                          ? "text-red-900 font-semibold"
                                          : "text-gray-700"
                                      )}
                                    >
                                      {alt.texto}
                                    </span>
                                    {isCorreta && (
                                      <div className="flex items-center gap-2 shrink-0">
                                        <span className="text-xs! font-semibold text-green-700">
                                          Resposta correta
                                        </span>
                                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                                      </div>
                                    )}
                                    {isSelecionada && !isCorreta && (
                                      <div className="flex items-center gap-2 shrink-0">
                                        <span className="text-xs! font-semibold text-red-700">
                                          Sua resposta
                                        </span>
                                        <XCircle className="h-4 w-4 text-red-600" />
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end">
                <ButtonCustom
                  onClick={() =>
                    router.push(
                      `/dashboard/cursos/alunos/cursos/${resolvedParams.cursoId}/${resolvedParams.turmaId}`
                    )
                  }
                  variant="default"
                  withAnimation={false}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar para o curso
                </ButtonCustom>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Tela de revisão
    if (estado === "REVISAO") {
      return (
        <div className="container w-full bg-white rounded-xl">
          <div className="w-full px-4 md:px-6 lg:px-8 py-6 pt-8 pb-8">
            <div className="space-y-6">
              {/* Mensagem quando atividade está encerrada mas acessível */}
              {atividadeEncerrada && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-amber-600 shrink-0 mt-2" />
                    <div className="flex-1">
                      <p className="text-sm! font-semibold text-amber-900 mb-0!">
                        Período encerrado
                      </p>
                      <p className="text-xs! text-amber-800 mb-0! leading-relaxed">
                        {mensagemPeriodo ||
                          "O período desta atividade encerrou. Você pode visualizar o conteúdo, mas não poderá submeter respostas."}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              {/* Banner de revisão */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
                <div className="flex items-center gap-3">
                  <FileQuestion className="h-5 w-5 text-blue-600 shrink-0" />
                  <p className="text-sm! font-semibold text-blue-900 mb-0!">
                    Revise suas respostas antes de confirmar
                  </p>
                </div>
              </div>

              {/* Lista de questões e respostas */}
              <TooltipProvider delayDuration={200}>
                <div className="space-y-4">
                  {atividade.questoes.map((q, index) => {
                    const resposta = respostasQuestoes[q.id];
                    const alternativaSelecionada = resposta?.alternativaId
                      ? q.alternativas?.find(
                          (a) => a.id === resposta.alternativaId
                        )
                      : null;

                    return (
                      <Tooltip key={q.id} disableHoverableContent>
                        <TooltipTrigger asChild>
                          <div
                            className="bg-white rounded-xl border border-gray-200 overflow-hidden cursor-pointer hover:border-[var(--primary-color)] transition-colors"
                            onClick={() => {
                              handleIrParaQuestao(index);
                              handleVoltarParaResponder();
                            }}
                          >
                            {/* Questão */}
                            <div className="px-6 py-4 border-b border-gray-200">
                              <p className="text-sm! font-semibold text-gray-900 mb-0!">
                                Questão {index + 1} - {q.enunciado}
                              </p>
                            </div>

                            {/* Resposta selecionada */}
                            <div className="px-6 py-4">
                              {alternativaSelecionada ? (
                                <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-4 border border-gray-200">
                                  <div className="w-8 h-8 rounded-full bg-[var(--primary-color)] text-white flex items-center justify-center shrink-0 text-sm! font-semibold">
                                    {String.fromCharCode(
                                      65 +
                                        (q.alternativas?.indexOf(
                                          alternativaSelecionada
                                        ) || 0)
                                    )}
                                  </div>
                                  <span className="text-sm! text-gray-900 font-medium mb-0! flex-1">
                                    {alternativaSelecionada.texto}
                                  </span>
                                </div>
                              ) : (
                                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                                  <span className="text-sm! text-amber-700 font-medium mb-0!">
                                    Não respondida
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent sideOffset={8} className="max-w-sm">
                          <div className="text-xs font-medium">
                            Clique para editar
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
              </TooltipProvider>

              {/* Botões de ação */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <ButtonCustom
                  onClick={handleVoltarParaResponder}
                  variant="outline"
                  withAnimation={false}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar para responder
                </ButtonCustom>
                <ButtonCustom
                  onClick={handleConfirmar}
                  variant="default"
                  withAnimation={false}
                  disabled={atividadeEncerrada}
                >
                  Confirmar respostas
                  <CheckCircle2 className="ml-2 h-4 w-4" />
                </ButtonCustom>
              </div>

              {/* Modal de confirmação */}
              <ConfirmarEnvioModal
                isOpen={isModalConfirmacaoOpen}
                onOpenChange={setIsModalConfirmacaoOpen}
                onConfirmar={handleConfirmarEnvio}
                titulo="Confirmar envio das respostas"
                pergunta="Você tem certeza que deseja confirmar suas respostas?"
                mensagemEdicao="Importante: Após confirmar, você não poderá mais editar suas respostas."
                mensagemProfessor="O sistema corrigirá automaticamente suas respostas e mostrará o resultado."
                textoBotao="Sim, confirmar respostas"
              />
            </div>
          </div>
        </div>
      );
    }

    // Tela principal - respondendo questões
    return (
      <div className="container w-full bg-white rounded-xl">
        <div className="w-full px-4 md:px-6 lg:px-8 py-6 pt-8 pb-8">
          <div className="space-y-6">
            {/* Mensagem quando atividade está encerrada mas acessível */}
            {atividadeEncerrada && estado !== "CORRIGIDA" && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-amber-600 shrink-0 mt-2" />
                  <div className="flex-1">
                    <p className="text-sm! font-semibold text-amber-900 mb-0!">
                      Período encerrado
                    </p>
                    <p className="text-xs! text-amber-800 mb-0! leading-relaxed">
                      {mensagemPeriodo ||
                        "O período desta atividade encerrou. Você pode visualizar o conteúdo, mas não poderá submeter respostas."}
                    </p>
                  </div>
                </div>
              </div>
            )}
            {/* Progresso e Paginação */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  {/* Paginação */}
                  {atividade.questoes.map((_, index) => {
                    const temResposta =
                      respostasQuestoes[atividade.questoes[index].id];
                    return (
                      <button
                        key={index}
                        onClick={() => handleIrParaQuestao(index)}
                        className={cn(
                          "w-8 h-8 rounded-full text-xs! font-semibold transition-colors",
                          index === questaoAtual
                            ? "bg-[var(--primary-color)] text-white"
                            : temResposta
                            ? "bg-green-100 text-green-700 border-2 border-green-300"
                            : "bg-gray-100 text-gray-600 border-2 border-gray-300"
                        )}
                      >
                        {index + 1}
                      </button>
                    );
                  })}
                </div>
                <span className="text-xs! text-gray-600 mb-0!">
                  {Object.keys(respostasQuestoes).length} de {totalQuestoes}{" "}
                  respondidas
                </span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[var(--primary-color)] transition-all duration-300"
                  style={{
                    width: `${((questaoAtual + 1) / totalQuestoes) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* Questão e Alternativas */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {/* Questão */}
              <div className="px-6 py-5 border-b border-gray-200">
                <p className="text-base! text-gray-900 leading-relaxed whitespace-pre-wrap font-medium mb-0!">
                  Questão {questaoAtual + 1} - {questao.enunciado}
                </p>
              </div>

              {/* Alternativas */}
              <div className="p-6 space-y-3">
                {questao.alternativas?.map((alt, index) => {
                  const isSelecionada = respostaAtual?.alternativaId === alt.id;
                  const letra = String.fromCharCode(65 + index);

                  return (
                    <button
                      key={alt.id}
                      onClick={() => {
                        if (!atividadeEncerrada || estado === "CORRIGIDA") {
                          handleSelecionarAlternativa(alt.id);
                        }
                      }}
                      disabled={atividadeEncerrada && estado !== "CORRIGIDA"}
                      className={cn(
                        "w-full p-4 rounded-lg border-2 text-left transition-all duration-200 flex items-center gap-3",
                        atividadeEncerrada && estado !== "CORRIGIDA"
                          ? "border-gray-200 bg-gray-50 cursor-not-allowed opacity-60"
                          : isSelecionada
                          ? "border-[var(--primary-color)] bg-[var(--primary-color)]/5"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      )}
                    >
                      <div
                        className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm! font-semibold transition-colors",
                          isSelecionada
                            ? "bg-[var(--primary-color)] text-white"
                            : "bg-gray-200 text-gray-700"
                        )}
                      >
                        {letra}
                      </div>
                      <span
                        className={cn(
                          "text-sm! flex-1",
                          isSelecionada
                            ? "text-gray-900 font-medium"
                            : "text-gray-700"
                        )}
                      >
                        {alt.texto}
                      </span>
                      {isSelecionada && (
                        <CheckCircle2 className="h-5 w-5 text-[var(--primary-color)] shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Navegação */}
            <div className="flex items-center justify-between">
              {questaoAtual > 0 ? (
                <ButtonCustom
                  onClick={handleQuestaoAnterior}
                  variant="outline"
                  withAnimation={false}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Anterior
                </ButtonCustom>
              ) : (
                <div></div>
              )}

              <div></div>

              {questaoAtual < totalQuestoes - 1 ? (
                <ButtonCustom
                  onClick={handleProximaQuestao}
                  variant="default"
                  withAnimation={false}
                  disabled={
                    !respostaAtual?.alternativaId ||
                    (atividadeEncerrada && estado !== "CORRIGIDA")
                  }
                >
                  Próxima
                  <ArrowRight className="ml-2 h-4 w-4" />
                </ButtonCustom>
              ) : (
                <ButtonCustom
                  onClick={handleRevisar}
                  variant="default"
                  withAnimation={false}
                  disabled={
                    !respostaAtual?.alternativaId ||
                    (atividadeEncerrada && estado !== "CORRIGIDA")
                  }
                >
                  Revisar respostas
                  <FileQuestion className="ml-2 h-4 w-4" />
                </ButtonCustom>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ========== LÓGICA PARA ATIVIDADES DE PERGUNTA E RESPOSTA ==========
  if (
    atividade.tipo === "PERGUNTA_RESPOSTA" &&
    atividade.perguntas &&
    atividade.perguntas.length > 0
  ) {
    // Atividades de pergunta e resposta têm apenas 1 pergunta
    const pergunta = atividade.perguntas[0];
    const respostaAtual = respostasPerguntas[pergunta.id];
    const podeEditar = pergunta.podeEditar !== false;
    const jaEnviada = !!respostaAtual?.dataEnvio;

    const handleAtualizarResposta = (texto: string) => {
      if (!podeEditar || jaEnviada) return;
      setRespostasPerguntas((prev) => ({
        ...prev,
        [pergunta.id]: {
          perguntaId: pergunta.id,
          respostaTexto: texto,
        },
      }));
    };

    const handleEnviarResposta = () => {
      const resposta = respostasPerguntas[pergunta.id];
      if (!resposta || !resposta.respostaTexto.trim()) {
        return;
      }
      // Abrir modal de confirmação
      setIsModalConfirmacaoOpen(true);
    };

    const handleConfirmarEnvio = () => {
      const resposta = respostasPerguntas[pergunta.id];
      if (!resposta || !resposta.respostaTexto.trim()) {
        return;
      }

      setRespostasPerguntas((prev) => ({
        ...prev,
        [pergunta.id]: {
          ...prev[pergunta.id],
          dataEnvio: new Date().toISOString(),
        },
      }));
      setEstado("ENVIADA");
      setIsModalConfirmacaoOpen(false);
    };

    // Tela de atividade enviada
    if (estado === "ENVIADA" || jaEnviada) {
      const resposta = respostasPerguntas[pergunta.id];
      const temNota = pergunta.nota !== undefined && pergunta.nota !== null;
      const foiCorrigida = !!pergunta.dataCorrecao;

      return (
        <div className="container w-full bg-white rounded-xl">
          <div className="w-full px-4 md:px-6 lg:px-8 py-6 pt-8 pb-8">
            <div className="space-y-6">
              {/* Banner de sucesso */}
              <div className="bg-green-50 border border-green-200 rounded-xl p-5">
                <div className="flex items-center gap-3 mb-0!">
                  <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                  <div className="flex-1">
                    <h2 className="text-lg! font-semibold text-green-900 mb-0!">
                      {foiCorrigida
                        ? "Atividade Corrigida"
                        : "Atividade Enviada"}
                    </h2>
                    <p className="text-sm! text-gray-700 mb-0!">
                      {foiCorrigida
                        ? "Sua resposta foi corrigida pelo professor."
                        : "Sua resposta foi enviada com sucesso. Não é mais possível editar sua resposta."}
                    </p>
                  </div>
                  {temNota && (
                    <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-green-200">
                      <Award className="h-4 w-4 text-green-600 shrink-0" />
                      <span className="text-base! font-bold text-green-700">
                        {pergunta.nota?.toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Pergunta e Resposta */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {/* Pergunta - Header destacado */}
                <div className="bg-gradient-to-r from-[var(--primary-color)]/5 to-[var(--primary-color)]/10 border-b border-gray-200 px-6 py-5">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-[var(--primary-color)] flex items-center justify-center shrink-0 shadow-sm">
                      <FileQuestion className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base! font-semibold text-gray-900 mb-0!">
                        Pergunta
                      </h3>
                      <p className="text-base! text-gray-800 leading-relaxed whitespace-pre-wrap font-medium mb-0!">
                        {pergunta.pergunta}
                      </p>
                    </div>
                  </div>
                  {resposta?.dataEnvio && (
                    <div className="flex items-center gap-2 text-xs! text-gray-500 mt-4 pt-4 border-t border-gray-200">
                      <Calendar className="h-3.5 w-3.5 shrink-0" />
                      <span>
                        Enviado em{" "}
                        {format(
                          new Date(resposta.dataEnvio),
                          "dd 'de' MMMM 'de' yyyy 'às' HH:mm",
                          { locale: ptBR }
                        )}
                      </span>
                      {foiCorrigida && pergunta.dataCorrecao && (
                        <>
                          <span className="mx-2">•</span>
                          <span>
                            Corrigido em{" "}
                            {format(
                              new Date(pergunta.dataCorrecao),
                              "dd 'de' MMMM 'de' yyyy 'às' HH:mm",
                              { locale: ptBR }
                            )}
                          </span>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Conteúdo da resposta */}
                <div className="p-6">
                  {/* Resposta enviada */}
                  <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                    <div className="flex items-start gap-2 mb-3">
                      <Lock className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />
                      <p className="text-sm! font-medium text-gray-700 mb-0!">
                        Sua Resposta:
                      </p>
                    </div>
                    <p className="text-sm! text-gray-900 whitespace-pre-wrap leading-relaxed mb-0!">
                      {resposta?.respostaTexto || "Nenhuma resposta enviada."}
                    </p>
                  </div>

                  {/* Feedback do professor (se houver) */}
                  {foiCorrigida && pergunta.feedback && (
                    <div className="bg-blue-50 rounded-lg p-5 border border-blue-200 mt-4">
                      <div className="flex items-start gap-2 mb-3">
                        <Award className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                        <p className="text-sm! font-medium text-blue-900 mb-0!">
                          Feedback do Professor:
                        </p>
                      </div>
                      <p className="text-sm! text-blue-800 whitespace-pre-wrap leading-relaxed mb-0!">
                        {pergunta.feedback}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Tela principal - respondendo pergunta
    return (
      <>
        <div className="container w-full bg-white rounded-xl">
          <div className="w-full px-4 md:px-6 lg:px-8 py-6 pt-8 pb-8">
            <div className="space-y-6">
              {/* Mensagem quando atividade está encerrada mas acessível */}
              {atividadeEncerrada && !jaEnviada && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-amber-600 shrink-0 mt-2" />
                    <div className="flex-1">
                      <p className="text-sm! font-semibold text-amber-900 mb-0!">
                        Período encerrado
                      </p>
                      <p className="text-xs! text-amber-800 mb-0! leading-relaxed">
                        {mensagemPeriodo ||
                          "O período desta atividade encerrou. Você pode visualizar o conteúdo, mas não poderá submeter respostas."}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              {/* Pergunta e Resposta */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {/* Pergunta - Header destacado */}
                <div className="bg-gradient-to-r from-[var(--primary-color)]/5 to-[var(--primary-color)]/10 border-b border-gray-200 px-6 py-5">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-[var(--primary-color)] flex items-center justify-center shrink-0 shadow-sm">
                      <FileQuestion className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base! mb-0!">Pergunta</h3>
                      <p className="text-base! text-gray-800 leading-relaxed whitespace-pre-wrap font-medium">
                        {pergunta.pergunta}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Conteúdo da resposta */}
                <div className="p-6 space-y-6">
                  {jaEnviada ? (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <Lock className="h-4 w-4 text-amber-600 shrink-0" />
                        <p className="text-sm! font-semibold text-amber-900">
                          Resposta já enviada
                        </p>
                      </div>
                      <p className="text-xs! text-amber-700 mb-4">
                        Esta resposta foi enviada e não pode mais ser editada.
                      </p>
                      <div className="bg-white rounded-lg p-5 border border-amber-200">
                        <p className="text-sm! text-gray-900 whitespace-pre-wrap leading-relaxed">
                          {respostaAtual.respostaTexto}
                        </p>
                        {respostaAtual.dataEnvio && (
                          <p className="text-xs! text-gray-500 mt-4 pt-4 border-t border-gray-200">
                            Enviado em{" "}
                            {format(
                              new Date(respostaAtual.dataEnvio),
                              "dd 'de' MMMM 'de' yyyy 'às' HH:mm",
                              { locale: ptBR }
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      <SimpleTextarea
                        label="Sua Resposta:"
                        value={respostaAtual?.respostaTexto || ""}
                        onChange={(e) =>
                          handleAtualizarResposta(e.target.value)
                        }
                        placeholder="Digite sua resposta aqui..."
                        maxLength={5000}
                        showCharCount={true}
                        disabled={
                          !podeEditar || jaEnviada || atividadeEncerrada
                        }
                        className="min-h-[280px]"
                      />

                      <div className="flex items-center justify-end pt-2 border-t border-gray-100">
                        <ButtonCustom
                          onClick={handleEnviarResposta}
                          disabled={
                            !respostaAtual?.respostaTexto?.trim() ||
                            jaEnviada ||
                            atividadeEncerrada
                          }
                          variant="default"
                          withAnimation={false}
                          className="min-w-[160px]"
                        >
                          <Send className="h-4 w-4 mr-2" />
                          Enviar Resposta
                        </ButtonCustom>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal de confirmação de envio */}
        <ConfirmarEnvioModal
          isOpen={isModalConfirmacaoOpen}
          onOpenChange={setIsModalConfirmacaoOpen}
          onConfirmar={handleConfirmarEnvio}
        />
      </>
    );
  }

  return null;
}
