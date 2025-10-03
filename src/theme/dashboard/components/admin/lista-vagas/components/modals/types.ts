export interface UnsavedChangesModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  title?: string;
  description?: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
}

export interface UnsavedChangesConfig {
  title: string;
  description?: string;
  warningMessage: string;
  confirmQuestion?: string;
  confirmButtonText: string;
  cancelButtonText: string;
}
