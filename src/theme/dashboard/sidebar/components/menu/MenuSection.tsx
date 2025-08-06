import { cn } from "@/lib/utils";
import { MenuItem } from "./MenuItem";
import { MenuSectionProps } from "../../types/sidebar.types";

/**
 * Componente que renderiza uma seção do menu com título e itens
 */
export function MenuSection({
  section,
  isCollapsed,
  handleNavigation,
}: MenuSectionProps) {
  return (
    <div
      className={cn("px-3 transition-all duration-200", isCollapsed && "px-1")}
    >
      {/* Título da seção - visível apenas quando não está colapsado */}
      {!isCollapsed && (
        <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500 transition-opacity duration-200">
          {section.title}
        </div>
      )}

      {/* Lista de itens desta seção */}
      <div className="space-y-1">
        {section.items.map((item) => (
          <MenuItem
            key={item.label}
            item={item}
            isCollapsed={isCollapsed}
            handleNavigation={handleNavigation}
            level={0}
          />
        ))}
      </div>
    </div>
  );
}
