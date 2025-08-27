import type { ReactNode } from "react";
import type { VariantProps } from "class-variance-authority";
import { fileUploadVariants } from "../variants";

/**
 * Status possíveis para um arquivo durante o upload
 */
export type FileUploadStatus = "idle" | "uploading" | "completed" | "failed" | "cancelled";

/**
 * Tipos de arquivo aceitos pelo componente
 */
export type AcceptedFileType = 
  | "image/*"
  | "application/pdf"
  | "text/csv"
  | "application/vnd.ms-excel"
  | "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  | "application/json"
  | ".csv"
  | ".xlsx"
  | ".xls"
  | ".pdf"
  | ".jpg"
  | ".jpeg"
  | ".png"
  | ".webp"
  | ".json";

/**
 * Item de arquivo no componente de upload
 */
export interface FileUploadItem {
  /** ID único do arquivo */
  id: string;
  /** Nome do arquivo */
  name: string;
  /** Tamanho em bytes */
  size: number;
  /** Tipo MIME do arquivo */
  type: string;
  /** Status atual do upload */
  status: FileUploadStatus;
  /** Progresso do upload (0-100) */
  progress?: number;
  /** Data de upload */
  uploadDate: Date;
  /** URL de preview (se aplicável) */
  previewUrl?: string;
  /** Mensagem de erro (se houver) */
  error?: string;
  /** Arquivo original do navegador */
  file?: File;
  /** URL retornada pelo servidor após upload */
  uploadedUrl?: string;
}

/**
 * Configurações de validação para arquivos
 */
export interface FileValidationConfig {
  /** Tamanho máximo em bytes */
  maxSize: number;
  /** Tamanho mínimo em bytes */
  minSize?: number;
  /** Tipos de arquivo aceitos */
  accept: AcceptedFileType[];
  /** Número máximo de arquivos */
  maxFiles: number;
  /** Se deve validar dimensões de imagem */
  validateImageDimensions?: {
    maxWidth?: number;
    maxHeight?: number;
    minWidth?: number;
    minHeight?: number;
  };
}

/**
 * Propriedades do componente FileUpload
 */
export interface FileUploadProps extends VariantProps<typeof fileUploadVariants> {
  /** Lista de arquivos já carregados */
  files?: FileUploadItem[];
  /** Configuração de validação */
  validation?: Partial<FileValidationConfig>;
  /** Número máximo de arquivos permitidos */
  maxFiles?: number;
  /** Se permite múltiplos arquivos */
  multiple?: boolean;
  /** Se está desabilitado */
  disabled?: boolean;
  /** Texto personalizado para a área de drop */
  dropzoneText?: ReactNode;
  /** Texto personalizado para o botão de browse */
  browseText?: string;
  /** Se deve mostrar preview de imagens */
  showPreview?: boolean;
  /** Se deve mostrar progresso detalhado */
  showProgress?: boolean;
  /** Se permite cancelar uploads */
  allowCancel?: boolean;
  /** Se permite retry em caso de erro */
  allowRetry?: boolean;
  /** Classes customizadas */
  classNames?: {
    container?: string;
    dropzone?: string;
    fileList?: string;
    fileItem?: string;
    progressBar?: string;
    errorMessage?: string;
    preview?: string;
  };
  /** Endpoint para upload automático */
  uploadUrl?: string;
  /** Caminho público para salvar o arquivo */
  publicUrl?: string;
  /** Se deve remover o arquivo do servidor ao ser excluído do componente */
  deleteOnRemove?: boolean;
  /** Se deve iniciar upload automaticamente ao adicionar arquivos */
  autoUpload?: boolean;
  /** Callbacks */
  onFilesChange?: (files: FileUploadItem[]) => void;
  /** Callback para quando arquivos são adicionados */
  onFilesAdded?: (newFiles: FileUploadItem[]) => void;
  /** Callback para quando arquivo é removido */
  onFileRemove?: (fileId: string) => void;
  /** Callback para início de upload */
  onUploadStart?: (file: FileUploadItem) => void;
  /** Callback para progresso de upload */
  onUploadProgress?: (fileId: string, progress: number) => void;
  /** Callback para upload concluído */
  onUploadComplete?: (file: FileUploadItem) => void;
  /** Callback para erro de upload */
  onUploadError?: (fileId: string, error: string) => void;
  /** Callback personalizado de upload */
  onUpload?: (file: File) => Promise<{ url?: string; error?: string }>;
}

/**
 * Propriedades para o item individual de arquivo
 */
export interface FileUploadItemProps {
  /** Dados do arquivo */
  file: FileUploadItem;
  /** Se deve mostrar preview */
  showPreview?: boolean;
  /** Se deve mostrar progresso */
  showProgress?: boolean;
  /** Se permite cancelar */
  allowCancel?: boolean;
  /** Se permite retry */
  allowRetry?: boolean;
  /** Classes customizadas */
  className?: string;
  /** Callbacks */
  onRemove?: () => void;
  onRetry?: () => void;
  onCancel?: () => void;
}

/**
 * Resultado da validação de arquivo
 */
export interface FileValidationResult {
  /** Se o arquivo é válido */
  isValid: boolean;
  /** Mensagens de erro */
  errors: string[];
  /** Avisos (não impedem upload) */
  warnings?: string[];
}