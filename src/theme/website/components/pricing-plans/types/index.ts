// src/theme/website/components/pricing-plans/types/index.ts

/**
 * Interface para dados de plano vindos da API
 */
export interface PricingPlanData {
  id: string;
  title: string;
  iconName: string; // Nome do ícone Lucide (ex: "Briefcase")
  price: string;
  description: string | null; // Descrição opcional - pode ser null se não preenchida
  features: string[];
  isPopular: boolean;
  isActive: boolean;
  order: number;
  buttonText: string;
  buttonUrl: string;
  period: string; // ex: "mês", "ano"
  currency: string; // ex: "R$"
}

/**
 * Props do componente principal
 */
export interface PricingPlansProps {
  className?: string;
  /**
   * Título da seção
   * @default "Escolha seu plano"
   */
  title?: string;
  /**
   * Subtítulo da seção
   * @default "Você pode mudar de plano a qualquer momento."
   */
  subtitle?: string;
  /**
   * Se deve carregar dados da API
   * @default true
   */
  fetchFromApi?: boolean;
  /**
   * Dados estáticos (usado quando fetchFromApi é false)
   */
  staticData?: PricingPlanData[];
  /**
   * Callback quando os dados são carregados
   */
  onDataLoaded?: (data: PricingPlanData[]) => void;
  /**
   * Callback quando ocorre erro
   */
  onError?: (error: string) => void;
  /**
   * Callback quando um plano é selecionado
   */
  onPlanSelect?: (plan: PricingPlanData) => void;
}

/**
 * Props do componente individual de plano
 */
export interface PricingPlanCardProps {
  plan: PricingPlanData;
  index: number;
  onSelect?: (plan: PricingPlanData) => void;
}
