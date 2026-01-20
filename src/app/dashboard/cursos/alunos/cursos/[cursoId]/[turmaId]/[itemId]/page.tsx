"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { ButtonCustom } from "@/components/ui/custom";
import {
  ArrowLeft,
  Video,
  Clock,
  PlayCircle,
  CheckCircle2,
  BookOpen,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getAulaById } from "@/api/aulas";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/custom";
import {
  getMockAulaById,
  getMockTurmaEstrutura,
  getMockTurmaProgresso,
  getMockAtividadeById,
  getMockProvaById,
  getMockAlunoCursos,
} from "@/mockData/aluno-candidato";
import { isWithinInterval, parse, isBefore, isAfter } from "date-fns";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Lock, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import AtividadePage from "./AtividadePage";
function getCookieValue(name: string): string | null {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
}

/**
 * Normaliza URL do YouTube para formato de embed
 */
function normalizeYouTubeUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    const host = urlObj.hostname.replace(/^www\./, "");

    // Se já está no formato embed, retorna como está
    if (url.includes("/embed/")) {
      return url;
    }

    // youtu.be/<id>
    if (host === "youtu.be") {
      const id = urlObj.pathname.split("/").filter(Boolean)[0];
      return id ? `https://www.youtube.com/embed/${id}?rel=0&autoplay=1` : url;
    }

    // youtube.com/watch?v=<id>
    if (host.includes("youtube.com")) {
      const v = urlObj.searchParams.get("v");
      if (v) {
        return `https://www.youtube.com/embed/${v}?rel=0&autoplay=1`;
      }

      // youtube.com/shorts/<id>
      if (urlObj.pathname.startsWith("/shorts/")) {
        const id = urlObj.pathname.split("/").filter(Boolean)[1];
        if (id) {
          return `https://www.youtube.com/embed/${id}?rel=0&autoplay=1`;
        }
      }
    }

    return url;
  } catch {
    return url;
  }
}

interface ItemPageProps {
  params: Promise<{
    cursoId: string;
    turmaId: string;
    itemId: string;
  }>;
}

export default function ItemPage({ params }: ItemPageProps) {
  const router = useRouter();
  const [resolvedParams, setResolvedParams] = useState<{
    cursoId: string;
    turmaId: string;
    itemId: string;
  } | null>(null);
  const [tempoAssistido, setTempoAssistido] = useState(0); // em segundos
  const [isPlaying, setIsPlaying] = useState(false);
  const [isVisible, setIsVisible] = useState(true); // se o iframe está visível
  const [aulaForaDoPeriodo, setAulaForaDoPeriodo] = useState(false);
  const [mensagemPeriodo, setMensagemPeriodo] = useState<string>("");
  const [aulaEncerrada, setAulaEncerrada] = useState(false); // Flag para aulas encerradas mas acessíveis
  const [turmaTipo, setTurmaTipo] = useState<
    "ONLINE" | "AO_VIVO" | "PRESENCIAL" | "SEMIPRESENCIAL" | null
  >(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    params.then(setResolvedParams);
  }, [params]);

  // Verificar se é uma atividade ou prova ANTES de fazer qualquer outra coisa
  const mockAtividade = resolvedParams?.itemId
    ? getMockAtividadeById(resolvedParams.itemId)
    : null;
  const mockProva = resolvedParams?.itemId
    ? getMockProvaById(resolvedParams.itemId)
    : null;

  const {
    data: aulaResponse,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["aula", resolvedParams?.itemId],
    queryFn: async () => {
      if (!resolvedParams?.itemId) throw new Error("Item ID não encontrado");

      const token = getCookieValue("token");

      // Tentar buscar da API primeiro
      try {
        if (token) {
          return await getAulaById(resolvedParams.itemId, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
        }
      } catch (error) {
        // Se falhar, tentar usar dados mockados
        console.log("API falhou, usando dados mockados:", error);
      }

      // Fallback para dados mockados
      const mockAula = getMockAulaById(resolvedParams.itemId);
      if (mockAula) {
        return mockAula;
      }

      throw new Error("Aula não encontrada");
    },
    enabled: !!resolvedParams?.itemId && !mockAtividade && !mockProva,
    staleTime: 5 * 60 * 1000,
    retry: false, // Não tentar novamente se falhar
  });

  const aula = aulaResponse;

  // Buscar tipo da turma para determinar regras de acesso
  useEffect(() => {
    if (resolvedParams?.cursoId && resolvedParams?.turmaId) {
      const cursos = getMockAlunoCursos(resolvedParams.cursoId);
      const curso = cursos.find(
        (c) =>
          c.cursoId === resolvedParams.cursoId &&
          c.turmaId === resolvedParams.turmaId
      );
      const tipoTurma = curso?.turmaTipo || null;
      setTurmaTipo(tipoTurma);
    }
  }, [resolvedParams?.cursoId, resolvedParams?.turmaId]);

  // Validação de período para aulas
  useEffect(() => {
    if (
      aula?.dataInicio &&
      aula?.dataFim &&
      aula?.horaInicio &&
      aula?.horaFim &&
      resolvedParams?.cursoId &&
      resolvedParams?.turmaId &&
      resolvedParams?.itemId
    ) {
      // Buscar progresso da aula para verificar se já foi concluída
      const progressoMap = getMockTurmaProgresso(
        resolvedParams.cursoId,
        resolvedParams.turmaId
      );

      // Buscar itemId na estrutura
      const estrutura = getMockTurmaEstrutura(
        resolvedParams.cursoId,
        resolvedParams.turmaId
      );
      let itemId: string | null = null;

      if (estrutura) {
        for (const modulo of estrutura.modules || []) {
          const item = modulo.items.find(
            (i: any) => i.aulaId === resolvedParams.itemId
          );
          if (item) {
            itemId = item.id;
            break;
          }
        }
        if (!itemId && estrutura.standaloneItems) {
          const item = estrutura.standaloneItems.find(
            (i: any) => i.aulaId === resolvedParams.itemId
          );
          if (item) {
            itemId = item.id;
          }
        }
      }

      const progressoId = itemId || resolvedParams.itemId;
      const progresso = progressoMap[progressoId];
      const jaConcluida = progresso?.status === "CONCLUIDO";

      const agora = new Date();
      try {
        const dataHoraInicio = parse(
          `${aula.dataInicio} ${aula.horaInicio}`,
          "yyyy-MM-dd HH:mm",
          new Date()
        );
        const dataHoraFim = parse(
          `${aula.dataFim} ${aula.horaFim}`,
          "yyyy-MM-dd HH:mm",
          new Date()
        );

        const estaDentroDoPeriodo = isWithinInterval(agora, {
          start: dataHoraInicio,
          end: dataHoraFim,
        });

        const estaAntes = isBefore(agora, dataHoraInicio);
        const estaDepois = isAfter(agora, dataHoraFim);

        // Se está antes do período, sempre bloquear (independente do tipo)
        if (estaAntes) {
          setAulaForaDoPeriodo(true);
          setAulaEncerrada(false);
          setMensagemPeriodo(
            `Esta aula estará disponível a partir de ${format(
              dataHoraInicio,
              "dd/MM/yyyy 'às' HH:mm",
              { locale: ptBR }
            )}.`
          );
          return;
        }

        // Se está depois do período (encerrado)
        if (estaDepois) {
          // Para PRESENCIAL: bloquear se não foi concluída
          if (turmaTipo === "PRESENCIAL" && !jaConcluida) {
            setAulaForaDoPeriodo(true);
            setAulaEncerrada(false);
            setMensagemPeriodo(
              `O período desta aula encerrou em ${format(
                dataHoraFim,
                "dd/MM/yyyy 'às' HH:mm",
                { locale: ptBR }
              )}.`
            );
            return;
          }

          // Para ONLINE/AO_VIVO: permitir acesso mesmo após encerrar (pode assistir gravação)
          if (turmaTipo === "ONLINE" || turmaTipo === "AO_VIVO") {
            setAulaForaDoPeriodo(false); // Permite acessar
            setAulaEncerrada(true); // Marca como encerrada (mas acessível)
            setMensagemPeriodo(
              `O período desta aula encerrou em ${format(
                dataHoraFim,
                "dd/MM/yyyy 'às' HH:mm",
                { locale: ptBR }
              )}. ${
                jaConcluida
                  ? "Você pode revisar o conteúdo."
                  : "Você pode visualizar o conteúdo, mas não poderá ter nota."
              }`
            );
            // Não return - permite continuar para ver o conteúdo
          } else {
            // Para outros tipos ou sem tipo definido, bloquear
            setAulaForaDoPeriodo(true);
            setAulaEncerrada(false);
            setMensagemPeriodo(
              `O período desta aula encerrou em ${format(
                dataHoraFim,
                "dd/MM/yyyy 'às' HH:mm",
                { locale: ptBR }
              )}.`
            );
            return;
          }
        } else {
          // Dentro do período
          setAulaForaDoPeriodo(false);
          setAulaEncerrada(false);
          setMensagemPeriodo("");
        }
      } catch (error) {
        // Se houver erro ao parsear datas, permite acesso
        setAulaForaDoPeriodo(false);
        setAulaEncerrada(false);
        setMensagemPeriodo("");
      }
    } else {
      setAulaForaDoPeriodo(false);
      setAulaEncerrada(false);
      setMensagemPeriodo("");
    }
  }, [
    aula?.dataInicio,
    aula?.dataFim,
    aula?.horaInicio,
    aula?.horaFim,
    resolvedParams?.cursoId,
    resolvedParams?.turmaId,
    resolvedParams?.itemId,
    turmaTipo,
  ]);

  // Determinar o que exibir baseado na modalidade e disponibilidade (antes dos early returns)
  const hasGravacao =
    aula?.linkGravacao && aula?.statusGravacao === "DISPONIVEL";
  const hasMeetUrl = aula?.modalidade === "AO_VIVO" && aula?.meetUrl;
  const hasYouTube = aula?.modalidade === "ONLINE" && aula?.youtubeUrl;

  // Prioridade: Gravação > Meet ao vivo > YouTube
  const isYouTube = hasYouTube && !hasGravacao && !hasMeetUrl;

  // Rastrear visibilidade do iframe (Intersection Observer) - SEMPRE executar
  useEffect(() => {
    if (!iframeRef.current || !isYouTube) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible(entry.isIntersecting);
        });
      },
      { threshold: 0.5 } // Considera visível se 50% do iframe está visível
    );

    observer.observe(iframeRef.current);

    return () => {
      observer.disconnect();
    };
  }, [isYouTube]);

  // Rastrear tempo assistido quando o vídeo está tocando e visível - SEMPRE executar
  useEffect(() => {
    if (isPlaying && isVisible && aula?.duracaoMinutos && isYouTube) {
      if (!startTimeRef.current) {
        startTimeRef.current = Date.now();
      }

      intervalRef.current = setInterval(() => {
        if (startTimeRef.current && aula?.duracaoMinutos) {
          const elapsed = Math.floor(
            (Date.now() - startTimeRef.current) / 1000
          );
          setTempoAssistido((prev) => {
            const novo = prev + elapsed;
            // Limitar ao máximo da duração da aula
            const maxSegundos = aula.duracaoMinutos * 60;
            return Math.min(novo, maxSegundos);
          });
          startTimeRef.current = Date.now();
        }
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      // Não resetar startTimeRef aqui, apenas pausar
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, isVisible, aula?.duracaoMinutos, isYouTube]);

  if (!resolvedParams) {
    return (
      <div className="h-screen w-full bg-white flex items-center justify-center">
        <Skeleton className="h-full w-full" />
      </div>
    );
  }

  // Se for uma atividade ou prova, renderizar componente de atividade
  if (mockAtividade || mockProva) {
    return (
      <AtividadePage
        params={Promise.resolve({
          cursoId: resolvedParams.cursoId,
          turmaId: resolvedParams.turmaId,
          atividadeId: resolvedParams.itemId,
        })}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="h-screen w-full bg-black flex items-center justify-center">
        <Skeleton className="h-full w-full" />
      </div>
    );
  }

  if (!aula) {
    // Se ainda está carregando, mostrar skeleton
    if (isLoading) {
      return (
        <div className="h-screen w-full bg-black flex items-center justify-center">
          <Skeleton className="h-full w-full" />
        </div>
      );
    }

    return (
      <div className="h-screen w-full bg-black flex items-center justify-center">
        <EmptyState
          title="Aula não encontrada"
          description="A aula que você procura não existe ou não está disponível."
          illustration="pass"
          actions={
            <ButtonCustom
              onClick={() => router.push("/dashboard/cursos/alunos/cursos")}
              variant="default"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para cursos
            </ButtonCustom>
          }
        />
      </div>
    );
  }

  // Verificar se a aula está fora do período permitido
  // Para ONLINE/AO_VIVO, permite acesso mesmo após encerrar (mas não pode ter nota)
  // Para PRESENCIAL, bloqueia completamente se não foi concluída
  if (aulaForaDoPeriodo && !aulaEncerrada) {
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
                    Aula indisponível no momento
                  </h2>
                  <p className="text-sm! text-amber-800 mb-0! leading-relaxed">
                    {mensagemPeriodo ||
                      "Esta aula não está disponível no momento."}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-end pt-4 border-t border-amber-200">
                <ButtonCustom
                  onClick={() =>
                    router.push(
                      `/dashboard/cursos/alunos/cursos/${resolvedParams?.cursoId}/${resolvedParams?.turmaId}`
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

  // Se não tiver nenhum conteúdo disponível
  // Para aulas PRESENCIAIS dentro do período, mostrar informações da aula
  if (!hasGravacao && !hasMeetUrl && !hasYouTube) {
    // Se for PRESENCIAL e estiver dentro do período, mostrar card com informações
    if (
      aula.modalidade === "PRESENCIAL" &&
      !aulaForaDoPeriodo &&
      !aulaEncerrada
    ) {
      return (
        <div className="container w-full bg-white rounded-xl">
          <div className="w-full px-4 md:px-6 lg:px-8 py-6 pt-8 pb-8">
            <div className="max-w-4xl mx-auto">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200 p-8 shadow-lg">
                <div className="text-center space-y-6">
                  <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
                    <BookOpen className="h-10 w-10 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      Aula Presencial
                    </h2>
                    <p className="text-base text-gray-700 mb-6">
                      {aula.descricao ||
                        "Esta é uma aula presencial. Compareça no local e horário indicados."}
                    </p>
                  </div>

                  {/* Informações da aula */}
                  <div className="bg-white rounded-lg border border-green-200 p-6 space-y-4">
                    {aula.sala && (
                      <div className="flex items-center justify-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                          <BookOpen className="h-5 w-5 text-green-600" />
                        </div>
                        <div className="text-left">
                          <p className="text-xs text-gray-500 mb-0">Local</p>
                          <p className="text-base font-semibold text-gray-900 mb-0">
                            {aula.sala}
                          </p>
                        </div>
                      </div>
                    )}

                    {(aula.dataInicio || aula.horaInicio) && (
                      <div className="flex items-center justify-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                          <Clock className="h-5 w-5 text-green-600" />
                        </div>
                        <div className="text-left">
                          <p className="text-xs text-gray-500 mb-0">Data e Horário</p>
                          <p className="text-base font-semibold text-gray-900 mb-0">
                            {aula.dataInicio &&
                              format(
                                parse(aula.dataInicio, "yyyy-MM-dd", new Date()),
                                "dd/MM/yyyy",
                                { locale: ptBR }
                              )}{" "}
                            {aula.horaInicio && `às ${aula.horaInicio}`}
                            {aula.horaFim && ` até ${aula.horaFim}`}
                          </p>
                        </div>
                      </div>
                    )}

                    {aula.duracaoMinutos && (
                      <div className="flex items-center justify-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                          <Clock className="h-5 w-5 text-green-600" />
                        </div>
                        <div className="text-left">
                          <p className="text-xs text-gray-500 mb-0">Duração</p>
                          <p className="text-base font-semibold text-gray-900 mb-0">
                            {aula.duracaoMinutos} minutos
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-center pt-4">
                    <ButtonCustom
                      onClick={() =>
                        router.push(
                          `/dashboard/cursos/alunos/cursos/${resolvedParams?.cursoId}/${resolvedParams?.turmaId}`
                        )
                      }
                      variant="default"
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Voltar para o curso
                    </ButtonCustom>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Para outros casos sem conteúdo, mostrar mensagem padrão
    return (
      <div className="h-screen w-full bg-black flex items-center justify-center">
        <EmptyState
          title="Aula não disponível"
          description={
            aula.modalidade === "AO_VIVO"
              ? "Esta aula não possui link do Google Meet ou gravação disponível."
              : "Esta aula não possui conteúdo disponível."
          }
          illustration="pass"
          actions={
            <ButtonCustom
              onClick={() =>
                router.push(
                  `/dashboard/cursos/alunos/cursos/${resolvedParams?.cursoId}/${resolvedParams?.turmaId}`
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

  // Determinar contentUrl
  let contentUrl: string;

  if (hasGravacao) {
    contentUrl = aula.linkGravacao!;
  } else if (hasMeetUrl) {
    contentUrl = aula.meetUrl!;
  } else if (hasYouTube) {
    contentUrl = normalizeYouTubeUrl(aula.youtubeUrl!);
  } else {
    contentUrl = "";
  }

  // Buscar estrutura para mostrar próximas aulas na sidebar
  const estrutura = getMockTurmaEstrutura(
    resolvedParams?.cursoId || "",
    resolvedParams?.turmaId || ""
  );

  // Encontrar todas as aulas da estrutura
  const todasAulas = estrutura
    ? [
        ...estrutura.modules.flatMap((mod) =>
          mod.items.filter((item) => item.type === "AULA" && item.aulaId)
        ),
        ...(estrutura.standaloneItems?.filter(
          (item) => item.type === "AULA" && item.aulaId
        ) || []),
      ]
    : [];

  // Encontrar a aula atual e próximas
  const aulaAtualIndex = todasAulas.findIndex(
    (a) => a.aulaId === resolvedParams?.itemId
  );
  const proximasAulas = todasAulas.slice(
    aulaAtualIndex + 1,
    aulaAtualIndex + 4
  );
  const proximaAula = todasAulas[aulaAtualIndex + 1];

  // Calcular se 80% da aula foi assistida (apenas para ONLINE)
  const duracaoTotalSegundos = aula?.duracaoMinutos
    ? aula.duracaoMinutos * 60
    : 0;
  const percentualAssistido =
    duracaoTotalSegundos > 0
      ? (tempoAssistido / duracaoTotalSegundos) * 100
      : 0;
  const podeAvancar =
    aula?.modalidade === "ONLINE" && percentualAssistido >= 80;

  return (
    <div className="container w-full bg-white rounded-xl">
      <div className="w-full px-4 md:px-6 lg:px-8 py-6 pt-8 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Coluna principal - Vídeo (maior) */}
          <div className="lg:col-span-3 space-y-4">
            {/* Mensagem quando aula está encerrada mas acessível */}
            {aulaEncerrada && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-amber-600 shrink-0 mt-2" />
                  <div className="flex-1">
                    <p className="text-sm! font-semibold text-amber-900 mb-0!">
                      Período encerrado
                    </p>
                    <p className="text-xs! text-amber-800 mb-0! leading-relaxed">
                      {mensagemPeriodo ||
                        "O período desta aula encerrou. Você pode visualizar o conteúdo, mas não poderá ter nota."}
                    </p>
                  </div>
                </div>
              </div>
            )}
            {/* Player de vídeo ou Card Google Meet */}
            {hasMeetUrl && !hasGravacao ? (
              // Google Meet não pode ser renderizado via iframe - abre em nova aba
              <div className="aspect-video bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl overflow-hidden shadow-lg relative flex flex-col items-center justify-center p-8 border border-blue-200">
                <div className="text-center space-y-6 max-w-md">
                  <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
                    <Video className="h-10 w-10 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      Aula ao Vivo - Google Meet
                    </h3>
                    <p className="text-sm text-gray-600 mb-6">
                      Clique no botão abaixo para entrar na reunião do Google
                      Meet. A sala será aberta em uma nova aba.
                    </p>
                  </div>
                  <ButtonCustom
                    onClick={() => {
                      if (aula.meetUrl) {
                        window.open(
                          aula.meetUrl,
                          "_blank",
                          "noopener,noreferrer"
                        );
                      }
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-base font-semibold"
                    withAnimation={false}
                  >
                    <Video className="mr-2 h-5 w-5" />
                    Entrar na Reunião do Google Meet
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </ButtonCustom>
                </div>
              </div>
            ) : (
              // Player normal para gravações ou YouTube (podem usar iframe)
              <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-lg relative">
                <iframe
                  ref={iframeRef}
                  src={contentUrl}
                  className="w-full h-full border-0"
                  allow={
                    isYouTube
                      ? "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      : "camera; microphone; fullscreen; display-capture; autoplay"
                  }
                  allowFullScreen
                  title={aula.titulo}
                  onLoad={() => {
                    // Quando o iframe carrega, iniciar rastreamento de tempo
                    // Para YouTube, assumimos que o vídeo está tocando quando carrega
                    if (isYouTube && aula?.modalidade === "ONLINE") {
                      setIsPlaying(true);
                    }
                  }}
                />
              </div>
            )}
          </div>

          {/* Sidebar - Informações e Próximas aulas */}
          <div className="lg:col-span-1">
            <div className="space-y-4 sticky top-6">
              {/* Informações da aula */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="space-y-4">
                  {/* Duração e Modalidade - mesma linha */}
                  <div className="flex items-center gap-3 flex-wrap">
                    {aula.duracaoMinutos && (
                      <div className="flex items-center gap-2 !text-sm text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span>{aula.duracaoMinutos} min</span>
                      </div>
                    )}
                    {aula.modalidade && (
                      <span
                        className={`!text-xs font-semibold px-2.5 py-1 rounded-md capitalize ${
                          aula.modalidade === "ONLINE"
                            ? "bg-blue-100 text-blue-700"
                            : aula.modalidade === "AO_VIVO"
                            ? "bg-purple-100 text-purple-700"
                            : aula.modalidade === "PRESENCIAL"
                            ? "bg-green-100 text-green-700"
                            : aula.modalidade === "SEMIPRESENCIAL"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {aula.modalidade.replace("_", " ")}
                      </span>
                    )}
                  </div>

                  {/* Descrição */}
                  {aula.descricao && (
                    <div className="pt-4 border-t border-gray-200">
                      <p className="!text-sm text-gray-700 leading-relaxed">
                        {aula.descricao}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Próximas Aulas */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="!text-base font-semibold text-gray-900 mb-4">
                  Próximas Aulas
                </h3>

                {proximasAulas.length > 0 ? (
                  <div className="space-y-2.5">
                    {proximasAulas.map((proximaAula) => (
                      <div
                        key={proximaAula.id}
                        className="relative w-full p-3.5 rounded-lg bg-gray-50 hover:bg-gray-100 border border-transparent hover:border-gray-200 transition-all duration-200 group overflow-hidden"
                      >
                        {/* Conteúdo da aula - opaco no hover */}
                        <div className="flex items-center gap-3 group-hover:opacity-30 transition-opacity duration-200">
                          <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm">
                            <PlayCircle className="h-4.5 w-4.5 text-[var(--primary-color)]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="!text-sm font-semibold text-gray-900 mb-0! line-clamp-2 leading-snug">
                              {proximaAula.title}
                            </p>
                          </div>
                        </div>

                        {/* Botão "Assistir agora" - aparece no hover */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <ButtonCustom
                            onClick={() => {
                              if (proximaAula.aulaId) {
                                router.push(
                                  `/dashboard/cursos/alunos/cursos/${resolvedParams?.cursoId}/${resolvedParams?.turmaId}/${proximaAula.aulaId}`
                                );
                              }
                            }}
                            variant="default"
                            size="sm"
                            className="bg-[var(--primary-color)] text-white hover:bg-[var(--primary-color)]/90"
                            withAnimation={false}
                          >
                            <PlayCircle className="h-4 w-4 mr-2" />
                            Assistir agora
                          </ButtonCustom>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
                    <p className="!text-sm text-gray-600">
                      Você completou todas as aulas!
                    </p>
                  </div>
                )}
              </div>

              {/* Botão Próxima Aula - apenas para ONLINE e quando 80% assistido */}
              {aula?.modalidade === "ONLINE" && proximaAula && (
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <div className="space-y-3">
                    <div>
                      <p className="!text-sm font-semibold text-gray-900 mb-0!">
                        Próxima Aula
                      </p>
                      <p className="!text-xs text-gray-600 mb-0!">
                        {proximaAula.title}
                      </p>
                    </div>
                    {!podeAvancar && (
                      <p className="!text-xs text-amber-600 mt-[-10px]!">
                        Continue assistindo para desbloquear (
                        {Math.round(percentualAssistido)}% / 100%)
                      </p>
                    )}
                    <ButtonCustom
                      onClick={() => {
                        if (proximaAula.aulaId) {
                          router.push(
                            `/dashboard/cursos/alunos/cursos/${resolvedParams?.cursoId}/${resolvedParams?.turmaId}/${proximaAula.aulaId}`
                          );
                        }
                      }}
                      variant="default"
                      disabled={!podeAvancar}
                      className={cn(
                        "w-full bg-[var(--primary-color)] text-white hover:bg-[var(--primary-color)]/90",
                        !podeAvancar && "opacity-50 cursor-not-allowed"
                      )}
                      withAnimation={false}
                    >
                      Próxima Aula
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </ButtonCustom>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
