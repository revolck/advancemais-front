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
      className={cn(
        "px-4 mb-8 transition-all duration-200",
        isCollapsed && "px-2 mb-6"
      )}
    >
      {/* Título da seção - visível apenas quando não está colapsado */}
      {!isCollapsed && (
        <div className="mb-4 text-xs uppercase tracking-wider text-[var(--secondary-color)] transition-opacity duration-200">
          {section.title}
        </div>
      )}

      {/* Lista de itens desta seção */}
      <div className="space-y-2">
        {section.items.map((item) => (
          <MenuItem
            key={item.route || item.label}
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
