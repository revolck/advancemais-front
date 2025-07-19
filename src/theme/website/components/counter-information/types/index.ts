/**
 * Interface para dados de estatísticas vindos da API
 */
export interface CounterData {
  id: string;
  value: number;
  prefix?: string;
  suffix?: string;
  description: string;
  order: number;
  isActive: boolean;
}

/**
 * Interface para resposta da API
 */
export interface CounterApiResponse {
  data: CounterData[];
  success: boolean;
  message?: string;
}

/**
 * Props do componente principal
 */
export interface CounterInformationProps {
  className?: string;
  /**
   * Se deve animar os contadores
   * @default true
   */
  animated?: boolean;
  /**
   * Duração da animação em milissegundos
   * @default 2000
   */
  animationDuration?: number;
  /**
   * Se deve carregar dados da API
   * @default true
   */
  fetchFromApi?: boolean;
  /**
   * Dados estáticos (usado quando fetchFromApi é false)
   */
  staticData?: CounterData[];
  /**
   * Callback quando os dados são carregados
   */
  onDataLoaded?: (data: CounterData[]) => void;
  /**
   * Callback quando ocorre erro
   */
  onError?: (error: string) => void;
}

/**
 * Props do componente individual de contador
 */
export interface CounterItemProps {
  data: CounterData;
  animated?: boolean;
  animationDuration?: number;
  index: number;
}

/**
 * Interface para configuração do contador animado
 */
export interface AnimatedCounterProps {
  from: number;
  to: number;
  duration: number;
  onUpdate: (value: number) => void;
  onComplete?: () => void;
}
