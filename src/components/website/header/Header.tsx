'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface NavItem {
  title: string;
  href: string;
}

const mainNav: NavItem[] = [
  {
    title: 'Recursos',
    href: '/recursos',
  },
  {
    title: 'Preços',
    href: '/precos',
  },
  {
    title: 'Blog',
    href: '/blog',
  },
  {
    title: 'Contato',
    href: '/contato',
  },
];

export default function Header() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Detecta quando a página é scrollada para mudar a aparência do header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Fecha o menu quando a rota muda
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  return (
    <header
      className={cn(
        'sticky top-0 z-40 w-full transition-all duration-200',
        isScrolled ? 'border-b bg-background/95 backdrop-blur supports-backdrop-blur:bg-background/60' : 'bg-background'
      )}
    >
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-bold text-xl">AdvanceMais</span>
        </Link>
        
        {/* Menu para dispositivos mobile */}
        <button
          className="block md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"