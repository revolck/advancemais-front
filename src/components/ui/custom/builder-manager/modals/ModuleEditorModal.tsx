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
import { Label } from "@/components/ui/label";
import type { BuilderModule } from "../types";
import { PLACEHOLDERS } from "../config";

interface ModuleEditorModalProps {
  isOpen: boolean;
  module: BuilderModule | null;
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
  onSave,
  onClose,
}: ModuleEditorModalProps) {
  const [title, setTitle] = React.useState("");

  // Sincroniza estado local com o módulo recebido
  React.useEffect(() => {
    if (module) {
      setTitle(module.title || "");
    }
  }, [module]);

  const handleSave = () => {
    onSave({
      title,
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
            <InputCustom
              label="Título"
              required
              value={title}
              error={!title?.trim() ? "Obrigatório" : undefined}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={PLACEHOLDERS.MODULE_TITLE}
            />
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
