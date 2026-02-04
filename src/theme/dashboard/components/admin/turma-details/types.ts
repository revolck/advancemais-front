/**
 * Contratos do domínio turma-details.
 * Compartilha apenas interfaces entre os microfrontends do domínio.
 */

import type { CursoTurma } from "@/api/cursos";

export interface HeaderInfoProps {
  turma: CursoTurma;
  cursoId: number;
  cursoNome?: string;
  onEditTurma?: () => void;
}

export interface ConfirmarPublicacaoTurmaModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isPublished: boolean;
  onConfirm: () => void;
  isPending: boolean;
}
