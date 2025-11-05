import React from "react";
import { InputCustom } from "@/components/ui/custom/input";
import { SelectCustom } from "@/components/ui/custom/select";
import type { BuilderItem, BuilderModule } from "../types";
import { LiveClassInfo } from "./LiveClassInfo";

interface ModalidadeFieldsProps {
  modalidade: "ONLINE" | "PRESENCIAL" | "LIVE" | "SEMIPRESENCIAL" | null;
  item: BuilderItem;
  modules: BuilderModule[];
  onUpdate: (updates: Partial<BuilderItem>) => void;
}

/**
 * Componente que renderiza campos específicos baseados na modalidade da turma
 */
export function ModalidadeFields({
  modalidade,
  item,
  modules,
  onUpdate,
}: ModalidadeFieldsProps) {
  // PRESENCIAL: não precisa de campos adicionais
  if (modalidade === "PRESENCIAL" || !modalidade) {
    return null;
  }

  // ONLINE: apenas link do YouTube
  if (modalidade === "ONLINE") {
    return (
      <InputCustom
        label="Link do YouTube"
        required
        type="url"
        placeholder="https://www.youtube.com/watch?v=..."
        value={item.youtubeUrl || ""}
        onChange={(e) => onUpdate({ youtubeUrl: e.target.value })}
      />
    );
  }

  // LIVE: apenas card informativo
  if (modalidade === "LIVE") {
    return <LiveClassInfo />;
  }

  // SEMIPRESENCIAL: escolha entre Meet ou YouTube
  if (modalidade === "SEMIPRESENCIAL") {
    return (
      <>
        <SelectCustom
          label="Tipo de link"
          required
          placeholder="Selecione o tipo"
          options={[
            { value: "MEET", label: "Criar link do Google Meet" },
            { value: "YOUTUBE", label: "Link do YouTube" },
          ]}
          value={item.tipoLinkSemiPresencial || null}
          onChange={(v) =>
            onUpdate({
              tipoLinkSemiPresencial: v as "MEET" | "YOUTUBE",
              youtubeUrl: v === "YOUTUBE" ? item.youtubeUrl : null,
              meetUrl: v === "MEET" ? item.meetUrl : null,
            })
          }
        />

        {item.tipoLinkSemiPresencial === "YOUTUBE" && (
          <InputCustom
            label="Link do YouTube"
            required
            type="url"
            placeholder="https://www.youtube.com/watch?v=..."
            value={item.youtubeUrl || ""}
            onChange={(e) => onUpdate({ youtubeUrl: e.target.value })}
          />
        )}

        {item.tipoLinkSemiPresencial === "MEET" && <LiveClassInfo />}
      </>
    );
  }

  return null;
}
