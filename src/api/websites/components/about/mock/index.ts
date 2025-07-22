import { AboutApiResponse } from "../types";

export const aboutMockData: AboutApiResponse = {
  src: "/images/about-placeholder.jpg",
  title: "Nossa História",
  description:
    "Somos uma empresa comprometida com a excelência e inovação, oferecendo soluções que transformam negócios e criam valor para nossos clientes.",
};

/**
 * Mock da função de API para desenvolvimento/teste
 */
export async function getAboutDataMock(): Promise<AboutApiResponse> {
  // Simular delay de rede
  await new Promise((resolve) => setTimeout(resolve, 500));
  return aboutMockData;
}
