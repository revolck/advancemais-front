"use client";

import { useState } from "react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Paperclip,
  GripVertical,
  ExternalLink,
  FileText,
  Trash2,
  Download,
  AlertCircle,
  Loader2,
} from "lucide-react";
import {
  listMateriais,
  deleteMaterial,
  reordenarMateriais,
  gerarTokenDownload,
  formatarTamanhoArquivo,
  getIconePorMimeType,
} from "@/api/aulas/core";
import type { AulaMaterial } from "@/api/aulas/types";
import { toastCustom } from "@/components/ui/custom";
import { cn } from "@/lib/utils";

interface MaterialListProps {
  aulaId: string;
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
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: material.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const icone = material.arquivoMimeType
    ? getIconePorMimeType(material.arquivoMimeType)
    : material.tipo === "LINK"
    ? "🔗"
    : "📝";

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-3 p-4 border rounded-lg bg-white hover:bg-gray-50 transition-colors",
        isDragging && "opacity-50 shadow-lg z-50"
      )}
    >
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
      >
        <GripVertical className="h-5 w-5" />
      </div>

      {/* Ícone do tipo */}
      <div className="text-2xl">{icone}</div>

      {/* Conteúdo */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h4 className="text-sm font-medium text-gray-900 truncate">
            {material.titulo}
          </h4>
          {material.obrigatorio && (
            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-xs">
              Obrigatório
            </Badge>
          )}
          <Badge variant="outline" className="text-xs">
            {material.tipo}
          </Badge>
        </div>
        {material.descricao && (
          <p className="text-xs text-gray-500 truncate">{material.descricao}</p>
        )}
        {material.arquivoNome && (
          <p className="text-xs text-gray-500">
            {material.arquivoNome}
            {material.arquivoTamanho &&
              ` • ${formatarTamanhoArquivo(material.arquivoTamanho)}`}
          </p>
        )}
        {material.linkUrl && (
          <a
            href={material.linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:underline flex items-center gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            {material.linkUrl}
            <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>

      {/* Ações */}
      <div className="flex items-center gap-2">
        {material.tipo === "ARQUIVO" && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDownload(material.id)}
            disabled={isDeleting}
          >
            <Download className="h-4 w-4" />
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDelete(material.id)}
          disabled={isDeleting}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export function MaterialList({ aulaId, onMaterialCountChange }: MaterialListProps) {
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
  useState(() => {
    onMaterialCountChange?.(materiais.length);
  });

  // Mutation para reordenar
  const reordenarMutation = useMutation({
    mutationFn: (ordens: Array<{ id: string; ordem: number }>) =>
      reordenarMateriais(aulaId, { ordens }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["aulaMateriais", aulaId] });
    },
    onError: (error: Error) => {
      toastCustom.error(error.message || "Erro ao reordenar materiais");
    },
  });

  // Mutation para deletar
  const deleteMutation = useMutation({
    mutationFn: (materialId: string) => deleteMaterial(aulaId, materialId),
    onSuccess: () => {
      toastCustom.success("Material removido!");
      queryClient.invalidateQueries({ queryKey: ["aulaMateriais", aulaId] });
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
    })
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Paperclip className="h-5 w-5" />
            Materiais Complementares
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Erro ao carregar materiais. Tente novamente.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (materiais.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Paperclip className="h-5 w-5" />
            Materiais Complementares
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-700">
              Nenhum material adicionado ainda. Use o formulário acima para
              adicionar arquivos, links ou conteúdo em texto.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Paperclip className="h-5 w-5" />
              Materiais Complementares
            </CardTitle>
            <Badge variant="outline">
              {materiais.length}/{materiaisData?.limite || 3}
            </Badge>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Arraste para reordenar os materiais
          </p>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

      {/* Dialog de confirmação de exclusão */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover material?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O material será permanentemente
              removido.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                if (deleteId) deleteMutation.mutate(deleteId);
              }}
              disabled={deleteMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Removendo...
                </>
              ) : (
                "Remover"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}



