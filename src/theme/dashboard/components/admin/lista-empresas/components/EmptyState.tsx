import React from "react";
import { Building2 } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ title, description }) => {
  return (
    <div className="text-center py-12">
      <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" aria-hidden="true" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500">{description}</p>
    </div>
  );
};
