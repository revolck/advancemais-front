import React from "react";

/**
 * Componente informativo para aulas ao vivo com Google Meet
 */
export function LiveClassInfo() {
  return (
    <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
      <div className="flex items-start gap-3">
        <div className="p-1.5 rounded-lg bg-blue-100 text-blue-600">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div className="flex-1">
          <p className="!text-sm !font-medium !text-blue-900 !mb-0">
            Aula ao vivo
          </p>
          <p className="!text-xs !text-blue-700 mt-1">
            O link do Google Meet será gerado automaticamente e enviado para a
            agenda dos alunos inscritos.
          </p>
        </div>
      </div>
    </div>
  );
}
