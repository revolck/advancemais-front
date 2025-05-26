import React from "react";

export const SliderSkeleton: React.FC = () => {
  return (
    <div className="relative w-full overflow-hidden bg-gray-200 dark:bg-gray-700 animate-pulse">
      <div className="h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] bg-gray-300 dark:bg-gray-600" />

      {/* Skeleton dos controles */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2">
        <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-400 rounded-full" />
      </div>

      <div className="absolute right-4 top-1/2 -translate-y-1/2">
        <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-400 rounded-full" />
      </div>

      {/* Skeleton dos dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
        <div className="flex space-x-2">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 md:w-3 md:h-3 bg-gray-400 rounded-full"
            />
          ))}
        </div>
      </div>
    </div>
  );
};
