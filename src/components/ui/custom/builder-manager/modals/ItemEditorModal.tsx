import React, { useMemo } from "react";
import {
  ModalCustom,
  ModalContentWrapper,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalTitle,
} from "@/components/ui/custom/modal";
import { ButtonCustom } from "@/components/ui/custom/button";
import { SelectCustom } from "@/components/ui/custom/select";
import { DatePickerRangeCustom } from "@/components/ui/custom/date-picker";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toastCustom } from "@/components/ui/custom";
import type { BuilderItem, BuilderModule } from "../types";
import { getItemTypeLabel } from "../config";
import {
  buildAulaTemplateOptions,
  buildAvaliacaoTemplateOptions,
} from "./itemEditorModal.utils";

interface ItemEditorModalProps {
  isOpen: boolean;
  item: BuilderItem | null;
  modules: BuilderModule[];
  standaloneItems?: BuilderItem[];
  modalidade?: "ONLINE" | "PRESENCIAL" | "LIVE" | "SEMIPRESENCIAL" | null;
  instructorOptions?: Array<{ value: string; label: string }>;
  minDate?: Date;
  maxDate?: Date;
  aulaTemplates?: Array<{
    id: string;
    codigo?: string;
    titulo: string;
    modalidade?: string;
    status?: string;
    instrutorId?: string | null;
    dataInicio?: string;
    dataFim?: string;
  }>;
  avaliacaoTemplates?: Array<{
    id: string;
    codigo?: string;
    titulo: string;
    tipo: "ATIVIDADE" | "PROVA";
    modalidade?: string;
    status?: string;
    instrutorId?: string | null;
    recuperacaoFinal?: boolean;
    dataInicio?: string;
    dataFim?: string;
  }>;
  onSave: (updates: Partial<BuilderItem>) => void;
  onClose: () => void;
}

function toDayStartMs(d?: Date | null): number | null {
  if (!d) return null;
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

function toDayEndMs(d?: Date | null): number | null {
  if (!d) return null;
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999).getTime();
}

function formatDatePtBr(iso?: string | null): string | null {
  if (!iso) return null;
  const dt = new Date(iso);
  if (Number.isNaN(dt.getTime())) return null;
  return dt.toLocaleDateString("pt-BR");
}

function parseIsoToDate(iso?: string | null): Date | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

function formatCapsLabel(value?: string | null): string | null {
  if (!value) return null;
  return String(value).replaceAll("_", " ").trim();
}

function normalizeModalidade(value?: string | null): string | null {
  if (!value) return null;
  const normalized = String(value)
    .toUpperCase()
    .replaceAll(" ", "_")
    .replaceAll("-", "_");
  if (normalized === "LIVE") return "AO_VIVO";
  if (normalized === "AO_VIVO") return "AO_VIVO";
  return normalized;
}

export function ItemEditorModal({
  isOpen,
  item,
  modules,
  standaloneItems = [],
  modalidade: _modalidade = null,
  instructorOptions = [],
  // Mantido por compatibilidade com BuilderManager (não usado aqui)
  minDate: _minDate,
  maxDate: _maxDate,
  aulaTemplates = [],
  avaliacaoTemplates = [],
  onSave,
  onClose,
}: ItemEditorModalProps) {
  const [title, setTitle] = React.useState("");
  const [templateId, setTemplateId] = React.useState<string | null>(null);
  const [instructorId, setInstructorId] = React.useState<string | null>(null);
  const [obrigatoria, setObrigatoria] = React.useState(true);
  const [recuperacaoFinal, setRecuperacaoFinal] = React.useState(false);
  const [startDate, setStartDate] = React.useState<Date | null>(null);
  const [endDate, setEndDate] = React.useState<Date | null>(null);
  const periodTouchedRef = React.useRef(false);

  React.useEffect(() => {
    if (!item) return;
    periodTouchedRef.current = false;
    setTitle(item.title || "");
    setTemplateId(item.templateId ?? null);
    setInstructorId(
      Array.isArray(item.instructorIds) && item.instructorIds.length > 0
        ? String(item.instructorIds[0])
        : item.instructorId
        ? String(item.instructorId)
        : null
    );
    setObrigatoria(item.obrigatoria ?? item.obrigatorio ?? true);
    setRecuperacaoFinal(Boolean(item.recuperacaoFinal ?? false));
    setStartDate(item.startDate ? new Date(item.startDate) : null);
    setEndDate(item.endDate ? new Date(item.endDate) : null);
  }, [item]);

  const usedTemplateIdsExcludingCurrent = useMemo(() => {
    if (!item?.id) return new Set<string>();
    const ids = new Set<string>();
    const allItems = [
      ...modules.flatMap((m) => m.items),
      ...(standaloneItems || []),
    ];
    allItems.forEach((it) => {
      if (it.id === item.id) return;
      if (!it.templateId) return;
      ids.add(it.templateId);
    });
    return ids;
  }, [modules, standaloneItems, item?.id]);

  const isModalidadeCompatible = useMemo(() => {
    const selected = normalizeModalidade(_modalidade);
    return (templateModalidade?: string | null) => {
      if (!selected) return true;
      const template = normalizeModalidade(templateModalidade);
      if (!template) return true;
      return template === selected;
    };
  }, [_modalidade]);

  const aulaTemplatesFiltered = useMemo(
    () => aulaTemplates.filter((t) => isModalidadeCompatible(t.modalidade)),
    [aulaTemplates, isModalidadeCompatible]
  );

  const avaliacaoTemplatesFiltered = useMemo(
    () => avaliacaoTemplates.filter((t) => isModalidadeCompatible(t.modalidade)),
    [avaliacaoTemplates, isModalidadeCompatible]
  );

  const selectedAula = useMemo(() => {
    if (item?.type !== "AULA" || !templateId) return null;
    return aulaTemplates.find((a) => a.id === templateId) || null;
  }, [aulaTemplates, item?.type, templateId]);

  const selectedAvaliacao = useMemo(() => {
    if (!templateId) return null;
    if (item?.type !== "ATIVIDADE" && item?.type !== "PROVA") return null;
    return avaliacaoTemplates.find((a) => a.id === templateId) || null;
  }, [avaliacaoTemplates, item?.type, templateId]);

  const isDuplicateTemplateSelection =
    !!templateId && usedTemplateIdsExcludingCurrent.has(templateId);

  const templatePeriod = useMemo(() => {
    if (!templateId || !item) return { start: null as Date | null, end: null as Date | null };
    if (item.type === "AULA") {
      const t = aulaTemplates.find((x) => x.id === templateId);
      return { start: parseIsoToDate(t?.dataInicio), end: parseIsoToDate(t?.dataFim) };
    }
    if (item.type === "ATIVIDADE" || item.type === "PROVA") {
      const t = avaliacaoTemplates.find((x) => x.id === templateId);
      return { start: parseIsoToDate(t?.dataInicio), end: parseIsoToDate(t?.dataFim) };
    }
    return { start: null, end: null };
  }, [avaliacaoTemplates, aulaTemplates, item, templateId]);

  // Se o item não tem período (ex.: dado legado), tenta pré-preencher com o período do template.
  React.useEffect(() => {
    if (!item || !templateId) return;
    if (periodTouchedRef.current) return;
    if (startDate || endDate) return;
    if (!templatePeriod.start || !templatePeriod.end) return;
    setStartDate(templatePeriod.start);
    setEndDate(templatePeriod.end);
  }, [
    endDate,
    item,
    startDate,
    templateId,
    templatePeriod.end,
    templatePeriod.start,
  ]);

  const periodError = useMemo(() => {
    const min = toDayStartMs(_minDate);
    const max = toDayEndMs(_maxDate);

    // Se a turma (ou módulo) não tem período, não valida aqui.
    if (min == null || max == null) return null;

    if (!startDate || !endDate) return "Informe o início e término do item.";

    const s = startDate.getTime();
    const e = endDate.getTime();

    if (s > e) return "A data final deve ser após a data inicial.";
    if (s < min || e > max) {
      const from = _minDate?.toLocaleDateString("pt-BR");
      const to = _maxDate?.toLocaleDateString("pt-BR");
      if (from && to) return `Escolha um período dentro de ${from} - ${to}.`;
      return "Escolha um período dentro do período permitido.";
    }

    return null;
  }, [_maxDate, _minDate, endDate, startDate]);

  const handleSave = () => {
    if (!item) return;

    if (!templateId) {
      toastCustom.error({
        title: "Seleção obrigatória",
        description:
          item.type === "AULA"
            ? "Selecione uma aula."
            : "Selecione uma avaliação (atividade/prova).",
      });
      return;
    }

    const templateTitle =
      item.type === "AULA"
        ? selectedAula?.titulo
        : selectedAvaliacao?.titulo;

    const safeTitle =
      (templateTitle || "").trim() ||
      (item.title || "").trim() ||
      (item.type === "PROVA"
        ? "Prova"
        : item.type === "ATIVIDADE"
        ? "Atividade"
        : "Aula");

    if (item.type === "AULA" && selectedAula) {
      if (!isModalidadeCompatible(selectedAula.modalidade)) {
        toastCustom.error({
          title: "Modalidade incompatível",
          description:
            "Aula incompatível com a modalidade da turma. Selecione outra aula.",
        });
        return;
      }
    }
    if (
      (item.type === "ATIVIDADE" || item.type === "PROVA") &&
      selectedAvaliacao
    ) {
      if (!isModalidadeCompatible(selectedAvaliacao.modalidade)) {
        toastCustom.error({
          title: "Modalidade incompatível",
          description:
            "Avaliação incompatível com a modalidade da turma. Selecione outra.",
        });
        return;
      }
    }

    if (isDuplicateTemplateSelection) {
      toastCustom.error({
        title: "Item duplicado",
        description:
          "Este item já foi selecionado em outro ponto da estrutura. Selecione outro.",
      });
      return;
    }

    if (periodError) {
      toastCustom.error({
        title: "Período inválido",
        description: periodError,
      });
      return;
    }

    onSave({
      title: safeTitle,
      templateId,
      startDate: startDate?.toISOString() || null,
      endDate: endDate?.toISOString() || null,
      instructorIds: instructorId ? [instructorId] : [],
      instructorId: instructorId || null,
      obrigatoria,
      obrigatorio: obrigatoria,
      ...(item.type === "PROVA" ? { recuperacaoFinal } : {}),
    });
    onClose();
  };

  if (!item) return null;

  const itemTypeLabel = getItemTypeLabel(item.type, true);
  const itemTypeLabelCapitalized = getItemTypeLabel(item.type, false);

  const templateHelperText = undefined;
  const allowedRangeLabel =
    _minDate && _maxDate
      ? `${_minDate.toLocaleDateString("pt-BR")} - ${_maxDate.toLocaleDateString("pt-BR")}`
      : null;

  const templateLabel =
    item.type === "AULA"
      ? "Aula"
      : item.type === "PROVA"
      ? "Prova"
      : "Atividade";

  const createLabel =
    item.type === "AULA"
      ? "Criar uma nova aula"
      : item.type === "PROVA"
      ? "Criar uma nova prova"
      : "Criar uma nova atividade";

  const createHref =
    item.type === "AULA"
      ? "/dashboard/cursos/aulas/cadastrar"
      : `/dashboard/cursos/atividades-provas/cadastrar?tipo=${item.type.toLowerCase()}`;

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
            <div className="flex items-center justify-between gap-3">
              <Label className="text-sm font-medium required">{templateLabel}</Label>
              <ButtonCustom
                variant="link"
                size="xs"
                withAnimation={false}
                asChild
                className="px-0"
              >
                <a
                  href={createHref}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {createLabel}
                </a>
              </ButtonCustom>
            </div>

            <SelectCustom
              label={undefined}
              required
              placeholder={
                item.type === "AULA"
                  ? "Selecionar aula"
                  : item.type === "PROVA"
                  ? "Selecionar prova"
                  : "Selecionar atividade"
              }
              options={
                item.type === "AULA"
                  ? buildAulaTemplateOptions(
                      aulaTemplatesFiltered,
                      usedTemplateIdsExcludingCurrent,
                      templateId
                    )
                  : buildAvaliacaoTemplateOptions(
                      avaliacaoTemplatesFiltered,
                      item.type,
                      usedTemplateIdsExcludingCurrent,
                      templateId
                    )
              }
              value={templateId}
              onChange={(id) => {
                setTemplateId(id);
                if (!id) return;
                const nextTitle =
                  item.type === "AULA"
                    ? aulaTemplates.find((a) => a.id === id)?.titulo
                    : avaliacaoTemplates.find((a) => a.id === id)?.titulo;
                if (nextTitle) setTitle(nextTitle);

                // Ao selecionar o template, tenta preencher o período com o período do template.
                periodTouchedRef.current = false;
                const templateStart =
                  item.type === "AULA"
                    ? parseIsoToDate(aulaTemplates.find((a) => a.id === id)?.dataInicio)
                    : parseIsoToDate(
                        avaliacaoTemplates.find((a) => a.id === id)?.dataInicio
                      );
                const templateEnd =
                  item.type === "AULA"
                    ? parseIsoToDate(aulaTemplates.find((a) => a.id === id)?.dataFim)
                    : parseIsoToDate(
                        avaliacaoTemplates.find((a) => a.id === id)?.dataFim
                      );

                if (templateStart && templateEnd) {
                  setStartDate(templateStart);
                  setEndDate(templateEnd);
                } else {
                  // Se o template não tem período, o usuário deve definir.
                  setStartDate(null);
                  setEndDate(null);
                }
              }}
              error={
                isDuplicateTemplateSelection
                  ? "Este item já está selecionado em outro ponto da estrutura."
                  : undefined
              }
              helperText={templateHelperText}
            />

            {item.type === "AULA" && selectedAula && (
              <div className="rounded-xl border border-border/60 bg-muted/5 p-4 text-sm text-muted-foreground">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
                  {selectedAula.modalidade && (
                    <div>
                      <span className="font-medium text-foreground">
                        Modalidade:
                      </span>{" "}
                      {formatCapsLabel(selectedAula.modalidade)}
                    </div>
                  )}
                  {selectedAula.status && (
                    <div>
                      <span className="font-medium text-foreground">Status:</span>{" "}
                      {formatCapsLabel(selectedAula.status)}
                    </div>
                  )}
                  {(selectedAula.dataInicio || selectedAula.dataFim) && (
                    <div className="sm:col-span-2">
                      <span className="font-medium text-foreground">
                        Período original:
                      </span>{" "}
                      {formatDatePtBr(selectedAula.dataInicio) ?? "—"} -{" "}
                      {formatDatePtBr(selectedAula.dataFim) ?? "—"}
                    </div>
                  )}
                </div>
              </div>
            )}

            {(item.type === "ATIVIDADE" || item.type === "PROVA") &&
              selectedAvaliacao && (
                <div className="rounded-xl border border-border/60 bg-muted/5 p-4 text-sm text-muted-foreground">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
                    {selectedAvaliacao.modalidade && (
                      <div>
                        <span className="font-medium text-foreground">
                          Modalidade:
                        </span>{" "}
                        {formatCapsLabel(selectedAvaliacao.modalidade)}
                      </div>
                    )}
                    {selectedAvaliacao.status && (
                      <div>
                        <span className="font-medium text-foreground">
                          Status:
                        </span>{" "}
                        {formatCapsLabel(selectedAvaliacao.status)}
                      </div>
                    )}
                    {(selectedAvaliacao.dataInicio || selectedAvaliacao.dataFim) && (
                      <div className="sm:col-span-2">
                        <span className="font-medium text-foreground">
                          Período original:
                        </span>{" "}
                        {formatDatePtBr(selectedAvaliacao.dataInicio) ?? "—"} -{" "}
                        {formatDatePtBr(selectedAvaliacao.dataFim) ?? "—"}
                      </div>
                    )}
                    {item.type === "PROVA" && (
                      <div className="sm:col-span-2">
                        <span className="font-medium text-foreground">
                          Recuperação final:
                        </span>{" "}
                        {selectedAvaliacao.recuperacaoFinal ? "Sim" : "Não"}
                      </div>
                    )}
                  </div>
                </div>
              )}

            <DatePickerRangeCustom
              label="Período"
              required
              size="md"
              value={{ from: startDate, to: endDate }}
              onChange={(range) => {
                periodTouchedRef.current = true;
                setStartDate(range.from || null);
                setEndDate(range.to || null);
              }}
              minDate={_minDate ?? new Date()}
              maxDate={_maxDate ?? undefined}
              clearable
              helperLabel="O período precisa ficar dentro do período da turma (ou do módulo, se definido)."
              helperText={
                allowedRangeLabel ? `Período permitido: ${allowedRangeLabel}` : undefined
              }
              error={periodError ?? undefined}
            />

            <div className="space-y-1">
              <SelectCustom
                label="Instrutor (opcional)"
                placeholder="Selecionar instrutor"
                value={instructorId}
                onChange={setInstructorId}
                options={instructorOptions.map((o) => ({
                  value: String(o.value),
                  label: o.label,
                }))}
                clearable
              />
            </div>

            {item.type === "PROVA" && (
              <div className="flex items-center gap-6 rounded-xl border border-border/60 bg-muted/5 p-4">
                <div className="flex flex-1 flex-col gap-1">
                  <Label
                    htmlFor="item-recuperacao-final"
                    className="text-sm font-medium cursor-pointer"
                  >
                    Recuperação final
                  </Label>
                  <span className="text-xs text-muted-foreground">
                    Define se esta prova é de recuperação final.
                  </span>
                </div>
                <Switch
                  id="item-recuperacao-final"
                  checked={recuperacaoFinal}
                  onCheckedChange={setRecuperacaoFinal}
                />
              </div>
            )}

            <div className="flex items-center gap-6 rounded-xl border border-border/60 bg-muted/5 p-4">
              <div className="flex flex-1 flex-col gap-1">
                <Label
                  htmlFor="item-obrigatoria"
                  className="text-sm font-medium cursor-pointer"
                >
                  {itemTypeLabelCapitalized} obrigatória
                </Label>
                <span className="text-xs text-muted-foreground">
                  Define se esta {itemTypeLabel} é obrigatória para a conclusão.
                </span>
              </div>
              <Switch
                id="item-obrigatoria"
                checked={obrigatoria}
                onCheckedChange={setObrigatoria}
              />
            </div>
          </div>
        </ModalBody>

        <ModalFooter className="flex justify-end gap-2">
          <ButtonCustom variant="outline" onClick={onClose} type="button">
            Cancelar
          </ButtonCustom>
          <ButtonCustom
            variant="primary"
            onClick={handleSave}
            type="button"
            disabled={
              !templateId ||
              isDuplicateTemplateSelection ||
              !!periodError ||
              !startDate ||
              !endDate
            }
          >
            Salvar
          </ButtonCustom>
        </ModalFooter>
      </ModalContentWrapper>
    </ModalCustom>
  );
}
