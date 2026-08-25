/**
 * Serviço responsável pelo upload e remoção de arquivos.
 * Fornece uma camada reutilizável para enviar arquivos para o blob storage
 * e gerenciar o ciclo de vida dos uploads.
 */

import routes from "@/api/routes";

export interface UploadResult {
  url: string;
  title: string;
}

export interface FileUploadResult {
  url: string;
  filename: string;
  originalName: string;
  size: number;
  mimeType: string;
}

const MIME_TYPE_BY_EXTENSION: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  csv: "text/csv",
  ppt: "application/vnd.ms-powerpoint",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  odt: "application/vnd.oasis.opendocument.text",
  ods: "application/vnd.oasis.opendocument.spreadsheet",
  odp: "application/vnd.oasis.opendocument.presentation",
  txt: "text/plain",
};

function resolveFileMimeType(file: File): string {
  if (file.type && file.type !== "application/octet-stream") return file.type;
  const extension = file.name.split(".").pop()?.toLowerCase() || "";
  return MIME_TYPE_BY_EXTENSION[extension] || "application/octet-stream";
}

/**
 * Extrai um título amigável a partir da URL da imagem.
 */
export function getImageTitle(url: string): string {
  const fileName = url.split("/").pop() ?? "";
  return fileName.replace(/\.[^/.]+$/, "");
}

async function deleteFileOrThrow(url: string): Promise<void> {
  const response = await fetch(
    `${routes.upload.base()}?file=${encodeURIComponent(url.replace(/^\/+/g, ""))}`,
    { method: "DELETE" },
  );

  if (!response.ok) {
    throw new Error(`Falha ao excluir arquivo (${response.status})`);
  }
}

/**
 * Remove um arquivo existente informando sua URL.
 */
export async function deleteFile(url: string): Promise<void> {
  try {
    await deleteFileOrThrow(url);
  } catch {
    // Silencia erros de remoção para não impedir o fluxo principal
  }
}

/**
 * Alias para retrocompatibilidade
 * @deprecated Use deleteFile em vez disso
 */
export const deleteImage = deleteFile;

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
    let reason = "";
    try {
      const data = await response.json();
      reason = (data?.error || data?.message || "").toString();
    } catch {
      try {
        reason = await response.text();
      } catch {
        /* ignore */
      }
    }
    const suffix = reason ? `: ${reason}` : "";
    throw new Error(`Falha no upload (${response.status})${suffix}`);
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
    await deleteFile(previousUrl);
  }

  return { url: uploadedUrl, title: getImageTitle(uploadedUrl) };
}

/**
 * Realiza o upload de um arquivo genérico para o blob storage.
 * Retorna informações completas do arquivo para uso posterior.
 *
 * @param file Arquivo selecionado pelo usuário
 * @param path Caminho/diretório de destino no servidor (ex: "materiais/aulas")
 */
export async function uploadFile(
  file: File,
  path: string,
): Promise<FileUploadResult> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(
    `${routes.upload.base()}?path=${encodeURIComponent(path)}`,
    { method: "POST", body: formData },
  );

  if (!response.ok) {
    let reason = "";
    try {
      const data = await response.json();
      reason = (data?.error || data?.message || "").toString();
    } catch {
      try {
        reason = await response.text();
      } catch {
        /* ignore */
      }
    }
    const suffix = reason ? `: ${reason}` : "";
    throw new Error(`Falha no upload (${response.status})${suffix}`);
  }

  const result = await response.json();
  const uploadedUrl: string | undefined = result?.url;

  if (!uploadedUrl) {
    throw new Error("URL de upload ausente na resposta");
  }

  return {
    url: uploadedUrl,
    filename: result?.filename || file.name,
    originalName: file.name,
    size: file.size,
    mimeType: resolveFileMimeType(file),
  };
}

/**
 * Realiza upload de múltiplos arquivos para o blob storage.
 * Retorna array de resultados. Se algum falhar, faz rollback dos anteriores.
 *
 * @param files Array de arquivos para upload
 * @param path Caminho/diretório de destino no servidor
 */
export async function uploadFiles(
  files: File[],
  path: string,
): Promise<FileUploadResult[]> {
  const results: FileUploadResult[] = [];

  for (const file of files) {
    try {
      const result = await uploadFile(file, path);
      results.push(result);
    } catch (error) {
      // Rollback: deletar arquivos já enviados
      for (const uploaded of results) {
        await deleteFile(uploaded.url);
      }
      throw error;
    }
  }

  return results;
}

/**
 * Deleta múltiplos arquivos do blob storage.
 * Útil para rollback quando a API falha após uploads.
 *
 * @param urls Array de URLs para deletar
 */
export async function deleteFiles(urls: string[]): Promise<void> {
  await Promise.all(urls.map((url) => deleteFile(url)));
}

/**
 * Remove arquivos confirmando a resposta do blob storage.
 * Repete falhas transitórias antes de devolver o erro ao fluxo chamador.
 */
export async function deleteFilesStrict(urls: string[]): Promise<void> {
  const uniqueUrls = [...new Set(urls)];

  await Promise.all(
    uniqueUrls.map(async (url) => {
      let lastError: unknown;

      for (let attempt = 0; attempt < 3; attempt += 1) {
        try {
          await deleteFileOrThrow(url);
          return;
        } catch (error) {
          lastError = error;
          if (attempt < 2) {
            await new Promise((resolve) => setTimeout(resolve, 250 * 2 ** attempt));
          }
        }
      }

      throw lastError;
    }),
  );
}
