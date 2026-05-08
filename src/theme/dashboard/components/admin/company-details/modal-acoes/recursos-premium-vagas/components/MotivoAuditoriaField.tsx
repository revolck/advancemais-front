import { SimpleTextarea } from "@/components/ui/custom/text-area";
import type { PremiumResourcesReasonFieldProps } from "../types";

export function MotivoAuditoriaField({
  motivo,
  isSubmitting,
  onChange,
}: PremiumResourcesReasonFieldProps) {
  return (
    <SimpleTextarea
      label="Motivo"
      required
      value={motivo}
      maxLength={250}
      showCharCount
      onChange={(event) => onChange(event.target.value.slice(0, 250))}
      disabled={isSubmitting}
      placeholder="Informe o motivo para auditoria administrativa."
      className="min-h-[110px] resize-none"
    />
  );
}
