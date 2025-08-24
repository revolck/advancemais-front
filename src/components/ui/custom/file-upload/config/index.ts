import type { FileValidationConfig, AcceptedFileType } from "../types";

/**
 * Configuração padrão para validação de arquivos
 */
export const DEFAULT_FILE_VALIDATION: FileValidationConfig = {
  maxSize: 2 * 1024 * 1024, // 2MB em bytes
  minSize: 0,
  maxFiles: 10,
  acceptedTypes: [
    ".csv",
    ".xlsx", 
    ".xls",
    ".pdf",
    ".jpg",
    ".jpeg", 
    ".png",
    ".webp",
    ".json",
    "text/csv",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/json",
  ] as AcceptedFileType[],
};

/**
 * Mapeamento de tipos MIME para extensões legíveis
 */
export const MIME_TYPE_MAP: Record<string, string> = {
  // Documentos
  "text/csv": "CSV",
  "application/vnd.ms-excel": "Excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "Excel",
  "application/pdf": "PDF",
  "application/json": "JSON",
  
  // Imagens
  "image/jpeg": "JPEG",
  "image/jpg": "JPG", 
  "image/png": "PNG",
  "image/webp": "WebP",
  "image/svg+xml": "SVG",
  
  // Genéricos
  "text/plain": "Texto",
  "application/octet-stream": "Arquivo",
};

/**
 * Extensões que são consideradas imagens
 */
export const IMAGE_EXTENSIONS = [
  "jpg", 
  "jpeg", 
  "png", 
  "webp", 
  "svg", 
  "gif",
  "bmp",
  "tiff"
];

/**
 * Extensões que são consideradas documentos
 */
export const DOCUMENT_EXTENSIONS = [
  "pdf", 
  "doc", 
  "docx", 
  "xls", 
  "xlsx", 
  "csv",
  "txt",
  "json",
  "xml"
];

/**
 * Configuração padrão para mensagens de erro
 */
export const DEFAULT_ERROR_MESSAGES = {
  fileTooLarge: "Arquivo muito grande. Tamanho máximo permitido: {maxSize}",
  fileTooSmall: "Arquivo muito pequeno. Tamanho mínimo: {minSize}",
  fileTypeNotAllowed: "Tipo de arquivo não permitido. Tipos aceitos: {allowedTypes}",
  tooManyFiles: "Muitos arquivos selecionados. Máximo permitido: {maxFiles}",
  uploadFailed: "Falha no upload do arquivo",
  networkError: "Erro de rede. Tente novamente.",
  serverError: "Erro do servidor. Tente novamente mais tarde.",
  cancelled: "Upload cancelado pelo usuário",
  invalidImageDimensions: "Dimensões da imagem inválidas",
  duplicateFile: "Arquivo duplicado detectado",
  unknownError: "Erro desconhecido ocorreu durante o upload"
};

/**
 * Configuração padrão para textos da interface
 */
export const DEFAULT_UI_TEXTS = {
  dropzoneTitle: "Arraste e Solte ou",
  dropzoneBrowse: "Procurar",
  dropzoneSubtitle: "para Enviar",
  dropzoneDescription: "Formatos suportados: {acceptedTypes} (máximo {maxSize} por arquivo)",
  uploading: "Enviando...",
  completed: "Concluído",
  failed: "Falha no Envio",
  cancelled: "Cancelado",
  retry: "Tentar Novamente",
  remove: "Remover",
  cancel: "Cancelar",
  filesSelected: "{count} arquivo(s) selecionado(s)",
  filesUploaded: "{completed} de {total} arquivo(s) enviado(s)",
  showMore: "Mostrar mais {count} arquivo(s)",
  showLess: "Mostrar menos",
};

/**
 * Configuração padrão para animações
 */
export const DEFAULT_ANIMATION_CONFIG = {
  uploadDuration: 2000, // Duração simulada do upload em ms
  progressUpdateInterval: 100, // Intervalo de atualização do progresso em ms
  fadeInDuration: 300, // Duração da animação de fade in
  scaleOnDragOver: 1.02, // Escala aplicada durante drag over
};

/**
 * Configuração de cores para diferentes status
 */
export const STATUS_COLORS = {
  idle: {
    bg: "bg-gray-50",
    border: "border-gray-200", 
    text: "text-gray-600"
  },
  uploading: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-600"
  },
  completed: {
    bg: "bg-green-50", 
    border: "border-green-200",
    text: "text-green-600"
  },
  failed: {
    bg: "bg-red-50",
    border: "border-red-200", 
    text: "text-red-600"
  },
  cancelled: {
    bg: "bg-gray-50",
    border: "border-gray-200",
    text: "text-gray-500"
  }
};

/**
 * Utilitário para formatar tamanho de arquivo
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

/**
 * Utilitário para obter extensão do arquivo
 */
export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || '';
}

/**
 * Utilitário para verificar se arquivo é imagem
 */
export function isImageFile(filename: string): boolean {
  const ext = getFileExtension(filename);
  return IMAGE_EXTENSIONS.includes(ext);
}

/**
 * Utilitário para verificar se arquivo é documento
 */
export function isDocumentFile(filename: string): boolean {
  const ext = getFileExtension(filename);
  return DOCUMENT_EXTENSIONS.includes(ext);
}

/**
 * Utilitário para obter nome legível do tipo de arquivo
 */
export function getReadableFileType(mimeType: string, filename: string): string {
  // Tenta primeiro pelo MIME type
  if (MIME_TYPE_MAP[mimeType]) {
    return MIME_TYPE_MAP[mimeType];
  }
  
  // Fallback para extensão
  const ext = getFileExtension(filename).toUpperCase();
  return ext || "Arquivo";
}