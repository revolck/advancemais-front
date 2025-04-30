'use client';
import { useState, useEffect } from 'react';
import { MainNav } from './menu/Menu';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import styles from './Header.module.css';
import Image from 'next/image';

const navigationItems = [
  {
    title: 'Sobre',
    href: '/sobre',
  },
  {
    title: 'Soluções',
    href: '/solucoes',
    hasMegaMenu: true,
    dropdownItems: [
      { title: 'Prefeitura e Gestão', href: '/solucoes/prefeitura-e-gestao' },
      { title: 'Saúde', href: '/solucoes/saude' },
      { title: 'Educação', href: '/solucoes/educacao' },
      { title: 'Assistência Social', href: '/solucoes/assistencia-social' },
      { title: 'Dara', href: '/solucoes/dara' },
      { title: 'Vigilância', href: '/solucoes/vigilancia' },
      { title: 'Comunicação', href: '/solucoes/comunicacao' },
      { title: 'Fintech', href: '/solucoes/fintech' },
    ],
  },
  {
    title: 'Tecnologia',
    href: '/tecnologia',
    hasDropdown: true,
    dropdownItems: [
      { title: 'Tecnologia 1', href: '/tecnologia/tecnologia-1' },
      { title: 'Tecnologia 2', href: '/tecnologia/tecnologia-2' },
    ],
  },
  {
    title: 'Carreira',
    href: '/carreira',
  },
  {
    title: 'Conteúdos',
    href: '/conteudos',
    hasDropdown: true,
    dropdownItems: [
      { title: 'Blog', href: '/conteudos/blog' },
      { title: 'Artigos', href: '/conteudos/artigos' },
      { title: 'Estudos de Caso', href: '/conteudos/estudos-de-caso' },
    ],
  },
  {
    title: 'Eventos',
    href: '/eventos',
  },
];

export default function Header() {
  // Estado para controlar se o menu está fixo (após scroll)
  const [isScrolled, setIsScrolled] = useState(false);

  // Efeito para detectar o scroll e fixar o menu
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 100); // Threshold de 100px
    };

    // Adiciona listener de scroll
    window.addEventListener('scroll', handleScroll);

    // Remove listener quando componente é desmontado
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <header className="flex min-h-screen flex-col">
      <MainNav items={navigationItems} isScrolled={isScrolled} />
      <main className="flex-1">
        <section className={styles.heroSection}>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:max-w-6xl py-16 md:py-24 h-full flex items-center">
            <div className="font-title text-white">teste</div>
          </div>
        </section>
      </main>
    </header>
  );
}
