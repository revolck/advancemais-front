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
}

export function MainNav({ items }: MainNavProps) {
  const pathname = usePathname();
  const [isHovering, setIsHovering] = React.useState<boolean>(false);
  const [activeMegaMenu, setActiveMegaMenu] = React.useState<string | null>(null);

  const handleMouseEnter = (title: string) => {
    if (title === 'Soluções') {
      setActiveMegaMenu(title);
    }
  };

  const handleMouseLeave = () => {
    setActiveMegaMenu(null);
  };

  return (
    <>
      <div
        className={cn(
          'flex w-full items-center justify-between transition-colors duration-300 px-4 md:px-8 lg:px-12 h-16',
          isHovering ? 'bg-white' : 'bg-red-600'
        )}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {/* Logo */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center">
            <div
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-md transition-colors duration-300',
                isHovering ? 'bg-red-600 text-white' : 'bg-white text-red-600'
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
                    isHovering ? 'text-red-600 hover:bg-red-50' : 'text-white hover:bg-white/10',
                    activeMegaMenu === item.title && isHovering && 'text-red-600'
                  )}
                >
                  {item.title}
                  {item.hasMegaMenu &&
                    (activeMegaMenu === item.title ? (
                      <ChevronUp className="ml-1 h-4 w-4" />
                    ) : (
                      <ChevronDown className="ml-1 h-4 w-4" />
                    ))}
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
              isHovering ? 'text-red-600 hover:bg-red-50' : 'text-white hover:bg-white/10'
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
                  isHovering ? 'text-red-600' : 'text-white'
                )}
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-red-600 text-white">
              <nav className="flex flex-col gap-4 mt-8">
                {items?.map((item, index) => (
                  <div key={index} className="py-2">
                    {item.hasDropdown || item.hasMegaMenu ? (
                      <div className="space-y-3">
                        <div className="font-medium text-lg">{item.title}</div>
                        <div className="ml-4 grid gap-2">
                          {item.dropdownItems?.map((dropdownItem, idx) => (
                            <Link
                              key={idx}
                              href={dropdownItem.href}
                              className="text-white/70 hover:text-white"
                            >
                              {dropdownItem.title}
                            </Link>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <Link
                        href={item.href}
                        className={cn(
                          'text-lg font-medium hover:underline',
                          pathname === item.href && 'font-semibold'
                        )}
                      >
                        {item.title}
                      </Link>
                    )}
                  </div>
                ))}
                <div className="py-2 mt-4">
                  <Link
                    href="/contato"
                    className="flex items-center gap-2 text-lg font-medium hover:underline"
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

      {/* Mega Menu */}
      {activeMegaMenu === 'Soluções' && <MegaMenu />}
    </>
  );
}
