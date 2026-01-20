"use client";

import { useMemo, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { format, parse, isBefore, isAfter } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ButtonCustom } from "@/components/ui/custom";
import { Card, CardContent } from "@/components/ui/card";
import type { BuilderData } from "@/components/ui/custom/builder-manager/types";
import { useRouter } from "next/navigation";
import {
  PlayCircle,
  CheckCircle2,
  Clock,
  FileText,
  ClipboardList,
  BookOpen,
  TrendingUp,
  Calendar,
  Award,
  ChevronDown,
  ChevronRight,
  Video,
  AlertCircle,
  CheckCircle,
  XCircle,
  MapPin,
  Building2,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  getMockTurmaProgresso,
  getMockAlunoCursos,
  getMockAtividadeById,
  getMockProvaById,
  getMockAulaById,
  type MockItemProgresso,
} from "@/mockData/aluno-candidato";

interface AlunoTurmaEstruturaViewProps {
  cursoId: string;
  turmaId: string;
  estrutura: BuilderData;
}

function getItemIcon(type: string) {
  switch (type) {
    case "AULA":
      return {
        icon: PlayCircle,
        color: "text-blue-600",
        bg: "bg-blue-50",
        border: "border-blue-100",
      };
    case "PROVA":
      return {
        icon: FileText,
        color: "text-rose-600",
        bg: "bg-rose-50",
        border: "border-rose-100",
      };
    case "ATIVIDADE":
      return {
        icon: ClipboardList,
        color: "text-amber-600",
        bg: "bg-amber-50",
        border: "border-amber-100",
      };
    default:
      return {
        icon: BookOpen,
        color: "text-gray-600",
        bg: "bg-gray-50",
        border: "border-gray-100",
      };
  }
}

function getItemTypeLabel(type: string) {
  switch (type) {
    case "AULA":
      return "Aula";
    case "PROVA":
      return "Prova";
    case "ATIVIDADE":
      return "Atividade";
    default:
      return "Item";
  }
}

function getItemTypeBadgeClasses(type: string): string {
  switch (type) {
    case "AULA":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "PROVA":
      return "bg-rose-100 text-rose-700 border-rose-200";
    case "ATIVIDADE":
      return "bg-amber-100 text-amber-700 border-amber-200";
    default:
      return "bg-gray-100 text-gray-600 border-gray-200";
  }
}

interface ItemRowProps {
  item: {
    id: string;
    title: string;
    type: string;
    startDate?: string | null;
    endDate?: string | null;
    aulaId?: string | null;
  };
  progresso?: MockItemProgresso;
  cursoId: string;
  turmaId: string;
  turmaTipo?: "ONLINE" | "AO_VIVO" | "PRESENCIAL" | "SEMIPRESENCIAL";
  periodoCursoEncerrado?: boolean;
}

function ItemRow({
  item,
  progresso,
  cursoId,
  turmaId,
  turmaTipo,
  periodoCursoEncerrado = false,
}: ItemRowProps) {
  const router = useRouter();
  const { icon: ItemIcon, color, bg, border } = getItemIcon(item.type);

  // Para turmas PRESENCIAIS, não permitir acesso direto - apenas mostrar período e nota
  const isPresencial = turmaTipo === "PRESENCIAL";

  // Verificar se a atividade já foi respondida (para atividades de PERGUNTA_RESPOSTA)
  const atividadeJaRespondida = useMemo(() => {
    if (item.type === "ATIVIDADE" && (item as any).platformActivityId) {
      const atividadeId = (item as any).platformActivityId;
      const atividade = getMockAtividadeById(atividadeId);
      if (atividade?.tipo === "PERGUNTA_RESPOSTA" && atividade.perguntas) {
        // Verificar se todas as perguntas já foram enviadas e não podem editar
        return atividade.perguntas.every(
          (p) => p.respostaEnviada && !p.podeEditar
        );
      }
    }
    return false;
  }, [item]);

  // Buscar informações de período para provas, atividades e aulas
  const itemPeriodo = useMemo(() => {
    // Para PROVA
    if (item.type === "PROVA") {
      const mockProva = getMockProvaById(item.id);
      if (
        mockProva?.dataInicio &&
        mockProva?.dataFim &&
        mockProva?.horaInicio &&
        mockProva?.horaFim
      ) {
        return {
          dataInicio: mockProva.dataInicio,
          dataFim: mockProva.dataFim,
          horaInicio: mockProva.horaInicio,
          horaFim: mockProva.horaFim,
        };
      }
      // Se não tiver no mock, buscar da estrutura (pode ter horaInicio/horaFim na estrutura para PRESENCIAL)
      if (item.startDate && item.endDate) {
        const itemAny = item as any;
        return {
          dataInicio: item.startDate,
          dataFim: item.endDate,
          horaInicio: itemAny.horaInicio || "00:00", // Buscar da estrutura se tiver
          horaFim: itemAny.horaFim || "23:59", // Buscar da estrutura se tiver
        };
      }
    }
    // Para ATIVIDADE
    if (item.type === "ATIVIDADE") {
      const atividadeId = (item as any).platformActivityId || item.id;
      const mockAtividade = getMockAtividadeById(atividadeId);
      if (
        mockAtividade?.dataInicio &&
        mockAtividade?.dataFim &&
        mockAtividade?.horaInicio &&
        mockAtividade?.horaFim
      ) {
        return {
          dataInicio: mockAtividade.dataInicio,
          dataFim: mockAtividade.dataFim,
          horaInicio: mockAtividade.horaInicio,
          horaFim: mockAtividade.horaFim,
        };
      }
      // Se não tiver no mock, buscar da estrutura (pode ter horaInicio/horaFim na estrutura para PRESENCIAL)
      if (item.startDate && item.endDate) {
        return {
          dataInicio: item.startDate,
          dataFim: item.endDate,
          horaInicio: (item as any).horaInicio || "00:00", // Buscar da estrutura se tiver
          horaFim: (item as any).horaFim || "23:59", // Buscar da estrutura se tiver
        };
      }
    }
    // Para AULA (buscar do mock primeiro, depois da estrutura)
    if (item.type === "AULA" && item.aulaId) {
      const mockAula = getMockAulaById(item.aulaId);
      if (
        mockAula?.dataInicio &&
        mockAula?.dataFim &&
        mockAula?.horaInicio &&
        mockAula?.horaFim
      ) {
        return {
          dataInicio: mockAula.dataInicio,
          dataFim: mockAula.dataFim,
          horaInicio: mockAula.horaInicio,
          horaFim: mockAula.horaFim,
        };
      }
      // Se não tiver no mock, buscar da estrutura (pode ter horaInicio/horaFim na estrutura para PRESENCIAL)
      if (item.startDate && item.endDate) {
        return {
          dataInicio: item.startDate,
          dataFim: item.endDate,
          horaInicio: (item as any).horaInicio || "00:00", // Buscar da estrutura se tiver
          horaFim: (item as any).horaFim || "23:59", // Buscar da estrutura se tiver
        };
      }
    }
    return null;
  }, [item]);

  // Verificar se o item está dentro do período permitido (para provas, atividades e aulas)
  const { itemDentroDoPeriodo, estaAntesDoPeriodo, estaDepoisDoPeriodo } =
    useMemo(() => {
      if (!itemPeriodo) {
        return {
          itemDentroDoPeriodo: true, // Se não tiver período, permite
          estaAntesDoPeriodo: false,
          estaDepoisDoPeriodo: false,
        };
      }

      const agora = new Date();
      try {
        const dataHoraInicio = parse(
          `${itemPeriodo.dataInicio} ${itemPeriodo.horaInicio}`,
          "yyyy-MM-dd HH:mm",
          new Date()
        );
        const dataHoraFim = parse(
          `${itemPeriodo.dataFim} ${itemPeriodo.horaFim}`,
          "yyyy-MM-dd HH:mm",
          new Date()
        );

        // Verificar se está antes do início (comparação estrita: agora < dataHoraInicio)
        const antes = isBefore(agora, dataHoraInicio);

        // Verificar se está depois do fim (comparação estrita: agora > dataHoraFim)
        const depois = isAfter(agora, dataHoraFim);

        // Verificar se está dentro do período (incluindo início e fim)
        // Se não está antes e não está depois, então está dentro (incluindo exatamente no início ou fim)
        const dentro = !antes && !depois;

        return {
          itemDentroDoPeriodo: dentro,
          estaAntesDoPeriodo: antes,
          estaDepoisDoPeriodo: depois,
        };
      } catch (error) {
        // Se houver erro ao parsear datas, permite acesso
        console.error("Erro ao calcular período do item:", error);
        return {
          itemDentroDoPeriodo: true,
          estaAntesDoPeriodo: false,
          estaDepoisDoPeriodo: false,
        };
      }
    }, [itemPeriodo]);

  // Verificar se já foi concluída (se foi, pode revisar mesmo fora do período)
  const itemJaConcluido = progresso?.status === "CONCLUIDO";

  // Para atividades de PERGUNTA_RESPOSTA, considerar como concluída se já foi respondida
  const atividadeJaRespondidaConcluida = atividadeJaRespondida;

  // Para ONLINE/AO_VIVO: permitir acesso mesmo após encerrar (mas não pode submeter se não respondeu)
  // Para PRESENCIAL: bloquear se estiver fora do período e não foi concluído
  const estaForaDoPeriodo = itemPeriodo && !itemDentroDoPeriodo;
  const podeAcessarEncerrado =
    (turmaTipo === "ONLINE" || turmaTipo === "AO_VIVO") && estaDepoisDoPeriodo;

  // Se a atividade já foi respondida, considerar como CONCLUIDO
  // Se estiver dentro do período, usar o status do progresso (ou NAO_INICIADO se não tiver)
  // Se estiver antes do período, considerar como não disponível
  // Se estiver depois do período e for PRESENCIAL (ou outro tipo que não permite acesso encerrado), considerar como não disponível
  const status = atividadeJaRespondidaConcluida
    ? "CONCLUIDO"
    : itemDentroDoPeriodo
    ? progresso?.status || "NAO_INICIADO"
    : estaAntesDoPeriodo
    ? "NAO_DISPONIVEL"
    : estaDepoisDoPeriodo && !podeAcessarEncerrado && !itemJaConcluido
    ? "NAO_DISPONIVEL"
    : progresso?.status || "NAO_INICIADO";

  const handleClick = () => {
    // Para PRESENCIAL, nunca permite navegação
    if (isPresencial) {
      return;
    }

    if (item.type === "AULA" && item.aulaId) {
      // Se for AO_VIVO dentro do período com meetUrl, abrir Google Meet em nova aba
      if (turmaTipo === "AO_VIVO" && itemDentroDoPeriodo && item.aulaId) {
        const mockAula = getMockAulaById(item.aulaId);
        if (mockAula?.meetUrl) {
          window.open(mockAula.meetUrl, "_blank", "noopener,noreferrer");
          return;
        }
      }

      // Se for AO_VIVO e estiver concluído com gravação disponível, abre para revisar o vídeo gravado
      // Se for ONLINE, abre normalmente
      router.push(
        `/dashboard/cursos/alunos/cursos/${cursoId}/${turmaId}/${item.aulaId}`
      );
    } else if (item.type === "ATIVIDADE") {
      // Navegar para página de atividade
      // Usa o platformActivityId se disponível, senão usa o id do item
      const atividadeId = (item as any).platformActivityId || item.id;
      router.push(
        `/dashboard/cursos/alunos/cursos/${cursoId}/${turmaId}/${atividadeId}`
      );
    } else if (item.type === "PROVA") {
      router.push(
        `/dashboard/cursos/alunos/cursos/${cursoId}/${turmaId}/${item.id}`
      );
    }
  };

  // Para PRESENCIAL, nunca permite acesso (não navega para página)
  // Para ONLINE/AO_VIVO, permite acesso se:
  // - Estiver dentro do período OU
  // - Estiver depois do período e pode acessar encerrado OU
  // - Já foi concluído
  const estaDisponivel = isPresencial
    ? false
    : itemDentroDoPeriodo || podeAcessarEncerrado || itemJaConcluido;

  // Determinar se deve mostrar tooltip (quando está antes do período)
  const deveMostrarTooltip =
    estaAntesDoPeriodo &&
    !itemJaConcluido &&
    itemPeriodo &&
    !periodoCursoEncerrado;

  const cardContent = (
    <div
      className={cn(
        "group flex items-start gap-4 p-4 rounded-xl border transition-all duration-200",
        // Para PRESENCIAL, sempre cursor-default (não clicável)
        // Para outros tipos, cursor baseado na disponibilidade
        isPresencial
          ? "cursor-default"
          : estaDisponivel
          ? "cursor-pointer"
          : "cursor-not-allowed opacity-75",
        status === "CONCLUIDO"
          ? "border-gray-200 bg-gray-50/30 hover:bg-gray-50/50"
          : status === "NAO_DISPONIVEL"
          ? "border-gray-200 bg-gray-50/50"
          : isPresencial
          ? "border-gray-200 bg-white"
          : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/80"
      )}
      onClick={!isPresencial && estaDisponivel ? handleClick : undefined}
    >
      {/* Ícone */}
      <div
        className={cn(
          "w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105",
          status === "CONCLUIDO" ? "bg-green-100" : bg
        )}
      >
        {status === "CONCLUIDO" ? (
          <CheckCircle2 className="h-5 w-5 text-green-600" />
        ) : (
          <ItemIcon className={cn("h-5 w-5", color)} />
        )}
      </div>

      {/* Conteúdo */}
      <div className="flex-1 min-w-0">
        {/* Título com badge ao lado */}
        <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
          <h4 className="!text-sm font-semibold text-gray-900 mb-0! leading-snug">
            {item.title}
          </h4>
          <span
            className={cn(
              "text-xs font-semibold px-2.5 py-1 rounded-md border shrink-0",
              getItemTypeBadgeClasses(item.type)
            )}
          >
            {getItemTypeLabel(item.type)}
          </span>
        </div>
        {/* Exibir período para provas, atividades e aulas (quando tiver período específico definido) */}
        {itemPeriodo && (
          <div className="flex flex-col gap-1.5 mt-1.5">
            <div className="flex items-center flex-wrap gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-gray-500 shrink-0" />
              <span className="text-xs! text-gray-600 mb-0!">
                {(() => {
                  try {
                    const dataHoraInicio = parse(
                      `${itemPeriodo.dataInicio} ${itemPeriodo.horaInicio}`,
                      "yyyy-MM-dd HH:mm",
                      new Date()
                    );
                    const dataHoraFim = parse(
                      `${itemPeriodo.dataFim} ${itemPeriodo.horaFim}`,
                      "yyyy-MM-dd HH:mm",
                      new Date()
                    );
                    return `${format(dataHoraInicio, "dd/MM/yyyy 'às' HH:mm", {
                      locale: ptBR,
                    })} até ${format(dataHoraFim, "dd/MM/yyyy 'às' HH:mm", {
                      locale: ptBR,
                    })}`;
                  } catch (error) {
                    return `${itemPeriodo.dataInicio} ${itemPeriodo.horaInicio} até ${itemPeriodo.dataFim} ${itemPeriodo.horaFim}`;
                  }
                })()}
              </span>
            </div>
            {/* Para PRESENCIAL, mostrar sala e endereço */}
            {isPresencial && item.type === "AULA" && item.aulaId && (
              <div className="flex flex-col gap-1.5 ml-5">
                {(() => {
                  const mockAula = getMockAulaById(item.aulaId);
                  const sala = mockAula?.sala;
                  const endereco = mockAula?.endereco;
                  if (!sala && !endereco) return null;
                  return (
                    <>
                      {sala && (
                        <div className="flex items-center flex-wrap gap-1.5">
                          <Building2 className="h-3.5 w-3.5 text-gray-500 shrink-0" />
                          <span className="text-xs! text-gray-600 mb-0!">
                            <strong className="font-semibold!">Sala:</strong>{" "}
                            {sala}
                          </span>
                        </div>
                      )}
                      {endereco && (
                        <div className="flex items-center flex-wrap gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-gray-500 shrink-0" />
                          <span className="text-xs! text-gray-600 mb-0!">
                            <strong className="font-semibold!">
                              Endereço:
                            </strong>{" "}
                            {endereco}
                          </span>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            )}
            {/* Só mostra badge "Encerrada" se:
                - Não estiver dentro do período
                - Item não foi concluído
                - Tem período definido
                - E período do curso NÃO encerrou (ou foi concluído)
                - E NÃO está antes do período (para não mostrar badge, apenas tooltip) */}
            {!itemDentroDoPeriodo &&
              !itemJaConcluido &&
              itemPeriodo &&
              !periodoCursoEncerrado &&
              !estaAntesDoPeriodo && (
                <span className="px-2 py-0.5 !text-xs font-semibold bg-amber-100 text-amber-700 rounded shrink-0">
                  {estaDepoisDoPeriodo
                    ? podeAcessarEncerrado
                      ? "Encerrada (somente visualização)"
                      : "Encerrada"
                    : "Indisponível"}
                </span>
              )}
          </div>
        )}
        {progresso?.nota !== null && progresso?.nota !== undefined && (
          <div className="flex items-center gap-1.5 mt-1.5">
            <Award className="h-4 w-4 text-amber-600 shrink-0" />
            <span className="text-xs! font-bold text-amber-700 mb-0!">
              NOTA: {progresso.nota.toFixed(1).replace(".", ",")}
            </span>
          </div>
        )}
        {/* Só mostra progresso se:
            - Status é EM_PROGRESSO
            - Tem percentual concluído
            - E (período do curso não encerrou OU item foi concluído) */}
        {status === "EM_PROGRESSO" &&
          progresso?.percentualConcluido &&
          (!periodoCursoEncerrado || itemJaConcluido) && (
            <div className="flex items-center gap-2.5 mt-2.5">
              <div className="flex-1 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${progresso.percentualConcluido}%` }}
                />
              </div>
              <span className="!text-xs font-semibold text-gray-600 min-w-[40px] text-right">
                {progresso.percentualConcluido}%
              </span>
            </div>
          )}
      </div>

      {/* Botão de ação - alinhado com a barra de progresso */}
      {/* Para PRESENCIAL, não mostra botão (apenas período e nota) */}
      {/* Para ONLINE/AO_VIVO, permite acesso mesmo se estiver encerrada (mas não pode submeter) */}
      {/* Para AO_VIVO concluído, só mostra botão se tiver gravação disponível */}
      {/* Para AO_VIVO antes do período, mostra botão bloqueado com tooltip */}
      {(() => {
        // Determinar configuração do botão
        let buttonConfig: { mostrar: boolean; bloqueado: boolean };

        // Para PRESENCIAL, nunca mostra botão
        if (isPresencial) {
          buttonConfig = { mostrar: false, bloqueado: false };
        }
        // Para AO_VIVO antes do período com meetUrl, mostrar botão bloqueado
        else if (
          estaAntesDoPeriodo &&
          turmaTipo === "AO_VIVO" &&
          item.type === "AULA" &&
          item.aulaId
        ) {
          const mockAula = getMockAulaById(item.aulaId);
          if (mockAula?.meetUrl) {
            buttonConfig = { mostrar: true, bloqueado: true };
          } else {
            buttonConfig = { mostrar: false, bloqueado: false };
          }
        }
        // Se estiver antes do período (e não for AO_VIVO com meetUrl), nunca mostra botão
        else if (estaAntesDoPeriodo) {
          buttonConfig = { mostrar: false, bloqueado: false };
        }
        // Se estiver dentro do período, sempre mostra botão (independente do tipo de turma ou status)
        else if (itemDentroDoPeriodo) {
          buttonConfig = { mostrar: true, bloqueado: false };
        }
        // Se estiver depois do período (encerrada)
        else if (estaDepoisDoPeriodo) {
          // Se já foi concluído, sempre mostra botão para revisar
          if (itemJaConcluido) {
            buttonConfig = { mostrar: true, bloqueado: false };
          }
          // Para ONLINE/AO_VIVO, permite acesso mesmo se estiver depois do período (encerrada)
          else if (podeAcessarEncerrado) {
            buttonConfig = { mostrar: true, bloqueado: false };
          }
          // Para AO_VIVO concluído, verificar se tem gravação disponível
          else if (
            status === "CONCLUIDO" &&
            turmaTipo === "AO_VIVO" &&
            item.type === "AULA" &&
            item.aulaId
          ) {
            const mockAula = getMockAulaById(item.aulaId);
            const temGravacao =
              mockAula?.linkGravacao &&
              mockAula?.statusGravacao === "DISPONIVEL";
            buttonConfig = { mostrar: temGravacao, bloqueado: false };
          }
          // Se não foi concluído e não pode acessar encerrado, não mostra botão
          else {
            buttonConfig = { mostrar: false, bloqueado: false };
          }
        }
        // Para outros casos, verifica se está disponível
        else {
          buttonConfig = {
            mostrar: status !== "NAO_DISPONIVEL",
            bloqueado: false,
          };
        }

        // Renderizar botão baseado na configuração
        if (!buttonConfig.mostrar) return null;

        // Se estiver bloqueado (AO_VIVO antes do período), mostrar botão com tooltip
        if (buttonConfig.bloqueado) {
          return (
            <div
              className={cn(
                "shrink-0 flex items-center",
                status === "EM_PROGRESSO" && progresso?.percentualConcluido
                  ? "self-end"
                  : "self-center"
              )}
            >
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <ButtonCustom
                      variant="default"
                      size="sm"
                      disabled
                      className="w-full bg-gray-300 text-gray-600 cursor-not-allowed opacity-60 rounded-lg h-9 font-semibold shadow-none"
                      withAnimation={false}
                    >
                      <Video className="h-4 w-4 mr-2" />
                      Entrar na sala
                    </ButtonCustom>
                  </TooltipTrigger>
                  <TooltipContent
                    side="top"
                    sideOffset={8}
                    className="bg-gray-900 text-white text-xs font-medium px-3 py-2 shadow-lg border border-gray-700 max-w-xs"
                  >
                    Aula libera em breve
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          );
        }

        // Botão normal (não bloqueado)
        return (
          <div
            className={cn(
              "shrink-0 flex items-center",
              status === "EM_PROGRESSO" && progresso?.percentualConcluido
                ? "self-end"
                : "self-center"
            )}
          >
            <ButtonCustom
              variant={
                status === "CONCLUIDO" || periodoCursoEncerrado
                  ? "outline"
                  : "default"
              }
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleClick();
              }}
              className={cn(
                "transition-all duration-200",
                // Se período encerrou, usar mesmo estilo de concluído ONLINE
                periodoCursoEncerrado
                  ? "border-gray-300 text-gray-700 hover:bg-[var(--primary-color)] hover:text-white hover:border-[var(--primary-color)]"
                  : status === "CONCLUIDO" && turmaTipo === "ONLINE"
                  ? "border-gray-300 text-gray-700 hover:bg-[var(--primary-color)] hover:text-white hover:border-[var(--primary-color)]"
                  : status === "CONCLUIDO"
                  ? "border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400"
                  : "bg-[var(--primary-color)] text-white hover:bg-[var(--primary-color)]/90"
              )}
              withAnimation={false}
            >
              {(() => {
                // Se período do curso encerrou, sempre mostrar "Revisar" (mesmo estilo de concluído)
                if (periodoCursoEncerrado) {
                  return (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-1.5" />
                      Revisar
                    </>
                  );
                }

                // Se está depois do período (encerrada) e foi concluído, mostrar "Revisar"
                if (estaDepoisDoPeriodo && itemJaConcluido) {
                  // Para AO_VIVO concluído com gravação
                  if (
                    turmaTipo === "AO_VIVO" &&
                    item.type === "AULA" &&
                    item.aulaId
                  ) {
                    const mockAula = getMockAulaById(item.aulaId);
                    const temGravacao =
                      mockAula?.linkGravacao &&
                      mockAula?.statusGravacao === "DISPONIVEL";
                    if (temGravacao) {
                      return (
                        <>
                          <Video className="h-4 w-4 mr-1.5" />
                          Revisar Gravação
                        </>
                      );
                    }
                  }
                  return (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-1.5" />
                      Revisar
                    </>
                  );
                }

                // Se está depois do período (encerrada) mas não foi concluído e pode acessar (ONLINE/AO_VIVO)
                if (
                  estaDepoisDoPeriodo &&
                  podeAcessarEncerrado &&
                  !itemJaConcluido
                ) {
                  return (
                    <>
                      <PlayCircle className="h-4 w-4 mr-1.5" />
                      Visualizar
                    </>
                  );
                }

                // Se está dentro do período
                if (itemDentroDoPeriodo) {
                  // Para AO_VIVO dentro do período, mostrar "Entrar na sala"
                  if (
                    turmaTipo === "AO_VIVO" &&
                    item.type === "AULA" &&
                    item.aulaId
                  ) {
                    const mockAula = getMockAulaById(item.aulaId);
                    if (mockAula?.meetUrl) {
                      return (
                        <>
                          <Video className="h-4 w-4 mr-1.5" />
                          Entrar na sala
                        </>
                      );
                    }
                  }

                  // Para EM_PROGRESSO
                  if (status === "EM_PROGRESSO") {
                    return (
                      <>
                        <PlayCircle className="h-4 w-4 mr-1.5" />
                        Continuar
                      </>
                    );
                  }
                  // Para CONCLUIDO dentro do período
                  if (status === "CONCLUIDO") {
                    return (
                      <>
                        <CheckCircle2 className="h-4 w-4 mr-1.5" />
                        Revisar
                      </>
                    );
                  }
                  // Para NAO_INICIADO dentro do período
                  return (
                    <>
                      <PlayCircle className="h-4 w-4 mr-1.5" />
                      Iniciar
                    </>
                  );
                }

                // Para outros casos (não deveria chegar aqui, mas mantém como fallback)
                if (status === "EM_PROGRESSO") {
                  return (
                    <>
                      <PlayCircle className="h-4 w-4 mr-1.5" />
                      Continuar
                    </>
                  );
                }
                // Para NAO_INICIADO
                return (
                  <>
                    <PlayCircle className="h-4 w-4 mr-1.5" />
                    Iniciar
                  </>
                );
              })()}
            </ButtonCustom>
          </div>
        );
      })()}
    </div>
  );

  // Se deve mostrar tooltip, envolver o card com Tooltip
  if (deveMostrarTooltip) {
    return (
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>{cardContent}</TooltipTrigger>
          <TooltipContent
            side="top"
            sideOffset={8}
            className="bg-gray-900 text-white text-xs font-medium px-3 py-2 shadow-lg border border-gray-700 max-w-xs"
          >
            Aguarde a liberação da próxima aula
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return cardContent;
}

export function AlunoTurmaEstruturaView({
  cursoId,
  turmaId,
  estrutura,
}: AlunoTurmaEstruturaViewProps) {
  const router = useRouter();
  const [collapsedModules, setCollapsedModules] = useState<
    Record<string, boolean>
  >({});
  const [sidebarSticky, setSidebarSticky] = useState(false);

  // Buscar informações do curso (tipo, período, nota média)
  const cursoInfo = useMemo(() => {
    const cursos = getMockAlunoCursos();
    const curso = cursos.find(
      (c) => c.cursoId === cursoId && c.turmaId === turmaId
    );
    return curso;
  }, [cursoId, turmaId]);

  const turmaTipo = cursoInfo?.turmaTipo;

  // Verificar se o período do curso encerrou
  const periodoCursoEncerrado = useMemo(() => {
    if (!cursoInfo?.dataFim) return false;
    const agora = new Date();
    const dataFimCurso = new Date(cursoInfo.dataFim);
    dataFimCurso.setHours(23, 59, 59, 999); // Fim do dia
    return agora > dataFimCurso;
  }, [cursoInfo?.dataFim]);

  // Buscar progresso do aluno
  const progressoMap = useMemo(() => {
    return getMockTurmaProgresso(cursoId, turmaId);
  }, [cursoId, turmaId]);

  // Organizar itens
  const { proximoItem, todosItens, progressoGeral } = useMemo(() => {
    const todos: Array<{
      item: any;
      progresso?: MockItemProgresso;
      moduloTitle?: string;
    }> = [];

    estrutura.modules.forEach((modulo) => {
      modulo.items.forEach((item) => {
        todos.push({
          item,
          progresso: progressoMap[item.id],
          moduloTitle: modulo.title,
        });
      });
    });

    estrutura.standaloneItems?.forEach((item) => {
      todos.push({
        item,
        progresso: progressoMap[item.id],
      });
    });

    const agora = new Date();

    // Para PRESENCIAL, buscar a próxima aula que ainda não começou
    if (turmaTipo === "PRESENCIAL") {
      // Filtrar apenas aulas e ordenar por data/hora de início
      const aulasComData = todos
        .filter((i) => {
          if (i.item.type !== "AULA" || !i.item.aulaId) return false;
          const mockAula = getMockAulaById(i.item.aulaId);
          return mockAula?.dataInicio && mockAula?.horaInicio;
        })
        .map((i) => {
          const mockAula = getMockAulaById(i.item.aulaId!);
          try {
            const dataHoraInicio = parse(
              `${mockAula?.dataInicio} ${mockAula?.horaInicio}`,
              "yyyy-MM-dd HH:mm",
              new Date()
            );
            return { ...i, dataHoraInicio };
          } catch {
            return null;
          }
        })
        .filter((i): i is NonNullable<typeof i> => i !== null)
        .sort(
          (a, b) => a.dataHoraInicio.getTime() - b.dataHoraInicio.getTime()
        );

      // Buscar a primeira aula que ainda não começou
      const proximaAulaFutura = aulasComData.find((i) =>
        isBefore(agora, i.dataHoraInicio)
      );

      const concluidos = todos.filter(
        (i) => i.progresso?.status === "CONCLUIDO"
      ).length;
      const progresso = Math.round((concluidos / todos.length) * 100);

      return {
        proximoItem: proximaAulaFutura || undefined,
        todosItens: todos,
        progressoGeral: progresso,
      };
    }

    // Para ONLINE/AO_VIVO, usar lógica padrão
    const proximo = todos.find(
      (i) => !i.progresso || i.progresso.status === "NAO_INICIADO"
    );
    const concluidos = todos.filter(
      (i) => i.progresso?.status === "CONCLUIDO"
    ).length;
    const progresso = Math.round((concluidos / todos.length) * 100);

    return {
      proximoItem: proximo,
      todosItens: todos,
      progressoGeral: progresso,
    };
  }, [estrutura, progressoMap, turmaTipo]);

  // Calcular nota média de todas as atividades/provas com nota (depois de todosItens estar definido)
  const notaMedia = useMemo(() => {
    const notas: number[] = [];
    todosItens.forEach(({ item, progresso }) => {
      // Considerar apenas atividades e provas que têm nota
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
  }, [todosItens]);

  // Verificar se passou (nota >= 7), está em recuperação (nota < 7) ou reprovado (sem nota)
  const statusAprovacao = useMemo(() => {
    if (!periodoCursoEncerrado) return null;
    if (notaMedia === null) return "REPROVADO";
    return notaMedia >= 7 ? "APROVADO" : "RECUPERACAO";
  }, [periodoCursoEncerrado, notaMedia]);

  // Sidebar sticky
  useEffect(() => {
    const handleScroll = () => {
      setSidebarSticky(window.scrollY > 100);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="flex gap-8">
      {/* Conteúdo Principal */}
      <div className="flex-1 space-y-6">
        {/* Alerta quando período do curso encerrou */}
        {periodoCursoEncerrado && (
          <Card
            className={cn(
              "border-2 rounded-2xl overflow-hidden",
              statusAprovacao === "APROVADO"
                ? "border-emerald-200 bg-gradient-to-br from-emerald-50/50 to-white"
                : statusAprovacao === "RECUPERACAO"
                ? "border-amber-200 bg-gradient-to-br from-amber-50/50 to-white"
                : statusAprovacao === "REPROVADO"
                ? "border-red-200 bg-gradient-to-br from-red-50/50 to-white"
                : "border-gray-200 bg-gradient-to-br from-gray-50/50 to-white"
            )}
          >
            <CardContent className="p-6">
              <div className="flex items-start gap-5">
                {/* Ícone */}
                <div
                  className={cn(
                    "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0",
                    statusAprovacao === "APROVADO"
                      ? "bg-emerald-500"
                      : statusAprovacao === "RECUPERACAO"
                      ? "bg-amber-500"
                      : statusAprovacao === "REPROVADO"
                      ? "bg-red-500"
                      : "bg-gray-400"
                  )}
                >
                  {statusAprovacao === "APROVADO" ? (
                    <CheckCircle className="h-7 w-7 text-white" />
                  ) : statusAprovacao === "RECUPERACAO" ? (
                    <AlertCircle className="h-7 w-7 text-white" />
                  ) : statusAprovacao === "REPROVADO" ? (
                    <XCircle className="h-7 w-7 text-white" />
                  ) : (
                    <AlertCircle className="h-7 w-7 text-white" />
                  )}
                </div>

                {/* Conteúdo */}
                <div className="flex-1 min-w-0">
                  {/* Título */}
                  <h2
                    className={cn(
                      "text-lg! font-bold! mb-0!",
                      statusAprovacao === "APROVADO"
                        ? "text-emerald-900!"
                        : statusAprovacao === "RECUPERACAO"
                        ? "text-amber-900!"
                        : statusAprovacao === "REPROVADO"
                        ? "text-red-900!"
                        : "text-gray-900!"
                    )}
                  >
                    Período do Curso Encerrado
                  </h2>

                  {/* Descrição */}
                  <p className="text-sm! text-gray-600! mb-4! leading-relaxed!">
                    O período para realização deste curso foi concluído em{" "}
                    <strong className="font-semibold! text-gray-900!">
                      {cursoInfo?.dataFim
                        ? format(new Date(cursoInfo.dataFim), "dd/MM/yyyy", {
                            locale: ptBR,
                          })
                        : ""}
                    </strong>
                    .
                  </p>

                  {/* Status e Nota */}
                  {statusAprovacao ? (
                    <div
                      className={cn(
                        "flex! items-center! justify-between! gap-3! px-4! py-3! rounded-xl!",
                        statusAprovacao === "APROVADO"
                          ? "bg-emerald-50! border! border-emerald-200!"
                          : statusAprovacao === "RECUPERACAO"
                          ? "bg-amber-50! border! border-amber-200!"
                          : "bg-red-50! border! border-red-200!"
                      )}
                    >
                      {notaMedia !== null ? (
                        <>
                          <div className="flex! items-center! gap-2!">
                            <Award
                              className={cn(
                                "h-4! w-4! shrink-0!",
                                statusAprovacao === "APROVADO"
                                  ? "text-emerald-600!"
                                  : "text-amber-600!"
                              )}
                            />
                            <span className="text-sm! font-medium!">
                              Nota Média:
                            </span>
                            <span
                              className={cn(
                                "text-lg! font-bold!",
                                statusAprovacao === "APROVADO"
                                  ? "text-emerald-900!"
                                  : "text-amber-900!"
                              )}
                            >
                              {notaMedia.toFixed(1).replace(".", ",")}
                            </span>
                          </div>
                          <span
                            className={cn(
                              "text-sm! font-semibold!",
                              statusAprovacao === "APROVADO"
                                ? "text-emerald-700!"
                                : "text-amber-700!"
                            )}
                          >
                            {statusAprovacao === "APROVADO"
                              ? "Você foi aprovado!"
                              : "Você está em recuperação."}
                          </span>
                        </>
                      ) : (
                        <>
                          <div className="flex! items-center! gap-2!">
                            <XCircle className="h-4! w-4! shrink-0! text-red-600!" />
                            <span className="text-sm! font-medium! text-gray-700!">
                              Status:
                            </span>
                          </div>
                          <span className="text-sm! font-semibold! text-red-700!">
                            Você foi reprovado.
                          </span>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="px-4! py-3! rounded-xl! bg-gray-100! text-gray-700! border! border-gray-200!">
                      <p className="text-sm! text-gray-700! mb-0!">
                        Nenhuma nota disponível ainda para calcular o status
                        final.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Módulos */}
        {estrutura.modules.length > 0 && (
          <div className="space-y-5">
            {estrutura.modules.map((modulo) => {
              const isCollapsed = collapsedModules[modulo.id] ?? false;
              const modulosItens = modulo.items.map((item) => ({
                item,
                progresso: progressoMap[item.id],
              }));
              const concluidosNoModulo = modulosItens.filter(
                (i) => i.progresso?.status === "CONCLUIDO"
              ).length;
              const progressoModulo = Math.round(
                (concluidosNoModulo / modulo.items.length) * 100
              );

              return (
                <Card
                  key={modulo.id}
                  className="border border-gray-200 rounded-2xl overflow-hidden transition-all duration-200 hover:border-gray-300 shadow-none p-0!"
                >
                  <CardContent className="p-0">
                    {/* Header do Módulo */}
                    <div
                      className="p-5 cursor-pointer hover:bg-gray-50/50 transition-colors duration-200 border-b border-gray-100"
                      onClick={() =>
                        setCollapsedModules((prev) => ({
                          ...prev,
                          [modulo.id]: !prev[modulo.id],
                        }))
                      }
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-100 to-purple-50 flex items-center justify-center shrink-0">
                            <BookOpen className="h-6 w-6 text-purple-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="!text-base font-bold text-gray-900 mb-0! tracking-tight">
                              {modulo.title}
                            </h3>
                            <div className="flex items-center gap-4 mt-0">
                              <span className="!text-xs font-medium text-gray-600">
                                {concluidosNoModulo}/{modulo.items.length}{" "}
                                concluídos
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="shrink-0 ml-4">
                          {isCollapsed ? (
                            <ChevronRight className="h-5 w-5 text-gray-400 transition-transform duration-200" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-gray-400 transition-transform duration-200" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Itens do Módulo */}
                    {!isCollapsed && (
                      <div className="p-5 space-y-3 bg-gray-50/30">
                        {modulo.items.map((item) => (
                          <ItemRow
                            key={item.id}
                            item={item}
                            progresso={progressoMap[item.id]}
                            cursoId={cursoId}
                            turmaId={turmaId}
                            turmaTipo={turmaTipo}
                            periodoCursoEncerrado={periodoCursoEncerrado}
                          />
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Itens Avulsos */}
        {estrutura.standaloneItems && estrutura.standaloneItems.length > 0 && (
          <div className="space-y-3">
            {estrutura.standaloneItems.map((item) => (
              <ItemRow
                key={item.id}
                item={item}
                progresso={progressoMap[item.id]}
                cursoId={cursoId}
                turmaId={turmaId}
                turmaTipo={turmaTipo}
                periodoCursoEncerrado={periodoCursoEncerrado}
              />
            ))}
          </div>
        )}
      </div>

      {/* Sidebar Fixo */}
      <div
        className={cn(
          "w-80 shrink-0 transition-all duration-300",
          sidebarSticky && "sticky top-6"
        )}
      >
        <div className="space-y-4">
          {/* Progresso Geral */}
          <Card className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-none">
            <CardContent className="p-5">
              <div className="space-y-4 mt-[-20px] mb-[-20px]">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="!text-sm font-bold text-gray-900 mb-0!">
                      Progresso Geral
                    </p>
                    <p className="!text-xs text-gray-500 mb-0!">
                      {todosItens.length} itens no curso
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-[var(--primary-color)]/10 flex items-center justify-center">
                    <Award className="h-5 w-5 text-[var(--primary-color)]" />
                  </div>
                </div>

                {/* Porcentagem grande */}
                <div className="text-center">
                  <p className="!text-4xl font-extrabold text-gray-900 mb-0! leading-none">
                    {progressoGeral}
                    <span className="!text-2xl font-bold text-gray-500">%</span>
                  </p>
                </div>

                {/* Barra de progresso */}
                <div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-[var(--primary-color)] h-2 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${progressoGeral}%` }}
                    />
                  </div>
                </div>

                {/* Métricas */}
                <div className="space-y-2.5 pt-3">
                  {/* Concluídos */}
                  <div className="flex items-center justify-between p-3 bg-emerald-50/50 rounded-lg border border-emerald-100">
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span className="!text-xs font-medium text-gray-700">
                        Concluídos
                      </span>
                    </div>
                    <span className="!text-lg font-bold text-gray-900">
                      {
                        todosItens.filter(
                          (i) => i.progresso?.status === "CONCLUIDO"
                        ).length
                      }
                    </span>
                  </div>

                  {/* Em Progresso ou Não Concluída */}
                  {!periodoCursoEncerrado ? (
                    <div className="flex items-center justify-between p-3 bg-blue-50/50 rounded-lg border border-blue-100">
                      <div className="flex items-center gap-2.5">
                        <Clock className="h-4 w-4 text-blue-600 shrink-0" />
                        <span className="!text-xs font-medium text-gray-700">
                          Em Progresso
                        </span>
                      </div>
                      <span className="!text-lg font-bold text-gray-900">
                        {
                          todosItens.filter(
                            (i) => i.progresso?.status === "EM_PROGRESSO"
                          ).length
                        }
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-3 bg-amber-50/50 rounded-lg border border-amber-100">
                      <div className="flex items-center gap-2.5">
                        <XCircle className="h-4 w-4 text-amber-600 shrink-0" />
                        <span className="!text-xs font-medium text-gray-700">
                          Não Concluída
                        </span>
                      </div>
                      <span className="!text-lg font-bold text-gray-900">
                        {
                          todosItens.filter(
                            (i) => i.progresso?.status !== "CONCLUIDO"
                          ).length
                        }
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Próximo Item */}
          {proximoItem && !periodoCursoEncerrado && (
            <Card className="border border-gray-200 rounded-2xl overflow-hidden bg-gray-50 shadow-none">
              <CardContent className="p-4">
                <div className="space-y-3 mt-[-20px] mb-[-20px]">
                  {/* Header "Próximo" */}
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-blue-100 rounded-lg border border-blue-200">
                    <TrendingUp className="h-3.5 w-3.5 text-blue-600" />
                    <p className="!text-xs font-semibold text-blue-700 mb-0!">
                      Próximo
                    </p>
                  </div>

                  {/* Card da Aula */}
                  <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-none">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center shrink-0 shadow-sm">
                        <PlayCircle className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="inline-flex items-center gap-1.5 mb-1.5">
                          <span className="px-2 py-0.5 !text-[10px] font-semibold bg-blue-100 text-blue-700 rounded border border-blue-200 uppercase tracking-wide">
                            {getItemTypeLabel(proximoItem.item.type)}
                          </span>
                        </div>
                        <p className="!text-sm font-bold text-gray-900 mb-0! line-clamp-2 leading-snug">
                          {proximoItem.item.title}
                        </p>
                        {/* Para PRESENCIAL, mostrar data e horário */}
                        {turmaTipo === "PRESENCIAL" &&
                          proximoItem.item.type === "AULA" &&
                          proximoItem.item.aulaId && (
                            <div className="mt-2.5 pt-2.5 border-t border-gray-100">
                              {(() => {
                                const mockAula = getMockAulaById(
                                  proximoItem.item.aulaId
                                );
                                if (
                                  !mockAula?.dataInicio ||
                                  !mockAula?.horaInicio ||
                                  !mockAula?.horaFim
                                )
                                  return null;

                                try {
                                  const dataInicio = parse(
                                    mockAula.dataInicio,
                                    "yyyy-MM-dd",
                                    new Date()
                                  );
                                  const dataFim = parse(
                                    mockAula.dataFim || mockAula.dataInicio,
                                    "yyyy-MM-dd",
                                    new Date()
                                  );
                                  const mesmoDia =
                                    format(dataInicio, "yyyy-MM-dd") ===
                                    format(dataFim, "yyyy-MM-dd");

                                  return (
                                    <div className="flex items-center gap-2">
                                      <Calendar className="h-3.5 w-3.5 text-gray-500 shrink-0" />
                                      <span className="text-xs! text-gray-600 mb-0! leading-relaxed">
                                        {mesmoDia ? (
                                          <>
                                            {format(dataInicio, "dd/MM/yyyy", {
                                              locale: ptBR,
                                            })}{" "}
                                            às {mockAula.horaInicio} até{" "}
                                            {mockAula.horaFim}
                                          </>
                                        ) : (
                                          <>
                                            {format(dataInicio, "dd/MM/yyyy", {
                                              locale: ptBR,
                                            })}{" "}
                                            às {mockAula.horaInicio} até{" "}
                                            {format(dataFim, "dd/MM/yyyy", {
                                              locale: ptBR,
                                            })}{" "}
                                            às {mockAula.horaFim}
                                          </>
                                        )}
                                      </span>
                                    </div>
                                  );
                                } catch {
                                  return null;
                                }
                              })()}
                            </div>
                          )}
                      </div>
                    </div>
                  </div>

                  {/* Botão Iniciar/Entrar na sala - não mostrar para PRESENCIAL */}
                  {turmaTipo !== "PRESENCIAL"
                    ? (() => {
                        // Para AO_VIVO dentro do período com meetUrl, mostrar botão "Entrar na sala"
                        if (
                          turmaTipo === "AO_VIVO" &&
                          proximoItem.item.type === "AULA" &&
                          proximoItem.item.aulaId
                        ) {
                          const mockAula = getMockAulaById(
                            proximoItem.item.aulaId
                          );
                          if (
                            mockAula?.meetUrl &&
                            mockAula?.dataInicio &&
                            mockAula?.horaInicio &&
                            mockAula?.horaFim
                          ) {
                            try {
                              const agora = new Date();
                              const dataHoraInicio = parse(
                                `${mockAula.dataInicio} ${mockAula.horaInicio}`,
                                "yyyy-MM-dd HH:mm",
                                new Date()
                              );
                              const dataHoraFim = parse(
                                `${mockAula.dataFim || mockAula.dataInicio} ${
                                  mockAula.horaFim
                                }`,
                                "yyyy-MM-dd HH:mm",
                                new Date()
                              );
                              const estaDentroDoPeriodo =
                                agora >= dataHoraInicio && agora <= dataHoraFim;

                              if (estaDentroDoPeriodo) {
                                return (
                                  <ButtonCustom
                                    variant="default"
                                    size="sm"
                                    onClick={() => {
                                      if (mockAula.meetUrl) {
                                        window.open(
                                          mockAula.meetUrl,
                                          "_blank",
                                          "noopener,noreferrer"
                                        );
                                      }
                                    }}
                                    className="w-full bg-[var(--primary-color)] text-white hover:bg-[var(--primary-color)]/90 rounded-lg h-9 font-semibold shadow-none"
                                    withAnimation={false}
                                  >
                                    <Video className="h-4 w-4 mr-2" />
                                    Entrar na sala
                                  </ButtonCustom>
                                );
                              }
                            } catch (error) {
                              // Se houver erro ao parsear datas, continua com lógica padrão
                            }
                          }
                        }

                        // Para AO_VIVO antes do período, não mostrar botão
                        if (
                          turmaTipo === "AO_VIVO" &&
                          proximoItem.item.type === "AULA" &&
                          proximoItem.item.aulaId
                        ) {
                          const mockAula = getMockAulaById(
                            proximoItem.item.aulaId
                          );
                          if (
                            mockAula?.meetUrl &&
                            mockAula?.dataInicio &&
                            mockAula?.horaInicio &&
                            mockAula?.horaFim
                          ) {
                            try {
                              const agora = new Date();
                              const dataHoraInicio = parse(
                                `${mockAula.dataInicio} ${mockAula.horaInicio}`,
                                "yyyy-MM-dd HH:mm",
                                new Date()
                              );
                              const estaAntesDoPeriodo = agora < dataHoraInicio;

                              // Se estiver antes do período, não mostrar botão
                              if (estaAntesDoPeriodo) {
                                return null;
                              }
                            } catch (error) {
                              // Se houver erro ao parsear datas, continua com lógica padrão
                            }
                          }
                        }

                        // Para outros casos, usar lógica padrão
                        return (
                          <ButtonCustom
                            variant="default"
                            size="sm"
                            onClick={() => {
                              if (
                                proximoItem.item.type === "AULA" &&
                                proximoItem.item.aulaId
                              ) {
                                router.push(
                                  `/dashboard/cursos/alunos/cursos/${cursoId}/${turmaId}/${proximoItem.item.aulaId}`
                                );
                              } else if (
                                proximoItem.item.type === "ATIVIDADE"
                              ) {
                                const atividadeId =
                                  (proximoItem.item as any)
                                    .platformActivityId || proximoItem.item.id;
                                router.push(
                                  `/dashboard/cursos/alunos/cursos/${cursoId}/${turmaId}/${atividadeId}`
                                );
                              } else if (proximoItem.item.type === "PROVA") {
                                router.push(
                                  `/dashboard/cursos/alunos/cursos/${cursoId}/${turmaId}/${proximoItem.item.id}`
                                );
                              }
                            }}
                            className="w-full bg-[var(--primary-color)] text-white hover:bg-[var(--primary-color)]/90 rounded-lg h-9 font-semibold shadow-none"
                            withAnimation={false}
                          >
                            <PlayCircle className="h-4 w-4 mr-2" />
                            Iniciar
                          </ButtonCustom>
                        );
                      })()
                    : null}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
