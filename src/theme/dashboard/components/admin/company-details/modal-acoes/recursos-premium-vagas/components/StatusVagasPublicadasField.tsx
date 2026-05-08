import { SelectCustom } from "@/components/ui/custom/select";
import { PREMIUM_REMOVE_STATUS_OPTIONS } from "../constants";
import type { PremiumResourcesStatusFieldProps } from "../types";

export function StatusVagasPublicadasField({
  novoStatus,
  isSubmitting,
  onChange,
}: PremiumResourcesStatusFieldProps) {
  return (
    <SelectCustom
      mode="single"
      label="Destino das vagas publicadas"
      required
      options={[...PREMIUM_REMOVE_STATUS_OPTIONS]}
      value={novoStatus}
      onChange={onChange}
      placeholder="Selecione o novo status"
      disabled={isSubmitting}
      size="sm"
      fullWidth
    />
  );
}
