/**
 * Interface para props do componente Loader
 */
export interface LoaderProps {
  /**
   * Se deve mostrar overlay de fundo
   * @default true
   */
  showOverlay?: boolean;

  /**
   * Se deve centralizar na tela
   * @default true
   */
  fullScreen?: boolean;

  /**
   * Classes CSS customizadas
   */
  className?: string;
}

/**
 * Configuração do loader
 */
export interface LoaderConfig {
  words: string[];
  animationDuration: number;
  bgColor: string;
}
