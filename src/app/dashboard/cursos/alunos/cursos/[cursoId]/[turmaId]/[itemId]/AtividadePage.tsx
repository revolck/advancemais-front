"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ButtonCustom,
  FileUpload,
  InputCustom,
  RichTextarea,
  toastCustom,
} from "@/components/ui/custom";
import type { FileUploadItem } from "@/components/ui/custom";
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
  Pencil,
  ExternalLink,
  Link2,
  Paperclip,
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
import {
  buscarAtividadeCursoCandidato,
  enviarRespostaAtividadeCursoCandidato,
} from "@/api/candidatos";
import type {
  CandidatoAtividadeDetalhe,
  CandidatoTurmaEstruturaItem,
} from "@/api/candidatos/types";
import { cn } from "@/lib/utils";
import { deleteFile, uploadFile } from "@/services/upload";
import { format, isWithinInterval, parse, isBefore, isAfter } from "date-fns";
import { ptBR } from "date-fns/locale";

interface AtividadePageProps {
  params: Promise<{
    cursoId: string;
    turmaId: string;
    atividadeId: string;
  }>;
  initialItem?: CandidatoTurmaEstruturaItem | null;
  estrutura?: {
    modules?: Array<{ items?: CandidatoTurmaEstruturaItem[] }>;
    standaloneItems?: CandidatoTurmaEstruturaItem[];
  } | null;
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

type EstadoAtividade =
  | "RESPONDENDO"
  | "REVISAO"
  | "CORRIGIDA"
  | "ENVIADA"
  | "AGUARDANDO_GABARITO";

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

function getDatePart(value?: string | null): string | undefined {
  if (!value) return undefined;
  return value.includes("T") ? value.split("T")[0] : value;
}

function buildFallbackAtividadeFromItem(
  item: CandidatoTurmaEstruturaItem,
  atividadeId: string,
): MockAtividadeQuestoes {
  const isProva = item.type === "PROVA";

  return {
    id: item.platformActivityId || item.id || atividadeId,
    titulo: item.title,
    descricao:
      item.descricao ||
      (isProva
        ? "Responda a avaliação conforme as orientações do curso."
        : "Envie sua resposta para esta atividade."),
    tipo: "PERGUNTA_RESPOSTA",
    notaTotal: isProva ? 10 : undefined,
    dataInicio: getDatePart(item.startDate),
    dataFim: getDatePart(item.endDate),
    horaInicio: item.horaInicio || "00:00",
    horaFim: item.horaFim || "23:59",
    questoes: [],
    perguntas: [
      {
        id: `pergunta-${item.platformActivityId || item.id || atividadeId}`,
        pergunta:
          item.descricao ||
          (isProva
            ? item.title
            : item.title || "Descreva sua resposta para a atividade."),
        podeEditar: true,
      },
    ],
  };
}

function buildAtividadeFromApi(
  detalhe: CandidatoAtividadeDetalhe,
): MockAtividadeQuestoes {
  const isQuestoes = isAvaliacaoComQuestoes(detalhe);
  const perguntaTexto = detalhe.questoes[0];

  return {
    id: detalhe.id,
    titulo: detalhe.titulo,
    descricao: detalhe.descricao || undefined,
    tipo: isQuestoes ? "MULTIPLA_ESCOLHA" : "PERGUNTA_RESPOSTA",
    dataInicio: getDatePart(detalhe.dataInicio),
    dataFim: getDatePart(detalhe.dataFim),
    horaInicio: detalhe.horaInicio || "00:00",
    horaFim: detalhe.horaFim || "23:59",
    notaTotal: detalhe.resultado?.notaMaxima,
    questoes: isQuestoes
      ? detalhe.questoes.map((questao) => ({
          id: questao.id,
          enunciado: questao.enunciado,
          alternativas: questao.alternativas.map((alternativa) => ({
            id: alternativa.id,
            texto: alternativa.texto,
            correta: alternativa.correta ?? false,
          })),
        }))
      : [],
    perguntas:
      !isQuestoes && perguntaTexto
        ? [
            {
              id: perguntaTexto.id,
              pergunta: perguntaTexto.enunciado,
              respostaEnviada:
                perguntaTexto.resposta?.respostaTexto || undefined,
              dataEnvio: detalhe.realizadoEm || undefined,
              podeEditar: detalhe.podeEditar,
              nota: detalhe.nota ?? undefined,
              dataCorrecao: detalhe.bloqueadoEdicaoEm || undefined,
              feedback: detalhe.feedback || undefined,
            },
          ]
        : undefined,
  };
}

function isAvaliacaoComQuestoes(detalhe: CandidatoAtividadeDetalhe): boolean {
  return detalhe.tipo === "PROVA" || detalhe.tipoAtividade === "QUESTOES";
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

function matchesEstruturaItem(
  item: CandidatoTurmaEstruturaItem,
  itemId?: string | null,
): boolean {
  if (!itemId) return false;

  return (
    item.id === itemId ||
    item.aulaId === itemId ||
    item.platformActivityId === itemId
  );
}

function getItemRouteId(item: CandidatoTurmaEstruturaItem): string {
  if (item.type === "AULA") {
    return item.aulaId || item.id;
  }

  return item.platformActivityId || item.id;
}

function getItemTypeLabel(type: CandidatoTurmaEstruturaItem["type"]): string {
  if (type === "AULA") return "Aula";
  if (type === "PROVA") return "Prova";
  return "Atividade";
}

function findNextCourseItem(
  estrutura:
    | {
        modules?: Array<{ items?: CandidatoTurmaEstruturaItem[] }>;
        standaloneItems?: CandidatoTurmaEstruturaItem[];
      }
    | null
    | undefined,
  currentItem: CandidatoTurmaEstruturaItem | null | undefined,
  currentItemId: string | null | undefined,
): CandidatoTurmaEstruturaItem | null {
  const items = getEstruturaItems(estrutura);
  const currentIndex = items.findIndex(
    (item) =>
      (currentItem?.id && item.id === currentItem.id) ||
      matchesEstruturaItem(item, currentItemId),
  );

  if (currentIndex < 0) return null;

  const remainingItems = items.slice(currentIndex + 1);
  return (
    remainingItems.find((item) => item.type === "AULA") ||
    remainingItems[0] ||
    null
  );
}

export default function AtividadePage({
  params,
  initialItem,
  estrutura,
}: AtividadePageProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [resolvedParams, setResolvedParams] = useState<{
    cursoId: string;
    turmaId: string;
    atividadeId: string;
  } | null>(null);
  const [atividade, setAtividade] = useState<MockAtividadeQuestoes | null>(
    null,
  );
  const [isAtividadeLoaded, setIsAtividadeLoaded] = useState(false);
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
  const [isEditandoResposta, setIsEditandoResposta] = useState(false);
  const [tentativasEnvio, setTentativasEnvio] = useState(0);
  const [edicoesRealizadas, setEdicoesRealizadas] = useState(0);
  const [limiteEdicoes, setLimiteEdicoes] = useState(3);
  const [ultimaEdicaoEm, setUltimaEdicaoEm] = useState<string | null>(null);
  const [materialMode, setMaterialMode] = useState<"ARQUIVO" | "LINK">(
    "ARQUIVO",
  );
  const [materialFiles, setMaterialFiles] = useState<FileUploadItem[]>([]);
  const [materialLink, setMaterialLink] = useState("");
  const [isSubmittingMaterial, setIsSubmittingMaterial] = useState(false);

  useEffect(() => {
    params.then(setResolvedParams);
  }, [params]);

  const { data: atividadeDetalheResponse, isLoading: isDetalheLoading } =
    useQuery({
      queryKey: [
        "candidato-atividade",
        resolvedParams?.cursoId,
        resolvedParams?.turmaId,
        resolvedParams?.atividadeId,
      ],
      queryFn: async () => {
        if (!resolvedParams) throw new Error("Atividade não encontrada");
        return buscarAtividadeCursoCandidato(
          resolvedParams.cursoId,
          resolvedParams.turmaId,
          resolvedParams.atividadeId,
        );
      },
      enabled:
        Boolean(resolvedParams) &&
        (initialItem?.type === "ATIVIDADE" || initialItem?.type === "PROVA"),
      retry: false,
      staleTime: 30 * 1000,
      refetchInterval: (query) =>
        query.state.data?.data?.aguardandoGabarito ? 15 * 1000 : false,
    });

  const atividadeDetalhe = atividadeDetalheResponse?.data ?? null;

  const enviarRespostaMutation = useMutation({
    mutationFn: async ({
      respostas,
    }: {
      respostas: Array<{
        questaoId: string;
        respostaTexto?: string | null;
        alternativaId?: string | null;
        anexoUrl?: string | null;
        anexoNome?: string | null;
      }>;
    }) => {
      if (!resolvedParams) throw new Error("Atividade não encontrada");
      return enviarRespostaAtividadeCursoCandidato(
        resolvedParams.cursoId,
        resolvedParams.turmaId,
        resolvedParams.atividadeId,
        { respostas },
      );
    },
    onSuccess: (response) => {
      if (!resolvedParams) return;
      queryClient.setQueryData(
        [
          "candidato-atividade",
          resolvedParams.cursoId,
          resolvedParams.turmaId,
          resolvedParams.atividadeId,
        ],
        response,
      );
      void queryClient.invalidateQueries({
        queryKey: [
          "turma-estrutura",
          resolvedParams.cursoId,
          resolvedParams.turmaId,
        ],
      });
      void queryClient.invalidateQueries({
        queryKey: ["aluno-candidato", "cursos"],
      });
    },
  });

  useEffect(() => {
    if (atividadeDetalhe?.tipoAtividade !== "ENVIO_MATERIAL") return;

    const resposta = atividadeDetalhe.questoes[0]?.resposta;
    if (!resposta?.anexoUrl || isEditandoResposta) return;

    const isExternalLink = resposta.anexoNome === "Link enviado";
    setMaterialMode(isExternalLink ? "LINK" : "ARQUIVO");
    setMaterialLink(isExternalLink ? resposta.anexoUrl : "");
    setMaterialFiles(
      isExternalLink
        ? []
        : [
            {
              id: `material-${atividadeDetalhe.id}`,
              name: resposta.anexoNome || "Material enviado",
              size: 0,
              type: "application/octet-stream",
              status: "completed",
              uploadDate: new Date(atividadeDetalhe.realizadoEm || Date.now()),
              uploadedUrl: resposta.anexoUrl,
            },
          ],
    );
  }, [atividadeDetalhe, isEditandoResposta]);

  useEffect(() => {
    if (
      resolvedParams?.atividadeId &&
      resolvedParams?.cursoId &&
      resolvedParams?.turmaId
    ) {
      setIsAtividadeLoaded(false);

      // Tentar buscar como atividade primeiro
      let mockAtividade = atividadeDetalhe
        ? buildAtividadeFromApi(atividadeDetalhe)
        : getMockAtividadeById(resolvedParams.atividadeId);
      let isProva =
        initialItem?.type === "PROVA" || atividadeDetalhe?.tipo === "PROVA";

      // Se não encontrar como atividade, tentar como prova
      if (!mockAtividade) {
        mockAtividade = getMockProvaById(resolvedParams.atividadeId);
        isProva = !!mockAtividade;
      }

      if (!mockAtividade && initialItem) {
        mockAtividade = buildFallbackAtividadeFromItem(
          initialItem,
          resolvedParams.atividadeId,
        );
        isProva = initialItem.type === "PROVA";
      }

      if (mockAtividade) {
        setAtividade(mockAtividade);
        setIsAtividadeLoaded(true);
        if (atividadeDetalhe) {
          setTentativasEnvio(atividadeDetalhe.tentativasEnvio);
          setEdicoesRealizadas(atividadeDetalhe.edicoesRealizadas);
          setLimiteEdicoes(atividadeDetalhe.limiteEdicoes);
          setUltimaEdicaoEm(atividadeDetalhe.ultimaEdicaoEm);
          setIsEditandoResposta(false);
          if (isAvaliacaoComQuestoes(atividadeDetalhe)) {
            setRespostasQuestoes(
              Object.fromEntries(
                atividadeDetalhe.questoes
                  .filter((questao) => questao.resposta?.alternativaId)
                  .map((questao) => [
                    questao.id,
                    {
                      questaoId: questao.id,
                      alternativaId: questao.resposta?.alternativaId ?? null,
                    },
                  ]),
              ),
            );

            if (
              atividadeDetalhe.gabaritoDisponivel &&
              atividadeDetalhe.resultado
            ) {
              const resultadoApi = atividadeDetalhe.resultado;
              setResultado({
                acertos: resultadoApi.acertos,
                total: resultadoApi.totalQuestoes,
                percentual: resultadoApi.percentual,
                nota: resultadoApi.nota ?? undefined,
                valorPorQuestao:
                  resultadoApi.totalQuestoes > 0
                    ? resultadoApi.notaMaxima / resultadoApi.totalQuestoes
                    : undefined,
                notaTotal: resultadoApi.notaMaxima,
              });
              setEstado("CORRIGIDA");
            } else if (atividadeDetalhe.aguardandoGabarito) {
              setResultado(null);
              setEstado("AGUARDANDO_GABARITO");
            }
          }
        }

        // Buscar tipo da turma para determinar regras de acesso
        const cursos = getMockAlunoCursos(resolvedParams.cursoId);
        const curso = cursos.find(
          (c) =>
            c.cursoId === resolvedParams.cursoId &&
            c.turmaId === resolvedParams.turmaId,
        );
        const tipoTurma =
          normalizeTurmaTipo(initialItem?.modalidade) ||
          curso?.turmaTipo ||
          null;
        setTurmaTipo(tipoTurma);

        // Buscar estrutura para encontrar o itemId correto
        const estrutura = getMockTurmaEstrutura(
          resolvedParams.cursoId,
          resolvedParams.turmaId,
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
                i.id === resolvedParams.atividadeId,
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
                i.id === resolvedParams.atividadeId,
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
          resolvedParams.turmaId,
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
                  i.platformActivityId === resolvedParams.atividadeId),
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
            new Date(),
          );
          const dataHoraFim = parse(
            `${dataFimItem} ${horaFimItem}`,
            "yyyy-MM-dd HH:mm",
            new Date(),
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
                { locale: ptBR },
              )}.`,
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
                  { locale: ptBR },
                )}.`,
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
                  { locale: ptBR },
                )}. ${
                  jaConcluida
                    ? "Você pode revisar suas respostas e ver a nota."
                    : "Você pode visualizar o conteúdo, mas não poderá submeter respostas."
                }`,
              );
              // Não return - permite continuar para ver o conteúdo
            } else {
              // Para outros tipos ou sem tipo definido, bloquear
              setIsProvaForaDoPeriodo(true);
              setMensagemPeriodo(
                `O período desta ${tipoItemLocal} encerrou em ${format(
                  dataHoraFim,
                  "dd/MM/yyyy 'às' HH:mm",
                  { locale: ptBR },
                )}.`,
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

        if (
          atividadeDetalhe &&
          isAvaliacaoComQuestoes(atividadeDetalhe) &&
          atividadeDetalhe.realizadoEm
        ) {
          return;
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
                Math.min(notaNormalizada, mockAtividade.notaTotal),
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
              Math.min((acertos / totalQuestoes) * 100, 100),
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

            const todasEnviadas = mockAtividade.perguntas.every(
              (p) => p.respostaEnviada,
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
          // Uma resposta enviada volta para o modo de leitura; a edição é uma ação explícita.
          const todasEnviadas = mockAtividade.perguntas.every(
            (p) => p.respostaEnviada,
          );
          if (todasEnviadas) {
            setEstado("ENVIADA");
            return; // Não continuar - atividade já enviada e bloqueada
          }
        }
      } else {
        // Se não encontrou a atividade, definir como null explicitamente
        setAtividade(null);
        setIsAtividadeLoaded(true);
      }
    }
  }, [
    resolvedParams?.atividadeId,
    resolvedParams?.cursoId,
    resolvedParams?.turmaId,
    initialItem,
    atividadeDetalhe,
  ]);

  if (!resolvedParams) {
    return (
      <div className="h-screen w-full bg-white flex items-center justify-center">
        <Skeleton className="h-full w-full" />
      </div>
    );
  }

  if (
    (initialItem?.type === "ATIVIDADE" || initialItem?.type === "PROVA") &&
    isDetalheLoading
  ) {
    return (
      <div className="h-screen w-full bg-white flex items-center justify-center">
        <Skeleton className="h-full w-full" />
      </div>
    );
  }

  // Se ainda não carregou a atividade mas temos o ID, mostrar loading
  if (
    !atividade &&
    resolvedParams?.atividadeId &&
    (!isAtividadeLoaded || isDetalheLoading)
  ) {
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
                  `/dashboard/cursos/alunos/cursos/${resolvedParams.cursoId}/${resolvedParams.turmaId}`,
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
                      `/dashboard/cursos/alunos/cursos/${resolvedParams.cursoId}/${resolvedParams.turmaId}`,
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

  // ========== LÓGICA PARA ATIVIDADES DE ENVIO DE MATERIAL ==========
  if (atividadeDetalhe?.tipoAtividade === "ENVIO_MATERIAL") {
    const questao = atividadeDetalhe.questoes[0];
    const resposta = questao?.resposta;
    const materialEnviado = Boolean(resposta?.anexoUrl) && !isEditandoResposta;
    const edicoesRestantes = Math.max(
      0,
      atividadeDetalhe.limiteEdicoes - atividadeDetalhe.edicoesRealizadas,
    );
    const podeEditarMaterial =
      atividadeDetalhe.podeEditar &&
      edicoesRestantes > 0 &&
      !atividadeEncerrada;
    const proximoItem = findNextCourseItem(
      estrutura,
      initialItem,
      resolvedParams.atividadeId,
    );
    const proximoItemRouteId = proximoItem ? getItemRouteId(proximoItem) : null;

    const handleSubmitMaterial = async () => {
      if (!questao || atividadeEncerrada || isSubmittingMaterial) return;

      let anexoUrl = materialLink.trim();
      let anexoNome = "Link enviado";
      let uploadedNow: string | null = null;
      const previousUrl = resposta?.anexoUrl || null;

      if (materialMode === "LINK") {
        try {
          const parsedUrl = new URL(anexoUrl);
          if (
            parsedUrl.protocol !== "http:" &&
            parsedUrl.protocol !== "https:"
          ) {
            throw new Error("invalid protocol");
          }
        } catch {
          toastCustom.error("Informe um link válido.");
          return;
        }
      } else {
        const selectedFile = materialFiles[0];
        if (!selectedFile) {
          toastCustom.error("Selecione um arquivo para enviar.");
          return;
        }

        if (selectedFile.file) {
          setIsSubmittingMaterial(true);
          try {
            const uploaded = await uploadFile(
              selectedFile.file,
              `cursos/atividades/${atividadeDetalhe.id}`,
            );
            anexoUrl = uploaded.url;
            anexoNome = uploaded.originalName;
            uploadedNow = uploaded.url;
          } catch (error: any) {
            toastCustom.error(
              error?.message || "Não foi possível enviar o arquivo.",
            );
            setIsSubmittingMaterial(false);
            return;
          }
        } else if (selectedFile.uploadedUrl) {
          anexoUrl = selectedFile.uploadedUrl;
          anexoNome = selectedFile.name;
        }
      }

      setIsSubmittingMaterial(true);
      try {
        const response = await enviarRespostaMutation.mutateAsync({
          respostas: [{ questaoId: questao.id, anexoUrl, anexoNome }],
        });

        if (previousUrl && previousUrl !== anexoUrl) {
          void deleteFile(previousUrl);
        }

        setAtividade(buildAtividadeFromApi(response.data));
        setTentativasEnvio(response.data.tentativasEnvio);
        setEdicoesRealizadas(response.data.edicoesRealizadas);
        setLimiteEdicoes(response.data.limiteEdicoes);
        setUltimaEdicaoEm(response.data.ultimaEdicaoEm);
        setIsEditandoResposta(false);
        setEstado("ENVIADA");
        toastCustom.success(
          resposta?.anexoUrl ? "Material atualizado." : "Material enviado.",
        );
      } catch (error: any) {
        if (uploadedNow) {
          void deleteFile(uploadedNow);
        }
        toastCustom.error(
          error?.message || "Não foi possível enviar o material.",
        );
      } finally {
        setIsSubmittingMaterial(false);
      }
    };

    if (!questao) {
      return (
        <div className="container w-full rounded-xl bg-white p-6">
          <EmptyState
            title="Conteúdo não disponível"
            description="Esta atividade ainda não possui instruções para envio."
            illustration="pass"
          />
        </div>
      );
    }

    return (
      <div className="container w-full rounded-xl bg-white">
        <div className="w-full px-4 py-8 md:px-6 lg:px-8">
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
            <div className="border-b border-gray-200 bg-gray-50 px-5 py-5 md:px-6">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[var(--primary-color)]">
                  <Paperclip className="h-5 w-5 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="mb-1! text-base! font-semibold text-gray-900">
                    Envio de material
                  </h3>
                  <p className="mb-0! whitespace-pre-wrap text-sm! leading-relaxed text-gray-700">
                    {questao.enunciado}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-5 p-5 md:p-6">
              {atividadeEncerrada && !materialEnviado && (
                <div className="rounded-md border border-amber-200 bg-amber-50 p-4">
                  <p className="mb-0! text-sm! text-amber-900">
                    {mensagemPeriodo}
                  </p>
                </div>
              )}

              {materialEnviado ? (
                <>
                  <div className="rounded-md border border-emerald-200 bg-emerald-50 p-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                      <div className="min-w-0 flex-1">
                        <p className="mb-1! text-sm! font-semibold text-emerald-900">
                          {atividadeDetalhe.corrigida
                            ? "Material corrigido"
                            : "Material enviado"}
                        </p>
                        <p className="mb-0! text-xs! text-emerald-800">
                          {atividadeDetalhe.corrigida
                            ? "A correção foi realizada pelo instrutor."
                            : podeEditarMaterial
                              ? `Aguardando correção. Você ainda pode editar ${edicoesRestantes} ${
                                  edicoesRestantes === 1 ? "vez" : "vezes"
                                }.`
                              : "Aguardando correção."}
                        </p>
                      </div>
                    </div>
                  </div>

                  <a
                    href={resposta?.anexoUrl || "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="flex cursor-pointer items-center gap-3 rounded-md border border-gray-200 bg-white p-4 text-gray-800 hover:bg-gray-50"
                  >
                    {resposta?.anexoNome === "Link enviado" ? (
                      <Link2 className="h-5 w-5 shrink-0 text-[var(--primary-color)]" />
                    ) : (
                      <Paperclip className="h-5 w-5 shrink-0 text-[var(--primary-color)]" />
                    )}
                    <span className="min-w-0 flex-1 truncate text-sm! font-medium">
                      {resposta?.anexoNome === "Link enviado"
                        ? resposta.anexoUrl
                        : resposta?.anexoNome || "Abrir material"}
                    </span>
                    <ExternalLink className="h-4 w-4 shrink-0 text-gray-500" />
                  </a>

                  {(podeEditarMaterial || proximoItemRouteId) && (
                    <div className="flex flex-col gap-3 border-t border-gray-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
                      {proximoItem ? (
                        <div className="min-w-0">
                          <p className="mb-1! text-xs! font-semibold uppercase text-gray-500">
                            Próximo item
                          </p>
                          <p className="mb-0! line-clamp-1 text-sm! font-medium text-gray-900">
                            {proximoItem.title}
                          </p>
                        </div>
                      ) : (
                        <div />
                      )}

                      <div className="flex flex-wrap justify-end gap-2">
                        {podeEditarMaterial && (
                          <ButtonCustom
                            type="button"
                            variant="outline"
                            withAnimation={false}
                            onClick={() => setIsEditandoResposta(true)}
                          >
                            Editar envio
                          </ButtonCustom>
                        )}
                        {proximoItemRouteId && (
                          <ButtonCustom
                            type="button"
                            variant="default"
                            withAnimation={false}
                            onClick={() =>
                              router.push(
                                `/dashboard/cursos/alunos/cursos/${resolvedParams.cursoId}/${resolvedParams.turmaId}/${proximoItemRouteId}`,
                              )
                            }
                          >
                            Avançar
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </ButtonCustom>
                        )}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="inline-flex rounded-md border border-gray-200 bg-gray-50 p-1">
                    <button
                      type="button"
                      disabled={isSubmittingMaterial}
                      onClick={() => setMaterialMode("ARQUIVO")}
                      className={cn(
                        "inline-flex h-9 cursor-pointer items-center gap-2 rounded px-3 text-sm! font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50",
                        materialMode === "ARQUIVO"
                          ? "bg-[var(--primary-color)] text-white"
                          : "text-gray-600 hover:bg-gray-100",
                      )}
                    >
                      <Paperclip className="h-4 w-4" />
                      Arquivo
                    </button>
                    <button
                      type="button"
                      disabled={isSubmittingMaterial}
                      onClick={() => setMaterialMode("LINK")}
                      className={cn(
                        "inline-flex h-9 cursor-pointer items-center gap-2 rounded px-3 text-sm! font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50",
                        materialMode === "LINK"
                          ? "bg-[var(--primary-color)] text-white"
                          : "text-gray-600 hover:bg-gray-100",
                      )}
                    >
                      <Link2 className="h-4 w-4" />
                      Link
                    </button>
                  </div>

                  {materialMode === "ARQUIVO" ? (
                    <FileUpload
                      files={materialFiles}
                      onFilesChange={setMaterialFiles}
                      maxFiles={1}
                      multiple={false}
                      autoUpload={false}
                      deleteOnRemove={false}
                      showValidationDetails={false}
                      disabled={isSubmittingMaterial || atividadeEncerrada}
                      validation={{
                        maxSize: 5 * 1024 * 1024,
                        maxFiles: 1,
                        accept: [
                          ".jpg",
                          ".jpeg",
                          ".png",
                          ".webp",
                          ".pdf",
                          ".doc",
                          ".docx",
                          ".xls",
                          ".xlsx",
                          ".ppt",
                          ".pptx",
                          ".odt",
                          ".ods",
                          ".odp",
                          ".txt",
                        ],
                      }}
                      dropzoneText={
                        <p className="mb-0! text-sm! text-gray-700">
                          Arraste o material ou selecione o arquivo
                        </p>
                      }
                      browseText="Selecionar"
                      classNames={{
                        container: "shadow-none",
                        dropzone: "cursor-pointer shadow-none",
                        fileItem: "shadow-none",
                      }}
                    />
                  ) : (
                    <InputCustom
                      label="Link do material"
                      type="url"
                      value={materialLink}
                      onChange={(event) => setMaterialLink(event.target.value)}
                      placeholder="https://"
                      disabled={isSubmittingMaterial || atividadeEncerrada}
                    />
                  )}

                  <div className="flex items-center justify-end gap-2 border-t border-gray-200 pt-5">
                    {isEditandoResposta && (
                      <ButtonCustom
                        type="button"
                        variant="outline"
                        withAnimation={false}
                        disabled={isSubmittingMaterial}
                        onClick={() => setIsEditandoResposta(false)}
                      >
                        Cancelar
                      </ButtonCustom>
                    )}
                    <ButtonCustom
                      type="button"
                      variant="default"
                      withAnimation={false}
                      isLoading={isSubmittingMaterial}
                      disabled={
                        atividadeEncerrada ||
                        isSubmittingMaterial ||
                        (materialMode === "ARQUIVO"
                          ? materialFiles.length === 0
                          : !materialLink.trim())
                      }
                      onClick={handleSubmitMaterial}
                    >
                      <Send className="mr-2 h-4 w-4" />
                      {resposta?.anexoUrl
                        ? "Atualizar material"
                        : "Enviar material"}
                    </ButtonCustom>
                  </div>
                </>
              )}
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

    const handleConfirmarEnvio = async () => {
      try {
        const response = await enviarRespostaMutation.mutateAsync({
          respostas: atividade.questoes.map((questao) => ({
            questaoId: questao.id,
            alternativaId: respostasQuestoes[questao.id]?.alternativaId ?? null,
          })),
        });
        setAtividade(buildAtividadeFromApi(response.data));
        setIsModalConfirmacaoOpen(false);
        setEstado(
          response.data.gabaritoDisponivel
            ? "CORRIGIDA"
            : "AGUARDANDO_GABARITO",
        );
        toastCustom.success(
          response.data.gabaritoDisponivel
            ? "Respostas corrigidas."
            : "Respostas enviadas. O gabarito será liberado após o encerramento.",
        );
      } catch (error: any) {
        if (
          error?.status === 409 &&
          error?.details?.code === "AVALIACAO_JA_ENVIADA"
        ) {
          setIsModalConfirmacaoOpen(false);
          await queryClient.invalidateQueries({
            queryKey: [
              "candidato-atividade",
              resolvedParams?.cursoId,
              resolvedParams?.turmaId,
              resolvedParams?.atividadeId,
            ],
          });
          toastCustom.info("Esta prova já foi enviada.");
          return;
        }

        toastCustom.error(
          error?.message || "Não foi possível enviar as respostas.",
        );
      }
    };

    const handleVoltarParaResponder = () => {
      setEstado("RESPONDENDO");
    };

    if (estado === "AGUARDANDO_GABARITO") {
      const liberacao = atividadeDetalhe?.gabaritoDisponivelEm
        ? format(
            new Date(atividadeDetalhe.gabaritoDisponivelEm),
            "dd/MM/yyyy 'às' HH:mm",
            { locale: ptBR },
          )
        : null;

      return (
        <div className="container w-full rounded-xl bg-white p-6 md:p-8">
          <div className="space-y-5">
            <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4">
              <Lock className="mt-0.5 h-5 w-5 shrink-0 text-blue-700" />
              <div>
                <p className="mb-0! text-sm! font-semibold text-blue-950">
                  Respostas enviadas
                </p>
                <p className="mb-0! mt-1 text-sm! text-blue-800">
                  {liberacao
                    ? `O gabarito e o resultado serão liberados em ${liberacao}.`
                    : "O gabarito será liberado após o encerramento da avaliação."}
                </p>
              </div>
            </div>

            <div className="divide-y divide-gray-100 rounded-lg border border-gray-200">
              {atividade.questoes.map((questao, index) => {
                const alternativa = questao.alternativas?.find(
                  (item) =>
                    item.id === respostasQuestoes[questao.id]?.alternativaId,
                );
                return (
                  <div key={questao.id} className="p-4">
                    <p className="mb-1! text-sm! font-semibold text-gray-900">
                      Questão {index + 1}
                    </p>
                    <p className="mb-2! text-sm! text-gray-700">
                      {questao.enunciado}
                    </p>
                    <span className="inline-flex rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs! font-medium text-gray-700">
                      Sua resposta: {alternativa?.texto || "Não respondida"}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end">
              <ButtonCustom
                variant="outline"
                withAnimation={false}
                onClick={() =>
                  router.push(
                    `/dashboard/cursos/alunos/cursos/${resolvedParams.cursoId}/${resolvedParams.turmaId}`,
                  )
                }
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar para o curso
              </ButtonCustom>
            </div>
          </div>
        </div>
      );
    }

    // Tela de correção e resultados
    if (estado === "CORRIGIDA" && resultado) {
      const proximoItem = findNextCourseItem(
        estrutura,
        initialItem,
        resolvedParams.atividadeId,
      );
      const proximoItemRouteId = proximoItem
        ? getItemRouteId(proximoItem)
        : null;
      const proximoItemLabelLower = proximoItem
        ? getItemTypeLabel(proximoItem.type).toLowerCase()
        : "";

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
                          : "bg-red-100",
                    )}
                  >
                    <span
                      className={cn(
                        "text-3xl! font-bold",
                        resultado.percentual >= 70
                          ? "text-green-700"
                          : resultado.percentual >= 50
                            ? "text-yellow-700"
                            : "text-red-700",
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
                        : "Revise as respostas e o conteúdo para reforçar seu aprendizado."}
                  </p>
                </div>

                <div className="space-y-4">
                  {atividade.questoes.map((q, index) => {
                    const resposta = respostasQuestoes[q.id];
                    const alternativaSelecionada = resposta?.alternativaId
                      ? q.alternativas?.find(
                          (a) => a.id === resposta.alternativaId,
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
                            : "border-red-200 bg-red-50",
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
                              {alternativaSelecionada && (
                                <span
                                  className={cn(
                                    "rounded border px-2 py-1 text-xs! font-semibold",
                                    acertou
                                      ? "border-green-300 bg-green-100 text-green-700"
                                      : "border-red-300 bg-red-100 text-red-700",
                                  )}
                                >
                                  Você marcou:{" "}
                                  {String.fromCharCode(
                                    65 +
                                      (q.alternativas?.indexOf(
                                        alternativaSelecionada,
                                      ) || 0),
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
                                          : "border-gray-200 bg-white",
                                    )}
                                  >
                                    <div
                                      className={cn(
                                        "w-6 h-6 rounded-full flex items-center justify-center shrink-0 !text-xs font-semibold",
                                        isCorreta
                                          ? "bg-green-600 text-white"
                                          : isSelecionada && !isCorreta
                                            ? "bg-red-600 text-white"
                                            : "bg-gray-200 text-gray-700",
                                      )}
                                    >
                                      {String.fromCharCode(
                                        65 +
                                          (q.alternativas?.indexOf(alt) || 0),
                                      )}
                                    </div>
                                    <span
                                      className={cn(
                                        "text-sm! flex-1",
                                        isCorreta
                                          ? "text-green-900 font-semibold"
                                          : isSelecionada && !isCorreta
                                            ? "text-red-900 font-semibold"
                                            : "text-gray-700",
                                      )}
                                    >
                                      {alt.texto}
                                    </span>
                                    <div className="flex shrink-0 items-center gap-3">
                                      {isSelecionada && (
                                        <span
                                          className={cn(
                                            "text-xs! font-semibold",
                                            isCorreta
                                              ? "text-green-700"
                                              : "text-red-700",
                                          )}
                                        >
                                          Sua resposta
                                        </span>
                                      )}
                                      {isCorreta && (
                                        <div className="flex items-center gap-2">
                                          <span className="text-xs! font-semibold text-green-700">
                                            Resposta correta
                                          </span>
                                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                                        </div>
                                      )}
                                      {isSelecionada && !isCorreta && (
                                        <XCircle className="h-4 w-4 text-red-600" />
                                      )}
                                    </div>
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

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                {proximoItem && proximoItemRouteId ? (
                  <div className="min-w-0">
                    <p className="mb-1! text-xs! font-semibold uppercase text-gray-500">
                      Próximo item
                    </p>
                    <p className="mb-0! line-clamp-1 text-sm! font-medium text-gray-900">
                      {proximoItem.title}
                    </p>
                  </div>
                ) : (
                  <div />
                )}

                <div className="flex flex-wrap justify-end gap-2">
                  <ButtonCustom
                    onClick={() =>
                      router.push(
                        `/dashboard/cursos/alunos/cursos/${resolvedParams.cursoId}/${resolvedParams.turmaId}`,
                      )
                    }
                    variant="outline"
                    withAnimation={false}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Voltar para o curso
                  </ButtonCustom>

                  {proximoItem && proximoItemRouteId && (
                    <ButtonCustom
                      onClick={() =>
                        router.push(
                          `/dashboard/cursos/alunos/cursos/${resolvedParams.cursoId}/${resolvedParams.turmaId}/${proximoItemRouteId}`,
                        )
                      }
                      variant="default"
                      withAnimation={false}
                    >
                      {proximoItem.type === "AULA"
                        ? "Ir para próxima aula"
                        : `Ir para próximo ${proximoItemLabelLower}`}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </ButtonCustom>
                  )}
                </div>
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
                          (a) => a.id === resposta.alternativaId,
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
                                          alternativaSelecionada,
                                        ) || 0),
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
                mensagemEdicao="Após confirmar, as respostas não poderão mais ser editadas."
                mensagemProfessor="A correção será automática. O gabarito será liberado um minuto após o encerramento."
                textoBotao="Sim, confirmar respostas"
                isLoading={enviarRespostaMutation.isPending}
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
                              : "bg-gray-100 text-gray-600 border-2 border-gray-300",
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
                            ? "cursor-pointer border-[var(--primary-color)] bg-[var(--primary-color)]/5"
                            : "cursor-pointer border-gray-200 bg-white hover:border-gray-300",
                      )}
                    >
                      <div
                        className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm! font-semibold transition-colors",
                          isSelecionada
                            ? "bg-[var(--primary-color)] text-white"
                            : "bg-gray-200 text-gray-700",
                        )}
                      >
                        {letra}
                      </div>
                      <span
                        className={cn(
                          "text-sm! flex-1",
                          isSelecionada
                            ? "text-gray-900 font-medium"
                            : "text-gray-700",
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
    const jaEnviada = !!respostaAtual?.dataEnvio && !isEditandoResposta;
    const edicoesRestantes = Math.max(0, limiteEdicoes - edicoesRealizadas);
    const podeReenviar =
      podeEditar && edicoesRestantes > 0 && !atividadeEncerrada;

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

    const handleConfirmarEnvio = async () => {
      const resposta = respostasPerguntas[pergunta.id];
      if (!resposta || !resposta.respostaTexto.trim()) {
        return;
      }

      try {
        if (atividadeDetalhe) {
          const response = await enviarRespostaMutation.mutateAsync({
            respostas: [
              {
                questaoId: pergunta.id,
                respostaTexto: resposta.respostaTexto,
              },
            ],
          });
          const detalheAtualizado = response.data;
          const questaoAtualizada = detalheAtualizado.questoes.find(
            (questao) => questao.id === pergunta.id,
          );
          setAtividade(buildAtividadeFromApi(detalheAtualizado));
          setTentativasEnvio(detalheAtualizado.tentativasEnvio);
          setEdicoesRealizadas(detalheAtualizado.edicoesRealizadas);
          setLimiteEdicoes(detalheAtualizado.limiteEdicoes);
          setUltimaEdicaoEm(detalheAtualizado.ultimaEdicaoEm);
          setRespostasPerguntas({
            [pergunta.id]: {
              perguntaId: pergunta.id,
              respostaTexto:
                questaoAtualizada?.resposta?.respostaTexto ||
                resposta.respostaTexto,
              dataEnvio:
                detalheAtualizado.realizadoEm || new Date().toISOString(),
            },
          });
        } else {
          setTentativasEnvio((atual) => atual + 1);
          if (tentativasEnvio > 0) {
            setEdicoesRealizadas((atual) => Math.min(limiteEdicoes, atual + 1));
            setUltimaEdicaoEm(new Date().toISOString());
          }
          setRespostasPerguntas((prev) => ({
            ...prev,
            [pergunta.id]: {
              ...prev[pergunta.id],
              dataEnvio: new Date().toISOString(),
            },
          }));
        }
        setIsEditandoResposta(false);
        setEstado("ENVIADA");
        setIsModalConfirmacaoOpen(false);
        toastCustom.success(
          tentativasEnvio > 0 ? "Resposta reenviada." : "Resposta enviada.",
        );
      } catch (error: any) {
        toastCustom.error(
          error?.message ||
            "Não foi possível enviar a resposta. Tente novamente.",
        );
      }
    };

    // Tela de atividade enviada
    if (estado === "ENVIADA" || jaEnviada) {
      const resposta = respostasPerguntas[pergunta.id];
      const temNota = pergunta.nota !== undefined && pergunta.nota !== null;
      const foiCorrigida = !!pergunta.dataCorrecao;
      const proximoItem = findNextCourseItem(
        estrutura,
        initialItem,
        resolvedParams.atividadeId,
      );
      const proximoItemRouteId = proximoItem
        ? getItemRouteId(proximoItem)
        : null;
      const proximoItemLabelLower = proximoItem
        ? getItemTypeLabel(proximoItem.type).toLowerCase()
        : "";

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
                        : podeReenviar
                          ? `Resposta enviada. Você ainda pode editar ${edicoesRestantes} ${
                              edicoesRestantes === 1 ? "vez" : "vezes"
                            }.`
                          : "Resposta enviada. O limite de três edições foi atingido."}
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
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs! text-gray-500 mt-4 pt-4 border-t border-gray-200">
                      <span className="inline-flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5 shrink-0" />
                        Enviado em{" "}
                        {format(
                          new Date(resposta.dataEnvio),
                          "dd 'de' MMMM 'de' yyyy 'às' HH:mm",
                          { locale: ptBR },
                        )}
                      </span>
                      {edicoesRealizadas > 0 && (
                        <span className="inline-flex items-center gap-2">
                          <Pencil className="h-3.5 w-3.5 shrink-0" />
                          Editado {edicoesRealizadas}{" "}
                          {edicoesRealizadas === 1 ? "vez" : "vezes"}
                        </span>
                      )}
                      {ultimaEdicaoEm && (
                        <span>
                          Última edição em{" "}
                          {format(
                            new Date(ultimaEdicaoEm),
                            "dd 'de' MMMM 'de' yyyy 'às' HH:mm",
                            { locale: ptBR },
                          )}
                        </span>
                      )}
                      {foiCorrigida && pergunta.dataCorrecao && (
                        <>
                          <span className="mx-2">•</span>
                          <span>
                            Corrigido em{" "}
                            {format(
                              new Date(pergunta.dataCorrecao),
                              "dd 'de' MMMM 'de' yyyy 'às' HH:mm",
                              { locale: ptBR },
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

                  {(!foiCorrigida && podeReenviar) || proximoItem ? (
                    <div className="mt-5 flex flex-col gap-3 border-t border-gray-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
                      {proximoItem && proximoItemRouteId ? (
                        <div className="min-w-0">
                          <p className="mb-1! text-xs! font-semibold uppercase text-gray-500">
                            Próximo item
                          </p>
                          <p className="mb-0! line-clamp-1 text-sm! font-medium text-gray-900">
                            {proximoItem.title}
                          </p>
                        </div>
                      ) : (
                        <div />
                      )}

                      <div className="flex flex-wrap justify-end gap-2">
                        {!foiCorrigida && podeReenviar && (
                          <ButtonCustom
                            type="button"
                            variant="outline"
                            withAnimation={false}
                            onClick={() => {
                              setIsEditandoResposta(true);
                              setEstado("RESPONDENDO");
                            }}
                          >
                            Editar resposta
                          </ButtonCustom>
                        )}

                        {proximoItem && proximoItemRouteId && (
                          <ButtonCustom
                            type="button"
                            variant="default"
                            withAnimation={false}
                            onClick={() =>
                              router.push(
                                `/dashboard/cursos/alunos/cursos/${resolvedParams.cursoId}/${resolvedParams.turmaId}/${proximoItemRouteId}`,
                              )
                            }
                          >
                            {proximoItem?.type === "AULA"
                              ? "Ir para próxima aula"
                              : `Ir para próximo ${proximoItemLabelLower}`}
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </ButtonCustom>
                        )}
                      </div>
                    </div>
                  ) : null}
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
                        {podeReenviar
                          ? `Você ainda pode editar ${edicoesRestantes} ${
                              edicoesRestantes === 1 ? "vez" : "vezes"
                            } antes da correção.`
                          : "Esta resposta não pode mais ser editada."}
                      </p>
                      <div className="bg-white rounded-lg p-5 border border-amber-200">
                        <p className="text-sm! text-gray-900 whitespace-pre-wrap leading-relaxed">
                          {respostaAtual.respostaTexto}
                        </p>
                        {respostaAtual.dataEnvio && (
                          <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-gray-200 pt-4 text-xs! text-gray-500">
                            <span>
                              Enviado em{" "}
                              {format(
                                new Date(respostaAtual.dataEnvio),
                                "dd 'de' MMMM 'de' yyyy 'às' HH:mm",
                                { locale: ptBR },
                              )}
                            </span>
                            {edicoesRealizadas > 0 && (
                              <span>
                                Editado {edicoesRealizadas}{" "}
                                {edicoesRealizadas === 1 ? "vez" : "vezes"}
                              </span>
                            )}
                            {ultimaEdicaoEm && (
                              <span>
                                Última edição em{" "}
                                {format(
                                  new Date(ultimaEdicaoEm),
                                  "dd 'de' MMMM 'de' yyyy 'às' HH:mm",
                                  { locale: ptBR },
                                )}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      <RichTextarea
                        label="Sua Resposta:"
                        value={respostaAtual?.respostaTexto || ""}
                        onChange={(e) =>
                          handleAtualizarResposta(
                            (e.target as HTMLTextAreaElement).value,
                          )
                        }
                        placeholder="Digite sua resposta aqui..."
                        maxLength={5000}
                        showCharCount={true}
                        disabled={
                          !podeEditar || jaEnviada || atividadeEncerrada
                        }
                        minEditorHeight={280}
                        maxEditorHeight={640}
                      />

                      <div className="flex items-center justify-end pt-2 border-t border-gray-100">
                        <ButtonCustom
                          onClick={handleEnviarResposta}
                          disabled={
                            !respostaAtual?.respostaTexto?.trim() ||
                            jaEnviada ||
                            atividadeEncerrada ||
                            enviarRespostaMutation.isPending
                          }
                          isLoading={enviarRespostaMutation.isPending}
                          variant="default"
                          withAnimation={false}
                          className="min-w-[160px]"
                        >
                          <Send className="h-4 w-4 mr-2" />
                          {tentativasEnvio > 0
                            ? "Reenviar resposta"
                            : "Enviar resposta"}
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
          titulo={
            tentativasEnvio > 0 ? "Reenviar resposta?" : "Enviar resposta?"
          }
          pergunta={
            tentativasEnvio > 0
              ? `Esta será a edição ${edicoesRealizadas + 1} de ${limiteEdicoes}.`
              : "Este é o envio inicial da atividade."
          }
          mensagemEdicao="Após o envio inicial, você poderá editar a resposta até 3 vezes."
          mensagemProfessor="Após a correção realizada pelo instrutor, a resposta não poderá mais ser editada."
          textoBotao={
            tentativasEnvio > 0 ? "Reenviar resposta" : "Enviar resposta"
          }
          isLoading={enviarRespostaMutation.isPending}
        />
      </>
    );
  }

  return null;
}
