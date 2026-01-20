"use client";

import { useMemo, useState, useEffect } from "react";
import type { BuilderData } from "@/components/ui/custom/builder-manager/types";
import { EmptyState } from "@/components/ui/custom";
import { ButtonCustom } from "@/components/ui/custom";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { getUserProfile } from "@/api/usuarios";
import {
  getMockAlunoCandidatoData,
  getMockAlunoCursos,
  getMockTurmaProgresso,
  getMockTurmaEstrutura,
} from "@/mockData/aluno-candidato";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  BookOpen,
  Calendar,
  Award,
  TrendingUp,
  Clock,
  Eye,
  PlayCircle,
  CheckCircle2,
  FileText,
  MessageSquare,
  GraduationCap,
  CheckSquare,
  Video,
  ExternalLink,
  Monitor,
  Users,
  Radio,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { MockCursoItemData } from "@/mockData/aluno-candidato";

function getCookieValue(name: string): string | null {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
}

function getStatusConfig(
  status: MockCursoItemData["status"],
  periodoEncerrado?: boolean
) {
  // Se período encerrou mas curso não foi concluído, mostra como "Encerrado"
  if (periodoEncerrado && status !== "CONCLUIDO") {
    return {
      label: "Encerrado",
      badgeLabel: "Encerrado",
      className: "bg-gray-100 text-gray-800 border-gray-200",
      badgeClassName: "bg-white text-gray-800 border border-gray-300",
    };
  }

  switch (status) {
    case "EM_PROGRESSO":
      return {
        label: "Em Andamento",
        badgeLabel: "Em Andamento",
        className: "bg-blue-100 text-blue-800 border-blue-200",
        badgeClassName: "bg-white text-blue-800 border border-blue-300",
      };
    case "CONCLUIDO":
      return {
        label: "Concluído",
        badgeLabel: "Concluído",
        className: "bg-green-100 text-green-800 border-green-200",
        badgeClassName: "bg-white text-green-800 border border-green-300",
      };
    case "NAO_INICIADO":
      return {
        label: "Novo",
        badgeLabel: "Novo",
        className: "bg-purple-100 text-purple-800 border-purple-200",
        badgeClassName: "bg-white text-purple-800 border border-purple-300",
      };
    default:
      return {
        label: "Novo",
        badgeLabel: "Novo",
        className: "bg-purple-100 text-purple-800 border-purple-200",
        badgeClassName: "bg-white text-purple-800 border border-purple-300",
      };
  }
}

function ContinueCard({
  curso,
  onView,
}: {
  curso: MockCursoItemData;
  onView: (curso: MockCursoItemData) => void;
}) {
  const [imageError, setImageError] = useState(false);

  // Verificar se período do curso encerrou
  const periodoCursoEncerrado = useMemo(() => {
    if (!curso.dataFim) return false;
    const agora = new Date();
    const dataFimCurso = new Date(curso.dataFim);
    dataFimCurso.setHours(23, 59, 59, 999); // Fim do dia
    return agora > dataFimCurso;
  }, [curso.dataFim]);

  // Buscar estrutura e progresso para calcular progresso corretamente
  const estrutura = useMemo(() => {
    return getMockTurmaEstrutura(curso.cursoId, curso.turmaId);
  }, [curso.cursoId, curso.turmaId]);

  const progressoMap = useMemo(() => {
    return getMockTurmaProgresso(curso.cursoId, curso.turmaId);
  }, [curso.cursoId, curso.turmaId]);

  // Calcular progresso baseado nos itens concluídos
  const progressoCalculado = useMemo(() => {
    if (!estrutura) return curso.percentualConcluido;

    const todosItens: Array<{ item: any; progresso?: any }> = [];

    // Percorrer módulos
    estrutura.modules?.forEach((modulo) => {
      modulo.items?.forEach((item) => {
        todosItens.push({
          item,
          progresso: progressoMap[item.id],
        });
      });
    });

    // Percorrer itens avulsos
    estrutura.standaloneItems?.forEach((item) => {
      todosItens.push({
        item,
        progresso: progressoMap[item.id],
      });
    });

    if (todosItens.length === 0) return curso.percentualConcluido;

    const concluidos = todosItens.filter(
      (i) => i.progresso?.status === "CONCLUIDO"
    ).length;

    return Math.round((concluidos / todosItens.length) * 100);
  }, [estrutura, progressoMap, curso.percentualConcluido]);

  // Calcular nota média apenas de atividades e provas
  const notaMediaCalculada = useMemo(() => {
    if (!estrutura) return curso.notaMedia;
    const notas: number[] = [];

    // Percorrer módulos
    estrutura.modules?.forEach((modulo) => {
      modulo.items?.forEach((item) => {
        const progresso = progressoMap[item.id];
        if (
          (item.type === "ATIVIDADE" || item.type === "PROVA") &&
          progresso?.nota !== null &&
          progresso?.nota !== undefined
        ) {
          notas.push(progresso.nota);
        }
      });
    });

    // Percorrer itens avulsos
    estrutura.standaloneItems?.forEach((item) => {
      const progresso = progressoMap[item.id];
      if (
        (item.type === "ATIVIDADE" || item.type === "PROVA") &&
        progresso?.nota !== null &&
        progresso?.nota !== undefined
      ) {
        notas.push(progresso.nota);
      }
    });

    if (notas.length === 0) return null;
    const soma = notas.reduce((acc, nota) => acc + nota, 0);
    return soma / notas.length;
  }, [estrutura, progressoMap, curso.notaMedia]);

  // Determinar status de aprovação apenas se período encerrou
  const statusAprovacao = useMemo(() => {
    if (!periodoCursoEncerrado) return null;
    if (notaMediaCalculada === null || notaMediaCalculada === undefined)
      return "REPROVADO";
    return notaMediaCalculada >= 7 ? "APROVADO" : "RECUPERACAO";
  }, [periodoCursoEncerrado, notaMediaCalculada]);

  const getNotaStatus = () => {
    // Só mostra status se período encerrou
    if (!periodoCursoEncerrado) return null;

    if (statusAprovacao === "APROVADO") {
      return {
        label: "Aprovado",
        mensagem: "Aprovou e gabaritou!",
        subMensagem: "Parabéns, seu esforço valeu a pena",
        color: "text-green-600",
        bgColor: "bg-green-50",
        circleColor: "border-green-200 bg-green-50",
        textColor: "text-green-900",
      };
    }

    if (statusAprovacao === "RECUPERACAO") {
      const pontosFaltando =
        notaMediaCalculada !== null && notaMediaCalculada !== undefined
          ? Math.max(0, 7 - notaMediaCalculada).toFixed(1)
          : "0";
      return {
        label: "Recuperação",
        mensagem: "Você está em recuperação",
        subMensagem: `Faltam **${pontosFaltando}** pontos para você ser aprovado`,
        color: "text-amber-600",
        bgColor: "bg-amber-50",
        circleColor: "border-amber-200 bg-amber-50",
        textColor: "text-amber-900",
      };
    }

    // REPROVADO
    return {
      label: "Reprovado",
      mensagem: "Você foi reprovado",
      subMensagem: "Não foi possível calcular a nota média",
      color: "text-red-600",
      bgColor: "bg-red-50",
      circleColor: "border-red-200 bg-red-50",
      textColor: "text-red-900",
    };
  };

  const notaStatus = getNotaStatus();
  const progressColor =
    notaStatus &&
    (notaStatus.label === "Recuperação" || notaStatus.label === "Reprovado")
      ? "bg-red-500"
      : "bg-green-500";

  return (
    <Card
      className="group border border-gray-200 bg-white rounded-2xl overflow-hidden transition-all duration-300 hover:border-[var(--primary-color)]/40 h-full flex flex-col cursor-pointer p-0 py-0 shadow-none"
      onClick={() => onView(curso)}
    >
      <CardContent className="p-0 h-full flex flex-col">
        {/* Imagem do curso */}
        <div className="relative h-44 w-full overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
          {!imageError && curso.cursoImagemUrl ? (
            <>
              <Image
                src={curso.cursoImagemUrl}
                alt={curso.cursoNome}
                fill
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                onError={() => setImageError(true)}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              />
            </>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
              <BookOpen className="h-12 w-12 text-gray-300" />
            </div>
          )}

          {/* Badge de visualizações no topo esquerdo */}
          {curso.totalAulas && (
            <div className="absolute top-2.5 left-2.5 z-10">
              <span className="inline-flex items-center gap-1.5 rounded-md bg-gray-900/75 backdrop-blur-sm px-2.5 py-1 text-xs font-medium text-white">
                <Eye className="h-3 w-3" />
                {curso.totalAulas}
              </span>
            </div>
          )}

          {/* Badge de status no canto superior direito */}
          {!periodoCursoEncerrado && (
            <div className="absolute top-2.5 right-2.5 z-10">
              <span className="inline-flex items-center rounded-md border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                Em Andamento
              </span>
            </div>
          )}
        </div>

        {/* Conteúdo do card */}
        <div className="p-6 flex-1 flex flex-col">
          {/* Título do curso com carga horária */}
          <div className="flex items-start justify-between gap-3 mb-4">
            <h3 className="!text-sm font-semibold text-gray-900 line-clamp-2 leading-snug group-hover:text-[var(--primary-color)] transition-colors flex-1 min-w-0">
              {curso.cursoNome}
            </h3>
            {curso.cargaHoraria && (
              <div className="flex items-center gap-1.5 shrink-0 text-gray-500">
                <Clock className="h-4 w-4 shrink-0" />
                <span className="!text-xs font-medium whitespace-nowrap">
                  {curso.cargaHoraria}h
                </span>
              </div>
            )}
          </div>

          {/* Informações compactas */}
          <div className="mt-auto">
            {/* Progresso ou Status */}
            {progressoCalculado > 0 ? (
              <div className="mb-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="!text-sm text-gray-600 font-medium">
                    Progresso
                  </span>
                  <span className="!text-sm font-bold text-gray-900">
                    {progressoCalculado}%
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden relative">
                  <div
                    className={cn("h-2 rounded-full", progressColor)}
                    style={{
                      width: `${progressoCalculado}%`,
                      animation: "progress 1.5s ease-out",
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="!text-sm text-gray-500 font-medium mb-5">
                Não Iniciado
              </div>
            )}

            {/* Nota melhorada com círculo - Sempre mostra */}
            {notaStatus && (
              <div className="flex items-start gap-5 pt-5 border-t border-gray-100 mb-5">
                {/* Círculo com nota */}
                <div
                  className={cn(
                    "w-24 h-24 rounded-full border flex flex-col items-center justify-center shrink-0",
                    notaStatus.circleColor
                  )}
                >
                  {periodoCursoEncerrado &&
                  notaMediaCalculada !== null &&
                  notaMediaCalculada !== undefined ? (
                    <>
                      <span className="!text-[10px] font-medium text-gray-500 uppercase tracking-wide mb-1">
                        Nota Média
                      </span>
                      <span
                        className={cn(
                          "!text-3xl font-bold leading-none mt-0.5",
                          notaStatus.textColor
                        )}
                      >
                        {notaMediaCalculada.toLocaleString("pt-BR", {
                          minimumFractionDigits: 1,
                          maximumFractionDigits: 1,
                        })}
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="!text-[10px] font-medium text-gray-500 uppercase tracking-wide mb-1">
                        Nota Média
                      </span>
                      <span
                        className={cn(
                          "!text-xl font-bold leading-none mt-0.5",
                          notaStatus.textColor
                        )}
                      >
                        -
                      </span>
                    </>
                  )}
                </div>

                {/* Mensagem motivacional */}
                <div className="flex-1 min-w-0 pt-0.5">
                  <p
                    className={cn(
                      "!text-base font-semibold mb-2 leading-tight",
                      notaStatus.textColor
                    )}
                  >
                    {notaStatus.mensagem}
                  </p>
                  <p className="!text-sm text-gray-600 leading-relaxed">
                    {notaStatus.subMensagem.split("**").map((part, index) =>
                      index % 2 === 1 ? (
                        <span key={index} className="font-bold text-gray-900">
                          {part}
                        </span>
                      ) : (
                        part
                      )
                    )}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Botão de ação */}
          <div className="mt-5 pt-4 border-t border-gray-100">
            <ButtonCustom
              variant={periodoCursoEncerrado ? "outline" : "default"}
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onView(curso);
              }}
              className={cn(
                periodoCursoEncerrado
                  ? "w-full rounded-lg font-medium transition-all"
                  : "w-full rounded-lg font-medium transition-all bg-[var(--primary-color)] text-white hover:bg-[var(--primary-color)]/90 border-[var(--primary-color)]"
              )}
              withAnimation={false}
            >
              {periodoCursoEncerrado ? "Revisar" : "Continuar"}
            </ButtonCustom>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ContinueCardAoVivo({ curso }: { curso: MockCursoItemData }) {
  // Só mostra para cursos AO_VIVO
  if (curso.turmaTipo !== "AO_VIVO" || !curso.proximaAula) return null;

  const proximaAulaData = curso.proximaAula;
  if (!proximaAulaData || !proximaAulaData.meetUrl) return null;

  const handleOpenMeet = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (proximaAulaData.meetUrl) {
      window.open(proximaAulaData.meetUrl, "_blank", "noopener,noreferrer");
    }
  };

  const dataFormatada = proximaAulaData.dataInicio
    ? format(new Date(proximaAulaData.dataInicio), "dd 'de' MMMM", {
        locale: ptBR,
      })
    : "";

  return (
    <Card className="group border border-gray-200 bg-white rounded-2xl overflow-hidden transition-all duration-300 hover:border-[var(--primary-color)]/40 h-full flex flex-col shadow-none pb-2 pt-2">
      <CardContent className="p-6 flex-1 flex flex-col">
        {/* Título do curso */}
        <h3 className="!text-sm font-semibold text-gray-900 line-clamp-2 leading-snug group-hover:text-[var(--primary-color)] transition-colors mb-4">
          {curso.cursoNome}
        </h3>

        {/* Próxima aula */}
        <div className="flex items-start gap-3 p-4 bg-blue-50/50 rounded-lg border border-blue-100/50 mb-5">
          <div className="shrink-0 mt-0.5">
            <Video className="h-4 w-4 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0 space-y-1">
            <p className="!text-xs font-medium text-gray-600 mb-0!">
              Próxima aula acontece em
            </p>
            <h4 className="!text-sm font-bold text-gray-900 mb-0!">
              {dataFormatada} às {proximaAulaData.horaInicio}
            </h4>
            <p className="!text-xs text-gray-700 line-clamp-2 mb-0!">
              {proximaAulaData.aulaNome}
            </p>
          </div>
        </div>

        {/* Botão para entrar na sala */}
        <div className="mt-auto">
          <ButtonCustom
            variant="default"
            size="sm"
            onClick={handleOpenMeet}
            className={cn(
              "w-full rounded-lg font-medium transition-all bg-[var(--primary-color)] text-white hover:bg-[var(--primary-color)]/90 border-[var(--primary-color)]"
            )}
            withAnimation={false}
          >
            <Video className="h-4 w-4 mr-2" />
            Entrar na sala do Meet
          </ButtonCustom>
        </div>
      </CardContent>
    </Card>
  );
}

function CursoCard({
  curso,
  onView,
}: {
  curso: MockCursoItemData;
  onView: (curso: MockCursoItemData) => void;
}) {
  const [imageError, setImageError] = useState(false);

  // Verificar se o período do curso encerrou
  const periodoCursoEncerrado = useMemo(() => {
    if (!curso.dataFim) return false;
    const agora = new Date();
    const dataFimCurso = new Date(curso.dataFim);
    dataFimCurso.setHours(23, 59, 59, 999); // Fim do dia
    return agora > dataFimCurso;
  }, [curso.dataFim]);

  // Buscar estrutura e progresso para calcular nota média corretamente
  const estrutura = useMemo(() => {
    return getMockTurmaEstrutura(curso.cursoId, curso.turmaId);
  }, [curso.cursoId, curso.turmaId]);

  const progressoMap = useMemo(() => {
    return getMockTurmaProgresso(curso.cursoId, curso.turmaId);
  }, [curso.cursoId, curso.turmaId]);

  // Calcular progresso baseado nos itens concluídos
  const progressoCalculado = useMemo(() => {
    if (!estrutura) return curso.percentualConcluido;

    const todosItens: Array<{ item: any; progresso?: any }> = [];

    // Percorrer módulos
    estrutura.modules?.forEach((modulo) => {
      modulo.items?.forEach((item) => {
        todosItens.push({
          item,
          progresso: progressoMap[item.id],
        });
      });
    });

    // Percorrer itens avulsos
    estrutura.standaloneItems?.forEach((item) => {
      todosItens.push({
        item,
        progresso: progressoMap[item.id],
      });
    });

    if (todosItens.length === 0) return curso.percentualConcluido;

    const concluidos = todosItens.filter(
      (i) => i.progresso?.status === "CONCLUIDO"
    ).length;

    return Math.round((concluidos / todosItens.length) * 100);
  }, [estrutura, progressoMap, curso.percentualConcluido]);

  // Calcular nota média apenas de atividades e provas
  const notaMediaCalculada = useMemo(() => {
    if (!estrutura) return curso.notaMedia;
    const notas: number[] = [];

    // Percorrer módulos
    estrutura.modules?.forEach((modulo) => {
      modulo.items?.forEach((item) => {
        const progresso = progressoMap[item.id];
        if (
          (item.type === "ATIVIDADE" || item.type === "PROVA") &&
          progresso?.nota !== null &&
          progresso?.nota !== undefined
        ) {
          notas.push(progresso.nota);
        }
      });
    });

    // Percorrer itens avulsos
    estrutura.standaloneItems?.forEach((item) => {
      const progresso = progressoMap[item.id];
      if (
        (item.type === "ATIVIDADE" || item.type === "PROVA") &&
        progresso?.nota !== null &&
        progresso?.nota !== undefined
      ) {
        notas.push(progresso.nota);
      }
    });

    if (notas.length === 0) return null;
    const soma = notas.reduce((acc, nota) => acc + nota, 0);
    return soma / notas.length;
  }, [estrutura, progressoMap, curso.notaMedia]);

  // Determinar status de aprovação apenas se período encerrou
  const statusAprovacao = useMemo(() => {
    if (!periodoCursoEncerrado) return null;
    if (notaMediaCalculada === null || notaMediaCalculada === undefined)
      return "REPROVADO";
    return notaMediaCalculada >= 7 ? "APROVADO" : "RECUPERACAO";
  }, [periodoCursoEncerrado, notaMediaCalculada]);

  // Ajustar status do curso baseado no período
  const statusCurso = useMemo(() => {
    if (periodoCursoEncerrado && curso.status !== "CONCLUIDO") {
      return curso.status; // Mantém o status original, mas mostra badge diferente
    }
    return curso.status;
  }, [periodoCursoEncerrado, curso.status]);

  const statusConfig = getStatusConfig(statusCurso, periodoCursoEncerrado);

  const getButtonLabel = () => {
    if (curso.status === "NAO_INICIADO") return "Iniciar";
    if (periodoCursoEncerrado) return "Revisar";
    if (curso.status === "CONCLUIDO") return "Visualizar";
    return "Continuar";
  };

  const getNotaStatus = () => {
    // Se período não encerrou, mostra status neutro
    if (!periodoCursoEncerrado) {
      return {
        label: "Em Andamento",
        mensagem: "Curso em andamento",
        subMensagem: "Continue estudando para alcançar seus objetivos",
        color: "text-blue-600",
        bgColor: "bg-blue-50",
        circleColor: "border-blue-200 bg-blue-50",
        textColor: "text-blue-900",
      };
    }

    // Se período encerrou, mostra status baseado na nota
    if (statusAprovacao === "APROVADO") {
      return {
        label: "Aprovado",
        mensagem: "Aprovou e gabaritou!",
        subMensagem: "Parabéns, seu esforço valeu a pena",
        color: "text-green-600",
        bgColor: "bg-green-50",
        circleColor: "border-green-200 bg-green-50",
        textColor: "text-green-900",
      };
    }

    if (statusAprovacao === "RECUPERACAO") {
      const pontosFaltando =
        notaMediaCalculada !== null && notaMediaCalculada !== undefined
          ? Math.max(0, 7 - notaMediaCalculada).toFixed(1)
          : "0";
      return {
        label: "Recuperação",
        mensagem: "Você está em recuperação",
        subMensagem: `Faltam **${pontosFaltando}** pontos para você ser aprovado`,
        color: "text-amber-600",
        bgColor: "bg-amber-50",
        circleColor: "border-amber-200 bg-amber-50",
        textColor: "text-amber-900",
      };
    }

    // REPROVADO
    return {
      label: "Reprovado",
      mensagem: "Você foi reprovado",
      subMensagem: "Não foi possível calcular a nota média",
      color: "text-red-600",
      bgColor: "bg-red-50",
      circleColor: "border-red-200 bg-red-50",
      textColor: "text-red-900",
    };
  };

  const notaStatus = getNotaStatus();
  const progressColor =
    notaStatus &&
    (notaStatus.label === "Recuperação" || notaStatus.label === "Reprovado")
      ? "bg-red-500"
      : "bg-green-500";

  return (
    <Card className="group border border-gray-200 bg-white rounded-2xl overflow-hidden transition-all duration-300 hover:border-[var(--primary-color)]/40 h-full flex flex-col cursor-pointer p-0 py-0 shadow-none">
      <CardContent className="p-0 h-full flex flex-col">
        {/* Imagem do curso */}
        <div className="relative h-44 w-full overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
          {!imageError && curso.cursoImagemUrl ? (
            <>
              <Image
                src={curso.cursoImagemUrl}
                alt={curso.cursoNome}
                fill
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                onError={() => setImageError(true)}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              />
            </>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
              <BookOpen className="h-12 w-12 text-gray-300" />
            </div>
          )}

          {/* Badge de informações no topo esquerdo */}
          {curso.totalAulas && (
            <div className="absolute top-2.5 left-2.5 z-10">
              <span className="inline-flex items-center gap-1.5 rounded-md bg-gray-900/75 backdrop-blur-sm px-2.5 py-1 text-xs font-medium text-white">
                <PlayCircle className="h-3 w-3" />
                {curso.totalAulas}
              </span>
            </div>
          )}

          {/* Badge de status no canto superior direito */}
          <div className="absolute top-2.5 right-2.5 z-10">
            <span
              className={cn(
                "inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-semibold",
                statusConfig.badgeClassName
              )}
            >
              {statusConfig.badgeLabel}
            </span>
          </div>
        </div>

        {/* Conteúdo do card */}
        <div className="p-6 flex-1 flex flex-col">
          {/* Título do curso com carga horária */}
          <div className="flex items-start justify-between gap-3 mb-4">
            <h3 className="!text-sm font-semibold text-gray-900 line-clamp-2 leading-snug group-hover:text-[var(--primary-color)] transition-colors flex-1 min-w-0">
              {curso.cursoNome}
            </h3>
            {curso.cargaHoraria && (
              <div className="flex items-center gap-1.5 shrink-0 text-gray-500">
                <Clock className="h-4 w-4 shrink-0" />
                <span className="!text-xs font-medium whitespace-nowrap">
                  {curso.cargaHoraria}h
                </span>
              </div>
            )}
          </div>

          {/* Informações compactas */}
          <div className="mt-auto">
            {/* Progresso ou Status */}
            {progressoCalculado > 0 ? (
              <div className="mb-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="!text-sm text-gray-600 font-medium">
                    Progresso
                  </span>
                  <span className="!text-sm font-bold text-gray-900">
                    {progressoCalculado}%
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden relative">
                  <div
                    className={cn("h-2 rounded-full", progressColor)}
                    style={{
                      width: `${progressoCalculado}%`,
                      animation: "progress 1.5s ease-out",
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="!text-sm text-gray-500 font-medium mb-5">
                Não Iniciado
              </div>
            )}

            {/* Nota melhorada com círculo - Sempre mostra */}
            {notaStatus && (
              <div className="flex items-start gap-5 pt-5 border-t border-gray-100 mb-5">
                {/* Círculo com nota */}
                <div
                  className={cn(
                    "w-24 h-24 rounded-full border flex flex-col items-center justify-center shrink-0",
                    notaStatus.circleColor
                  )}
                >
                  {periodoCursoEncerrado &&
                  notaMediaCalculada !== null &&
                  notaMediaCalculada !== undefined ? (
                    <>
                      <span className="!text-[10px] font-medium text-gray-500 uppercase tracking-wide mb-1">
                        Nota Média
                      </span>
                      <span
                        className={cn(
                          "!text-3xl font-bold leading-none mt-0.5",
                          notaStatus.textColor
                        )}
                      >
                        {notaMediaCalculada.toLocaleString("pt-BR", {
                          minimumFractionDigits: 1,
                          maximumFractionDigits: 1,
                        })}
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="!text-[10px] font-medium text-gray-500 uppercase tracking-wide mb-1">
                        Nota Média
                      </span>
                      <span
                        className={cn(
                          "!text-xl font-bold leading-none mt-0.5",
                          notaStatus.textColor
                        )}
                      >
                        -
                      </span>
                    </>
                  )}
                </div>

                {/* Mensagem motivacional */}
                <div className="flex-1 min-w-0 pt-0.5">
                  <p
                    className={cn(
                      "font-semibold! mb-0! mt-4! leading-tight",
                      notaStatus.textColor
                    )}
                  >
                    {notaStatus.mensagem}
                  </p>
                  <p className="text-xs! text-gray-600 leading-relaxed!">
                    {notaStatus.subMensagem.split("**").map((part, index) =>
                      index % 2 === 1 ? (
                        <span key={index} className="font-bold text-gray-900">
                          {part}
                        </span>
                      ) : (
                        part
                      )
                    )}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Botão de ação */}
          <div className="mt-5 pt-4 border-t border-gray-100">
            <ButtonCustom
              variant="default"
              size="sm"
              onClick={() => onView(curso)}
              className={cn(
                "w-full rounded-lg font-medium transition-all bg-[var(--primary-color)] text-white hover:bg-[var(--primary-color)]/90 border-[var(--primary-color)]"
              )}
              withAnimation={false}
            >
              {getButtonLabel()}
            </ButtonCustom>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

type TurmaTipoFilter =
  | "ONLINE"
  | "PRESENCIAL"
  | "AO_VIVO"
  | "SEMIPRESENCIAL"
  | "TODOS";

export function AlunoCursosView() {
  const [currentPage, setCurrentPage] = useState(1);
  const [tipoFiltro, setTipoFiltro] = useState<TurmaTipoFilter>("TODOS");
  const pageSize = 8;

  // Buscar perfil do usuário
  const { data: profileResponse } = useQuery({
    queryKey: ["user-profile"],
    queryFn: async () => {
      const token = getCookieValue("token");
      if (!token) throw new Error("Token não encontrado");
      return getUserProfile(token);
    },
    staleTime: 5 * 60 * 1000,
  });

  const userId = useMemo(() => {
    return profileResponse && "usuario" in profileResponse
      ? profileResponse.usuario.id
      : null;
  }, [profileResponse]);

  // Buscar detalhes do aluno com suas inscrições (usando dados mockados)
  const { data: alunoData, isLoading: isLoadingAluno } = useQuery({
    queryKey: ["aluno-detalhes", userId],
    queryFn: async () => {
      const mockData = getMockAlunoCandidatoData();
      const turmasMap = new Map<
        string,
        { cursoId: string; turmaId: string; turmaNome: string }
      >();
      mockData.cursos.forEach((curso) => {
        const key = `${curso.id}::turma-001`;
        if (!turmasMap.has(key)) {
          turmasMap.set(key, {
            cursoId: curso.id,
            turmaId: "turma-001",
            turmaNome: "Turma A - Manhã",
          });
        }
      });

      const inscricoes = Array.from(turmasMap.values()).map((turma) => {
        const curso = mockData.cursos.find((c) => c.id === turma.cursoId);
        return {
          cursoId: turma.cursoId,
          cursoNome: curso?.nome || turma.cursoId,
          turmaId: turma.turmaId,
          turmaNome: turma.turmaNome,
          alunoId: userId || "aluno-001",
          statusInscricao: curso?.status || "EM_PROGRESSO",
        };
      });

      return {
        success: true,
        data: {
          id: userId || "aluno-001",
          nome: "Aluno Teste",
          email: "aluno@teste.com",
          inscricoes,
        },
      };
    },
    enabled: true,
    staleTime: 5 * 60 * 1000,
  });

  // Buscar cursos (mockados por enquanto)
  const { data: todosCursos, isLoading: isLoadingCursos } = useQuery({
    queryKey: ["aluno-cursos"],
    queryFn: async () => {
      return getMockAlunoCursos();
    },
    enabled: true,
    staleTime: 5 * 60 * 1000,
  });

  const isLoading = isLoadingCursos || isLoadingAluno;

  // Identificar quais tipos de turma existem nos cursos
  const tiposDisponiveis = useMemo(() => {
    const tipos = new Set<MockCursoItemData["turmaTipo"]>();
    (todosCursos || []).forEach((curso) => {
      if (curso.turmaTipo) {
        tipos.add(curso.turmaTipo);
      }
    });
    return Array.from(tipos);
  }, [todosCursos]);

  // Atualizar filtro padrão quando os tipos mudarem (apenas se houver 1 tipo)
  useEffect(() => {
    if (tiposDisponiveis.length === 1) {
      const primeiroTipo = tiposDisponiveis[0];
      if (primeiroTipo && tipoFiltro === "TODOS") {
        setTipoFiltro(primeiroTipo);
      }
    }
  }, [tiposDisponiveis, tipoFiltro]);

  // Filtrar cursos por tipo
  const cursosFiltrados = useMemo(() => {
    if (tipoFiltro === "TODOS") return todosCursos || [];
    return (todosCursos || []).filter(
      (curso) => curso.turmaTipo === tipoFiltro
    );
  }, [todosCursos, tipoFiltro]);

  // Verificar se período do curso encerrou
  const periodoCursoEncerrado = useMemo(() => {
    return (curso: MockCursoItemData) => {
      if (!curso.dataFim) return false;
      const agora = new Date();
      const dataFimCurso = new Date(curso.dataFim);
      dataFimCurso.setHours(23, 59, 59, 999); // Fim do dia
      return agora > dataFimCurso;
    };
  }, []);

  // Cursos em progresso ONLINE para "Continue de onde parou" - apenas cursos com período ativo
  const cursosEmProgressoOnline = useMemo(() => {
    return cursosFiltrados.filter(
      (curso) =>
        curso.status === "EM_PROGRESSO" &&
        curso.progressoDetalhado &&
        curso.turmaTipo === "ONLINE" &&
        !periodoCursoEncerrado(curso)
    );
  }, [cursosFiltrados, periodoCursoEncerrado]);

  // Cursos AO_VIVO em progresso - apenas cursos com período ativo
  const cursosAoVivo = useMemo(() => {
    return cursosFiltrados.filter(
      (curso) =>
        curso.status === "EM_PROGRESSO" &&
        curso.turmaTipo === "AO_VIVO" &&
        curso.proximaAula &&
        !periodoCursoEncerrado(curso)
    );
  }, [cursosFiltrados, periodoCursoEncerrado]);

  // Paginação (baseada nos cursos filtrados)
  const totalPages = Math.max(
    1,
    Math.ceil((cursosFiltrados?.length || 0) / pageSize)
  );
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const cursosPaginados = cursosFiltrados.slice(startIndex, endIndex);

  // Resetar página quando o filtro mudar
  useEffect(() => {
    setCurrentPage(1);
  }, [tipoFiltro]);

  const router = useRouter();

  const handleView = (curso: MockCursoItemData) => {
    // Navegar para a página de estrutura da turma
    router.push(
      `/dashboard/cursos/alunos/cursos/${curso.cursoId}/${curso.turmaId}`
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-96 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!todosCursos || todosCursos.length === 0) {
    return (
      <EmptyState
        title="Nenhum curso encontrado"
        description="Não há cursos disponíveis no momento."
        illustration="books"
      />
    );
  }

  // Configuração dos tipos de turma
  const tipoConfig: Record<
    NonNullable<MockCursoItemData["turmaTipo"]>,
    { label: string; icon: typeof Monitor }
  > = {
    ONLINE: { label: "Online", icon: Monitor },
    PRESENCIAL: { label: "Presencial", icon: Users },
    AO_VIVO: { label: "Ao Vivo", icon: Radio },
    SEMIPRESENCIAL: { label: "Semipresencial", icon: Video },
  };

  // Mostrar filtros apenas se houver mais de 1 tipo
  const mostrarFiltros = tiposDisponiveis.length > 1;

  return (
    <div className="space-y-8">
      {/* Filtros por tipo de turma */}
      {mostrarFiltros && (
        <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-4">
          <ButtonCustom
            onClick={() => setTipoFiltro("TODOS")}
            variant={tipoFiltro === "TODOS" ? "default" : "outline"}
            size="sm"
            withAnimation={false}
            className={cn(
              tipoFiltro === "TODOS"
                ? "bg-[var(--primary-color)] text-white hover:bg-[var(--primary-color)]/90"
                : ""
            )}
          >
            Todos
          </ButtonCustom>
          {tiposDisponiveis
            .filter(
              (tipo): tipo is NonNullable<typeof tipo> => tipo !== undefined
            )
            .map((tipo) => {
              const config = tipoConfig[tipo];
              const Icon = config.icon;
              return (
                <ButtonCustom
                  key={tipo}
                  onClick={() => setTipoFiltro(tipo)}
                  variant={tipoFiltro === tipo ? "default" : "outline"}
                  size="sm"
                  withAnimation={false}
                  className={cn(
                    tipoFiltro === tipo
                      ? "bg-[var(--primary-color)] text-white hover:bg-[var(--primary-color)]/90"
                      : ""
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {config.label}
                </ButtonCustom>
              );
            })}
        </div>
      )}

      {/* Seção "Continue de onde parou" - Apenas ONLINE */}
      {cursosEmProgressoOnline.length > 0 && (
        <div className="space-y-4">
          <h2 className="!text-lg font-bold text-gray-900">
            Continue de onde parou
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {cursosEmProgressoOnline.slice(0, 4).map((curso) => (
              <ContinueCard key={curso.key} curso={curso} onView={handleView} />
            ))}
          </div>
        </div>
      )}

      {/* Seção "Próximas aulas ao vivo" */}
      {cursosAoVivo.length > 0 && (
        <div className="space-y-4">
          <h2 className="!text-lg font-bold text-gray-900">
            Próximas aulas ao vivo
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {cursosAoVivo.slice(0, 4).map((curso) => (
              <ContinueCardAoVivo key={curso.key} curso={curso} />
            ))}
          </div>
        </div>
      )}

      {/* Seção "Todos os cursos" */}
      <div className="space-y-4">
        <h2 className="!text-lg font-bold text-gray-900">Todos os cursos</h2>
        {cursosPaginados.length === 0 ? (
          <EmptyState
            title="Nenhum curso encontrado"
            description={`Não há cursos do tipo selecionado no momento.`}
            illustration="books"
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {cursosPaginados.map((curso) => (
              <CursoCard key={curso.key} curso={curso} onView={handleView} />
            ))}
          </div>
        )}
      </div>

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 pt-6">
          <div className="text-sm text-gray-600">
            Página {currentPage} de {totalPages} • {todosCursos.length} cursos
          </div>
          <div className="flex items-center gap-2">
            <ButtonCustom
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              withAnimation={false}
            >
              Anterior
            </ButtonCustom>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <ButtonCustom
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(page)}
                className={cn(
                  "text-sm min-w-[40px]",
                  currentPage === page &&
                    "bg-[var(--primary-color)] text-white hover:bg-[var(--primary-color)]/90"
                )}
                withAnimation={false}
              >
                {page}
              </ButtonCustom>
            ))}
            <ButtonCustom
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              withAnimation={false}
            >
              Próxima
            </ButtonCustom>
          </div>
        </div>
      )}
    </div>
  );
}
