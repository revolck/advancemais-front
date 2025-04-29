'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useState } from 'react';

const solutionsData = [
  {
    title: 'Prefeitura e Gestão',
    description: 'Ecossistema cloud completo para governos inteligentes.',
    color: 'bg-red-500',
    image: '/placeholder.svg?height=100&width=100',
  },
  {
    title: 'Saúde',
    description: 'Eleve a estratégia e o atendimento em uma única solução.',
    color: 'bg-cyan-500',
    image: '/placeholder.svg?height=100&width=100',
  },
  {
    title: 'Educação',
    description: 'Melhores resultados com um sistema de gestão integrado.',
    color: 'bg-orange-500',
    image: '/placeholder.svg?height=100&width=100',
  },
  {
    title: 'Assistência Social',
    description: 'A solução completa para Assistência Social.',
    color: 'bg-teal-500',
    image: '/placeholder.svg?height=100&width=100',
  },
  {
    title: 'Dara',
    description: 'A Inteligência Artificial da nova era da gestão pública.',
    color: 'bg-rose-500',
    image: '/placeholder.svg?height=100&width=100',
  },
  {
    title: 'Vigilância',
    description: 'Tecnologia que fortalece a saúde nas cidades.',
    color: 'bg-indigo-500',
    image: '/placeholder.svg?height=100&width=100',
  },
  {
    title: 'Comunicação',
    description: 'Todas as comunicações oficiais num só lugar.',
    color: 'bg-pink-500',
    image: '/placeholder.svg?height=100&width=100',
  },
  {
    title: 'Fintech',
    description: 'Soluções em tecnologia financeira municipal.',
    color: 'bg-blue-500',
    image: '/placeholder.svg?height=100&width=100',
  },
];

export function MegaMenu() {
  const [hoveredItem, setHoveredItem] = useState<number | null>(null);

  return (
    <div className="py-8">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-800">Todas as nossas soluções</h3>
        <Link
          href="/solucoes"
          className="text-red-600 hover:text-red-700 font-medium inline-flex items-center group"
        >
          Ver todas as soluções
          <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {solutionsData.map((solution, index) => (
          <Link
            href={`/solucoes/${solution.title.toLowerCase().replace(/\s+/g, '-')}`}
            key={index}
            className="group relative flex flex-col hover:bg-gray-50 p-4 rounded-lg transition-all duration-200 border border-transparent hover:border-gray-100 hover:shadow-sm"
            onMouseEnter={() => setHoveredItem(index)}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <div className="flex items-start space-x-4">
              <div
                className={`relative rounded-lg overflow-hidden ${solution.color} w-16 h-16 flex-shrink-0`}
              >
                <Image
                  src={solution.image || '/placeholder.svg'}
                  alt={solution.title}
                  width={64}
                  height={64}
                  className="object-cover"
                />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 group-hover:text-red-600 transition-colors">
                  {solution.title}
                </h4>
                <p className="text-sm text-gray-600 mt-1">{solution.description}</p>
              </div>
            </div>

            <span
              className={`
                absolute bottom-2 right-4 text-red-600 font-medium text-sm 
                flex items-center opacity-0 transform translate-x-[-10px]
                transition-all duration-200 ease-in-out
                ${hoveredItem === index ? 'opacity-100 translate-x-0' : ''}
              `}
            >
              Saiba mais <ArrowRight className="ml-1 h-3 w-3" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
