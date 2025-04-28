import Image from 'next/image';
import Link from 'next/link';

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
  return (
    <div className="absolute left-0 right-0 z-50 bg-white shadow-lg border-t border-gray-100 animate-in fade-in-10 slide-in-from-top-5 duration-300">
      <div className="container mx-auto px-4 md:px-8 lg:px-12 py-8">
        <h3 className="text-xl font-bold text-gray-800 mb-6">Todas as nossas soluções</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {solutionsData.map((solution, index) => (
            <Link
              href={`/solucoes/${solution.title.toLowerCase().replace(/\s+/g, '-')}`}
              key={index}
              className="group flex items-start space-x-3 hover:bg-gray-50 p-2 rounded-lg transition-colors"
            >
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
              <div>
                <h4 className="font-medium text-gray-900 group-hover:text-red-600 transition-colors">
                  {solution.title}
                </h4>
                <p className="text-sm text-gray-600 mt-1">{solution.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
