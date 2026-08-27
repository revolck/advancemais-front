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
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { updateAulaProgresso } from "@/api/aulas";
import {
  buscarAulaCursoCandidato,
  buscarEstruturaCursoCandidato,
} from "@/api/candidatos";
import type {
  CandidatoTurmaEstruturaItem,
  CandidatoTurmaEstruturaResponse,
} from "@/api/candidatos/types";
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

function normalizeTurmaTipo(
  value?: string | null,
): "ONLINE" | "AO_VIVO" | "PRESENCIAL" | "SEMIPRESENCIAL" | null {
  if (!value) return null;
  if (value === "LIVE") return "AO_VIVO";
  if (
    value === "ONLINE" ||
    value === "AO_VIVO" ||
    value === "PRESENCIAL" ||
    value === "SEMIPRESENCIAL"
  ) {
    return value;
  }
  return null;
}

interface ItemPageProps {
  params: Promise<{
    cursoId: string;
    turmaId: string;
    itemId: string;
  }>;
}

type CandidatoTurmaEstruturaData = CandidatoTurmaEstruturaResponse["data"];
type CandidatoTurmaEstrutura = CandidatoTurmaEstruturaData["estrutura"];

function extractEstruturaCursoData(
  payload?: CandidatoTurmaEstruturaData | CandidatoTurmaEstrutura | null,
): CandidatoTurmaEstrutura | null {
  if (!payload) return null;

  if ("estrutura" in payload && payload.estrutura) {
    return payload.estrutura;
  }

  if ("modules" in payload && Array.isArray(payload.modules)) {
    return payload;
  }

  return null;
}

function AulaPageSkeleton() {
  return (
    <div className="w-full max-w-none rounded-2xl border border-gray-200 bg-white">
      <div className="w-full p-5 md:p-6 xl:p-7">
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_340px] 2xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="min-w-0 space-y-4">
            <Skeleton className="aspect-video w-full rounded-2xl" />
          </div>

          <aside className="min-w-0">
            <div className="space-y-4">
              <div className="rounded-2xl border border-gray-200 bg-white p-5">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-28 rounded-md" />
                    <Skeleton className="h-3 w-36 rounded-md" />
                  </div>
                  <div className="flex gap-2 border-t border-gray-200 pt-4">
                    <Skeleton className="h-8 w-20 rounded-full" />
                    <Skeleton className="h-8 w-24 rounded-full" />
                  </div>
                  <div className="space-y-2 border-t border-gray-200 pt-4">
                    <Skeleton className="h-3 w-full rounded-md" />
                    <Skeleton className="h-3 w-4/5 rounded-md" />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-5">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32 rounded-md" />
                    <Skeleton className="h-3 w-40 rounded-md" />
                  </div>
                  <Skeleton className="h-6 w-8 rounded-full" />
                </div>
                <div className="space-y-2.5">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3.5"
                    >
                      <Skeleton className="h-9 w-9 rounded-lg" />
                      <div className="min-w-0 flex-1 space-y-2">
                        <Skeleton className="h-3.5 w-4/5 rounded-md" />
                        <Skeleton className="h-3 w-2/5 rounded-md" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function getEstruturaItems(
  estrutura?: {
    modules?: Array<{ items?: CandidatoTurmaEstruturaItem[] }>;
    standaloneItems?: CandidatoTurmaEstruturaItem[];
  } | null,
): CandidatoTurmaEstruturaItem[] {
  const modules = Array.isArray(estrutura?.modules) ? estrutura.modules : [];
  const standaloneItems = Array.isArray(estrutura?.standaloneItems)
    ? estrutura.standaloneItems
    : [];

  return [
    ...modules.flatMap((module) =>
      Array.isArray(module.items) ? module.items : [],
    ),
    ...standaloneItems,
  ];
}

function findEstruturaItem(
  estrutura:
    | {
        modules?: Array<{ items?: CandidatoTurmaEstruturaItem[] }>;
        standaloneItems?: CandidatoTurmaEstruturaItem[];
      }
    | null
    | undefined,
  itemId: string | null | undefined,
): CandidatoTurmaEstruturaItem | null {
  if (!itemId) return null;

  return (
    getEstruturaItems(estrutura).find(
      (item) =>
        item.id === itemId ||
        item.aulaId === itemId ||
        item.platformActivityId === itemId,
    ) ?? null
  );
}

export default function ItemPage({ params }: ItemPageProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
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
  const lastSavedTimeRef = useRef(0);

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

  const { data: estruturaCursoPayload, isLoading: isEstruturaCursoLoading } =
    useQuery({
      queryKey: [
        "turma-estrutura",
        resolvedParams?.cursoId,
        resolvedParams?.turmaId,
      ],
      queryFn: async () => {
        if (!resolvedParams?.cursoId || !resolvedParams?.turmaId) {
          throw new Error("Curso ou turma não encontrado");
        }

        const response = await buscarEstruturaCursoCandidato(
          resolvedParams.cursoId,
          resolvedParams.turmaId,
        );
        return response.success ? response.data : null;
      },
      enabled: Boolean(resolvedParams?.cursoId && resolvedParams?.turmaId),
      staleTime: 30 * 1000,
      retry: false,
    });

  const estruturaCursoData = extractEstruturaCursoData(estruturaCursoPayload);

  const estruturaItem = findEstruturaItem(
    estruturaCursoData,
    resolvedParams?.itemId,
  );

  useEffect(() => {
    const tempoPersistido =
      estruturaItem?.progresso?.tempoAssistidoSegundos ?? 0;
    setTempoAssistido(tempoPersistido);
    lastSavedTimeRef.current = tempoPersistido;
  }, [estruturaItem?.id, estruturaItem?.progresso?.tempoAssistidoSegundos]);

  const isAtividadeOuProva =
    Boolean(mockAtividade || mockProva) ||
    estruturaItem?.type === "ATIVIDADE" ||
    estruturaItem?.type === "PROVA";

  const {
    data: aulaResponse,
    isLoading,
    isError,
  } = useQuery({
    queryKey: [
      "candidato-aula",
      resolvedParams?.cursoId,
      resolvedParams?.turmaId,
      resolvedParams?.itemId,
    ],
    queryFn: async () => {
      if (
        !resolvedParams?.cursoId ||
        !resolvedParams?.turmaId ||
        !resolvedParams?.itemId
      ) {
        throw new Error("Item ID não encontrado");
      }

      try {
        return await buscarAulaCursoCandidato(
          resolvedParams.cursoId,
          resolvedParams.turmaId,
          resolvedParams.itemId,
        );
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
    enabled:
      !!resolvedParams?.itemId &&
      !mockAtividade &&
      !mockProva &&
      !isEstruturaCursoLoading &&
      (!estruturaItem || estruturaItem.type === "AULA"),
    staleTime: 5 * 60 * 1000,
    retry: false, // Não tentar novamente se falhar
  });

  const aula = aulaResponse;

  // Buscar tipo da turma para determinar regras de acesso
  useEffect(() => {
    const tipoTurmaApi = normalizeTurmaTipo(aula?.turma?.metodo);
    if (tipoTurmaApi) {
      setTurmaTipo(tipoTurmaApi);
      return;
    }

    if (resolvedParams?.cursoId && resolvedParams?.turmaId) {
      const cursos = getMockAlunoCursos(resolvedParams.cursoId);
      const curso = cursos.find(
        (c) =>
          c.cursoId === resolvedParams.cursoId &&
          c.turmaId === resolvedParams.turmaId,
      );
      const tipoTurma = curso?.turmaTipo || null;
      setTurmaTipo(tipoTurma);
    }
  }, [aula?.turma?.metodo, resolvedParams?.cursoId, resolvedParams?.turmaId]);

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
        resolvedParams.turmaId,
      );

      // Buscar itemId na estrutura
      const estrutura = getMockTurmaEstrutura(
        resolvedParams.cursoId,
        resolvedParams.turmaId,
      );
      let itemId: string | null = null;

      if (estrutura) {
        for (const modulo of estrutura.modules || []) {
          const item = modulo.items.find(
            (i: any) => i.aulaId === resolvedParams.itemId,
          );
          if (item) {
            itemId = item.id;
            break;
          }
        }
        if (!itemId && estrutura.standaloneItems) {
          const item = estrutura.standaloneItems.find(
            (i: any) => i.aulaId === resolvedParams.itemId,
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
          new Date(),
        );
        const dataHoraFim = parse(
          `${aula.dataFim} ${aula.horaFim}`,
          "yyyy-MM-dd HH:mm",
          new Date(),
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
              { locale: ptBR },
            )}.`,
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
                { locale: ptBR },
              )}.`,
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
                { locale: ptBR },
              )}. ${
                jaConcluida
                  ? "Você pode revisar o conteúdo."
                  : "Você pode visualizar o conteúdo, mas não poderá ter nota."
              }`,
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
                { locale: ptBR },
              )}.`,
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
      { threshold: 0.5 }, // Considera visível se 50% do iframe está visível
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
            (Date.now() - startTimeRef.current) / 1000,
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

  useEffect(() => {
    const inscricaoId = estruturaCursoPayload?.inscricaoId;
    const aulaId = estruturaItem?.aulaId ?? resolvedParams?.itemId;
    const duracaoSegundos = (aula?.duracaoMinutos ?? 0) * 60;

    if (
      !inscricaoId ||
      !aulaId ||
      !isYouTube ||
      duracaoSegundos <= 0 ||
      tempoAssistido <= lastSavedTimeRef.current
    ) {
      return;
    }

    const percentualAssistido = Math.min(
      100,
      (tempoAssistido / duracaoSegundos) * 100,
    );
    const atingiuConclusao = percentualAssistido >= 90;
    if (!atingiuConclusao && tempoAssistido - lastSavedTimeRef.current < 10) {
      return;
    }

    const tempoAnterior = lastSavedTimeRef.current;
    lastSavedTimeRef.current = tempoAssistido;

    void updateAulaProgresso(aulaId, {
      inscricaoId,
      percentualAssistido,
      tempoAssistidoSegundos: tempoAssistido,
      ultimaPosicao: tempoAssistido,
    })
      .then(() => {
        void queryClient.invalidateQueries({
          queryKey: [
            "turma-estrutura",
            resolvedParams?.cursoId,
            resolvedParams?.turmaId,
          ],
        });
        void queryClient.invalidateQueries({
          queryKey: ["aluno-candidato", "cursos"],
        });
      })
      .catch(() => {
        lastSavedTimeRef.current = tempoAnterior;
      });
  }, [
    aula?.duracaoMinutos,
    estruturaCursoPayload?.inscricaoId,
    estruturaItem?.aulaId,
    isYouTube,
    queryClient,
    resolvedParams?.cursoId,
    resolvedParams?.itemId,
    resolvedParams?.turmaId,
    tempoAssistido,
  ]);

  if (!resolvedParams) {
    return <AulaPageSkeleton />;
  }

  if (!mockAtividade && !mockProva && isEstruturaCursoLoading) {
    return <AulaPageSkeleton />;
  }

  // Se for uma atividade ou prova, renderizar componente de atividade
  if (isAtividadeOuProva) {
    return (
      <AtividadePage
        params={Promise.resolve({
          cursoId: resolvedParams.cursoId,
          turmaId: resolvedParams.turmaId,
          atividadeId: resolvedParams.itemId,
        })}
        initialItem={estruturaItem}
        estrutura={estruturaCursoData}
      />
    );
  }

  if (isLoading) {
    return <AulaPageSkeleton />;
  }

  if (!aula) {
    // Se ainda está carregando, mostrar skeleton
    if (isLoading) {
      return <AulaPageSkeleton />;
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
                      `/dashboard/cursos/alunos/cursos/${resolvedParams?.cursoId}/${resolvedParams?.turmaId}`,
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
                          <p className="text-xs text-gray-500 mb-0">
                            Data e Horário
                          </p>
                          <p className="text-base font-semibold text-gray-900 mb-0">
                            {aula.dataInicio &&
                              format(
                                parse(
                                  aula.dataInicio,
                                  "yyyy-MM-dd",
                                  new Date(),
                                ),
                                "dd/MM/yyyy",
                                { locale: ptBR },
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
                          `/dashboard/cursos/alunos/cursos/${resolvedParams?.cursoId}/${resolvedParams?.turmaId}`,
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
                  `/dashboard/cursos/alunos/cursos/${resolvedParams?.cursoId}/${resolvedParams?.turmaId}`,
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
  const estrutura =
    estruturaCursoData ||
    getMockTurmaEstrutura(
      resolvedParams?.cursoId || "",
      resolvedParams?.turmaId || "",
    );

  const estruturaModules = Array.isArray(estrutura?.modules)
    ? estrutura.modules
    : [];
  const estruturaStandaloneItems = Array.isArray(estrutura?.standaloneItems)
    ? estrutura.standaloneItems
    : [];

  // Encontrar todas as aulas da estrutura
  const todasAulas = [
    ...estruturaModules.flatMap((mod) =>
      Array.isArray(mod.items)
        ? mod.items.filter((item) => item.type === "AULA" && item.aulaId)
        : [],
    ),
    ...estruturaStandaloneItems.filter(
      (item) => item.type === "AULA" && item.aulaId,
    ),
  ];

  // Encontrar a aula atual e próximas
  const aulaAtualIndex = todasAulas.findIndex(
    (a) => a.aulaId === resolvedParams?.itemId,
  );
  const proximasAulas = todasAulas.slice(
    aulaAtualIndex + 1,
    aulaAtualIndex + 4,
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
    aula?.modalidade === "ONLINE" &&
    (percentualAssistido >= 80 ||
      estruturaItem?.progresso?.status === "CONCLUIDO");
  const podeIrParaProximaAula =
    aula?.modalidade === "ONLINE" &&
    Boolean(proximaAula?.aulaId) &&
    (podeAvancar || aulaEncerrada);

  return (
    <div className="w-full max-w-none rounded-2xl border border-gray-200 bg-white">
      <div className="w-full p-5 md:p-6 xl:p-7">
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_340px] 2xl:grid-cols-[minmax(0,1fr)_360px]">
          {/* Coluna principal - Vídeo (maior) */}
          <div className="min-w-0 space-y-4">
            {/* Mensagem quando aula está encerrada mas acessível */}
            {aulaEncerrada && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
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
              <div className="relative flex aspect-video flex-col items-center justify-center overflow-hidden rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-8">
                <div className="text-center space-y-6 max-w-md">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue-600">
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
                          "noopener,noreferrer",
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
              <div className="relative aspect-video overflow-hidden rounded-2xl border border-slate-900 bg-black">
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
          <aside className="min-w-0">
            <div className="space-y-4">
              {/* Informações da aula */}
              <div className="rounded-2xl border border-gray-200 bg-white p-5">
                <div className="space-y-4">
                  <div>
                    <p className="mb-1! text-sm! font-semibold text-gray-900">
                      Informações
                    </p>
                    <p className="mb-0! text-xs! text-gray-500">
                      Detalhes desta aula
                    </p>
                  </div>

                  {/* Duração e Modalidade - mesma linha */}
                  <div className="flex flex-wrap items-center gap-2 border-t border-gray-200 pt-4">
                    {aula.duracaoMinutos && (
                      <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm! font-medium text-gray-700">
                        <Clock className="h-4 w-4" />
                        <span>{aula.duracaoMinutos} min</span>
                      </div>
                    )}
                    {aula.modalidade && (
                      <span
                        className={`rounded-full border px-3 py-1.5 text-xs! font-semibold capitalize ${
                          aula.modalidade === "ONLINE"
                            ? "border-blue-200 bg-blue-50 text-blue-700"
                            : aula.modalidade === "AO_VIVO"
                              ? "border-purple-200 bg-purple-50 text-purple-700"
                              : aula.modalidade === "PRESENCIAL"
                                ? "border-green-200 bg-green-50 text-green-700"
                                : aula.modalidade === "SEMIPRESENCIAL"
                                  ? "border-amber-200 bg-amber-50 text-amber-700"
                                  : "border-gray-200 bg-gray-50 text-gray-700"
                        }`}
                      >
                        {aula.modalidade.replace("_", " ")}
                      </span>
                    )}
                  </div>

                  {/* Descrição */}
                  {aula.descricao && (
                    <div className="border-t border-gray-200 pt-4">
                      <p className="mb-0! text-sm! leading-relaxed text-gray-700">
                        {aula.descricao}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Próximas Aulas */}
              <div className="rounded-2xl border border-gray-200 bg-white p-5">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <h3 className="mb-1! text-base! font-semibold text-gray-900">
                      Próximas aulas
                    </h3>
                    <p className="mb-0! text-xs! text-gray-500">
                      Continue pela sequência
                    </p>
                  </div>
                  {proximasAulas.length > 0 && (
                    <span className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs! font-semibold text-gray-600">
                      {proximasAulas.length}
                    </span>
                  )}
                </div>

                {isEstruturaCursoLoading ? (
                  <div className="space-y-2.5">
                    {Array.from({ length: 2 }).map((_, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3.5"
                      >
                        <Skeleton className="h-9 w-9 rounded-lg" />
                        <div className="min-w-0 flex-1 space-y-2">
                          <Skeleton className="h-3.5 w-4/5 rounded-md" />
                          <Skeleton className="h-3 w-2/5 rounded-md" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : proximasAulas.length > 0 ? (
                  <div className="space-y-2.5">
                    {proximasAulas.map((proximaAula) => (
                      <div
                        key={proximaAula.id}
                        className="group relative w-full overflow-hidden rounded-xl border border-gray-200 bg-gray-50 p-3.5 transition-colors duration-200 hover:bg-gray-100"
                      >
                        {/* Conteúdo da aula - opaco no hover */}
                        <div className="flex items-center gap-3 transition-opacity duration-200 group-hover:opacity-25">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-blue-100 bg-blue-50">
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
                                  `/dashboard/cursos/alunos/cursos/${resolvedParams?.cursoId}/${resolvedParams?.turmaId}/${proximaAula.aulaId}`,
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
                  <div className="rounded-xl border border-green-100 bg-green-50/50 px-4 py-6 text-center">
                    <CheckCircle2 className="mx-auto mb-3 h-10 w-10 text-green-500" />
                    <p className="mb-0! text-sm! font-medium text-gray-700">
                      Você completou todas as aulas!
                    </p>
                  </div>
                )}
              </div>

              {/* Botão Próxima Aula - apenas para ONLINE e quando concluída/liberada */}
              {aula?.modalidade === "ONLINE" && proximaAula && (
                <div className="rounded-2xl border border-gray-200 bg-white p-5">
                  <div className="space-y-3">
                    <div>
                      <p className="!text-sm font-semibold text-gray-900 mb-0!">
                        Ir para próxima aula
                      </p>
                      <p className="!text-xs text-gray-600 mb-0!">
                        {proximaAula.title}
                      </p>
                    </div>
                    {!podeIrParaProximaAula && (
                      <p className="!text-xs text-amber-600 mt-[-10px]!">
                        Continue assistindo para desbloquear (
                        {Math.round(percentualAssistido)}% / 100%)
                      </p>
                    )}
                    <ButtonCustom
                      onClick={() => {
                        if (proximaAula.aulaId) {
                          router.push(
                            `/dashboard/cursos/alunos/cursos/${resolvedParams?.cursoId}/${resolvedParams?.turmaId}/${proximaAula.aulaId}`,
                          );
                        }
                      }}
                      variant="default"
                      disabled={!podeIrParaProximaAula}
                      className={cn(
                        "w-full bg-[var(--primary-color)] text-white hover:bg-[var(--primary-color)]/90",
                        !podeIrParaProximaAula &&
                          "opacity-50 cursor-not-allowed",
                      )}
                      withAnimation={false}
                    >
                      Ir para próxima aula
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </ButtonCustom>
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
