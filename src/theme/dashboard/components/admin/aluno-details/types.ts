import type { ReactNode } from "react";
import type {
  CursoAlunoDetalhes,
  CursoAlunoEndereco,
  CursoAlunoEstatisticas,
  CursoAlunoInscricao,
} from "@/api/cursos/types";

export interface AlunoDetailsViewProps {
  alunoId: string;
  initialData: CursoAlunoDetalhes;
}

export type AlunoDetailsData = CursoAlunoDetalhes;
export type AlunoEndereco = CursoAlunoEndereco;
export type AlunoEstatisticas = CursoAlunoEstatisticas;
export type AlunoInscricao = CursoAlunoInscricao;

export interface HeaderInfoProps {
  aluno: AlunoDetailsData;
  onEditAluno?: () => void;
  onEditEndereco?: () => void;
  onResetSenha?: () => void;
  onLiberarAcessoAluno?: () => void;
  onBloquearAluno?: () => void;
  onDesbloquearAluno?: () => void;
  /** Só admin e moderador: tira a pessoa de aluno/candidato */
  onAlterarFuncao?: () => void;
}

export interface AboutTabProps {
  aluno: AlunoDetailsData;
  isLoading?: boolean;
}

export interface HistoryTabProps {
  aluno: AlunoDetailsData;
  isLoading?: boolean;
}

export interface InscricoesTabProps {
  aluno: AlunoDetailsData;
  inscricoes: AlunoInscricao[];
  isLoading?: boolean;
  canCreateNota?: boolean;
  /** Equipe (admin, moderador, pedagógico): associa a turmas e gerencia cada matrícula */
  podeGerenciarTurmas?: boolean;
  /** Recarrega o aluno depois de uma mudança nas turmas */
  onTurmasAlteradas?: () => void;
}

export interface HorizontalTabItem {
  value: string;
  label: string;
  icon: string;
  content: ReactNode;
}
