'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, ChevronUp, MessageCircle } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import { MegaMenu } from './mega-menu';

interface MainNavProps {
  items?: {
    title: string;
    href: string;
    hasDropdown?: boolean;
    hasMegaMenu?: boolean;
    dropdownItems?: { title: string; href: string }[];
  }[];
  isScrolled?: boolean;
}

export function MainNav({ items, isScrolled = false }: MainNavProps) {
  const pathname = usePathname();
  const [isHovering, setIsHovering] = React.useState<boolean>(false);
  const [activeMegaMenu, setActiveMegaMenu] = React.useState<string | null>(null);
  const [megaMenuTimeout, setMegaMenuTimeout] = React.useState<NodeJS.Timeout | null>(null);
  const megaMenuRef = React.useRef<HTMLDivElement>(null);
  const navRef = React.useRef<HTMLDivElement>(null);

  // Definir se o menu deve ter fundo branco (hover ou scroll ou mega-menu aberto)
  const shouldBeWhite = isHovering || isScrolled || activeMegaMenu !== null;

  // Manipular entrada do mouse em item do menu
  const handleMouseEnter = (title: string) => {
    if (megaMenuTimeout) {
      clearTimeout(megaMenuTimeout);
      setMegaMenuTimeout(null);
    }

    if (title === 'Soluções') {
      setActiveMegaMenu(title);
    }
  };

  // Manipular saída do mouse do item do menu com delay para melhorar usabilidade
  const handleMouseLeave = () => {
    const timeout = setTimeout(() => {
      setActiveMegaMenu(null);
    }, 300); // Delay para evitar fechamento imediato

    setMegaMenuTimeout(timeout);
  };

  // Manipular entrada do mouse no mega-menu
  const handleMegaMenuMouseEnter = () => {
    if (megaMenuTimeout) {
      clearTimeout(megaMenuTimeout);
      setMegaMenuTimeout(null);
    }
  };

  // Manipular clique fora do mega-menu para fechá-lo
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        megaMenuRef.current &&
        navRef.current &&
        !megaMenuRef.current.contains(event.target as Node) &&
        !navRef.current.contains(event.target as Node)
      ) {
        setActiveMegaMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Limpar timeout ao desmontar componente
  React.useEffect(() => {
    return () => {
      if (megaMenuTimeout) {
        clearTimeout(megaMenuTimeout);
      }
    };
  }, [megaMenuTimeout]);

  return (
    <>
      <div
        ref={navRef}
        className={cn(
          'fixed top-0 w-full z-40 transition-all duration-300',
          shouldBeWhite
            ? 'bg-white' // Fundo branco quando necessário
            : '' // Fundo transparente conforme solicitado
        )}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-[1250px] flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <div
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-md transition-colors duration-300',
                  shouldBeWhite ? 'bg-red-600 text-white' : 'bg-white text-red-600'
                )}
              >
                <span className="font-bold">ipm</span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center justify-center">
            <ul className="flex space-x-6">
              {items?.map((item, index) => (
                <li
                  key={index}
                  className="flex items-center"
                  onMouseEnter={() => handleMouseEnter(item.title)}
                  onMouseLeave={handleMouseLeave}
                >
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center px-2 py-1.5 text-base font-medium rounded-md transition-colors duration-300',
                      shouldBeWhite
                        ? 'text-gray-800 hover:text-red-600'
                        : 'text-white hover:bg-white/10',
                      activeMegaMenu === item.title && 'text-red-600'
                    )}
                  >
                    {item.title}
                    {item.hasMegaMenu && (
                      <span className="ml-1 transition-transform duration-200">
                        {activeMegaMenu === item.title ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact Button */}
          <div className="hidden md:flex items-center">
            <Button
              variant="ghost"
              className={cn(
                'transition-colors duration-300',
                shouldBeWhite ? 'text-gray-800 hover:text-red-600' : 'text-white hover:bg-white/10'
              )}
            >
              <MessageCircle className="mr-2 h-5 w-5" />
              Contato
            </Button>
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden flex items-center ml-auto">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    'transition-colors duration-300',
                    shouldBeWhite ? 'text-red-600' : 'text-white'
                  )}
                >
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-white border-l border-gray-100 p-0">
                <nav className="flex flex-col h-full">
                  <div className="p-4 border-b border-gray-100">
                    <div className="w-10 h-10 bg-red-600 text-white rounded-md flex items-center justify-center">
                      <span className="font-bold">ipm</span>
                    </div>
                  </div>

                  <div className="flex-1 overflow-auto py-6 px-4">
                    {items?.map((item, index) => (
                      <div key={index} className="py-2">
                        {item.hasDropdown || item.hasMegaMenu ? (
                          <MobileAccordionItem item={item} pathname={pathname} />
                        ) : (
                          <Link
                            href={item.href}
                            className={cn(
                              'block text-lg font-medium py-2 text-gray-800 hover:text-red-600 transition-colors',
                              pathname === item.href && 'text-red-600'
                            )}
                          >
                            {item.title}
                          </Link>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="mt-auto p-4 border-t border-gray-100">
                    <Link
                      href="/contato"
                      className="flex items-center gap-2 text-lg font-medium text-gray-800 hover:text-red-600 transition-colors py-2"
                    >
                      <MessageCircle className="h-5 w-5" />
                      Contato
                    </Link>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Mega Menu */}
      {activeMegaMenu === 'Soluções' && (
        <div
          ref={megaMenuRef}
          className="fixed top-16 left-0 right-0 z-30 bg-white border-t border-gray-100 animate-in fade-in-5 slide-in-from-top-2 duration-200"
          onMouseEnter={handleMegaMenuMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-[1250px]">
            <MegaMenu />
          </div>
        </div>
      )}
    </>
  );
}

// Componente de Item Accordion para Menu Mobile
function MobileAccordionItem({
  item,
  pathname,
}: {
  item: {
    title: string;
    href: string;
    dropdownItems?: { title: string; href: string }[];
  };
  pathname: string;
}) {
  const [isOpen, setIsOpen] = React.useState(false);

  // Verificar se algum item filho está ativo
  const hasActiveChild = item.dropdownItems?.some(
    child => pathname === child.href || pathname.startsWith(`${child.href}/`)
  );

  return (
    <div className="space-y-1">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center justify-between w-full py-2 text-lg font-medium text-left',
          hasActiveChild ? 'text-red-600' : 'text-gray-800'
        )}
      >
        <span>{item.title}</span>
        <span className="ml-1 transition-transform duration-200">
          {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </span>
      </button>

      {isOpen && item.dropdownItems && (
        <div className="ml-4 space-y-1 pt-1 pb-2">
          {item.dropdownItems.map((dropdownItem, idx) => (
            <Link
              key={idx}
              href={dropdownItem.href}
              className={cn(
                'block py-2 text-base',
                pathname === dropdownItem.href
                  ? 'text-red-600 font-medium'
                  : 'text-gray-600 hover:text-red-600'
              )}
            >
              {dropdownItem.title}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
