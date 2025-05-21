import React from "react";
import * as LucideIcons from "lucide-react";

// Define o tipo para nomes de ícones com base nas chaves do objeto importado
export type IconName = keyof typeof LucideIcons;

// Define um tipo mais específico para componentes de ícone da biblioteca Lucide
type LucideIconComponent = React.ForwardRefExoticComponent<
  Omit<LucideIcons.LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>
>;

interface IconProps {
  /** Nome do ícone da biblioteca Lucide React */
  name: IconName;
  /** Tamanho do ícone (em pixels) */
  size?: number;
  /** Cor do ícone */
  color?: string;
  /** Classes CSS adicionais */
  className?: string;
  /** Ação de clique no ícone */
  onClick?: () => void;
}

/**
 * Componente Icon que renderiza ícones da biblioteca Lucide React
 */
export const Icon: React.FC<IconProps> = ({
  name,
  size = 20,
  color,
  className = "",
  onClick,
  ...props
}) => {
  const LucideIcon = LucideIcons[name] as LucideIconComponent;

  if (!LucideIcon) {
    console.warn(`Ícone '${name}' não encontrado na biblioteca Lucide`);
    return null;
  }

  return (
    <LucideIcon
      size={size}
      color={color}
      className={className}
      onClick={onClick}
      {...props}
    />
  );
};

/**
 * Exporta todos os ícones da Lucide React para uso em outros componentes
 */
export const Icons = {
  // Ícones
  Mail: LucideIcons.Mail,
  Phone: LucideIcons.Phone,
  User: LucideIcons.User,
  Lock: LucideIcons.Lock,
  Eye: LucideIcons.Eye,
  EyeOff: LucideIcons.EyeOff,
  Search: LucideIcons.Search,
  MapPin: LucideIcons.MapPin,
  Calendar: LucideIcons.Calendar,
  CreditCard: LucideIcons.CreditCard,
  Check: LucideIcons.Check,
  X: LucideIcons.X,
  ChevronDown: LucideIcons.ChevronDown,
  ChevronUp: LucideIcons.ChevronUp,
  ChevronLeft: LucideIcons.ChevronLeft,
  ChevronRight: LucideIcons.ChevronRight,

  // Função de utilidade para ícones
  get: (name: IconName): LucideIconComponent =>
    LucideIcons[name] as LucideIconComponent,

  // Helper para verificar se um ícone existe
  exists: (name: string): name is IconName => name in LucideIcons,
};

export default Icons;
