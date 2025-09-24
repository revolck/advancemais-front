"use client";

import {
  ModalCustom,
  ModalContentWrapper,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalTitle,
  ModalDescription,
} from "@/components/ui/custom/modal";
import { ButtonCustom } from "@/components/ui/custom/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { AdminCompanyVagaItem } from "@/api/empresas/admin/types";
import { toDateInputValue } from "../utils";

interface EditVacancyModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  vacancy: AdminCompanyVagaItem | null;
  onSave?: (vacancy: AdminCompanyVagaItem) => void;
}

export function EditVacancyModal({
  isOpen,
  onOpenChange,
  vacancy,
  onSave,
}: EditVacancyModalProps) {
  const editVacancyTitle = vacancy ? vacancy.titulo ?? "" : "";
  const editVacancyCode = vacancy ? vacancy.codigo ?? vacancy.id : "";
  const editVacancyInscricoes = "";

  const handleClose = () => {
    onOpenChange(false);
  };

  const handleSave = () => {
    if (vacancy) {
      onSave?.(vacancy);
    }
  };

  return (
    <ModalCustom
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="2xl"
      backdrop="blur"
      scrollBehavior="inside"
    >
      <ModalContentWrapper key={vacancy?.id ?? "nova"}>
        {vacancy ? (
          <>
            <ModalHeader className="space-y-1">
              <ModalTitle>Editar vaga</ModalTitle>
              <ModalDescription>
                {editVacancyCode ? `Código: ${editVacancyCode}` : undefined}
              </ModalDescription>
            </ModalHeader>
            <ModalBody className="max-h-[65vh] pr-1">
              <form
                className="space-y-6"
                onSubmit={(event) => event.preventDefault()}
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor={`vacancy-title-${vacancy.id}`}>
                      Nome da vaga
                    </Label>
                    <Input
                      id={`vacancy-title-${vacancy.id}`}
                      defaultValue={editVacancyTitle}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor={`vacancy-code-${vacancy.id}`}>Código</Label>
                    <Input
                      id={`vacancy-code-${vacancy.id}`}
                      defaultValue={editVacancyCode}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor={`vacancy-modalidade-${vacancy.id}`}>
                      Modalidade
                    </Label>
                    <Input
                      id={`vacancy-modalidade-${vacancy.id}`}
                      defaultValue=""
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor={`vacancy-regime-${vacancy.id}`}>
                      Regime de trabalho
                    </Label>
                    <Input
                      id={`vacancy-regime-${vacancy.id}`}
                      defaultValue=""
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor={`vacancy-carga-${vacancy.id}`}>
                      Carga horária
                    </Label>
                    <Input id={`vacancy-carga-${vacancy.id}`} defaultValue="" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor={`vacancy-inscricoes-${vacancy.id}`}>
                      Inscrições até
                    </Label>
                    <Input
                      id={`vacancy-inscricoes-${vacancy.id}`}
                      type="date"
                      defaultValue=""
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor={`vacancy-descricao-${vacancy.id}`}>
                    Descrição
                  </Label>
                  <Textarea
                    id={`vacancy-descricao-${vacancy.id}`}
                    className="min-h-[120px] resize-y"
                    defaultValue=""
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor={`vacancy-atividades-${vacancy.id}`}>
                      Atividades
                    </Label>
                    <Textarea
                      id={`vacancy-atividades-${vacancy.id}`}
                      className="min-h-[100px] resize-y"
                      defaultValue=""
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor={`vacancy-requisitos-${vacancy.id}`}>
                      Requisitos
                    </Label>
                    <Textarea
                      id={`vacancy-requisitos-${vacancy.id}`}
                      className="min-h-[100px] resize-y"
                      defaultValue=""
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor={`vacancy-beneficios-${vacancy.id}`}>
                      Benefícios
                    </Label>
                    <Textarea
                      id={`vacancy-beneficios-${vacancy.id}`}
                      className="min-h-[100px] resize-y"
                      defaultValue=""
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor={`vacancy-observacoes-${vacancy.id}`}>
                      Observações
                    </Label>
                    <Textarea
                      id={`vacancy-observacoes-${vacancy.id}`}
                      className="min-h-[100px] resize-y"
                      defaultValue=""
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor={`vacancy-empresa-${vacancy.id}`}>
                      Empresa (exibição)
                    </Label>
                    <Input
                      id={`vacancy-empresa-${vacancy.id}`}
                      defaultValue=""
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor={`vacancy-modo-${vacancy.id}`}>
                      Acesso (pública/anônima)
                    </Label>
                    <Input
                      id={`vacancy-modo-${vacancy.id}`}
                      defaultValue="Pública"
                    />
                  </div>
                </div>
              </form>
            </ModalBody>
            <ModalFooter className="pt-2">
              <ButtonCustom variant="ghost" onClick={handleClose}>
                Cancelar
              </ButtonCustom>
              <ButtonCustom onClick={handleSave}>
                Salvar alterações
              </ButtonCustom>
            </ModalFooter>
          </>
        ) : (
          <>
            <ModalBody className="py-6 text-center text-sm text-slate-500">
              Nenhuma vaga selecionada.
            </ModalBody>
            <ModalFooter className="pt-2">
              <ButtonCustom variant="ghost" onClick={handleClose}>
                Fechar
              </ButtonCustom>
            </ModalFooter>
          </>
        )}
      </ModalContentWrapper>
    </ModalCustom>
  );
}
