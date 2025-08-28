import { RecrutamentoApiResponse } from "../types";

export const recrutamentoMockData: RecrutamentoApiResponse = {
  src: "/images/recrutamento-placeholder.jpg",
  title: "Serviços de Recrutamento",
  description:
    "Descrição sobre recrutamento empresarial fornecida pela Advance+.",
  buttonUrl: "https://example.com/recrutamento",
  buttonLabel: "Saiba mais",
};

export async function getRecrutamentoDataMock(): Promise<RecrutamentoApiResponse> {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return recrutamentoMockData;
}
