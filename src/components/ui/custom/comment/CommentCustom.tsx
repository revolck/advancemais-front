"use client";

import { useMemo, useState } from "react";
import { PencilLine, Plus, Trash2 } from "lucide-react";

import { ButtonCustom, EmptyState, SelectCustom } from "@/components/ui/custom";
import { AvatarCustom } from "@/components/ui/custom/avatar";
import { Button } from "@/components/ui/button";
import { CommentDeleteModal } from "@/components/ui/custom/comment/CommentDeleteModal";
import { CommentFormModal } from "@/components/ui/custom/comment/CommentFormModal";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface CommentItem {
  id: string;
  content: string;
  author?: string | null;
  authorId?: string | null;
  avatarUrl?: string | null;
  updatedAt: string;
  canEdit?: boolean;
  canDelete?: boolean;
}

interface CommentCustomProps {
  comments: CommentItem[];
  title?: string;
  addButtonLabel?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  isLoading?: boolean;
  createPending?: boolean;
  updatePending?: boolean;
  deletingId?: string | null;
  onCreate: (content: string) => void;
  onUpdate: (id: string, content: string) => void;
  onDelete: (id: string) => void;
  formatDate?: (value?: string | null) => string;
}

function NoteSkeletonRows() {
  return (
    <div className="space-y-3 px-5 py-5">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="rounded-[22px] border border-slate-200/80 bg-white px-5 py-5"
        >
          <div className="flex items-start gap-4">
            <Skeleton className="h-11 w-11 rounded-full" />
            <div className="min-w-0 flex-1 space-y-3">
              <div className="space-y-2">
                <Skeleton className="h-4 w-32 rounded-full" />
                <Skeleton className="h-3 w-24 rounded-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full rounded-full" />
                <Skeleton className="h-4 w-4/5 rounded-full" />
                <Skeleton className="h-4 w-2/3 rounded-full" />
              </div>
              <div className="flex items-center justify-between gap-3 pt-1">
                <Skeleton className="h-8 w-24 rounded-full" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-9 w-9 rounded-full" />
                  <Skeleton className="h-9 w-9 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function CommentActionButton({
  label,
  onClick,
  disabled,
  isLoading,
  tone = "default",
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  tone?: "default" | "danger";
  children: React.ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onClick}
          disabled={disabled}
          className={cn(
            "h-8 w-8 cursor-pointer rounded-full p-0 text-gray-500 shadow-none",
            tone === "danger"
              ? "hover:bg-red-50 hover:text-red-600"
              : "hover:bg-slate-100 hover:text-slate-700",
            "disabled:cursor-wait disabled:opacity-60",
          )}
          aria-label={label}
        >
          {isLoading ? (
            <Trash2 className="h-3.5 w-3.5 animate-pulse" />
          ) : (
            children
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent sideOffset={8}>{label}</TooltipContent>
    </Tooltip>
  );
}

export function CommentCustom({
  comments,
  addButtonLabel = "Adicionar nota",
  emptyTitle = "Sem notas registradas",
  emptyDescription = "As anotações deste lead aparecerão aqui.",
  isLoading = false,
  createPending = false,
  updatePending = false,
  deletingId = null,
  onCreate,
  onUpdate,
  onDelete,
  formatDate,
}: CommentCustomProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<CommentItem | null>(
    null,
  );
  const [authorFilter, setAuthorFilter] = useState<string>("ALL");
  const [periodFilter, setPeriodFilter] = useState<string>("ALL");
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const isMutating = createPending || updatePending || Boolean(deletingId);

  const editingComment = useMemo(
    () => comments.find((comment) => comment.id === editingCommentId) ?? null,
    [comments, editingCommentId],
  );

  const authorOptions = useMemo(() => {
    const authors = Array.from(
      new Set(
        comments
          .map((comment) => comment.author?.trim())
          .filter((author): author is string => Boolean(author)),
      ),
    ).sort((left, right) => left.localeCompare(right, "pt-BR"));

    return [
      { value: "ALL", label: "Todos os autores" },
      ...authors.map((author) => ({ value: author, label: author })),
    ];
  }, [comments]);

  const filteredComments = useMemo(() => {
    const now = Date.now();
    const cutoffMap: Record<string, number | null> = {
      ALL: null,
      "7": 7,
      "30": 30,
      "90": 90,
    };

    return comments.filter((comment) => {
      const matchesAuthor =
        authorFilter === "ALL" ||
        (comment.author ?? "Equipe interna") === authorFilter;

      const days = cutoffMap[periodFilter];
      const matchesPeriod =
        days == null ||
        now - new Date(comment.updatedAt).getTime() <=
          days * 24 * 60 * 60 * 1000;

      return matchesAuthor && matchesPeriod;
    });
  }, [authorFilter, comments, periodFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredComments.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginatedComments = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filteredComments.slice(start, start + pageSize);
  }, [filteredComments, safePage]);
  const startItem =
    filteredComments.length === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const endItem = Math.min(safePage * pageSize, filteredComments.length);
  const visiblePages = useMemo(() => {
    const pages = new Set<number>([
      1,
      totalPages,
      safePage - 1,
      safePage,
      safePage + 1,
    ]);
    return Array.from(pages)
      .filter((value) => value >= 1 && value <= totalPages)
      .sort((left, right) => left - right);
  }, [safePage, totalPages]);

  return (
    <>
      <section>
        <div className="border-b border-gray-200/70 px-3 py-5">
          <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,280px)] xl:items-end">
            <div className="min-w-0">
              <SelectCustom
                label="Autor"
                options={authorOptions}
                value={authorFilter}
                disabled={isMutating}
                placeholder="Selecionar autor"
                onChange={(nextValue) => {
                  if (!nextValue) return;
                  if (nextValue === authorFilter) return;
                  setAuthorFilter(nextValue);
                  if (page !== 1) setPage(1);
                }}
              />
            </div>
            <div className="min-w-0">
              <SelectCustom
                label="Período"
                options={[
                  { value: "ALL", label: "Todo o período" },
                  { value: "7", label: "Últimos 7 dias" },
                  { value: "30", label: "Últimos 30 dias" },
                  { value: "90", label: "Últimos 90 dias" },
                ]}
                value={periodFilter}
                disabled={isMutating}
                placeholder="Selecionar período"
                onChange={(nextValue) => {
                  if (!nextValue) return;
                  if (nextValue === periodFilter) return;
                  setPeriodFilter(nextValue);
                  if (page !== 1) setPage(1);
                }}
              />
            </div>

            <ButtonCustom
              type="button"
              variant="primary"
              size="lg"
              withAnimation={false}
              className="w-full xl:self-end"
              onClick={() => setIsCreateOpen(true)}
              disabled={isMutating}
            >
              <Plus className="mr-2 h-4 w-4" />
              {addButtonLabel}
            </ButtonCustom>
          </div>
        </div>

        {isLoading || isMutating ? (
          <NoteSkeletonRows />
        ) : comments.length === 0 ? (
          <div className="px-5 py-6">
            <EmptyState
              illustration="fileNotFound"
              title={emptyTitle}
              description={emptyDescription}
            />
          </div>
        ) : filteredComments.length === 0 ? (
          <div className="px-5 py-6">
            <EmptyState
              illustration="fileNotFound"
              title="Nenhuma nota encontrada"
              description="Ajuste os filtros para localizar outras anotações."
            />
          </div>
        ) : (
          <>
            <div className="space-y-3 px-3 py-5">
              {paginatedComments.map((comment) => (
                <article
                  key={comment.id}
                  className="rounded-2xl border border-slate-200/80 bg-white px-4 py-4 transition-colors hover:border-slate-300"
                >
                  <div className="space-y-3">
                    <p className="!mb-0 !text-sm leading-7 text-slate-700 whitespace-pre-wrap">
                      {comment.content}
                    </p>

                    <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
                      <div className="flex min-w-0 items-center gap-2.5">
                        <AvatarCustom
                          name={comment.author || "Equipe interna"}
                          src={comment.avatarUrl ?? undefined}
                          size="xs"
                          showStatus={false}
                          className="shrink-0"
                        />

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                            <p className="!mb-0 !text-xs font-medium text-slate-700">
                              {comment.author || "Equipe interna"}
                            </p>
                            <span className="hidden h-1 w-1 rounded-full bg-slate-300 sm:block" />
                            <p className="!mb-0 !text-xs text-slate-400">
                              {formatDate
                                ? formatDate(comment.updatedAt)
                                : comment.updatedAt}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-0.5">
                        {comment.canEdit !== false && (
                          <CommentActionButton
                            label="Editar nota"
                            onClick={() => setEditingCommentId(comment.id)}
                          >
                            <PencilLine className="h-3.5 w-3.5" />
                          </CommentActionButton>
                        )}

                        {comment.canDelete !== false && (
                          <CommentActionButton
                            label="Excluir nota"
                            onClick={() => setDeleteCandidate(comment)}
                            tone="danger"
                            disabled={deletingId === comment.id}
                            isLoading={deletingId === comment.id}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </CommentActionButton>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {filteredComments.length > pageSize && (
              <div className="flex flex-col gap-4 border-t border-gray-200 bg-gray-50/30 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                <span className="!text-sm text-gray-600">
                  Mostrando {startItem} a {endItem} de {filteredComments.length}{" "}
                  nota{filteredComments.length === 1 ? "" : "s"}
                </span>

                {totalPages > 1 && (
                  <div className="flex items-center gap-2">
                    <ButtonCustom
                      type="button"
                      variant="outline"
                      withAnimation={false}
                      onClick={() =>
                        setPage((current) => Math.max(1, current - 1))
                      }
                      disabled={safePage === 1}
                      size="sm"
                      className="h-8! px-3!"
                    >
                      Anterior
                    </ButtonCustom>

                    {visiblePages[0] > 1 && (
                      <>
                        <ButtonCustom
                          type="button"
                          variant={safePage === 1 ? "primary" : "outline"}
                          withAnimation={false}
                          onClick={() => setPage(1)}
                          size="sm"
                          className="h-8! w-8! min-w-8! p-0!"
                        >
                          1
                        </ButtonCustom>
                        {visiblePages[0] > 2 && (
                          <span className="text-gray-400">...</span>
                        )}
                      </>
                    )}

                    {visiblePages.map((visiblePage) => (
                      <ButtonCustom
                        key={visiblePage}
                        type="button"
                        variant={
                          safePage === visiblePage ? "primary" : "outline"
                        }
                        withAnimation={false}
                        onClick={() => setPage(visiblePage)}
                        size="sm"
                        className="h-8! w-8! min-w-8! p-0!"
                      >
                        {visiblePage}
                      </ButtonCustom>
                    ))}

                    {visiblePages[visiblePages.length - 1] < totalPages && (
                      <>
                        {visiblePages[visiblePages.length - 1] <
                          totalPages - 1 && (
                          <span className="text-gray-400">...</span>
                        )}
                        <ButtonCustom
                          type="button"
                          variant={
                            safePage === totalPages ? "primary" : "outline"
                          }
                          withAnimation={false}
                          onClick={() => setPage(totalPages)}
                          size="sm"
                          className="h-8! w-8! min-w-8! p-0!"
                        >
                          {totalPages}
                        </ButtonCustom>
                      </>
                    )}

                    <ButtonCustom
                      type="button"
                      variant="outline"
                      withAnimation={false}
                      onClick={() =>
                        setPage((current) => Math.min(totalPages, current + 1))
                      }
                      disabled={safePage === totalPages}
                      size="sm"
                      className="h-8! px-3!"
                    >
                      Próxima
                    </ButtonCustom>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </section>

      {isCreateOpen && (
        <CommentFormModal
          isOpen={isCreateOpen}
          title="Adicionar nota"
          initialValue=""
          submitLabel="Salvar nota"
          isSubmitting={createPending}
          onClose={() => setIsCreateOpen(false)}
          onSubmit={(value) => {
            onCreate(value);
            setIsCreateOpen(false);
          }}
        />
      )}

      {editingComment && (
        <CommentFormModal
          isOpen={Boolean(editingComment)}
          title="Editar nota"
          initialValue={editingComment.content}
          submitLabel="Salvar alterações"
          isSubmitting={updatePending}
          onClose={() => setEditingCommentId(null)}
          onSubmit={(value) => {
            onUpdate(editingComment.id, value);
            setEditingCommentId(null);
          }}
        />
      )}

      {deleteCandidate && (
        <CommentDeleteModal
          isOpen={Boolean(deleteCandidate)}
          content={deleteCandidate.content}
          isDeleting={deletingId === deleteCandidate.id}
          onClose={() => setDeleteCandidate(null)}
          onConfirm={() => {
            onDelete(deleteCandidate.id);
            setDeleteCandidate(null);
          }}
        />
      )}
    </>
  );
}
