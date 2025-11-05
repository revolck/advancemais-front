export * from "./lista-empresas";
export * from "./company-details";
export * from "./lista-vagas";
export * from "./lista-cursos";
export { VisaoGeralDashboard } from "./visao-geral/VisaoGeralDashboard";

// Curso Details
export {
  CursoDetailsView,
  AboutTab as CursoAboutTab,
  HeaderInfo as CursoHeaderInfo,
  TurmasTab,
  HistoryTab,
} from "./curso-details";

// Turma Details
export {
  TurmaDetailsView,
  HeaderInfo as TurmaHeaderInfo,
  AboutTab as TurmaAboutTab,
  InscricoesTab as TurmaInscricoesTab,
  HistoryTab as TurmaHistoryTab,
} from "./turma-details";

// Lista Dashboards
export { TurmasDashboard } from "./lista-turmas/TurmasDashboard";
export { InstrutoresDashboard } from "./lista-instrutores/InstrutoresDashboard";
export { UsuariosDashboard } from "./lista-usuarios/UsuariosDashboard";
export { ProvasDashboard } from "./lista-provas/ProvasDashboard";
export { CertificadosDashboard } from "./lista-certificados/CertificadosDashboard";
export { EstagiosDashboard } from "./lista-estagios/EstagiosDashboard";
export { AgendaDashboard } from "./lista-agenda/AgendaDashboard";

// Candidato Details
export {
  CandidatoDetailsView,
  AboutTab as CandidatoAboutTab,
  HeaderInfo as CandidatoHeaderInfo,
  CandidaturasTab,
  ContatoTab,
  CurriculosTab,
} from "./candidato-details";
export type {
  CandidatoDetailsViewProps,
  CandidatoDetailsData,
  CandidatoOverview,
  Candidatura,
  CandidaturaStatus,
} from "./candidato-details/types";
export * from "./candidato-details/utils";

// Aluno Details
export { AlunoDetailsView } from "./aluno-details";
export type {
  AlunoDetailsViewProps,
  AlunoDetailsData,
  AlunoInscricao,
  AlunoEndereco,
  AlunoEstatisticas,
} from "./aluno-details/types";

// Instrutor Details
export { InstrutorDetailsView } from "./instrutor-details";
export type {
  InstrutorDetailsViewProps,
  InstrutorDetailsData,
  HeaderInfoProps as InstrutorHeaderInfoProps,
  AboutTabProps as InstrutorAboutTabProps,
} from "./instrutor-details/types";

// Usuario Details
export { UsuarioDetailsView } from "./usuario-details";
export type {
  UsuarioDetailsViewProps,
  UsuarioDetailsData,
  HeaderInfoProps as UsuarioHeaderInfoProps,
  AboutTabProps as UsuarioAboutTabProps,
} from "./usuario-details/types";
