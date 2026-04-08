/**
 * Contratos do domínio turma-details.
 * Compartilha apenas interfaces entre os microfrontends do domínio.
 */

import type { CursoTurma } from "@/api/cursos";

export interface HeaderInfoProps {
  turma: CursoTurma;
  cursoId: number | string;
  cursoNome?: string;
  onEditTurma?: () => void;
  onCreateAula?: () => void;
  onCreateAvaliacao?: () => void;
  canManage?: boolean;
  canAppendItensOperacionais?: boolean;
  onDeleteSuccess?: () => void;
}

export interface ConfirmarPublicacaoTurmaModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isPublished: boolean;
  onConfirm: () => void;
  isPending: boolean;
}

export interface ExcluirTurmaModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isPending: boolean;
}
