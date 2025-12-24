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
import { InputCustom } from "@/components/ui/custom/input";
import { DatePickerRangeCustom } from "@/components/ui/custom/date-picker";
import { MultiSelectFilter } from "@/components/ui/custom/filters/MultiSelectFilter";
import { SelectCustom } from "@/components/ui/custom/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toastCustom } from "@/components/ui/custom";
import { MOCK_AULAS, MOCK_ATIVIDADES_PROVAS } from "@/mockData";
import type { BuilderItem, BuilderModule } from "../types";
import { getItemTypeLabel } from "../config";

interface ItemEditorModalProps {
  isOpen: boolean;
  item: BuilderItem | null;
  modules: BuilderModule[];
  standaloneItems?: BuilderItem[];
  modalidade?: "ONLINE" | "PRESENCIAL" | "LIVE" | "SEMIPRESENCIAL" | null;
  instructorOptions?: Array<{ value: string; label: string }>;
  minDate?: Date;
  maxDate?: Date;
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
  standaloneItems = [],
  modalidade = null,
  instructorOptions = [],
  minDate,
  maxDate,
  onSave,
  onClose,
}: ItemEditorModalProps) {
  const [title, setTitle] = React.useState("");
  const [startDate, setStartDate] = React.useState<Date | null>(null);
  const [endDate, setEndDate] = React.useState<Date | null>(null);
  const [instructorId, setInstructorId] = React.useState<string | null>(null);
  const [obrigatorio, setObrigatorio] = React.useState(true);
  const [aulaId, setAulaId] = React.useState<string | null>(null);
  const [platformActivityId, setPlatformActivityId] = React.useState<
    string | null
  >(null);

  // Sincroniza estado local com o item recebido
  React.useEffect(() => {
    if (item) {
      if (item.type === "AULA") {
        setStartDate(null);
        setEndDate(null);
        const nextAulaId = item.aulaId ?? null;
        setAulaId(nextAulaId);
        const selected = nextAulaId
          ? MOCK_AULAS.find((a) => a.id === nextAulaId)
          : null;
        setTitle(selected?.titulo || item.title || "");
      } else {
        setTitle(item.title || "");
        setStartDate(item.startDate ? new Date(item.startDate) : null);
        setEndDate(item.endDate ? new Date(item.endDate) : null);
        setAulaId(item.aulaId ?? null);
      }
      setInstructorId(item.instructorId || null);
      setObrigatorio(item.obrigatorio ?? true);
      setPlatformActivityId(item.platformActivityId || null);
    }
  }, [item]);

  const allowedAulas = useMemo(() => {
    if (!modalidade) return MOCK_AULAS;
    return MOCK_AULAS.filter((a) => a.modalidade === modalidade);
  }, [modalidade]);

  const usedAulaIdsExcludingCurrent = useMemo(() => {
    if (!item?.id) return new Set<string>();
    const ids = new Set<string>();
    const allItems = [
      ...modules.flatMap((m) => m.items),
      ...(standaloneItems || []),
    ];
    allItems.forEach((it) => {
      if (it.id === item.id) return;
      if (it.type !== "AULA") return;
      if (!it.aulaId) return;
      ids.add(it.aulaId);
    });
    return ids;
  }, [modules, standaloneItems, item?.id]);

  const isDuplicateAulaSelection =
    item?.type === "AULA" && !!aulaId && usedAulaIdsExcludingCurrent.has(aulaId);

  const allowedAvaliacoes = useMemo(() => {
    let base = MOCK_ATIVIDADES_PROVAS;
    if (modalidade) base = base.filter((x) => x.modalidade === modalidade);
    const min = minDate ? new Date(minDate).setHours(0, 0, 0, 0) : null;
    const max = maxDate ? new Date(maxDate).setHours(23, 59, 59, 999) : null;
    if (min != null && max != null) {
      base = base.filter((x) => {
        const s = new Date(x.inicio).getTime();
        const e = new Date(x.fim).getTime();
        return s >= min && e <= max;
      });
    }
    return base;
  }, [modalidade, minDate, maxDate]);

  const selectedAula =
    item?.type === "AULA" ? MOCK_AULAS.find((a) => a.id === aulaId) : null;
  const selectedAvaliacao =
    item?.type === "ATIVIDADE" || item?.type === "PROVA"
      ? MOCK_ATIVIDADES_PROVAS.find((x) => x.id === platformActivityId)
      : null;
  const isSelectedAulaCompatible =
    !modalidade || !selectedAula ? true : selectedAula.modalidade === modalidade;

  React.useEffect(() => {
    if (!item || item.type !== "AULA") return;
    if (!aulaId) return;
    if (isSelectedAulaCompatible) return;

    setAulaId(null);
    setTitle(item.title || "");
    toastCustom.error({
      title: "Aula incompatível",
      description:
        "A aula selecionada não corresponde à modalidade escolhida para a turma. Selecione uma aula compatível.",
    });
  }, [aulaId, isSelectedAulaCompatible, item, modalidade]);

  React.useEffect(() => {
    if (!item || (item.type !== "ATIVIDADE" && item.type !== "PROVA")) return;
    if (!platformActivityId) return;

    const next = MOCK_ATIVIDADES_PROVAS.find((x) => x.id === platformActivityId);
    if (!next) return;

    if (modalidade && next.modalidade !== modalidade) {
      setPlatformActivityId(null);
      setTitle(item.title || "");
      toastCustom.error({
        title: "Seleção incompatível",
        description:
          "O item selecionado não corresponde à modalidade escolhida para a turma.",
      });
      return;
    }

    const min = minDate ? new Date(minDate).setHours(0, 0, 0, 0) : null;
    const max = maxDate ? new Date(maxDate).setHours(23, 59, 59, 999) : null;
    if (min != null && max != null) {
      const s = new Date(next.inicio).getTime();
      const e = new Date(next.fim).getTime();
      if (s < min || e > max) {
        setPlatformActivityId(null);
        setTitle(item.title || "");
        toastCustom.error({
          title: "Período inválido",
          description:
            "O período da prova/atividade deve estar dentro do período do módulo.",
        });
      }
    }
  }, [platformActivityId, item, modalidade, minDate, maxDate]);

  const handleSave = () => {
    if (!item) return;

    if (item.type === "AULA") {
      if (!aulaId) {
        toastCustom.error({
          title: "Aula obrigatória",
          description: "Selecione uma aula cadastrada.",
        });
        return;
      }
      if (usedAulaIdsExcludingCurrent.has(aulaId)) {
        toastCustom.error({
          title: "Aula duplicada",
          description:
            "Esta aula já foi selecionada em outro item. Selecione uma aula diferente.",
        });
        return;
      }
      if (!isSelectedAulaCompatible) {
        toastCustom.error({
          title: "Aula incompatível",
          description:
            "A aula selecionada não corresponde à modalidade escolhida para a turma.",
        });
        return;
      }
    } else if (item.type === "ATIVIDADE" || item.type === "PROVA") {
      if (!platformActivityId) {
        toastCustom.error({
          title: "Seleção obrigatória",
          description: `Selecione uma ${
            item.type === "PROVA" ? "prova" : "atividade"
          } cadastrada.`,
        });
        return;
      }
    } else {
      const start = startDate?.getTime() ?? null;
      const end = endDate?.getTime() ?? null;
      const min = minDate ? new Date(minDate).setHours(0, 0, 0, 0) : null;
      const max = maxDate ? new Date(maxDate).setHours(23, 59, 59, 999) : null;

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
          description: "O período deve estar dentro do período do módulo.",
        });
        return;
      }
      if (max != null && end != null && end > max) {
        toastCustom.error({
          title: "Período inválido",
          description: "O período deve estar dentro do período do módulo.",
        });
        return;
      }
    }

    onSave({
      title,
      aulaId: item.type === "AULA" ? aulaId : undefined,
      startDate:
        item.type === "AULA"
          ? null
          : item.type === "ATIVIDADE" || item.type === "PROVA"
          ? selectedAvaliacao?.inicio ?? null
          : startDate?.toISOString() || null,
      endDate:
        item.type === "AULA"
          ? null
          : item.type === "ATIVIDADE" || item.type === "PROVA"
          ? selectedAvaliacao?.fim ?? null
          : endDate?.toISOString() || null,
      instructorId,
      obrigatorio,
      platformActivityId,
    } as Partial<BuilderItem>);
    onClose();
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
            {item.type === "AULA" ? (
              <div className="space-y-1">
                <SelectCustom
                  label="Aula cadastrada"
                  required
                  placeholder="Selecionar aula"
                  options={allowedAulas.map((a) => ({
                    value: a.id,
                    label:
                      usedAulaIdsExcludingCurrent.has(a.id) && a.id !== aulaId
                        ? `${a.codigo} • ${a.titulo} (já selecionada)`
                        : `${a.codigo} • ${a.titulo}`,
                    disabled:
                      usedAulaIdsExcludingCurrent.has(a.id) && a.id !== aulaId,
                  }))}
                  value={aulaId}
                  onChange={(id) => {
                    if (id && usedAulaIdsExcludingCurrent.has(id)) {
                      toastCustom.error({
                        title: "Aula duplicada",
                        description:
                          "Esta aula já foi selecionada em outro item. Selecione uma aula diferente.",
                      });
                      return;
                    }
                    setAulaId(id);
                    const selected = MOCK_AULAS.find((a) => a.id === id);
                    if (selected) setTitle(selected.titulo);
                  }}
                  error={
                    isDuplicateAulaSelection
                      ? "Esta aula já está selecionada em outro item."
                      : undefined
                  }
                  helperText={
                    modalidade
                      ? `Mostrando apenas aulas da modalidade ${modalidade}`
                      : undefined
                  }
                />
                <div className="flex items-center justify-end">
                  <ButtonCustom
                    variant="link"
                    size="xs"
                    withAnimation={false}
                    asChild
                    className="px-0"
                  >
                    <a
                      href="/dashboard/cursos/aulas/cadastrar"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Criar nova aula
                    </a>
                  </ButtonCustom>
                </div>
              </div>
            ) : item.type === "ATIVIDADE" || item.type === "PROVA" ? (
              <div className="space-y-1">
                <SelectCustom
                  label={
                    item.type === "PROVA"
                      ? "Prova cadastrada"
                      : "Atividade cadastrada"
                  }
                  required
                  placeholder={
                    item.type === "PROVA"
                      ? "Selecionar prova"
                      : "Selecionar atividade"
                  }
                  options={allowedAvaliacoes
                    .filter((x) => x.tipo === item.type)
                    .map((x) => ({
                      value: x.id,
                      label: `${x.codigo} • ${x.titulo}`,
                    }))}
                  value={platformActivityId}
                  onChange={(id) => {
                    setPlatformActivityId(id);
                    const selected = MOCK_ATIVIDADES_PROVAS.find(
                      (x) => x.id === id
                    );
                    if (selected) setTitle(selected.titulo);
                  }}
                  helperText={
                    modalidade
                      ? `Mostrando apenas ${
                          item.type === "PROVA" ? "provas" : "atividades"
                        } da modalidade ${modalidade}`
                      : undefined
                  }
                />
                <div className="flex items-center justify-end">
                  <ButtonCustom
                    variant="link"
                    size="xs"
                    withAnimation={false}
                    asChild
                    className="px-0"
                  >
                    <a
                      href={`/dashboard/cursos/atividades-provas/cadastrar?tipo=${item.type.toLowerCase()}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Criar nova {item.type === "PROVA" ? "prova" : "atividade"}
                    </a>
                  </ButtonCustom>
                </div>
              </div>
            ) : (
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
            )}

            {item.type === "AULA" && selectedAula && (
              <div className="rounded-xl border border-border/60 bg-muted/5 p-4 text-sm text-muted-foreground">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                  <span>
                    <span className="font-medium text-foreground">Modalidade:</span>{" "}
                    {selectedAula.modalidade}
                  </span>
                  <span>
                    <span className="font-medium text-foreground">Duração:</span>{" "}
                    {selectedAula.duracaoMinutos} min
                  </span>
                  <span>
                    <span className="font-medium text-foreground">Status:</span>{" "}
                    {selectedAula.status}
                  </span>
                </div>
              </div>
            )}

            {(item.type === "ATIVIDADE" || item.type === "PROVA") &&
              selectedAvaliacao && (
                <div className="rounded-xl border border-border/60 bg-muted/5 p-4 text-sm text-muted-foreground">
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                    <span>
                      <span className="font-medium text-foreground">Modalidade:</span>{" "}
                      {selectedAvaliacao.modalidade}
                    </span>
                    <span>
                      <span className="font-medium text-foreground">Período:</span>{" "}
                      {new Date(selectedAvaliacao.inicio).toLocaleDateString("pt-BR")}{" "}
                      - {new Date(selectedAvaliacao.fim).toLocaleDateString("pt-BR")}
                    </span>
                    <span>
                      <span className="font-medium text-foreground">Status:</span>{" "}
                      {selectedAvaliacao.status}
                    </span>
                  </div>
                </div>
              )}

            {item.type !== "AULA" &&
              item.type !== "ATIVIDADE" &&
              item.type !== "PROVA" && (
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
                minDate={minDate ?? new Date()}
                maxDate={maxDate}
                clearable
              />
            )}

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

            {/* AULA é selecionada do cadastro de aulas; links/plataforma são definidos lá */}

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
              disabled={!title.trim() || isDuplicateAulaSelection}
            >
              Salvar
            </ButtonCustom>
          </div>
        </ModalFooter>
      </ModalContentWrapper>
    </ModalCustom>
  );
}
