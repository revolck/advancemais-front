import React from "react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="text-6xl font-bold text-gray-300">
          404
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Página não encontrada
          </h2>
          <p className="text-gray-600">
            A página que você está procurando não existe ou foi movida.
          </p>
        </div>

        <Link
          href="/"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
        >
          Voltar ao Início
        </Link>
      </div>
    </div>
  );
}
