export { TurmaDetailsView } from "./TurmaDetailsView";
export { HeaderInfo } from "./components/HeaderInfo";
export { AboutTab } from "./tabs/AboutTab";
export { EstruturaTab } from "./tabs/EstruturaTab";
export { InscricoesTab } from "./tabs/InscricoesTab";
export { HistoryTab } from "./tabs/HistoryTab";

// Hooks do domínio
export { usePublicarTurma } from "./hooks";
export type { UsePublicarTurmaParams } from "./hooks";

// Modais de ações do domínio
export { ConfirmarPublicacaoTurmaModal } from "./modal-acoes";

// Contratos (types)
export type {
  HeaderInfoProps,
  ConfirmarPublicacaoTurmaModalProps,
} from "./types";
