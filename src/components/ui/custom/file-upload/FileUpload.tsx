"use client";

import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import routes from "@/api/routes";
import { Icon } from "../Icons";
import { toastCustom } from "../toast";
import {
  fileUploadVariants,
  dropzoneVariants,
  fileItemVariants,
  progressBarVariants,
  progressIndicatorVariants,
  filePreviewVariants,
  fileActionVariants,
  messageVariants,
} from "./variants";
import {
  DEFAULT_FILE_VALIDATION,
  DEFAULT_ERROR_MESSAGES,
  DEFAULT_UI_TEXTS,
  DEFAULT_ANIMATION_CONFIG,
  formatFileSize,
  getFileExtension,
  isImageFile,
  isDocumentFile,
  getReadableFileType,
} from "./config";
import type {
  FileUploadProps,
  FileUploadItem,
  FileUploadItemProps,
  FileValidationResult,
  FileUploadStatus,
} from "./types";

/**
 * Componente individual de item de arquivo
 */
const FileUploadItemComponent: React.FC<FileUploadItemProps> = ({
  file,
  showPreview = true,
  showProgress = true,
  allowCancel = true,
  allowRetry = true,
  className,
  onRemove,
  onRetry,
  onCancel,
}) => {
  const isImage = isImageFile(file.name);
  const isDocument = isDocumentFile(file.name);

  const getStatusIcon = () => {
    switch (file.status) {
      case "uploading":
        return <Icon name="Loader2" className="w-4 h-4 animate-spin text-blue-500" />;
      case "completed":
        return <Icon name="CheckCircle" className="w-4 h-4 text-green-500" />;
      case "failed":
        return <Icon name="AlertCircle" className="w-4 h-4 text-red-500" />;
      case "cancelled":
        return <Icon name="XCircle" className="w-4 h-4 text-gray-500" />;
      default:
        return <Icon name="File" className="w-4 h-4 text-gray-500" />;
    }
  };

  const getFileIcon = () => {
    if (isImage) {
      return file.previewUrl ? (
        <Image
          src={file.previewUrl}
          alt={file.name}
          fill
          unoptimized
          className="object-cover"
          sizes="48px"
        />
      ) : (
        <Icon name="Image" className="w-6 h-6 text-blue-500" />
      );
    }

    if (isDocument) {
      const ext = getFileExtension(file.name);
      if (ext === "pdf") return <Icon name="FileText" className="w-6 h-6 text-red-500" />;
      if (["csv", "xlsx", "xls"].includes(ext)) return <Icon name="Sheet" className="w-6 h-6 text-green-500" />;
      if (ext === "json") return <Icon name="FileCode" className="w-6 h-6 text-purple-500" />;
    }

    return <Icon name="File" className="w-6 h-6 text-gray-500" />;
  };

  const getStatusText = () => {
    switch (file.status) {
      case "uploading":
        return `${DEFAULT_UI_TEXTS.uploading} ${Math.round(file.progress || 0)}%`;
      case "completed":
        return DEFAULT_UI_TEXTS.completed;
      case "failed":
        return file.error || DEFAULT_UI_TEXTS.failed;
      case "cancelled":
        return DEFAULT_UI_TEXTS.cancelled;
      default:
        return "";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={cn(
        fileItemVariants({
          status: file.status,
        }),
        className
      )}
    >
      {/* Preview/Icon */}
      {showPreview && (
        <div className={filePreviewVariants({ type: isImage ? "image" : isDocument ? "document" : "generic" })}>
          {getFileIcon()}
        </div>
      )}

      {/* File Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium text-sm text-foreground truncate max-w-[200px]" title={file.name}>
            {file.name}
          </p>
          {getStatusIcon()}
        </div>
        
        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
          <span>{formatFileSize(file.size)}</span>
          <span>{getReadableFileType(file.type, file.name)}</span>
          <span>{file.uploadDate.toLocaleDateString()}</span>
        </div>

        {/* Status & Progress */}
        <div className="mt-2">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className={messageVariants({ 
              type: file.status === "failed" ? "error" : 
                    file.status === "completed" ? "success" : "info" 
            })}>
              {getStatusText()}
            </span>
          </div>

          {/* Progress Bar */}
          {showProgress && file.status === "uploading" && (
            <div className={progressBarVariants()}>
              <div 
                className={progressIndicatorVariants({ 
                  status: file.status,
                  animated: file.status === "uploading" 
                })}
                style={{ width: `${file.progress || 0}%` }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        {/* Retry Button */}
        {allowRetry && file.status === "failed" && onRetry && (
          <button
            onClick={onRetry}
            className={cn(fileActionVariants({ variant: "ghost" }))}
            title={DEFAULT_UI_TEXTS.retry}
          >
            <Icon name="RotateCcw" className="w-3 h-3" />
          </button>
        )}

        {/* Cancel Button */}
        {allowCancel && file.status === "uploading" && onCancel && (
          <button
            onClick={onCancel}
            className={cn(fileActionVariants({ variant: "ghost" }))}
            title={DEFAULT_UI_TEXTS.cancel}
          >
            <Icon name="X" className="w-3 h-3" />
          </button>
        )}

        {/* Remove Button */}
        {onRemove && (
          <button
            onClick={onRemove}
            className={cn(fileActionVariants({ variant: "ghost" }))}
            title={DEFAULT_UI_TEXTS.remove}
          >
            <Icon name="Trash2" className="w-3 h-3 text-red-500" />
          </button>
        )}
      </div>
    </motion.div>
  );
};

/**
 * Componente principal de upload de arquivos
 */
export const FileUpload: React.FC<FileUploadProps> = ({
  files: controlledFiles,
  validation = {},
  maxFiles,
  multiple = true,
  disabled = false,
  dropzoneText,
  browseText = DEFAULT_UI_TEXTS.dropzoneBrowse,
  showPreview = true,
  showProgress = true,
  allowCancel = true,
  allowRetry = true,
  variant = "bordered",
  size = "md",
  classNames = {},
  onFilesChange,
  onFilesAdded,
  onFileRemove,
  onUploadStart,
  onUploadProgress,
  onUploadComplete,
  onUploadError,
  onUpload,
  uploadUrl,
  publicUrl,
  deleteOnRemove = true,
  autoUpload = true,
}) => {
  const [internalFiles, setInternalFiles] = useState<FileUploadItem[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showAllFiles, setShowAllFiles] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCountRef = useRef(0);

  // Determine if controlled or uncontrolled
  const isControlled = controlledFiles !== undefined;
  const files = isControlled ? controlledFiles : internalFiles;

  const filesRef = useRef<FileUploadItem[]>(files);

  useEffect(() => {
    filesRef.current = files;
  }, [files]);
  
  // Merge validation config with defaults
  const validationConfig = useMemo(() => ({
    ...DEFAULT_FILE_VALIDATION,
    ...validation,
  }), [validation]);

  const maxFilesLimit = maxFiles ?? validationConfig.maxFiles;

  const resolvedUploadUrl = useMemo(() => {
    if (uploadUrl) return uploadUrl;
    const sanitized = (publicUrl || "").replace(/^\/+/g, "").replace(/\.+/g, "");
    const base = routes.upload.base();
    return sanitized ? `${base}?path=${encodeURIComponent(sanitized)}` : base;
  }, [uploadUrl, publicUrl]);

  // File validation function
  const validateFile = useCallback((file: File): FileValidationResult => {
    const errors: string[] = [];

    // Check file size
    if (file.size > validationConfig.maxSize) {
      errors.push(
        DEFAULT_ERROR_MESSAGES.fileTooLarge.replace(
          "{maxSize}",
          formatFileSize(validationConfig.maxSize)
        )
      );
    }

    if (validationConfig.minSize && file.size < validationConfig.minSize) {
      errors.push(
        DEFAULT_ERROR_MESSAGES.fileTooSmall.replace(
          "{minSize}",
          formatFileSize(validationConfig.minSize)
        )
      );
    }

    // Check file type
    const fileExt = `.${getFileExtension(file.name)}`;
    const isTypeAllowed = validationConfig.accept.some(type => {
      if (type.startsWith('.')) {
        return type === fileExt;
      }

      // Support wildcard types like "image/*"
      if (type.endsWith('/*')) {
        const baseType = type.slice(0, -1); // remove the '*'
        return file.type.startsWith(baseType);
      }

      return file.type === type;
    });

    if (!isTypeAllowed) {
      errors.push(
        DEFAULT_ERROR_MESSAGES.fileTypeNotAllowed.replace(
          "{allowedTypes}",
          validationConfig.accept.filter(t => t.startsWith('.')).join(', ')
        )
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }, [validationConfig]);

  // Handle file updates
  const updateFiles = useCallback(
    (newFiles: FileUploadItem[]) => {
      // Keep reference in sync immediately so that subsequent
      // operations (like simulated progress updates) always operate
      // on the latest file list. This avoids race conditions where
      // the ref still points to a stale array during asynchronous
      // updates, which could result in lost file data.
      filesRef.current = newFiles;

      if (!isControlled) {
        setInternalFiles(newFiles);
      }
      onFilesChange?.(newFiles);
    },
    [isControlled, onFilesChange]
  );

  // Generate file preview URL
  const generatePreviewUrl = useCallback((file: File): string | undefined => {
    if (isImageFile(file.name)) {
      return URL.createObjectURL(file);
    }
    return undefined;
  }, []);

  // Simulate file upload
  const simulateUpload = useCallback(
    (fileId: string) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 25;

        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);

          // Simulate success/failure (90% success rate)
          const isSuccess = Math.random() > 0.1;
          const newStatus: FileUploadStatus = isSuccess
            ? "completed"
            : "failed";

          updateFiles(
            filesRef.current.map((file) =>
              file.id === fileId
                ? {
                    ...file,
                    status: newStatus,
                    progress: 100,
                    error: isSuccess
                      ? undefined
                      : DEFAULT_ERROR_MESSAGES.uploadFailed,
                  }
                : file
            )
          );

          // Trigger callbacks
          const file = filesRef.current.find((f) => f.id === fileId);
          if (file) {
            if (isSuccess) {
              onUploadComplete?.(file);
            } else {
              onUploadError?.(fileId, DEFAULT_ERROR_MESSAGES.uploadFailed);
            }
          }
        } else {
          updateFiles(
            filesRef.current.map((file) =>
              file.id === fileId ? { ...file, progress } : file
            )
          );

          onUploadProgress?.(fileId, progress);
        }
      }, DEFAULT_ANIMATION_CONFIG.progressUpdateInterval);

      return interval;
    },
    [updateFiles, onUploadComplete, onUploadError, onUploadProgress]
  );

  const uploadFile = useCallback(
    (fileId: string) => {
      const target = filesRef.current.find(f => f.id === fileId);
      if (!target || !target.file) return;

      if (onUpload) {
        onUploadStart?.(target);
        onUpload(target.file).then(({ url, error }) => {
          if (error) {
            updateFiles(
              filesRef.current.map(file =>
                file.id === fileId
                  ? { ...file, status: "failed", error }
                  : file
              )
            );
            onUploadError?.(fileId, error);
            return;
          }

          updateFiles(
            filesRef.current.map(file =>
              file.id === fileId
                ? { ...file, status: "completed", progress: 100, uploadedUrl: url }
                : file
            )
          );
          const updated = filesRef.current.find(f => f.id === fileId);
          if (updated) {
            onUploadComplete?.(updated);
          }
        });
        return;
      }

      if (!resolvedUploadUrl) {
        simulateUpload(fileId);
        return;
      }

      onUploadStart?.(target);
      const xhr = new XMLHttpRequest();
      xhr.open("POST", resolvedUploadUrl);

      xhr.upload.onprogress = (e) => {
        if (!e.lengthComputable) return;
        const progress = (e.loaded / e.total) * 100;
        updateFiles(
          filesRef.current.map(file =>
            file.id === fileId ? { ...file, progress } : file
          )
        );
        onUploadProgress?.(fileId, progress);
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          let url: string | undefined;
          try {
            const json = JSON.parse(xhr.responseText);
            url = json.url;
          } catch {
            url = undefined;
          }
          updateFiles(
            filesRef.current.map(file =>
              file.id === fileId
                ? { ...file, status: "completed", progress: 100, uploadedUrl: url }
                : file
            )
          );
          const updated = filesRef.current.find(f => f.id === fileId);
          if (updated) {
            onUploadComplete?.(updated);
          }
        } else {
          const error = DEFAULT_ERROR_MESSAGES.uploadFailed;
          updateFiles(
            filesRef.current.map(file =>
              file.id === fileId
                ? { ...file, status: "failed", error }
                : file
            )
          );
          onUploadError?.(fileId, error);
        }
      };

      xhr.onerror = () => {
        const error = DEFAULT_ERROR_MESSAGES.uploadFailed;
        updateFiles(
          filesRef.current.map(file =>
            file.id === fileId
              ? { ...file, status: "failed", error }
              : file
          )
        );
        onUploadError?.(fileId, error);
      };

      const formData = new FormData();
      formData.append("file", target.file);
      xhr.send(formData);
    },
    [resolvedUploadUrl, onUpload, simulateUpload, updateFiles, onUploadStart, onUploadProgress, onUploadComplete, onUploadError]
  );

  // Handle file processing
  const processFiles = useCallback((newFiles: File[]) => {
    // Check total file count
    if (filesRef.current.length + newFiles.length > maxFilesLimit) {
      toastCustom.error({
        title: "Muitos arquivos!",
        description: DEFAULT_ERROR_MESSAGES.tooManyFiles.replace(
          "{maxFiles}",
          maxFilesLimit.toString()
        ),
        duration: 5000,
      });
      return;
    }

    const validFiles: FileUploadItem[] = [];
    const invalidFiles: { file: File; errors: string[] }[] = [];

    newFiles.forEach(file => {
      const validation = validateFile(file);
      
      if (validation.isValid) {
        const fileItem: FileUploadItem = {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: file.name,
          size: file.size,
          type: file.type,
          status: autoUpload ? "uploading" : "idle",
          progress: autoUpload ? 0 : undefined,
          uploadDate: new Date(),
          previewUrl: generatePreviewUrl(file),
          file,
        };
        
        validFiles.push(fileItem);
      } else {
        invalidFiles.push({ file, errors: validation.errors });
      }
    });

    // Show validation errors
    invalidFiles.forEach(({ file, errors }) => {
      toastCustom.error({
        title: `Erro no arquivo: ${file.name}`,
        description: errors.join(". "),
        duration: 8000,
      });
    });

    // Add valid files and start upload
    if (validFiles.length > 0) {
      const updatedFiles = [...filesRef.current, ...validFiles];
      updateFiles(updatedFiles);
      onFilesAdded?.(validFiles);

      if (autoUpload) {
        // Start upload for each file
        validFiles.forEach(file => {
          uploadFile(file.id);
        });
      }

      // Show success message
      toastCustom.success({
        title: "Arquivos adicionados!",
        description: autoUpload
          ? `${validFiles.length} arquivo(s) sendo enviado(s).`
          : `${validFiles.length} arquivo(s) pronto(s) para upload.`,
        duration: 3000,
      });
    }
  }, [maxFilesLimit, validateFile, generatePreviewUrl, updateFiles, onFilesAdded, uploadFile, autoUpload]);

  // Drag & Drop handlers
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCountRef.current++;
    if (!disabled) {
      setIsDragOver(true);
    }
  }, [disabled]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCountRef.current--;
    if (dragCountRef.current === 0) {
      setIsDragOver(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    dragCountRef.current = 0;

    if (disabled) return;

    const droppedFiles = Array.from(e.dataTransfer.files);
    processFiles(droppedFiles);
  }, [disabled, processFiles]);

  // File input handler
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files ? Array.from(e.target.files) : [];
    if (selectedFiles.length > 0) {
      processFiles(selectedFiles);
    }
    // Reset input value
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [processFiles]);

  // File action handlers
  const removeFromServer = useCallback(async (file: FileUploadItem) => {
    if (!file.uploadedUrl) return;
    const relative = file.uploadedUrl.replace(/^\/+/g, "");
    try {
      await fetch(`${routes.upload.base()}?file=${encodeURIComponent(relative)}`, {
        method: "DELETE",
      });
    } catch {}
  }, []);

  const handleFileRemove = useCallback(
    async (fileId: string) => {
      const target = filesRef.current.find((f) => f.id === fileId);
      if (target && deleteOnRemove) {
        await removeFromServer(target);
      }
      const updatedFiles = filesRef.current.filter((file) => file.id !== fileId);
      updateFiles(updatedFiles);
      onFileRemove?.(fileId);

      toastCustom.success({
        description: "Arquivo removido com sucesso.",
        duration: 2000,
      });
    },
    [removeFromServer, updateFiles, onFileRemove, deleteOnRemove]
  );

  const handleFileRetry = useCallback(
    (fileId: string) => {
      updateFiles(
        filesRef.current.map((file) =>
          file.id === fileId
            ? { ...file, status: "uploading", progress: 0, error: undefined }
            : file
        )
      );

      uploadFile(fileId);

      toastCustom.info({
        description: "Tentando enviar arquivo novamente...",
        duration: 2000,
      });
    },
    [updateFiles, uploadFile]
  );

  const handleFileCancel = useCallback(
    (fileId: string) => {
      updateFiles(
        filesRef.current.map((file) =>
          file.id === fileId ? { ...file, status: "cancelled" } : file
        )
      );

      toastCustom.info({
        description: "Upload cancelado.",
        duration: 2000,
      });
    },
    [updateFiles]
  );

  // Generate accepted types string for display
  const acceptDisplay = useMemo(() => {
    const extensions = validationConfig.accept
      .filter(type => type.startsWith('.'))
      .join(', ');
    return extensions || 'Vários formatos';
  }, [validationConfig.accept]);

  // File display logic
  const INITIAL_DISPLAY_COUNT = 3;
  const displayedFiles = showAllFiles ? files : files.slice(0, INITIAL_DISPLAY_COUNT);
  const hasMoreFiles = files.length > INITIAL_DISPLAY_COUNT;

  // Generate accept attribute for input
  const acceptAttribute = validationConfig.accept.join(',');

  // Check if maximum number of files has been reached
  const isMaxFilesReached = files.length >= maxFilesLimit;

  return (
    <div className={cn(fileUploadVariants({ variant, size }), classNames.container)}>
      {/* Dropzone */}
      {!isMaxFilesReached && (
        <div
          className={cn(
            dropzoneVariants({
              variant: variant === "minimal" ? "minimal" : "default",
              state: disabled ? "disabled" : isDragOver ? "dragOver" : "idle",
              size,
            }),
            classNames.dropzone
          )}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !disabled && fileInputRef.current?.click()}
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-label="File upload area"
          onKeyDown={(e) => {
            if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
        >
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full">
              <Icon
                name={isDragOver ? "FileUp" : "Upload"}
                className={cn(
                  "w-5 h-5 transition-colors",
                  isDragOver ? "text-primary" : "text-primary/70"
                )}
              />
            </div>

            <div className="text-center">
              {dropzoneText || (
                <p className="text-foreground font-medium">
                  {DEFAULT_UI_TEXTS.dropzoneTitle}{" "}
                  <span className="text-primary hover:underline cursor-pointer">
                    {browseText}
                  </span>{" "}
                  {DEFAULT_UI_TEXTS.dropzoneSubtitle}
                </p>
              )}

              <p className="text-xs text-muted-foreground mt-1">
                {DEFAULT_UI_TEXTS.dropzoneDescription
                  .replace("{acceptedTypes}", acceptDisplay)
                  .replace("{maxSize}", formatFileSize(validationConfig.maxSize))}
              </p>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple={multiple}
            accept={acceptAttribute}
            onChange={handleFileSelect}
            className="hidden"
            disabled={disabled}
          />
        </div>
      )}

      {/* Files List */}
      {files.length > 0 && (
        <div
          className={cn(
            isMaxFilesReached ? "space-y-2" : "mt-4 space-y-2",
            classNames.fileList
          )}
        >
          <AnimatePresence>
            {displayedFiles.map(file => (
              <FileUploadItemComponent
                key={file.id}
                file={file}
                showPreview={showPreview}
                showProgress={showProgress}
                allowCancel={allowCancel}
                allowRetry={allowRetry}
                className={classNames.fileItem}
                onRemove={() => handleFileRemove(file.id)}
                onRetry={() => handleFileRetry(file.id)}
                onCancel={() => handleFileCancel(file.id)}
              />
            ))}
          </AnimatePresence>

          {/* Show More/Less Toggle */}
          {hasMoreFiles && (
            <div className="text-center pt-2">
              <button
                onClick={() => setShowAllFiles(!showAllFiles)}
                className="text-sm text-primary hover:underline"
              >
                {showAllFiles 
                  ? DEFAULT_UI_TEXTS.showLess
                  : DEFAULT_UI_TEXTS.showMore.replace(
                      "{count}", 
                      (files.length - INITIAL_DISPLAY_COUNT).toString()
                    )
                }
              </button>
            </div>
          )}

          {/* Files Summary */}
          <div className="mt-3 p-3 bg-muted/30 rounded-md">
            <p className="text-xs text-muted-foreground">
              {DEFAULT_UI_TEXTS.filesUploaded
                .replace("{completed}", files.filter(f => f.status === "completed").length.toString())
                .replace("{total}", files.length.toString())}
              {files.filter(f => f.status === "failed").length > 0 && 
                ` • ${files.filter(f => f.status === "failed").length} com falha`
              }
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;