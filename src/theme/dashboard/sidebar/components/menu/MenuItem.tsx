import React, { useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/custom/Icons";
import { cn } from "@/lib/utils";
import { MenuItemProps } from "../../types/sidebar.types";
import { useProjectStore } from "../../modules/project-selector/store/projectStore";

/**
 * Componente que renderiza um item de menu individual
 */
export function MenuItem({
  item,
  isCollapsed,
  handleNavigation,
  level,
  parentId = "",
}: MenuItemProps) {
  // Estado local para controlar o submenu
  const [isSubmenuOpen, setIsSubmenuOpen] = useState(false);

  // Estados globais do projectStore
  const { setNavigating } = useProjectStore();

  // Propriedades derivadas
  const hasSubmenu = item.submenu && item.submenu.length > 0;
  const isActive = item.active || false;
  const itemId = parentId ? `${parentId}-${item.label}` : item.label;

  // Handler de navegação customizado
  const handleItemNavigation = () => {
    setNavigating(true);
    if (typeof handleNavigation === "function") {
      handleNavigation();
    }
    setTimeout(() => setNavigating(false), 300);
  };

  // Handler para o submenu
  const toggleSubmenu = (e: React.MouseEvent) => {
    if (hasSubmenu) {
      e.preventDefault();
      e.stopPropagation();
      setIsSubmenuOpen(!isSubmenuOpen);
    }
  };

  // Renderização condicional para estado colapsado em primeiro nível
  if (isCollapsed && level === 0) {
    const menuContent = (
      <button
        onClick={hasSubmenu ? toggleSubmenu : handleItemNavigation}
        className={cn(
          "relative w-10 h-10 mx-auto my-1 flex items-center justify-center rounded-md transition-colors",
          isActive || isSubmenuOpen
            ? "bg-primary/90 text-primary-foreground"
            : "text-gray-700 hover:bg-gray-100"
        )}
      >
        {item.icon && <Icon name={item.icon} size={20} />}
      </button>
    );

    return (
      <div className="relative group">
        {item.href && !hasSubmenu ? (
          <Link
            href={item.href}
            onClick={handleItemNavigation}
            className="block"
          >
            {menuContent}
          </Link>
        ) : (
          <div>{menuContent}</div>
        )}

        {/* Popup submenu para estado colapsado */}
        {hasSubmenu && isSubmenuOpen && (
          <div
            className={cn(
              "absolute left-full top-0 ml-2 w-48 rounded-md bg-white shadow-lg border border-gray-100 py-1 z-50",
              "origin-left transition-all duration-150 ease-out"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Cabeçalho */}
            <div className="flex items-center p-2 rounded-t-md bg-indigo-500 text-white font-medium">
              {item.icon && (
                <Icon name={item.icon} size={16} className="mr-2" />
              )}
              <p className="text-sm">{item.label}</p>
            </div>

            {/* Items do submenu */}
            <div className="py-1">
              {item.submenu?.map((subItem) => (
                <div key={`${itemId}-${subItem.label}`} className="px-2 py-0.5">
                  {subItem.href ? (
                    <Link
                      href={subItem.href}
                      onClick={handleItemNavigation}
                      className={cn(
                        "flex items-center px-2 py-1.5 text-sm rounded-md",
                        "hover:bg-gray-100",
                        "text-gray-700",
                        subItem.active &&
                          "bg-gray-100 font-medium"
                      )}
                    >
                      {subItem.icon && (
                        <Icon
                          name={subItem.icon}
                          size={16}
                          className="mr-2 text-gray-500"
                        />
                      )}
                      <span>{subItem.label}</span>
                    </Link>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSubmenu(e);
                      }}
                      className="flex items-center justify-between w-full px-2 py-1.5 text-sm rounded-md hover:bg-gray-100 text-gray-700"
                    >
                      <div className="flex items-center">
                        {subItem.icon && (
                          <Icon
                            name={subItem.icon}
                            size={16}
                            className="mr-2 text-gray-500"
                          />
                        )}
                        <span>{subItem.label}</span>
                      </div>
                      {subItem.submenu && (
                        <Icon
                          name="ChevronRight"
                          size={16}
                          className="text-gray-400"
                        />
                      )}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Renderização padrão (não colapsada ou para submenus)
  return (
    <div className="relative">
      {item.href && !hasSubmenu ? (
        <Link
          href={item.href}
          onClick={handleItemNavigation}
          className={cn(
            "flex items-center px-3 py-2 text-sm rounded-md transition-colors w-full",
            "hover:bg-gray-100",
            isActive
              ? "bg-gray-100 text-gray-900 font-medium"
              : "text-gray-600",
            level > 0 && "text-xs"
          )}
        >
          {item.icon && (
            <Icon name={item.icon} size={16} className="mr-3 flex-shrink-0" />
          )}
          <span className={level > 0 ? "ml-1" : ""}>{item.label}</span>
        </Link>
      ) : (
        <button
          onClick={toggleSubmenu}
          className={cn(
            "flex items-center justify-between w-full px-3 py-2 text-sm rounded-md transition-colors",
            "hover:bg-gray-100",
            isSubmenuOpen || isActive
              ? "bg-gray-100 text-gray-900"
              : "text-gray-600",
            level > 0 && "text-xs"
          )}
        >
          <div className="flex items-center">
            {item.icon && (
              <Icon name={item.icon} size={16} className="mr-3 flex-shrink-0" />
            )}
            <span className={level > 0 ? "ml-1" : ""}>{item.label}</span>
          </div>
          {hasSubmenu && (
            <div className="flex items-center">
              <Icon
                name="ChevronDown"
                size={16}
                className={cn(
                  "transform transition-transform duration-200",
                  isSubmenuOpen ? "rotate-180" : "rotate-0"
                )}
              />
            </div>
          )}
        </button>
      )}

      {/* Renderização recursiva de submenu */}
      {hasSubmenu && (
        <div
          className={cn(
            "mt-1 pl-4 border-l border-gray-200",
            "overflow-hidden transition-all duration-300 ease-in-out",
            isSubmenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          )}
        >
          {item.submenu?.map((subItem) => (
            <MenuItem
              key={`${itemId}-${subItem.label}`}
              item={subItem}
              isCollapsed={isCollapsed}
              handleNavigation={handleNavigation}
              level={level + 1}
              parentId={itemId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
