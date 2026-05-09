import { describe, expect, it } from "vitest";
import { mapLogoEnterpriseResponsesToLogoData } from "./normalization";

describe("mapLogoEnterpriseResponsesToLogoData", () => {
  it("normaliza logos publicados com payload direto", () => {
    const result = mapLogoEnterpriseResponsesToLogoData([
      {
        id: "ordem-1",
        logoId: "logo-1",
        nome: "Empresa A",
        imagemUrl: "https://cdn.example.com/logo-a.webp",
        imagemAlt: "Logo Empresa A",
        website: "https://empresa-a.com",
        status: "PUBLICADO",
        ordem: 2,
      },
    ]);

    expect(result).toEqual([
      {
        id: "logo-1",
        name: "Empresa A",
        src: "https://cdn.example.com/logo-a.webp",
        alt: "Logo Empresa A",
        website: "https://empresa-a.com",
        order: 2,
      },
    ]);
  });

  it("normaliza logos com recurso aninhado e status ausente quando permitido", () => {
    const result = mapLogoEnterpriseResponsesToLogoData(
      [
        {
          id: "ordem-2",
          ordem: "1",
          logoEnterprise: {
            id: "logo-2",
            nome: "Empresa B",
            imagem: {
              url: "website/logo-enterprises/logo-b.webp",
            },
            imagemAlt: "Logo Empresa B",
          },
        },
      ],
      { assumePublishedWhenStatusMissing: true },
    );

    expect(result).toEqual([
      {
        id: "logo-2",
        name: "Empresa B",
        src: "/website/logo-enterprises/logo-b.webp",
        alt: "Logo Empresa B",
        website: undefined,
        order: 1,
      },
    ]);
  });
});
