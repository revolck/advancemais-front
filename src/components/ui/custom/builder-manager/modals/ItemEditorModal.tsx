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
import { SelectCustom } from "@/components/ui/custom/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ModalidadeFields } from "../components";
import type { BuilderItem, BuilderModule } from "../types";
import {
  MOCK_ACTIVITIES,
  MOCK_EXAMS,
  getItemTypeLabel,
  PLACEHOLDERS,
} from "../config";

interface ItemEditorModalProps {
  isOpen: boolean;
  item: BuilderItem | null;
  modules: BuilderModule[];
  modalidade?: "ONLINE" | "PRESENCIAL" | "LIVE" | "SEMIPRESENCIAL" | null;
  instructorOptions?: Array<{ value: string; label: string }>;
  onSave: (updates: Partial<BuilderItem>) => void;
  onClose: () => void;
}

/**
 * Modal reutilizável para edição de itens (aula, prova, atividade)
 * Pode ser usado em qualquer contexto que precise editar itens de currículo
 */
export function ItemEditorModal({
  isOpen,
  item,
  modules,
  modalidade = null,
  instructorOptions = [],
  onSave,
  onClose,
}: ItemEditorModalProps) {
  const [title, setTitle] = React.useState("");
  const [startDate, setStartDate] = React.useState<Date | null>(null);
  const [endDate, setEndDate] = React.useState<Date | null>(null);
  const [instructorId, setInstructorId] = React.useState<string | null>(null);
  const [obrigatorio, setObrigatorio] = React.useState(true);
  const [platformActivityId, setPlatformActivityId] = React.useState<
    string | null
  >(null);
  const [youtubeUrl, setYoutubeUrl] = React.useState<string | null>(null);
  const [meetUrl, setMeetUrl] = React.useState<string | null>(null);
  const [tipoLinkSemiPresencial, setTipoLinkSemiPresencial] = React.useState<
    "MEET" | "YOUTUBE" | null
  >(null);

  // Sincroniza estado local com o item recebido
  React.useEffect(() => {
    if (item) {
      setTitle(item.title || "");
      setStartDate(item.startDate ? new Date(item.startDate) : null);
      setEndDate(item.endDate ? new Date(item.endDate) : null);
      setInstructorId(item.instructorId || null);
      setObrigatorio(item.obrigatorio ?? true);
      setPlatformActivityId(item.platformActivityId || null);
      setYoutubeUrl(item.youtubeUrl || null);
      setMeetUrl(item.meetUrl || null);
      setTipoLinkSemiPresencial(item.tipoLinkSemiPresencial || null);
    }
  }, [item]);

  const handleSave = () => {
    onSave({
      title,
      startDate: startDate?.toISOString() || null,
      endDate: endDate?.toISOString() || null,
      instructorId,
      obrigatorio,
      platformActivityId,
      youtubeUrl,
      meetUrl,
      tipoLinkSemiPresencial,
    });
    onClose();
  };

  const handleModalidadeUpdate = (updates: Partial<BuilderItem>) => {
    if (updates.youtubeUrl !== undefined) setYoutubeUrl(updates.youtubeUrl);
    if (updates.meetUrl !== undefined) setMeetUrl(updates.meetUrl);
    if (updates.tipoLinkSemiPresencial !== undefined) {
      setTipoLinkSemiPresencial(updates.tipoLinkSemiPresencial);
    }
  };

  if (!item) return null;

  const itemTypeLabel = getItemTypeLabel(item.type, true);
  const itemTypeLabelCapitalized = getItemTypeLabel(item.type, false);

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
          <ModalTitle>Editar {itemTypeLabel}</ModalTitle>
        </ModalHeader>

        <ModalBody className="space-y-6">
          <div className="space-y-4">
            <InputCustom
              label="Título"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={`Ex: ${
                itemTypeLabel === "aula"
                  ? "Introdução ao tema"
                  : `${itemTypeLabelCapitalized} do módulo`
              }`}
            />

            {item.type === "ATIVIDADE" && (
              <SelectCustom
                label="Atividade da plataforma"
                required
                placeholder={PLACEHOLDERS.SELECT_ACTIVITY}
                options={MOCK_ACTIVITIES}
                value={platformActivityId}
                onChange={setPlatformActivityId}
              />
            )}

            {item.type === "PROVA" && (
              <SelectCustom
                label="Prova da plataforma"
                required
                placeholder={PLACEHOLDERS.SELECT_EXAM}
                options={MOCK_EXAMS}
                value={platformActivityId}
                onChange={setPlatformActivityId}
              />
            )}

            <DatePickerRangeCustom
              label="Período"
              size="md"
              value={{
                from: startDate,
                to: endDate,
              }}
              onChange={(range) => {
                setStartDate(range.from || null);
                setEndDate(range.to || null);
              }}
              minDate={new Date()}
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
                selectedValues={instructorId ? [String(instructorId)] : []}
                onSelectionChange={(ids) => {
                  setInstructorId(ids.length > 0 ? ids[0] : null);
                }}
                showApplyButton
              />
            </div>

            {item.type === "AULA" && (
              <ModalidadeFields
                modalidade={modalidade}
                item={{
                  ...item,
                  youtubeUrl,
                  meetUrl,
                  tipoLinkSemiPresencial,
                }}
                modules={modules}
                onUpdate={handleModalidadeUpdate}
              />
            )}

            <div className="flex items-center gap-6 rounded-xl border border-border/60 bg-muted/5 p-4">
              <div className="flex flex-1 flex-col gap-1">
                <Label
                  htmlFor="item-obrigatorio"
                  className="text-sm font-medium cursor-pointer"
                >
                  {itemTypeLabelCapitalized} obrigatória
                </Label>
                <span className="text-xs text-muted-foreground">
                  Define se esta {itemTypeLabel} é obrigatória para a conclusão
                  do curso.
                </span>
              </div>
              <Switch
                id="item-obrigatorio"
                checked={obrigatorio}
                onCheckedChange={setObrigatorio}
                className="cursor-pointer"
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
