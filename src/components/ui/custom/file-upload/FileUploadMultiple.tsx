"use client";

import React, { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Icon } from "../Icons";
import { toastCustom } from "../toast";
import {
  DEFAULT_FILE_VALIDATION,
  DEFAULT_ERROR_MESSAGES,
  formatFileSize,
  getFileExtension,
  formatAcceptedTypes,
  getReadableFileType,
} from "./config";
import type {
  FileUploadItem,
  FileValidationResult,
  AcceptedFileType,
} from "./types";

interface FileUploadMultipleProps {
  /** Lista de arquivos já carregados */
  files?: FileUploadItem[];
  /** Número máximo de arquivos permitidos */
  maxFiles?: number;
  /** Tamanho máximo por arquivo em bytes */
  maxSize?: number;
  /** Tipos de arquivo aceitos */
  accept?: AcceptedFileType[];
  /** Se está desabilitado */
  disabled?: boolean;
  /** Callback quando arquivos mudam */
  onFilesChange?: (files: FileUploadItem[]) => void;
  /** Classes customizadas */
  className?: string;
  /** Texto da área de drop */
  dropzoneText?: string;
  /** Se deve mostrar o resumo de arquivos */
  showSummary?: boolean;
}

/**
 * Componente de upload múltiplo com design compacto e moderno
 */
export function FileUploadMultiple({
  files: controlledFiles,
  maxFiles = 3,
  maxSize = DEFAULT_FILE_VALIDATION.maxSize,
  accept = DEFAULT_FILE_VALIDATION.accept,
  disabled = false,
  onFilesChange,
  className,
  dropzoneText = "Arraste arquivos aqui ou",
  showSummary = true,
}: FileUploadMultipleProps) {
  const [internalFiles, setInternalFiles] = useState<FileUploadItem[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCountRef = useRef(0);

  // Controlled vs uncontrolled
  const isControlled = controlledFiles !== undefined;
  const files = isControlled ? controlledFiles : internalFiles;

  // Validation
  const validateFile = useCallback(
    (file: File): FileValidationResult => {
      const errors: string[] = [];

      if (file.size > maxSize) {
        errors.push(
          DEFAULT_ERROR_MESSAGES.fileTooLarge.replace(
            "{maxSize}",
            formatFileSize(maxSize)
          )
        );
      }

      const fileExt = `.${getFileExtension(file.name)}`;
      const isTypeAllowed = accept.some((type) => {
        if (type.startsWith(".")) return type === fileExt;
        if (type.endsWith("/*")) {
          const baseType = type.slice(0, -1);
          return file.type.startsWith(baseType);
        }
        return file.type === type;
      });

      if (!isTypeAllowed) {
        errors.push(
          DEFAULT_ERROR_MESSAGES.fileTypeNotAllowed.replace(
            "{allowedTypes}",
            formatAcceptedTypes(accept)
          )
        );
      }

      return { isValid: errors.length === 0, errors };
    },
    [accept, maxSize]
  );

  // Update files
  const updateFiles = useCallback(
    (newFiles: FileUploadItem[]) => {
      if (!isControlled) {
        setInternalFiles(newFiles);
      }
      onFilesChange?.(newFiles);
    },
    [isControlled, onFilesChange]
  );

  // Process new files
  const processFiles = useCallback(
    (newFiles: File[]) => {
      if (files.length + newFiles.length > maxFiles) {
        toastCustom.error({
          title: "Limite excedido",
          description: `Máximo de ${maxFiles} arquivos permitidos.`,
        });
        return;
      }

      const validFiles: FileUploadItem[] = [];

      newFiles.forEach((file) => {
        const validation = validateFile(file);
        if (validation.isValid) {
          validFiles.push({
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: file.name,
            size: file.size,
            type: file.type,
            status: "idle",
            uploadDate: new Date(),
            file,
          });
        } else {
          toastCustom.error({
            title: `Erro: ${file.name}`,
            description: validation.errors.join(". "),
          });
        }
      });

      if (validFiles.length > 0) {
        updateFiles([...files, ...validFiles]);
      }
    },
    [files, maxFiles, validateFile, updateFiles]
  );

  // Drag handlers
  const handleDragEnter = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCountRef.current++;
      if (!disabled) setIsDragOver(true);
    },
    [disabled]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCountRef.current--;
    if (dragCountRef.current === 0) setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
      dragCountRef.current = 0;
      if (disabled) return;
      const droppedFiles = Array.from(e.dataTransfer.files);
      processFiles(droppedFiles);
    },
    [disabled, processFiles]
  );

  // File input handler
  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = e.target.files ? Array.from(e.target.files) : [];
      if (selectedFiles.length > 0) {
        processFiles(selectedFiles);
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [processFiles]
  );

  // Remove file
  const removeFile = useCallback(
    (fileId: string) => {
      updateFiles(files.filter((f) => f.id !== fileId));
    },
    [files, updateFiles]
  );

  // Clear all files
  const clearAllFiles = useCallback(() => {
    updateFiles([]);
  }, [updateFiles]);

  // File type badge color
  const getTypeBadgeColor = (fileName: string) => {
    const ext = getFileExtension(fileName).toUpperCase();
    const colorMap: Record<string, string> = {
      PDF: "bg-red-100! text-red-700! border-red-200!",
      DOC: "bg-blue-100! text-blue-700! border-blue-200!",
      DOCX: "bg-blue-100! text-blue-700! border-blue-200!",
      XLS: "bg-emerald-100! text-emerald-700! border-emerald-200!",
      XLSX: "bg-emerald-100! text-emerald-700! border-emerald-200!",
      CSV: "bg-emerald-100! text-emerald-700! border-emerald-200!",
      PPT: "bg-orange-100! text-orange-700! border-orange-200!",
      PPTX: "bg-orange-100! text-orange-700! border-orange-200!",
      ZIP: "bg-amber-100! text-amber-700! border-amber-200!",
      RAR: "bg-amber-100! text-amber-700! border-amber-200!",
      JPG: "bg-purple-100! text-purple-700! border-purple-200!",
      JPEG: "bg-purple-100! text-purple-700! border-purple-200!",
      PNG: "bg-indigo-100! text-indigo-700! border-indigo-200!",
      GIF: "bg-pink-100! text-pink-700! border-pink-200!",
      WEBP: "bg-violet-100! text-violet-700! border-violet-200!",
      SVG: "bg-cyan-100! text-cyan-700! border-cyan-200!",
      MP4: "bg-rose-100! text-rose-700! border-rose-200!",
      MP3: "bg-fuchsia-100! text-fuchsia-700! border-fuchsia-200!",
      JSON: "bg-slate-100! text-slate-700! border-slate-200!",
      TXT: "bg-gray-100! text-gray-700! border-gray-200!",
    };
    return colorMap[ext] || "bg-gray-100! text-gray-600! border-gray-200!";
  };

  const isMaxFilesReached = files.length >= maxFiles;
  const acceptAttribute = accept.join(",");

  // Formatar tipos aceitos de forma legível
  const acceptedTypesDisplay = formatAcceptedTypes(accept);

  return (
    <div className={cn("space-y-3!", className)}>
      {/* Dropzone - hidden when max files reached */}
      {!isMaxFilesReached && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className={cn(
            "relative! rounded-xl! border! transition-all! duration-200! cursor-pointer!",
            isDragOver
              ? "border-primary! bg-primary/5! scale-[1.01]!"
              : "border-gray-200! bg-gray-50/30! hover:border-gray-300! hover:bg-gray-50/80!",
            disabled && "opacity-50! cursor-not-allowed!"
          )}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !disabled && fileInputRef.current?.click()}
        >
          <div className="flex! flex-col! items-center! justify-center! py-8! px-6!">
            {/* Ícone */}
            <div
              className={cn(
                "flex! items-center! justify-center! w-12! h-12! rounded-full! mb-3! transition-colors!",
                isDragOver ? "bg-primary/10!" : "bg-white! border! border-gray-200!"
              )}
            >
              <Icon
                name={isDragOver ? "FileUp" : "Upload"}
                className={cn(
                  "w-5! h-5! transition-colors!",
                  isDragOver ? "text-primary!" : "text-gray-400!"
                )}
              />
            </div>

            {/* Texto principal */}
            <p className="text-sm! text-gray-700! text-center! mb-1! font-medium!">
              {dropzoneText}{" "}
              <span className="text-primary! font-semibold! hover:underline!">
                clique para selecionar
              </span>
            </p>

            {/* Informações detalhadas */}
            <div className="flex! flex-col! items-center! gap-0.5! mt-1!">
              <p className="text-xs! text-gray-400! mb-0!">
                Máximo de <span className="font-medium! text-gray-500!">{maxFiles} arquivos</span> • Até <span className="font-medium! text-gray-500!">{formatFileSize(maxSize)}</span> por arquivo
              </p>
              <p className="text-[11px]! text-gray-400! mb-0!">
                Formatos: <span className="text-gray-500!">{acceptedTypesDisplay}</span>
              </p>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={acceptAttribute}
            onChange={handleFileSelect}
            className="hidden!"
            disabled={disabled}
          />
        </motion.div>
      )}

      {/* Files List */}
      {files.length > 0 && (
        <div className="space-y-0!">
          {/* File items container */}
          <div className="rounded-lg! border! border-gray-200! overflow-hidden! bg-white!">
            {/* Header dentro do container */}
            <div className="flex! items-center! justify-between! px-3! py-2! bg-gray-50/50! border-b! border-gray-100!">
              <span className="text-xs! font-medium! text-gray-500! mb-0!">
                {files.length}/{maxFiles} arquivo{files.length !== 1 ? "s" : ""}
              </span>
              {files.length > 1 && (
                <button
                  type="button"
                  onClick={clearAllFiles}
                  disabled={disabled}
                  className="text-xs! text-red-500! hover:text-red-600! cursor-pointer! disabled:opacity-50! disabled:cursor-not-allowed!"
                >
                  Remover todos
                </button>
              )}
            </div>

            {/* File items */}
            <AnimatePresence mode="popLayout">
              {files.map((file, index) => {
                const typeLabel = getReadableFileType(
                  file.type,
                  file.name
                ).toUpperCase();
                const badgeColor = getTypeBadgeColor(file.name);

                return (
                  <motion.div
                    key={file.id}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.15 }}
                    className={cn(
                      "flex! items-center! gap-3! px-3! py-2.5! hover:bg-gray-50/80! transition-colors!",
                      index < files.length - 1 && "border-b! border-gray-100!"
                    )}
                  >
                    {/* Type Badge */}
                    <div
                      className={cn(
                        "flex! items-center! justify-center! w-9! h-9! rounded-md! text-[10px]! font-bold! shrink-0!",
                        badgeColor
                      )}
                    >
                      {typeLabel || "FILE"}
                    </div>

                    {/* File Info */}
                    <div className="flex-1! min-w-0!">
                      <p
                        className="text-sm! font-medium! text-gray-700! truncate! mb-0!"
                        title={file.name}
                      >
                        {file.name}
                      </p>
                      <p className="text-xs! text-gray-400! mb-0!">
                        {formatFileSize(file.size)}
                      </p>
                    </div>

                    {/* Remove Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(file.id);
                      }}
                      disabled={disabled}
                      className={cn(
                        "flex! items-center! justify-center! w-7! h-7! rounded-md! transition-all! shrink-0! cursor-pointer!",
                        "text-gray-400! hover:text-red-500! hover:bg-red-50!",
                        "disabled:opacity-50! disabled:cursor-not-allowed!"
                      )}
                      title="Remover"
                    >
                      <Icon name="X" className="w-4! h-4!" />
                    </button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}

export default FileUploadMultiple;
