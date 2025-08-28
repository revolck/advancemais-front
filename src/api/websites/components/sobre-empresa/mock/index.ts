import type { AccordionSectionData } from "../types";

export const sobreEmpresaMockData: AccordionSectionData[] = [
  {
    id: "sobreempresa-uuid",
    title: "Sobre a Empresa",
    videoUrl: "https://example.com/video",
    videoType: "url",
    items: [
      {
        id: "sobreempresa-descricao",
        value: "descricao",
        trigger: "Descrição",
        content: "Descrição sobre a empresa",
        order: 1,
        isActive: true,
      },
      {
        id: "sobreempresa-visao",
        value: "visao",
        trigger: "Visão",
        content: "Nossa visão",
        order: 2,
        isActive: true,
      },
      {
        id: "sobreempresa-missao",
        value: "missao",
        trigger: "Missão",
        content: "Nossa missão",
        order: 3,
        isActive: true,
      },
      {
        id: "sobreempresa-valores",
        value: "valores",
        trigger: "Valores",
        content: "Nossos valores",
        order: 4,
        isActive: true,
      },
    ],
    order: 1,
    isActive: true,
  },
];
