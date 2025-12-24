import React from "react";
import {
  ModalCustom,
  ModalContentWrapper,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalTitle,
} from "@/components/ui/custom/modal";
import { ButtonCustom } from "@/components/ui/custom/button";
import { InputCustom } from "@/components/ui/custom/input";
import { DatePickerRangeCustom } from "@/components/ui/custom/date-picker";
import { MultiSelectFilter } from "@/components/ui/custom/filters/MultiSelectFilter";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toastCustom } from "@/components/ui/custom";
import type { BuilderModule } from "../types";
import { PLACEHOLDERS } from "../config";

interface ModuleEditorModalProps {
  isOpen: boolean;
  module: BuilderModule | null;
  instructorOptions?: Array<{ value: string; label: string }>;
  minDate?: Date;
  maxDate?: Date;
  existingModules?: BuilderModule[];
  onSave: (updates: Partial<BuilderModule>) => void;
  onClose: () => void;
}

/**
 * Modal reutilizável para edição de módulos
 * Pode ser usado em qualquer contexto que precise editar módulos de cursos
 */
export function ModuleEditorModal({
  isOpen,
  module,
  instructorOptions = [],
  minDate,
  maxDate,
  existingModules = [],
  onSave,
  onClose,
}: ModuleEditorModalProps) {
  const [title, setTitle] = React.useState("");
  const [startDate, setStartDate] = React.useState<Date | null>(null);
  const [endDate, setEndDate] = React.useState<Date | null>(null);
  const [instructorIds, setInstructorIds] = React.useState<string[]>([]);
  const [obrigatorio, setObrigatorio] = React.useState(true);

  // Sincroniza estado local com o módulo recebido
  React.useEffect(() => {
    if (module) {
      setTitle(module.title || "");
      setStartDate(module.startDate ? new Date(module.startDate) : null);
      setEndDate(module.endDate ? new Date(module.endDate) : null);
      setInstructorIds(module.instructorIds || []);
      setObrigatorio(module.obrigatorio ?? true);
    }
  }, [module]);

  const handleSave = () => {
    const start = startDate?.getTime() ?? null;
    const end = endDate?.getTime() ?? null;
    const min = minDate ? new Date(minDate).setHours(0, 0, 0, 0) : null;
    const max = maxDate ? new Date(maxDate).setHours(23, 59, 59, 999) : null;

    if (start == null || end == null) {
      toastCustom.error({
        title: "Período obrigatório",
        description: "Informe o início e término do módulo.",
      });
      return;
    }

    if (start != null && end != null && start > end) {
      toastCustom.error({
        title: "Período inválido",
        description: "A data final deve ser após a data inicial.",
      });
      return;
    }
    if (min != null && start != null && start < min) {
      toastCustom.error({
        title: "Período inválido",
        description: "O período do módulo deve estar dentro do período da turma.",
      });
      return;
    }
    if (max != null && end != null && end > max) {
      toastCustom.error({
        title: "Período inválido",
        description: "O período do módulo deve estar dentro do período da turma.",
      });
      return;
    }

    const conflictingModule = existingModules.find((m) => {
      if (!m || m.id === module?.id) return false;
      if (!m.startDate || !m.endDate) return false;
      const ms = new Date(m.startDate).getTime();
      const me = new Date(m.endDate).getTime();
      // Não permite períodos sobrepostos (encostar na borda é permitido)
      return start < me && end > ms;
    });

    if (conflictingModule) {
      const conflictStart = new Date(conflictingModule.startDate!).toLocaleDateString(
        "pt-BR"
      );
      const conflictEnd = new Date(conflictingModule.endDate!).toLocaleDateString(
        "pt-BR"
      );
      toastCustom.error({
        title: "Conflito de período",
        description: `O período do módulo conflita com "${
          conflictingModule.title || "Módulo"
        }" (${conflictStart} - ${conflictEnd}). Escolha um período após ${conflictEnd} ou antes de ${conflictStart}.`,
      });
      return;
    }

    onSave({
      title,
      startDate: startDate?.toISOString() || null,
      endDate: endDate?.toISOString() || null,
      instructorIds,
      obrigatorio,
    });
    onClose();
  };

  if (!module) return null;

  return (
    <ModalCustom
      isOpen={isOpen}
      onOpenChange={onClose}
      size="lg"
      backdrop="blur"
      scrollBehavior="inside"
    >
      <ModalContentWrapper>
        <ModalHeader>
          <ModalTitle>Editar módulo</ModalTitle>
        </ModalHeader>

        <ModalBody className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-6 rounded-xl border border-border/60 bg-muted/5 p-4">
              <div className="flex flex-1 flex-col gap-1">
                <Label
                  htmlFor="mod-obrigatorio"
                  className="text-sm font-medium cursor-pointer"
                >
                  Módulo obrigatório
                </Label>
                <span className="text-xs text-muted-foreground">
                  Define se este módulo é obrigatório para a conclusão do curso.
                </span>
              </div>
              <Switch
                id="mod-obrigatorio"
                checked={obrigatorio}
                onCheckedChange={setObrigatorio}
                className="cursor-pointer"
              />
            </div>

            <InputCustom
              label="Título"
              required
              value={title}
              error={!title?.trim() ? "Obrigatório" : undefined}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={PLACEHOLDERS.MODULE_TITLE}
            />

            <DatePickerRangeCustom
              label="Período"
              required
              size="md"
              value={{
                from: startDate,
                to: endDate,
              }}
              onChange={(range) => {
                setStartDate(range.from || null);
                setEndDate(range.to || null);
              }}
              minDate={minDate ?? new Date()}
              maxDate={maxDate}
              clearable
            />

            <div className="space-y-1">
              <Label className="text-sm font-medium">Instrutores</Label>
              <MultiSelectFilter
                title="Instrutores"
                placeholder="Selecionar instrutores"
                options={instructorOptions.map((o) => ({
                  value: String(o.value),
                  label: o.label,
                }))}
                selectedValues={instructorIds.map(String)}
                onSelectionChange={setInstructorIds}
                showApplyButton
              />
            </div>
          </div>
        </ModalBody>

        <ModalFooter>
          <div className="flex items-center justify-end gap-2 w-full">
            <ButtonCustom variant="outline" size="md" onClick={onClose}>
              Cancelar
            </ButtonCustom>
            <ButtonCustom
              variant="primary"
              size="md"
              onClick={handleSave}
              disabled={!title.trim()}
            >
              Salvar
            </ButtonCustom>
          </div>
        </ModalFooter>
      </ModalContentWrapper>
    </ModalCustom>
  );
}
