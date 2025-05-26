import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

interface SliderErrorProps {
  message?: string;
  onRetry?: () => void;
}

export const SliderError: React.FC<SliderErrorProps> = ({
  message = "Erro ao carregar banners",
  onRetry,
}) => {
  return (
    <div
      className="relative w-full h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] 
                    bg-gray-100 dark:bg-gray-800 flex flex-col items-center justify-center"
    >
      <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
        {message}
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-4 text-center max-w-md">
        Não foi possível carregar os banners. Verifique sua conexão e tente
        novamente.
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 
                     text-white px-4 py-2 rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Tentar Novamente</span>
        </button>
      )}
    </div>
  );
};
