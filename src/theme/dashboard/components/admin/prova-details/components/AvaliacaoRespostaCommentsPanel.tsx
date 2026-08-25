"use client";

import { useMemo, useState } from "react";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import {
  createAvaliacaoRespostaComentario,
  deleteAvaliacaoRespostaComentario,
  fixarAvaliacaoRespostaComentario,
  listAvaliacaoRespostaComentarios,
  updateAvaliacaoRespostaComentario,
  type AvaliacaoRespostaComentario,
} from "@/api/provas";
import {
  CommentThread,
  type CommentAttachment,
  type CommentThreadFilter,
  type CommentType,
  toastCustom,
} from "@/components/ui/custom";
import { deleteFiles, deleteFilesStrict, uploadFiles } from "@/services/upload";

interface AvaliacaoRespostaCommentsPanelProps {
  avaliacaoId?: string | null;
  respostaId?: string | null;
  enabled?: boolean;
}

const roleLabelByValue: Record<string, string> = {
  ADMIN: "Administrativo",
  MODERADOR: "Moderador",
  PEDAGOGICO: "Pedagógico",
  INSTRUTOR: "Instrutor",
  ALUNO_CANDIDATO: "Aluno/Candidato",
};

function mapComment(comment: AvaliacaoRespostaComentario): CommentType {
  return {
    id: comment.id,
    parentId: comment.parentId ?? null,
    author: comment.autor?.nome || "Usuario",
    authorId: comment.autor?.id ?? null,
    avatarUrl: comment.autor?.avatarUrl ?? null,
    role: comment.autor?.role ?? null,
    roleLabel: roleLabelByValue[String(comment.autor?.role ?? "").toUpperCase()] ?? comment.autor?.role,
    content: comment.conteudo,
    attachments: (comment.anexos ?? []).map((attachment) => ({
      url: attachment.url,
      name: attachment.nome,
      type: attachment.tipo,
      size: attachment.tamanho,
    })),
    createdAt: comment.criadoEm ?? null,
    updatedAt: comment.atualizadoEm ?? null,
    pinned: comment.fixado,
    canEdit: comment.canEdit,
    canDelete: comment.canDelete,
    canPin: comment.canPin,
    replies: (comment.replies ?? []).map(mapComment),
  };
}

function findComment(comments: CommentType[], commentId: string | number): CommentType | null {
  for (const comment of comments) {
    if (String(comment.id) === String(commentId)) return comment;
    const nestedComment = findComment(comment.replies ?? [], commentId);
    if (nestedComment) return nestedComment;
  }
  return null;
}

function collectAttachmentUrls(comment: CommentType | null): string[] {
  if (!comment) return [];
  return [
    ...(comment.attachments ?? []).map((attachment) => attachment.url),
    ...(comment.replies ?? []).flatMap((reply) => collectAttachmentUrls(reply)),
  ];
}

const toApiAttachment = (attachment: CommentAttachment) => ({
  url: attachment.url,
  nome: attachment.name,
  tipo: attachment.type,
  tamanho: attachment.size,
});

export function AvaliacaoRespostaCommentsPanel({
  avaliacaoId,
  respostaId,
  enabled = true,
}: AvaliacaoRespostaCommentsPanelProps) {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<CommentThreadFilter>("PRINCIPAL");
  const canLoad = Boolean(enabled && avaliacaoId && respostaId);
  const queryKey = ["avaliacao-resposta-comentarios", avaliacaoId, respostaId, filter];

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam }) =>
      listAvaliacaoRespostaComentarios(avaliacaoId!, respostaId!, {
        filtro: filter,
        page: pageParam,
        pageSize: 8,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.pagination?.hasMore
        ? lastPage.pagination.page + 1
        : undefined,
    enabled: canLoad,
    staleTime: 0,
  });

  const comments = useMemo(
    () => (data?.pages ?? []).flatMap((page) => page.data.map(mapComment)),
    [data],
  );
  const totalCount = data?.pages[0]?.total ?? comments.length;

  const invalidateComments = async () => {
    await queryClient.invalidateQueries({
      queryKey: ["avaliacao-resposta-comentarios", avaliacaoId, respostaId],
    });
  };

  const createMutation = useMutation({
    mutationFn: async ({
      content,
      parentId,
      files,
    }: {
      content: string;
      parentId?: string | number | null;
      files: File[];
    }) => {
      const uploaded = files.length
        ? await uploadFiles(files, `cursos/comentarios/${avaliacaoId}/${respostaId}`)
        : [];

      try {
        return await createAvaliacaoRespostaComentario(avaliacaoId!, respostaId!, {
          conteudo: content,
          anexos: uploaded.map((file) => ({
            url: file.url,
            nome: file.originalName,
            tipo: file.mimeType,
            tamanho: file.size,
          })),
          parentId: parentId ? String(parentId) : null,
        });
      } catch (error) {
        await deleteFiles(uploaded.map((file) => file.url));
        throw error;
      }
    },
    onSuccess: async () => {
      await invalidateComments();
      toastCustom.success("Comentario publicado");
    },
    onError: (error) => {
      toastCustom.error(error instanceof Error ? error.message : "Erro ao publicar comentario");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      commentId,
      content,
      attachments,
      files,
    }: {
      commentId: string | number;
      content: string;
      attachments: CommentAttachment[];
      files: File[];
    }) => {
      const originalAttachments = findComment(comments, commentId)?.attachments ?? [];
      const uploaded = files.length
        ? await uploadFiles(files, `cursos/comentarios/${avaliacaoId}/${respostaId}`)
        : [];
      const nextAttachments = [
        ...attachments,
        ...uploaded.map((file) => ({
          url: file.url,
          name: file.originalName,
          type: file.mimeType,
          size: file.size,
        })),
      ];

      try {
        const updated = await updateAvaliacaoRespostaComentario(
          avaliacaoId!,
          respostaId!,
          String(commentId),
          {
            conteudo: content,
            anexos: nextAttachments.map(toApiAttachment),
          },
        );
        const retainedUrls = new Set(nextAttachments.map((attachment) => attachment.url));
        await deleteFiles(
          originalAttachments
            .filter((attachment) => !retainedUrls.has(attachment.url))
            .map((attachment) => attachment.url),
        );
        return updated;
      } catch (error) {
        await deleteFiles(uploaded.map((file) => file.url));
        throw error;
      }
    },
    onSuccess: async () => {
      await invalidateComments();
      toastCustom.success("Comentario editado");
    },
    onError: (error) => {
      toastCustom.error(error instanceof Error ? error.message : "Erro ao editar comentario");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (commentId: string | number) => {
      const fallbackAttachmentUrls = collectAttachmentUrls(findComment(comments, commentId));
      const result = await deleteAvaliacaoRespostaComentario(
        avaliacaoId!,
        respostaId!,
        String(commentId),
      );
      const attachmentUrls = result.deletedAttachmentUrls ?? fallbackAttachmentUrls;

      try {
        await deleteFilesStrict(attachmentUrls);
        return { ...result, blobCleanupFailed: false };
      } catch {
        return { ...result, blobCleanupFailed: true };
      }
    },
    onSuccess: async ({ blobCleanupFailed }) => {
      await invalidateComments();
      if (blobCleanupFailed) {
        toastCustom.warning(
          "Comentário excluído, mas não foi possível remover um ou mais anexos",
        );
        return;
      }
      toastCustom.success("Comentário excluído");
    },
    onError: (error) => {
      toastCustom.error(error instanceof Error ? error.message : "Erro ao excluir comentario");
    },
  });

  const pinMutation = useMutation({
    mutationFn: ({ commentId, pinned }: { commentId: string | number; pinned: boolean }) =>
      fixarAvaliacaoRespostaComentario(avaliacaoId!, respostaId!, String(commentId), {
        fixado: pinned,
      }),
    onSuccess: async () => {
      await invalidateComments();
    },
    onError: (error) => {
      toastCustom.error(error instanceof Error ? error.message : "Erro ao fixar comentario");
    },
  });

  const isMutating =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending ||
    pinMutation.isPending;

  return (
    <CommentThread
      comments={comments}
      isLoading={isLoading && comments.length === 0}
      isMutating={isMutating}
      pendingCreateParentId={
        createMutation.isPending
          ? (createMutation.variables?.parentId ?? null)
          : undefined
      }
      activeFilter={filter}
      totalCount={totalCount}
      hasMore={Boolean(hasNextPage)}
      isLoadingMore={isFetchingNextPage}
      onFilterChange={(nextFilter) => {
        setFilter(nextFilter);
      }}
      onLoadMore={async () => {
        await fetchNextPage();
      }}
      onCreate={async (content, parentId, files = []) => {
        await createMutation.mutateAsync({ content, parentId, files });
      }}
      onUpdate={async (commentId, content, attachments = [], files = []) => {
        await updateMutation.mutateAsync({ commentId, content, attachments, files });
      }}
      onDelete={async (commentId) => {
        await deleteMutation.mutateAsync(commentId);
      }}
      onTogglePin={async (commentId, pinned) => {
        await pinMutation.mutateAsync({ commentId, pinned });
      }}
    />
  );
}
