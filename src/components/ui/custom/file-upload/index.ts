export { FileUpload } from "./FileUpload";

export {
  fileUploadVariants,
  dropzoneVariants,
  fileItemVariants,
  progressBarVariants,
  progressIndicatorVariants,
  filePreviewVariants,
  fileActionVariants,
  messageVariants,
} from "./variants";

export {
  DEFAULT_FILE_VALIDATION,
  DEFAULT_ERROR_MESSAGES,
  DEFAULT_UI_TEXTS,
  DEFAULT_ANIMATION_CONFIG,
  MIME_TYPE_MAP,
  IMAGE_EXTENSIONS,
  DOCUMENT_EXTENSIONS,
  STATUS_COLORS as FILE_UPLOAD_STATUS_COLORS,
  formatFileSize,
  getFileExtension,
  isImageFile,
  isDocumentFile,
  getReadableFileType,
  formatAcceptedTypes,
} from "./config";

export type {
  FileUploadProps,
  FileUploadItem,
  FileUploadItemProps,
  FileUploadStatus,
  FileValidationConfig,
  FileValidationResult,
  AcceptedFileType,
} from "./types";

// Default export
export { FileUpload as default } from "./FileUpload";
