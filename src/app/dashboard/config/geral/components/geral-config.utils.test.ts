import { describe, expect, it } from "vitest";

import type { ConfigCategoryGroup } from "@/api/configuracoes-gerais/types";
import {
  buildConfigPayload,
  getNextSecretDraftFromMaskedKey,
  getSecretFieldInputState,
} from "./geral-config.utils";

const baseGroup: ConfigCategoryGroup = {
  category: "mercadopago",
  label: "Mercado Pago",
  description: "",
  items: [
    {
      key: "mp_access_token",
      label: "Access token de produção",
      type: "string",
      secret: true,
      configured: true,
      source: "DB",
      maskedPreview: "********token12",
      value: null,
    },
    {
      key: "assinaturas_grace_days",
      label: "Dias de tolerância",
      type: "number",
      secret: false,
      configured: true,
      source: "ENV",
      value: 5,
    },
  ],
};

describe("geral-config utils", () => {
  it("não envia segredos quando o draft continua em keep", () => {
    const payload = buildConfigPayload(
      baseGroup,
      { assinaturas_grace_days: 10 },
      { mp_access_token: { action: "keep", value: "" } },
    );

    expect(payload.values).toEqual({ assinaturas_grace_days: 10 });
    expect(payload.secrets).toEqual({});
  });

  it("não marca segredo como replace só por exibir valor mascarado", () => {
    const state = getSecretFieldInputState(baseGroup.items[0], {
      action: "keep",
      value: "",
    });

    expect(state.showingMaskedValue).toBe(true);
    expect(state.inputValue).toBe("********token12");
  });

  it("só troca para replace quando há interação real de edição", () => {
    expect(getNextSecretDraftFromMaskedKey("a")).toEqual({
      action: "replace",
      value: "a",
    });
    expect(getNextSecretDraftFromMaskedKey("Backspace")).toEqual({
      action: "replace",
      value: "",
    });
    expect(getNextSecretDraftFromMaskedKey("Tab")).toBeNull();
  });
});
