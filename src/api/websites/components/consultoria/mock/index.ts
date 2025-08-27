import { ConsultoriaApiResponse } from "../types";

export const consultoriaMockData: ConsultoriaApiResponse = {
  src: "/images/consultoria-placeholder.jpg",
  title: "Serviços de Consultoria",
  description:
    "Descrição sobre consultoria empresarial fornecida pela Advance+.",
  buttonUrl: "https://example.com/consultoria",
  buttonLabel: "Saiba mais",
};

export async function getConsultoriaDataMock(): Promise<ConsultoriaApiResponse> {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return consultoriaMockData;
}
