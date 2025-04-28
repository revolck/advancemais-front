'use client';
import { MainNav } from './menu/Menu';
import { ArrowRight } from 'lucide-react';

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
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 w-full">
        <MainNav items={navigationItems} />
      </header>
      <main className="flex-1">
        <section className="w-full bg-gradient-to-br from-red-600 via-red-500 to-orange-400">
          <div className="container mx-auto px-4 md:px-8 lg:px-12 py-16 md:py-24">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-6">
                <h1 className="text-white text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                  Impulsione
                  <br />
                  <span className="underline">progresso econômico</span>
                  <br />
                  com uma gestão mais
                  <br />
                  eficiente e inteligente
                </h1>
                <p className="text-white text-lg">
                  Somos a evolução da gestão pública, com soluções inovadoras para arrecadar mais,
                  atender melhor e acelerar a transformação digital com um sistema de gestão pública
                  em nuvem.
                </p>
                <div className="pt-4">
                  <a
                    href="#"
                    className="inline-flex items-center text-white border-b-2 border-white pb-1 hover:opacity-80 transition-opacity"
                  >
                    Solicite uma demonstração
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </a>
                </div>
              </div>
              <div className="hidden md:block">
                {/* Placeholder for the image of woman with tablet */}
                <div className="relative h-[400px] w-full">
                  <img
                    src="/placeholder.svg?height=400&width=400"
                    alt="Woman with tablet"
                    className="absolute right-0 h-full object-contain"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
