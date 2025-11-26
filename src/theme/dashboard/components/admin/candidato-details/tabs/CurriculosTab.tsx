"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { EmptyState } from "@/components/ui/custom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { FileText, Crown, Calendar, Eye, Download, Loader2 } from "lucide-react";
import type { CurriculosTabProps } from "../types";
import { formatDate, formatRelativeTime } from "../utils/formatters";
import { cn } from "@/lib/utils";
import { getCurriculo } from "@/api/candidatos";
import { getUsuarioById } from "@/api/usuarios";
import { toastCustom } from "@/components/ui/custom/toast";
import { ViewCurriculoModal } from "../modal-acoes/ViewCurriculoModal";
import type { Curriculo } from "@/api/candidatos/types";
import type { UsuarioCurriculo } from "@/api/usuarios/types";
import { generateCurriculoPdf } from "../utils/generateCurriculoPdf";

export function CurriculosTab({
  candidato,
  curriculos = [],
  isLoading = false,
}: CurriculosTabProps) {
  const isCurriculoDetalhado = (
    curriculo: Curriculo | UsuarioCurriculo
  ): curriculo is Curriculo => {
    return "objetivo" in curriculo || "resumo" in curriculo;
  };

  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>(
    {}
  );
  const [loadingDownload, setLoadingDownload] = useState<
    Record<string, boolean>
  >({});
  const [selectedCurriculo, setSelectedCurriculo] = useState<Curriculo | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Buscar dados do usuário usando getUsuarioById (mesma API usada em UsuarioDetailsView)
  // Isso retorna os currículos já incluídos na resposta
  const { data: usuarioData, isLoading: isLoadingUsuario } = useQuery({
    queryKey: ["usuario-curriculos", candidato.id],
    queryFn: async () => {
      try {
        const response = await getUsuarioById(candidato.id);
        return response.usuario;
      } catch (error) {
        console.error("Erro ao buscar dados do usuário:", error);
        return null;
      }
    },
    enabled: !!candidato.id,
    staleTime: 5 * 60 * 1000,
  });

  const curriculosData = usuarioData?.curriculos || [];

  const handleViewCurriculo = async (curriculoId: string, titulo: string) => {
    setLoadingStates((prev) => ({ ...prev, [curriculoId]: true }));
    try {
      const curriculo = await getCurriculo(curriculoId);
      setSelectedCurriculo(curriculo);
      setIsModalOpen(true);
    } catch (error) {
      console.error("Erro ao carregar currículo:", error);
      toastCustom.error({
        title: "Erro ao carregar currículo",
        description: "Não foi possível carregar os detalhes do currículo.",
      });
    } finally {
      setLoadingStates((prev) => ({ ...prev, [curriculoId]: false }));
    }
  };

  const handleDownloadPDF = async (
    curriculo: Curriculo | UsuarioCurriculo,
    e?: React.MouseEvent
  ) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    
    // Evitar múltiplas chamadas simultâneas
    if (loadingDownload[curriculo.id]) {
      return;
    }
    
    setLoadingDownload((prev) => ({ ...prev, [curriculo.id]: true }));
    try {
      // Buscar o currículo completo se necessário
      const curriculoCompleto = isCurriculoDetalhado(curriculo)
        ? curriculo
        : await getCurriculo(curriculo.id);
      
      await generateCurriculoPdf(
        curriculoCompleto,
        candidato.nomeCompleto,
        usuarioData
      );

      toastCustom.success({
        title: "Download iniciado",
        description: "O currículo está sendo baixado em PDF.",
      });
    } catch (error) {
      console.error("Erro ao baixar PDF:", error);
      toastCustom.error({
        title: "Erro ao gerar PDF",
        description: "Não foi possível gerar o currículo em PDF.",
      });
    } finally {
      setLoadingDownload((prev) => ({ ...prev, [curriculo.id]: false }));
    }
  };

  if (isLoading || isLoadingUsuario) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="animate-pulse bg-gray-100 rounded-lg h-20" />
        ))}
      </div>
    );
  }

  if (curriculosData.length === 0) {
    return (
      <div className="rounded-3xl border border-slate-200/80 bg-white p-12">
        <EmptyState
          illustration="fileNotFound"
          illustrationAlt="Nenhum currículo"
          title="Nenhum currículo encontrado"
          description="Este candidato ainda não possui currículos cadastrados."
          maxContentWidth="md"
        />
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white p-2">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-gray-200 bg-gray-50/50">
              <TableHead className="font-medium text-gray-700 py-4">
                Currículo
              </TableHead>
              <TableHead className="font-medium text-gray-700">
                Resumo
              </TableHead>
              <TableHead className="font-medium text-gray-700">
                Criado em
              </TableHead>
              <TableHead className="font-medium text-gray-700">
                Status
              </TableHead>
              <TableHead className="font-medium text-gray-700 text-right">
                Ações
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {curriculosData.map((curriculo) => (
              <TableRow
                key={curriculo.id}
                className="border-gray-100 hover:bg-gray-50/50 transition-colors"
              >
                <td className="py-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-blue-100 p-2 shrink-0">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="text-sm text-gray-900 font-medium truncate max-w-[200px]">
                          {curriculo.titulo}
                        </div>
                        {curriculo.principal && (
                          <Badge
                            variant="outline"
                            className="bg-yellow-50 text-yellow-700 border-yellow-200 flex items-center gap-1 shrink-0"
                          >
                            <Crown className="h-3 w-3 fill-current" />
                            Principal
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="py-4">
                  <div className="text-sm text-gray-600 max-w-[300px] truncate">
                    {curriculo.resumo || "—"}
                  </div>
                </td>
                <td className="py-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4 text-gray-400 shrink-0" />
                    <span className="truncate">
                      {formatRelativeTime(curriculo.criadoEm)}
                    </span>
                  </div>
                </td>
                <td className="py-4">
                  <Badge
                    variant="outline"
                    className="bg-green-50 text-green-700 border-green-200"
                  >
                    Ativo
                  </Badge>
                </td>
                <td className="py-4">
                  <div className="flex items-center justify-end gap-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full text-gray-500 hover:text-white hover:bg-[var(--primary-color)] cursor-pointer"
                          onClick={() =>
                            handleViewCurriculo(curriculo.id, curriculo.titulo)
                          }
                          disabled={loadingStates[curriculo.id]}
                        >
                          {loadingStates[curriculo.id] ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent sideOffset={8}>
                        Ver currículo
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full text-gray-500 hover:text-white hover:bg-[var(--primary-color)] cursor-pointer"
                          onClick={(e) => handleDownloadPDF(curriculo, e)}
                          disabled={loadingDownload[curriculo.id]}
                        >
                          {loadingDownload[curriculo.id] ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Download className="h-4 w-4" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent sideOffset={8}>Baixar PDF</TooltipContent>
                    </Tooltip>
                  </div>
                </td>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Modal de visualização */}
      {selectedCurriculo && usuarioData && (
        <ViewCurriculoModal
          isOpen={isModalOpen}
          onOpenChange={setIsModalOpen}
          curriculo={selectedCurriculo}
          usuarioNome={candidato.nomeCompleto}
          usuarioData={usuarioData}
        />
      )}
    </div>
  );
}
