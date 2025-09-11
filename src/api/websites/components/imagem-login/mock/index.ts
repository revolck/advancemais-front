import type { LoginImageItem } from "../types";

export const loginImageMockData: LoginImageItem = {
  id: "login-mock-id",
  imagemUrl: "/images/login/mock-login.webp",
  imagemTitulo: "login",
  link: "#",
};

export async function getLoginImageDataMock(): Promise<LoginImageItem> {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return loginImageMockData;
}
