// src/theme/website/components/communication-highlights/index.ts

// Componente principal
export { default } from "./CommunicationHighlights";
export { default as CommunicationHighlights } from "./CommunicationHighlights";

// Componentes individuais
export { TextContent } from "./components/TextContent";
export { ImageGallery } from "./components/ImageGallery";

// Hook
export { useCommunicationData } from "./hooks/useCommunicationData";

// Tipos e constantes
export type { CommunicationData, CommunicationHighlightsProps } from "./types";
export { DEFAULT_COMMUNICATION_DATA, COMMUNICATION_CONFIG } from "./constants";
