"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ModalContentWrapper,
  ModalCustom,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/custom/modal";
import {
  GripVertical,
  ExternalLink,
  FileText,
  Trash2,
  Download,
  AlertCircle,
} from "lucide-react";
import {
  listMateriais,
  deleteMaterial,
  reordenarMateriais,
  gerarTokenDownload,
  formatarTamanhoArquivo,
} from "@/api/aulas/core";
import type { AulaMaterial } from "@/api/aulas/types";
import { ButtonCustom, toastCustom } from "@/components/ui/custom";
import { cn } from "@/lib/utils";

interface MaterialListProps {
  aulaId: string;
  showHeader?: boolean;
  onMaterialCountChange?: (count: number) => void;
}

interface SortableMaterialItemProps {
  material: AulaMaterial;
  onDelete: (id: string) => void;
  onDownload: (id: string) => void;
  isDeleting: boolean;
}

function SortableMaterialItem({
  material,
  onDelete,
  onDownload,
  isDeleting,
}: SortableMaterialItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: material.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const tipoBadge = useMemo(() => {
    if (material.tipo === "LINK") return "Link";
    const ext = material.arquivoNome?.split(".").pop()?.toUpperCase();
    return ext || "Arquivo";
  }, [material.arquivoNome, material.tipo]);

  const tipoBadgeClassName = useMemo(() => {
    const key = tipoBadge.toUpperCase();
    const map: Record<string, string> = {
      LINK: "bg-blue-50 text-blue-700 border-blue-200",
      PDF: "bg-red-50 text-red-700 border-red-200",
      DOC: "bg-blue-50 text-blue-700 border-blue-200",
      DOCX: "bg-blue-50 text-blue-700 border-blue-200",
      XLS: "bg-emerald-50 text-emerald-700 border-emerald-200",
      XLSX: "bg-emerald-50 text-emerald-700 border-emerald-200",
      CSV: "bg-emerald-50 text-emerald-700 border-emerald-200",
      PPT: "bg-orange-50 text-orange-700 border-orange-200",
      PPTX: "bg-orange-50 text-orange-700 border-orange-200",
      ZIP: "bg-amber-50 text-amber-700 border-amber-200",
      RAR: "bg-amber-50 text-amber-700 border-amber-200",
      JPG: "bg-purple-50 text-purple-700 border-purple-200",
      JPEG: "bg-purple-50 text-purple-700 border-purple-200",
      PNG: "bg-indigo-50 text-indigo-700 border-indigo-200",
      GIF: "bg-pink-50 text-pink-700 border-pink-200",
      WEBP: "bg-violet-50 text-violet-700 border-violet-200",
      SVG: "bg-cyan-50 text-cyan-700 border-cyan-200",
      MP4: "bg-rose-50 text-rose-700 border-rose-200",
      MP3: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200",
    };
    return map[key] || "bg-gray-50 text-gray-700 border-gray-200";
  }, [tipoBadge]);

  const primaryMeta = useMemo(() => {
    if (material.tipo === "ARQUIVO") {
      const size =
        material.arquivoTamanho !== null &&
        material.arquivoTamanho !== undefined
          ? formatarTamanhoArquivo(material.arquivoTamanho)
          : null;
      return `${material.arquivoNome || "Arquivo"}${size ? ` • ${size}` : ""}`;
    }

    if (material.linkUrl) {
      try {
        const url = new URL(material.linkUrl);
        return url.host;
      } catch {
        return material.linkUrl;
      }
    }

    return null;
  }, [
    material.arquivoNome,
    material.arquivoTamanho,
    material.linkUrl,
    material.tipo,
  ]);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group flex items-center gap-3 p-4 border border-gray-200/60 rounded-xl bg-white hover:bg-gray-50/60 transition-colors",
        isDragging && "opacity-50 shadow-lg z-50",
      )}
    >
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
        aria-label="Arrastar para reordenar"
      >
        <GripVertical className="h-5 w-5" />
      </div>

      {/* Tipo */}
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
        {material.tipo === "LINK" ? (
          <ExternalLink className="h-4 w-4" aria-hidden="true" />
        ) : (
          <FileText className="h-4 w-4" aria-hidden="true" />
        )}
      </div>

      {/* Conteúdo */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h4 className="text-sm! font-semibold text-gray-900 truncate mb-0!">
            {material.titulo}
          </h4>
          <Badge
            variant="outline"
            className={cn(
              "text-[11px]! font-medium px-2 py-0.5 rounded-md",
              tipoBadgeClassName,
            )}
          >
            {tipoBadge}
          </Badge>
        </div>
        {primaryMeta && (
          <p className="text-xs! text-gray-500 truncate mb-0!">{primaryMeta}</p>
        )}
      </div>

      {/* Ações */}
      <div className="flex items-center gap-2">
        {material.tipo === "LINK" && material.linkUrl && (
          <Button
            variant="outline"
            size="icon"
            onClick={() =>
              window.open(material.linkUrl!, "_blank", "noopener,noreferrer")
            }
            disabled={isDeleting}
            aria-label="Abrir link"
            className="h-9 w-9 rounded-lg border border-gray-200/60 bg-white text-gray-600 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 cursor-pointer"
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        )}
        {material.tipo === "ARQUIVO" && (
          <Button
            variant="outline"
            size="icon"
            onClick={() => onDownload(material.id)}
            disabled={isDeleting}
            aria-label="Baixar arquivo"
            className="h-9 w-9 rounded-lg border border-gray-200/60 bg-white text-gray-600 hover:bg-gray-50 hover:border-gray-300 cursor-pointer"
          >
            <Download className="h-4 w-4" />
          </Button>
        )}
        <Button
          variant="outline"
          size="icon"
          onClick={() => onDelete(material.id)}
          disabled={isDeleting}
          className="h-9 w-9 rounded-lg border border-red-200/80 bg-white text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-300 cursor-pointer"
          aria-label="Remover material"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export function MaterialList({
  aulaId,
  showHeader = true,
  onMaterialCountChange,
}: MaterialListProps) {
  const queryClient = useQueryClient();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Buscar materiais
  const {
    data: materiaisData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["aulaMateriais", aulaId],
    queryFn: () => listMateriais(aulaId),
    staleTime: 1000 * 60 * 2, // 2 minutos
  });

  const materiais = materiaisData?.data || [];

  // Notificar mudanças na contagem
  useEffect(() => {
    onMaterialCountChange?.(materiais.length);
  }, [materiais.length, onMaterialCountChange]);

  // Mutation para reordenar
  const reordenarMutation = useMutation({
    mutationFn: (ordens: Array<{ id: string; ordem: number }>) =>
      reordenarMateriais(aulaId, { ordens }),
	    onSuccess: async () => {
	      await queryClient.invalidateQueries({
	        queryKey: ["aulaMateriais", aulaId],
	      });
	      await queryClient.refetchQueries({
	        queryKey: ["aulaMateriais", aulaId],
	        exact: true,
	      });
	      await queryClient.invalidateQueries({
	        queryKey: ["aulaHistorico", aulaId],
	      });
	      await queryClient.refetchQueries({
	        queryKey: ["aulaHistorico", aulaId],
	        exact: true,
	      });
	    },
    onError: (error: Error) => {
      toastCustom.error(error.message || "Erro ao reordenar materiais");
    },
  });

  // Mutation para deletar
  const deleteMutation = useMutation({
    mutationFn: (materialId: string) => deleteMaterial(aulaId, materialId),
	    onSuccess: async () => {
	      toastCustom.success("Material removido!");
	      await queryClient.invalidateQueries({
	        queryKey: ["aulaMateriais", aulaId],
	      });
	      await queryClient.refetchQueries({
	        queryKey: ["aulaMateriais", aulaId],
	        exact: true,
	      });
	      await queryClient.invalidateQueries({
	        queryKey: ["aulaHistorico", aulaId],
	      });
	      await queryClient.refetchQueries({
	        queryKey: ["aulaHistorico", aulaId],
	        exact: true,
	      });
	      setDeleteId(null);
	    },
    onError: (error: Error) => {
      toastCustom.error(error.message || "Erro ao remover material");
    },
  });

  // Mutation para gerar token de download
  const downloadMutation = useMutation({
    mutationFn: (materialId: string) => gerarTokenDownload(aulaId, materialId),
    onSuccess: (data) => {
      // Abrir download em nova aba
      window.open(`/api/v1${data.downloadUrl}`, "_blank");
    },
    onError: (error: Error) => {
      toastCustom.error(error.message || "Erro ao baixar arquivo");
    },
  });

  // Sensors para drag-and-drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // Handler de drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = materiais.findIndex((m) => m.id === active.id);
    const newIndex = materiais.findIndex((m) => m.id === over.id);

    const newMateriais = arrayMove(materiais, oldIndex, newIndex);
    const ordens = newMateriais.map((m, index) => ({
      id: m.id,
      ordem: index,
    }));

    reordenarMutation.mutate(ordens);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {showHeader && (
          <div className="flex items-center justify-between">
            <h3 className="text-sm! font-semibold text-gray-900 mb-0!">
              Materiais
            </h3>
            <Badge variant="outline">—</Badge>
          </div>
        )}
        <div className="space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Erro ao carregar materiais. Tente novamente.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {showHeader && (
          <div className="flex items-center justify-between">
            <h3 className="text-sm! font-semibold text-gray-900 mb-0!">
              Materiais
            </h3>
            <Badge variant="outline">
              {materiais.length}/{materiaisData?.limite || 3}
            </Badge>
          </div>
        )}
        {materiais.length === 0 ? (
          <div className="rounded-xl border border-gray-200/60 bg-gray-50/40 p-5">
            <p className="text-sm! font-medium text-gray-800 mb-0!">
              Nenhum material adicionado.
            </p>
            <p className="text-xs! text-gray-500 mb-0!">
              Adicione um arquivo acima para disponibilizar para os alunos.
            </p>
          </div>
        ) : (
          <>
            {materiais.length > 1 && (
              <p className="text-xs! text-gray-500 mb-0!">
                Arraste para reordenar
              </p>
            )}
            <div>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={materiais.map((m) => m.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-3">
                    {materiais.map((material) => (
                      <SortableMaterialItem
                        key={material.id}
                        material={material}
                        onDelete={setDeleteId}
                        onDownload={(id) => downloadMutation.mutate(id)}
                        isDeleting={deleteMutation.isPending}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          </>
        )}
      </div>

      {/* Modal de confirmação de exclusão (UI Custom) */}
      <ModalCustom
        isOpen={Boolean(deleteId)}
        onOpenChange={(open) => !open && setDeleteId(null)}
        size="sm"
        backdrop="blur"
      >
        <ModalContentWrapper>
          <ModalHeader className="space-y-1">
            <ModalTitle>Remover material?</ModalTitle>
            <ModalDescription>
              Esta ação não pode ser desfeita. O material será removido da aula.
            </ModalDescription>
          </ModalHeader>

          <ModalFooter className="px-1 py-2">
            <div className="flex w-full justify-end gap-3">
              <ButtonCustom
                variant="outline"
                size="md"
                onClick={() => setDeleteId(null)}
                disabled={deleteMutation.isPending}
              >
                Cancelar
              </ButtonCustom>
              <ButtonCustom
                variant="danger"
                size="md"
                isLoading={deleteMutation.isPending}
                loadingText="Removendo..."
                onClick={() => {
                  if (deleteId) deleteMutation.mutate(deleteId);
                }}
              >
                Remover
              </ButtonCustom>
            </div>
          </ModalFooter>
        </ModalContentWrapper>
      </ModalCustom>
    </>
  );
}
