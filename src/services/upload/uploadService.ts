/**
 * Serviço responsável pelo upload e remoção de imagens.
 * Fornece uma camada reutilizável para enviar arquivos e
 * validar se a URL retornada realmente corresponde a um
 * recurso existente.
 */

import routes from "@/api/routes";

export interface UploadResult {
  url: string;
  title: string;
}

/**
 * Extrai um título amigável a partir da URL da imagem.
 */
export function getImageTitle(url: string): string {
  const fileName = url.split("/").pop() ?? "";
  return fileName.replace(/\.[^/.]+$/, "");
}

/**
 * Remove uma imagem existente informando sua URL.
 */
export async function deleteImage(url: string): Promise<void> {
  try {
    await fetch(
      `${routes.upload.base()}?file=${encodeURIComponent(
        url.replace(/^\/+/g, ""),
      )}`,
      { method: "DELETE" },
    );
  } catch {
    // Silencia erros de remoção para não impedir o fluxo principal
  }
}

/**
 * Realiza o upload de uma imagem para o backend.
 * A URL retornada é validada por meio de uma requisição GET
 * para garantir que o recurso foi persistido corretamente.
 *
 * @param file Arquivo de imagem selecionado pelo usuário
 * @param path Caminho/diretório de destino no servidor
 * @param previousUrl (opcional) URL de imagem anterior para remoção
 */
export async function uploadImage(
  file: File,
  path: string,
  previousUrl?: string,
): Promise<UploadResult> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(
    `${routes.upload.base()}?path=${encodeURIComponent(path)}`,
    { method: "POST", body: formData },
  );

  if (!response.ok) {
    throw new Error(`Falha no upload (${response.status})`);
  }

  const result = await response.json();
  const uploadedUrl: string | undefined = result?.url;

  if (!uploadedUrl) {
    throw new Error("URL de upload ausente na resposta");
  }

  // Valida se a URL gerada realmente aponta para uma imagem válida
  try {
    const check = await fetch(uploadedUrl);
    if (!check.ok) {
      throw new Error(`Status inválido ao validar imagem: ${check.status}`);
    }
    await check.blob();
  } catch {
    throw new Error("Imagem enviada é inválida ou inacessível");
  }

  if (previousUrl && previousUrl !== uploadedUrl) {
    await deleteImage(previousUrl);
  }

  return { url: uploadedUrl, title: getImageTitle(uploadedUrl) };
}

