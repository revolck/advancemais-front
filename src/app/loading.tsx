import { SimpleLoader } from "@/components/ui/custom/loader";

/**
 * Loading page global da aplicação
 * Usa SimpleLoader para evitar problemas de SSR
 */
export default function Loading() {
  return (
    <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
      <SimpleLoader />
    </div>
  );
}
