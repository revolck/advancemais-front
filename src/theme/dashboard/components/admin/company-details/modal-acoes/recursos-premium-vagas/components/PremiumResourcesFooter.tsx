import { ButtonCustom } from "@/components/ui/custom/button";
import type { PremiumResourcesFooterProps } from "../types";

export function PremiumResourcesFooter({
  isActive,
  isSubmitting,
  onCancel,
  onConfirm,
}: PremiumResourcesFooterProps) {
  return (
    <div className="flex w-full justify-end gap-3">
      <ButtonCustom
        variant="outline"
        size="md"
        onClick={onCancel}
        disabled={isSubmitting}
      >
        Cancelar
      </ButtonCustom>
      <ButtonCustom
        variant={isActive ? "danger" : "primary"}
        size="md"
        onClick={onConfirm}
        isLoading={isSubmitting}
        loadingText={isActive ? "Removendo..." : "Aplicando..."}
        disabled={isSubmitting}
      >
        {isActive ? "Sim, remover premium" : "Sim, aplicar premium"}
      </ButtonCustom>
    </div>
  );
}
