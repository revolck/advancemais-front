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

  /**
   * Variant do loader
   * @default 'default'
   */
  variant?: "default" | "minimal" | "compact";
}

/**
 * Configuração do loader
 */
export interface LoaderConfig {
  words: string[];
  animationDuration: number;
  bgColor: string;
}
