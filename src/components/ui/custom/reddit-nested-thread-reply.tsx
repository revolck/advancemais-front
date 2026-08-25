"use client";

import { useMemo, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import {
  ChevronDown,
  ChevronUp,
  ExternalLink,
  FileText,
  ImageIcon,
  Loader2,
  Paperclip,
  PencilLine,
  Pin,
  PinOff,
  Reply,
  Send,
  Smile,
  Trash2,
  X,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AvatarCustom } from "@/components/ui/custom/avatar";
import { ButtonCustom } from "@/components/ui/custom/button";
import {
  ModalBody,
  ModalContentWrapper,
  ModalCustom,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/custom/modal";
import { SimpleTextarea } from "@/components/ui/custom/text-area";
import { cn } from "@/lib/utils";

export type CommentThreadFilter = "PRINCIPAL" | "RECENTES" | "MEUS_COMENTARIOS";

export interface CommentAttachment {
  url: string;
  name: string;
  type: string;
  size: number;
}

export interface CommentType {
  id: string | number;
  parentId?: string | number | null;
  author: string;
  authorId?: string | null;
  avatarUrl?: string | null;
  role?: string | null;
  roleLabel?: string | null;
  content: string;
  attachments?: CommentAttachment[];
  timestamp?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  pinned?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  canPin?: boolean;
  replies?: CommentType[];
}

interface CommentThreadProps {
  comments: CommentType[];
  isLoading?: boolean;
  isMutating?: boolean;
  pendingCreateParentId?: string | number | null;
  totalCount?: number;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  activeFilter?: CommentThreadFilter;
  title?: string;
  submitLabel?: string;
  onFilterChange?: (filter: CommentThreadFilter) => void;
  onCreate?: (
    content: string,
    parentId?: string | number | null,
    files?: File[],
  ) => Promise<void> | void;
  onUpdate?: (
    commentId: string | number,
    content: string,
    attachments?: CommentAttachment[],
    files?: File[],
  ) => Promise<void> | void;
  onDelete?: (commentId: string | number) => Promise<void> | void;
  onTogglePin?: (
    commentId: string | number,
    pinned: boolean,
  ) => Promise<void> | void;
  onLoadMore?: () => Promise<void> | void;
}

type ActiveCommentAction = {
  type: "reply" | "edit";
  commentId: string | number;
} | null;

const FILTER_OPTIONS: Array<{ value: CommentThreadFilter; label: string }> = [
  { value: "PRINCIPAL", label: "Principal" },
  { value: "RECENTES", label: "Mais recentes" },
  { value: "MEUS_COMENTARIOS", label: "Meus comentários" },
];

const COMMENT_EMOJIS = [
  "😀", "😂", "😊", "😍", "🤔", "👏", "👍", "👎",
  "🙏", "🎉", "✅", "💡", "📚", "📝", "⭐", "❤️",
];
const MAX_COMMENT_FILES = 3;
const MAX_COMMENT_FILE_SIZE = 5 * 1024 * 1024;
const COMMENT_FILE_ACCEPT = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
  ".csv",
  ".ppt",
  ".pptx",
  ".odt",
  ".ods",
  ".odp",
  ".txt",
].join(",");

const roleLabelByValue: Record<string, string> = {
  ADMIN: "Administrativo",
  MODERADOR: "Moderador",
  PEDAGOGICO: "Pedagógico",
  INSTRUTOR: "Instrutor",
  ALUNO_CANDIDATO: "Aluno/Candidato",
};

const roleBadgeClassByValue: Record<string, string> = {
  ADMIN: "border-blue-200 bg-blue-50 text-blue-700",
  MODERADOR: "border-amber-200 bg-amber-50 text-amber-700",
  PEDAGOGICO: "border-violet-200 bg-violet-50 text-violet-700",
  INSTRUTOR: "border-teal-200 bg-teal-50 text-teal-700",
  ALUNO_CANDIDATO: "border-emerald-200 bg-emerald-50 text-emerald-700",
};

function getDateLabel(comment: CommentType) {
  if (comment.timestamp) return comment.timestamp;
  const rawDate = comment.createdAt ?? comment.updatedAt;
  if (!rawDate) return "";
  const date = new Date(rawDate);
  if (Number.isNaN(date.getTime())) return "";

  return formatDistanceToNow(date, {
    addSuffix: true,
    locale: ptBR,
  });
}

function countComments(comments: CommentType[]): number {
  return comments.reduce(
    (total, comment) => total + 1 + countComments(comment.replies ?? []),
    0,
  );
}

function IconAction({
  label,
  disabled,
  children,
  onClick,
}: {
  label: string;
  disabled?: boolean;
  children: ReactNode;
  onClick?: () => void;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={disabled}
          className="h-7 w-7 cursor-pointer rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 disabled:opacity-40"
          onClick={onClick}
          aria-label={label}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent sideOffset={6}>{label}</TooltipContent>
    </Tooltip>
  );
}

function formatFileSize(size: number) {
  if (size < 1024 * 1024) return `${Math.max(1, Math.round(size / 1024))} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function isImageAttachment(attachment: Pick<CommentAttachment, "type" | "name">) {
  return attachment.type.startsWith("image/") || /\.(jpe?g|png|webp|gif)$/i.test(attachment.name);
}

function Composer({
  placeholder,
  submitLabel,
  isSubmitting,
  autoFocus,
  variant = "default",
  contextLabel,
  initialContent = "",
  initialAttachments = [],
  onCancel,
  onSubmit,
}: {
  placeholder: string;
  submitLabel: string;
  isSubmitting?: boolean;
  autoFocus?: boolean;
  variant?: "default" | "reply" | "edit";
  contextLabel?: string;
  initialContent?: string;
  initialAttachments?: CommentAttachment[];
  onCancel?: () => void;
  onSubmit: (
    content: string,
    files: File[],
    attachments: CommentAttachment[],
  ) => Promise<void> | void;
}) {
  const [content, setContent] = useState(initialContent);
  const [files, setFiles] = useState<File[]>([]);
  const [attachments, setAttachments] = useState(initialAttachments);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isEmojiOpen, setIsEmojiOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canSubmit =
    (content.trim().length > 0 || files.length > 0 || attachments.length > 0) &&
    !isSubmitting;

  const handleSubmit = async () => {
    const value = content.trim();
    if (!value && files.length === 0 && attachments.length === 0) return;
    await onSubmit(value, files, attachments);
    setContent("");
    setFiles([]);
    setAttachments([]);
  };

  const handleFiles = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;
    const availableSlots = MAX_COMMENT_FILES - files.length - attachments.length;
    const selected = Array.from(selectedFiles).slice(0, Math.max(availableSlots, 0));
    const oversized = selected.find((file) => file.size > MAX_COMMENT_FILE_SIZE);

    if (availableSlots <= 0) {
      setFileError(`Você pode adicionar até ${MAX_COMMENT_FILES} arquivos.`);
      return;
    }
    if (oversized) {
      setFileError(`O arquivo ${oversized.name} ultrapassa o limite permitido.`);
      return;
    }

    setFileError(
      selected.length < selectedFiles.length
        ? `Somente os ${MAX_COMMENT_FILES} primeiros arquivos foram adicionados.`
        : null,
    );
    setFiles((current) => [...current, ...selected]);
  };

  const insertEmoji = (emoji: string) => {
    const textarea = textareaRef.current;
    const start = textarea?.selectionStart ?? content.length;
    const end = textarea?.selectionEnd ?? content.length;
    const nextContent = `${content.slice(0, start)}${emoji}${content.slice(end)}`.slice(0, 2000);
    setContent(nextContent);
    setIsEmojiOpen(false);
    requestAnimationFrame(() => {
      textarea?.focus();
      textarea?.setSelectionRange(start + emoji.length, start + emoji.length);
    });
  };

  return (
    <div
      className={cn(
        "border bg-slate-50/60",
        variant === "reply"
          ? "rounded-lg border-sky-100 p-2.5"
          : "rounded-xl border-slate-200 p-3",
      )}
    >
      {contextLabel ? (
        <p className="mb-2! text-xs! font-medium text-slate-500">
          {contextLabel}
        </p>
      ) : null}
      <SimpleTextarea
        ref={textareaRef}
        value={content}
        onChange={(event) => setContent(event.target.value)}
        disabled={isSubmitting}
        aria-busy={isSubmitting}
        placeholder={placeholder}
        maxLength={2000}
        showCharCount
        rows={variant === "reply" || variant === "edit" ? 2 : 3}
        autoFocus={autoFocus}
        size="md"
        className={cn(
          "border-0 text-sm! leading-relaxed text-slate-800 placeholder:text-slate-400",
          variant === "reply" || variant === "edit" ? "min-h-[64px]" : "min-h-[96px]",
        )}
      />

      {attachments.length > 0 || files.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-2">
          {attachments.map((attachment) => (
            <div
              key={attachment.url}
              className="flex min-w-0 max-w-full items-center gap-2 rounded-md border border-slate-200 bg-white px-2.5 py-2"
            >
              {isImageAttachment(attachment) ? (
                <ImageIcon className="h-4 w-4 shrink-0 text-sky-600" />
              ) : (
                <FileText className="h-4 w-4 shrink-0 text-slate-500" />
              )}
              <span className="max-w-52 truncate text-xs! font-medium text-slate-700">
                {attachment.name}
              </span>
              <button
                type="button"
                disabled={isSubmitting}
                className="cursor-pointer rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed"
                onClick={() => setAttachments((items) => items.filter((item) => item.url !== attachment.url))}
                aria-label={`Remover ${attachment.name}`}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          {files.map((file, index) => (
            <div
              key={`${file.name}-${file.lastModified}-${index}`}
              className="flex min-w-0 max-w-full items-center gap-2 rounded-md border border-sky-100 bg-sky-50/70 px-2.5 py-2"
            >
              {file.type.startsWith("image/") ? (
                <ImageIcon className="h-4 w-4 shrink-0 text-sky-600" />
              ) : (
                <FileText className="h-4 w-4 shrink-0 text-slate-500" />
              )}
              <span className="max-w-52 truncate text-xs! font-medium text-slate-700">
                {file.name}
              </span>
              <span className="shrink-0 text-[11px]! text-slate-400">{formatFileSize(file.size)}</span>
              <button
                type="button"
                disabled={isSubmitting}
                className="cursor-pointer rounded p-0.5 text-slate-400 hover:bg-sky-100 hover:text-slate-700 disabled:cursor-not-allowed"
                onClick={() => setFiles((items) => items.filter((_, itemIndex) => itemIndex !== index))}
                aria-label={`Remover ${file.name}`}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      ) : null}

      {fileError ? <p className="mt-2 mb-0! text-xs! text-red-600">{fileError}</p> : null}

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={COMMENT_FILE_ACCEPT}
        className="hidden"
        disabled={isSubmitting}
        onChange={(event) => {
          handleFiles(event.target.files);
          event.target.value = "";
        }}
      />

      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={isSubmitting || files.length + attachments.length >= MAX_COMMENT_FILES}
                className="h-8 w-8 cursor-pointer rounded-md text-slate-500 hover:bg-slate-100 hover:text-sky-700"
                onClick={() => fileInputRef.current?.click()}
                aria-label="Adicionar imagem ou documento"
              >
                <Paperclip className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Adicionar imagem ou documento</TooltipContent>
          </Tooltip>

          <Popover open={isEmojiOpen} onOpenChange={setIsEmojiOpen}>
            <Tooltip>
              <TooltipTrigger asChild>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={isSubmitting}
                    className={cn(
                      "h-8 w-8 cursor-pointer rounded-md text-slate-500 transition-colors hover:bg-amber-50 hover:text-amber-700",
                      isEmojiOpen && "bg-amber-50 text-amber-700",
                    )}
                    aria-label="Adicionar emoji"
                  >
                    <Smile className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
              </TooltipTrigger>
              <TooltipContent>Adicionar emoji</TooltipContent>
            </Tooltip>
            <PopoverContent
              align="start"
              side="top"
              sideOffset={8}
              className="w-64 overflow-hidden rounded-lg border-slate-200 bg-white p-0 shadow-[0_12px_32px_rgba(15,23,42,0.16)] outline-none"
            >
              <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50/80 px-3 py-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-amber-50 text-amber-700">
                  <Smile className="h-4 w-4" aria-hidden />
                </span>
                <p className="mb-0! text-xs! font-semibold text-slate-700">
                  Emojis
                </p>
              </div>
              <div className="grid grid-cols-6 gap-1.5 p-2.5" aria-label="Emojis">
                {COMMENT_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    className="flex aspect-square w-full cursor-pointer items-center justify-center rounded-md border border-transparent bg-white text-lg transition-[background-color,border-color,transform] hover:border-amber-100 hover:bg-amber-50 active:scale-95 focus-visible:border-amber-300 focus-visible:bg-amber-50 focus-visible:outline-none"
                    onClick={() => insertEmoji(emoji)}
                    aria-label={`Inserir ${emoji}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex shrink-0 items-center justify-end gap-2">
          {onCancel ? (
            <ButtonCustom
              type="button"
              variant="outline"
              size="sm"
              disabled={isSubmitting}
              className="h-9 rounded-md"
              onClick={onCancel}
            >
              Cancelar
            </ButtonCustom>
          ) : null}
          <ButtonCustom
            type="button"
            variant="primary"
            size="sm"
            disabled={!canSubmit}
            className="h-9 rounded-md px-4"
            onClick={handleSubmit}
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            {submitLabel}
          </ButtonCustom>
        </div>
      </div>
    </div>
  );
}

function DeleteCommentModal({
  isOpen,
  isDeleting,
  onClose,
  onConfirm,
}: {
  isOpen: boolean;
  isDeleting?: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
}) {
  return (
    <ModalCustom
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (!open && !isDeleting) onClose();
      }}
      size="md"
      backdrop="opaque"
    >
      <ModalContentWrapper hideCloseButton={isDeleting}>
        <ModalHeader>
          <ModalTitle className="mb-0!">Excluir comentário</ModalTitle>
        </ModalHeader>

        <ModalBody>
          <div className="flex items-start gap-3 rounded-lg border border-red-100 bg-red-50/70 p-4">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-red-100 text-red-600">
              <Trash2 className="h-4 w-4" aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="mb-1! text-sm! font-semibold text-slate-900">
                Tem certeza que deseja excluir este comentário?
              </p>
              <p className="mb-0! text-sm! leading-relaxed text-slate-600">
                Esta ação é definitiva e não poderá ser desfeita.
              </p>
            </div>
          </div>
        </ModalBody>

        <ModalFooter className="gap-2">
          <ButtonCustom
            type="button"
            variant="outline"
            size="md"
            disabled={isDeleting}
            onClick={onClose}
          >
            Cancelar
          </ButtonCustom>
          <ButtonCustom
            type="button"
            variant="danger"
            size="md"
            disabled={isDeleting}
            isLoading={isDeleting}
            loadingText="Excluindo..."
            onClick={onConfirm}
          >
            Excluir comentário
          </ButtonCustom>
        </ModalFooter>
      </ModalContentWrapper>
    </ModalCustom>
  );
}

function CommentAttachmentsView({ attachments }: { attachments: CommentAttachment[] }) {
  if (attachments.length === 0) return null;

  return (
    <div className="mb-3 grid max-w-2xl gap-2 sm:grid-cols-2">
      {attachments.map((attachment) =>
        isImageAttachment(attachment) ? (
          <a
            key={attachment.url}
            href={attachment.url}
            target="_blank"
            rel="noreferrer"
            className="group/attachment relative block aspect-[16/9] overflow-hidden rounded-md border border-slate-200 bg-slate-50"
          >
            <Image
              src={attachment.url}
              alt={attachment.name}
              fill
              unoptimized
              sizes="(max-width: 640px) 100vw, 360px"
              className="object-cover transition-transform duration-200 group-hover/attachment:scale-[1.02]"
            />
            <span className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-slate-950/75 px-2.5 py-2 text-xs! text-white">
              <span className="truncate">{attachment.name}</span>
              <ExternalLink className="h-3.5 w-3.5 shrink-0" />
            </span>
          </a>
        ) : (
          <a
            key={attachment.url}
            href={attachment.url}
            target="_blank"
            rel="noreferrer"
            className="flex min-w-0 items-center gap-3 rounded-md border border-slate-200 bg-slate-50/70 px-3 py-2.5 text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-100"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-white text-slate-500 shadow-sm">
              <FileText className="h-4 w-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-xs! font-semibold">{attachment.name}</span>
              <span className="block text-[11px]! text-slate-500">{formatFileSize(attachment.size)}</span>
            </span>
            <ExternalLink className="h-4 w-4 shrink-0 text-slate-400" />
          </a>
        ),
      )}
    </div>
  );
}

function CommentItem({
  comment,
  depth,
  isMutating,
  pendingCreateParentId,
  activeAction,
  onActionChange,
  onCreate,
  onUpdate,
  onDelete,
  onTogglePin,
}: {
  comment: CommentType;
  depth: number;
  isMutating?: boolean;
  pendingCreateParentId?: string | number | null;
  activeAction?: ActiveCommentAction;
  onActionChange?: (action: ActiveCommentAction) => void;
  onCreate?: CommentThreadProps["onCreate"];
  onUpdate?: CommentThreadProps["onUpdate"];
  onDelete?: CommentThreadProps["onDelete"];
  onTogglePin?: CommentThreadProps["onTogglePin"];
}) {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const isReplying =
    activeAction?.type === "reply" && activeAction.commentId === comment.id;
  const isEditing =
    activeAction?.type === "edit" && activeAction.commentId === comment.id;
  const replies = comment.replies ?? [];
  const dateLabel = getDateLabel(comment);
  const normalizedRole = String(
    comment.role ?? comment.roleLabel ?? "",
  ).toUpperCase();
  const normalizedRoleLabel =
    roleLabelByValue[normalizedRole] ?? comment.roleLabel;
  const roleBadgeClass =
    roleBadgeClassByValue[normalizedRole] ??
    "border-slate-200 bg-slate-50 text-slate-600";

  const handleDelete = async () => {
    await onDelete?.(comment.id);
    setIsDeleteModalOpen(false);
  };

  return (
    <div className={cn("relative", depth > 0 && "pl-5")}>
      {depth > 0 ? (
        <div
          className="absolute left-1 top-0 h-full w-px bg-slate-200"
          aria-hidden
        />
      ) : null}

      <article
        className={cn(
          "group relative overflow-hidden rounded-lg border bg-white transition-colors",
          comment.pinned
            ? "border-sky-200 shadow-[0_1px_2px_rgba(2,132,199,0.08)]"
            : "border-slate-200 hover:border-slate-300",
        )}
      >
        {comment.pinned ? (
          <div className="flex h-9 items-center border-b border-sky-100 bg-sky-50/70 px-3">
            <div className="flex items-center gap-2 text-sky-700">
              <span className="flex h-5 w-5 items-center justify-center rounded-md bg-sky-100">
                <Pin className="h-3 w-3 fill-sky-600" aria-hidden />
              </span>
              <p className="mb-0! text-xs! font-semibold text-sky-800">
                Comentário fixado
              </p>
            </div>
          </div>
        ) : null}
        <div className="grid grid-cols-[32px_minmax(0,1fr)] items-start gap-x-2.5 p-3">
          <AvatarCustom
            name={comment.author || "Usuario"}
            src={comment.avatarUrl || undefined}
            size="sm"
            withBorder
          />
          <div className="min-w-0 flex-1">
            <div className="flex min-h-7 min-w-0 flex-col items-stretch gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
              <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
                <p className="mb-0! min-w-0 truncate text-sm! font-semibold leading-5 text-slate-900">
                  {comment.author}
                </p>
                {normalizedRoleLabel ? (
                  <Badge
                    variant="outline"
                    className={cn(
                      "rounded-md px-2 py-0.5 text-[11px]! font-medium",
                      roleBadgeClass,
                    )}
                  >
                    {normalizedRoleLabel}
                  </Badge>
                ) : null}
                {dateLabel ? (
                  <span className="whitespace-nowrap text-xs! text-slate-500">
                    {dateLabel}
                  </span>
                ) : null}
              </div>

              <div className="flex shrink-0 items-center gap-0.5 self-end opacity-80 transition-opacity group-hover:opacity-100 sm:self-auto">
                {comment.canPin && onTogglePin ? (
                  <IconAction
                    label={comment.pinned ? "Desfixar" : "Fixar"}
                    disabled={isMutating}
                    onClick={() => onTogglePin(comment.id, !comment.pinned)}
                  >
                    {comment.pinned ? (
                      <PinOff className="h-4 w-4" />
                    ) : (
                      <Pin className="h-4 w-4" />
                    )}
                  </IconAction>
                ) : null}
                {comment.canEdit && onUpdate ? (
                  <IconAction
                    label="Editar"
                    disabled={isMutating}
                    onClick={() => {
                      if (isEditing) {
                        onActionChange?.(null);
                        return;
                      }
                      onActionChange?.({ type: "edit", commentId: comment.id });
                    }}
                  >
                    <PencilLine className="h-4 w-4" />
                  </IconAction>
                ) : null}
                {comment.canDelete && onDelete ? (
                  <IconAction
                    label="Excluir"
                    disabled={isMutating}
                    onClick={() => setIsDeleteModalOpen(true)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </IconAction>
                ) : null}
              </div>
            </div>

            {isEditing ? (
              <div className="mt-3">
                <Composer
                  placeholder="Edite o comentário..."
                  submitLabel="Salvar"
                  isSubmitting={isMutating}
                  autoFocus
                  variant="edit"
                  contextLabel="Editando comentário"
                  initialContent={comment.content}
                  initialAttachments={comment.attachments ?? []}
                  onCancel={() => onActionChange?.(null)}
                  onSubmit={async (content, files, attachments) => {
                    await onUpdate?.(comment.id, content, attachments, files);
                    onActionChange?.(null);
                  }}
                />
              </div>
            ) : (
              <>
                {comment.content ? (
                  <p className="mt-3 mb-3! whitespace-pre-wrap break-words text-sm! leading-relaxed text-slate-700">
                    {comment.content}
                  </p>
                ) : null}
                <CommentAttachmentsView attachments={comment.attachments ?? []} />
              </>
            )}

            {!isEditing ? (
              <div className="-ml-2 mt-1 flex flex-wrap items-center gap-1">
              {onCreate ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="inline-flex h-6 cursor-pointer items-center gap-1 rounded-md px-2 py-0 text-xs! font-medium leading-none text-slate-500 hover:bg-slate-50 hover:text-sky-700"
                  disabled={isMutating}
                  onClick={() => {
                    onActionChange?.(
                      isReplying
                        ? null
                        : { type: "reply", commentId: comment.id },
                    );
                  }}
                >
                  <Reply className="h-3.5 w-3.5 shrink-0" />
                  <span className="leading-none mt-1.5">Responder</span>
                </Button>
              ) : null}
              {replies.length > 0 ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 cursor-pointer rounded-md px-2 text-xs! font-medium text-slate-600 hover:bg-slate-100"
                  onClick={() => setCollapsed((value) => !value)}
                >
                  {collapsed ? (
                    <ChevronDown className="h-3.5 w-3.5" />
                  ) : (
                    <ChevronUp className="h-3.5 w-3.5" />
                  )}
                  {collapsed ? "Expandir" : "Recolher"}
                </Button>
              ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </article>

      {isReplying ? (
        <div className="mt-3 pl-5">
          <Composer
            placeholder="Responder comentário..."
            submitLabel="Responder"
            isSubmitting={isMutating}
            autoFocus
            variant="reply"
            contextLabel={`Respondendo a ${comment.author}`}
            onCancel={() => onActionChange?.(null)}
            onSubmit={async (content, files) => {
              await onCreate?.(content, comment.id, files);
              onActionChange?.(null);
            }}
          />
        </div>
      ) : null}

      {pendingCreateParentId === comment.id ? (
        <PendingCommentSkeleton nested />
      ) : null}

      {!collapsed && replies.length > 0 ? (
        <div className="mt-3 space-y-3">
          {replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              depth={Math.min(depth + 1, 5)}
              isMutating={isMutating}
              pendingCreateParentId={pendingCreateParentId}
              activeAction={activeAction}
              onActionChange={onActionChange}
              onCreate={onCreate}
              onUpdate={onUpdate}
              onDelete={onDelete}
              onTogglePin={onTogglePin}
            />
          ))}
        </div>
      ) : null}

      <DeleteCommentModal
        isOpen={isDeleteModalOpen}
        isDeleting={isMutating}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
}

function CommentSkeleton({ count }: { count: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: Math.max(count, 1) }, (_, item) => (
        <div
          key={item}
          className="rounded-lg border border-slate-200 bg-white p-3"
        >
          <div className="grid grid-cols-[32px_minmax(0,1fr)] gap-x-2.5">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="space-y-2 pt-1">
              <Skeleton className="h-3.5 w-40" />
              <Skeleton className="h-3.5 w-3/4" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function PendingCommentSkeleton({ nested = false }: { nested?: boolean }) {
  return (
    <div className={cn("mt-3", nested && "pl-5")} aria-live="polite">
      <div className="rounded-lg border border-sky-200 bg-sky-50/40 p-3">
        <div className="grid grid-cols-[32px_minmax(0,1fr)] gap-x-2.5">
          <Skeleton className="h-8 w-8 rounded-full bg-sky-100" />
          <div className="min-w-0 space-y-2 pt-0.5">
            <div className="flex items-center gap-2">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-sky-600" />
              <p className="mb-0! text-xs! font-medium text-sky-700">
                Publicando comentário
              </p>
            </div>
            <Skeleton className="h-3.5 w-2/3 bg-sky-100" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function CommentThread({
  comments,
  isLoading = false,
  isMutating = false,
  pendingCreateParentId,
  totalCount,
  hasMore = false,
  isLoadingMore = false,
  activeFilter = "PRINCIPAL",
  title = "Comentários da resposta",
  submitLabel = "Comentar",
  onFilterChange,
  onCreate,
  onUpdate,
  onDelete,
  onTogglePin,
  onLoadMore,
}: CommentThreadProps) {
  const loadedTotal = useMemo(() => countComments(comments), [comments]);
  const total = totalCount ?? loadedTotal;
  const [activeAction, setActiveAction] = useState<ActiveCommentAction>(null);

  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <div className="flex flex-col gap-4 border-b border-slate-200 bg-white px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <div className="min-w-0">
            <h3 className="mb-0! text-base! font-semibold leading-6 text-slate-950">
              {title}
            </h3>
            <p className="mb-0! text-xs! text-slate-500">
              {isLoading
                ? "Carregando comentários..."
                : `${total} ${total === 1 ? "comentário publicado" : "comentários publicados"}`}
            </p>
          </div>
        </div>

        <div className="flex w-full flex-wrap items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1 lg:w-auto">
          {FILTER_OPTIONS.map((option) => (
            <Button
              key={option.value}
              type="button"
              variant={activeFilter === option.value ? "default" : "ghost"}
              size="sm"
              className={cn(
                "h-8 flex-1 cursor-pointer rounded-md px-3 text-xs! font-medium lg:flex-none",
                activeFilter === option.value
                  ? "bg-[var(--primary-color)] text-white hover:bg-[var(--primary-color)]/90"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
              )}
              onClick={() => {
                setActiveAction(null);
                onFilterChange?.(option.value);
              }}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="max-h-[560px] overflow-y-auto bg-slate-50/30 px-4 py-3 [scrollbar-color:#cbd5e1_transparent] [scrollbar-width:thin]">
        {isLoading ? (
          <CommentSkeleton count={3} />
        ) : comments.length > 0 ? (
          <div className="space-y-3">
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                depth={0}
                isMutating={isMutating}
                pendingCreateParentId={pendingCreateParentId}
                activeAction={activeAction}
                onActionChange={setActiveAction}
                onCreate={onCreate}
                onUpdate={onUpdate}
                onDelete={onDelete}
                onTogglePin={onTogglePin}
              />
            ))}
          </div>
        ) : (
          <p className="my-5! text-center text-sm! text-slate-500">
            Nenhum comentário publicado.
          </p>
        )}

        {pendingCreateParentId === null ? <PendingCommentSkeleton /> : null}

        {hasMore && onLoadMore ? (
          <div className="mt-3 flex justify-center">
            <ButtonCustom
              type="button"
              variant="outline"
              size="sm"
              disabled={isLoadingMore}
              isLoading={isLoadingMore}
              loadingText="Carregando..."
              onClick={onLoadMore}
            >
              Ver mais comentários
            </ButtonCustom>
          </div>
        ) : null}
      </div>

      {onCreate ? (
        <div className="border-t border-slate-200 bg-white p-3 shadow-[0_-4px_14px_rgba(15,23,42,0.04)]">
          <Composer
            placeholder="Escreva um comentário para o aluno..."
            submitLabel={submitLabel}
            isSubmitting={isMutating}
            onSubmit={(content, files) => onCreate(content, null, files)}
          />
        </div>
      ) : null}
    </section>
  );
}
