import { apiFetch } from "@/api/client";
import routes from "@/api/routes";
import { apiConfig } from "@/lib/env";
import { sortSlidersByOrder } from "../utils";
import type {
  SliderBackendResponse,
  SliderItem,
  SliderFormData,
  ReorderParams,
} from "../types";

/**
 * Mapeia resposta da API para formato do frontend
 */
function mapSliderResponse(data: SliderBackendResponse): SliderItem {
  return {
    id: data.id,
    imagemUrl: data.imagemUrl,
    imagemTitulo: data.imagemTitulo,
    link: data.link,
    ordem: data.ordem,
    criadoEm: new Date(data.criadoEm),
    atualizadoEm: new Date(data.atualizadoEm),
    isPublished: true, // Por padrão, considera publicado se retornado pela API
  };
}

/**
 * Busca todos os sliders
 */
export async function getSliders(): Promise<SliderItem[]> {
  try {
    const response = await apiFetch<SliderBackendResponse[]>(
      routes.website.home.slide(),
      {
        init: {
          headers: apiConfig.headers,
          method: "GET",
        },
      }
    );

    const sliders = response.map(mapSliderResponse);
    return sortSlidersByOrder(sliders);
  } catch (error) {
    console.error("❌ Erro ao buscar sliders:", error);
    throw new Error("Falha ao carregar lista de sliders");
  }
}

/**
 * Busca um slider específico por ID
 */
export async function getSliderById(id: string): Promise<SliderItem> {
  try {
    const response = await apiFetch<SliderBackendResponse>(
      `${routes.website.home.slide()}/${id}`,
      {
        init: {
          headers: apiConfig.headers,
          method: "GET",
        },
      }
    );

    return mapSliderResponse(response);
  } catch (error) {
    console.error(`❌ Erro ao buscar slider ${id}:`, error);
    throw new Error("Falha ao carregar slider");
  }
}

/**
 * Cria um novo slider
 */
export async function createSlider(data: SliderFormData): Promise<SliderItem> {
  try {
    const formData = createFormData(data);

    const response = await apiFetch<SliderBackendResponse>(
      routes.website.home.slide(),
      {
        init: {
          method: "POST",
          body: formData,
          headers: getMultipartHeaders(),
        },
      }
    );

    return mapSliderResponse(response);
  } catch (error) {
    console.error("❌ Erro ao criar slider:", error);
    throw new Error("Falha ao criar slider");
  }
}

/**
 * Atualiza um slider existente
 */
export async function updateSlider(
  id: string,
  data: SliderFormData
): Promise<SliderItem> {
  try {
    const formData = createFormData(data);

    const response = await apiFetch<SliderBackendResponse>(
      `${routes.website.home.slide()}/${id}`,
      {
        init: {
          method: "PUT",
          body: formData,
          headers: getMultipartHeaders(),
        },
      }
    );

    return mapSliderResponse(response);
  } catch (error) {
    console.error(`❌ Erro ao atualizar slider ${id}:`, error);
    throw new Error("Falha ao atualizar slider");
  }
}

/**
 * Remove um slider
 */
export async function deleteSlider(id: string): Promise<void> {
  try {
    await apiFetch<void>(`${routes.website.home.slide()}/${id}`, {
      init: {
        method: "DELETE",
        headers: apiConfig.headers,
      },
    });
  } catch (error) {
    console.error(`❌ Erro ao deletar slider ${id}:`, error);
    throw new Error("Falha ao remover slider");
  }
}

/**
 * Reordena sliders atualizando suas posições
 */
export async function reorderSliders(
  reorderData: ReorderParams[]
): Promise<SliderItem[]> {
  try {
    // Atualiza cada slider individualmente
    const updatePromises = reorderData.map(({ id, ordem }) =>
      updateSlider(id, { ordem })
    );

    const updatedSliders = await Promise.all(updatePromises);
    return sortSlidersByOrder(updatedSliders);
  } catch (error) {
    console.error("❌ Erro ao reordenar sliders:", error);
    throw new Error("Falha ao reordenar sliders");
  }
}

/**
 * Utilitários internos
 */

function createFormData(data: SliderFormData): FormData {
  const formData = new FormData();

  if (data.imagem) {
    formData.append("imagem", data.imagem);
  } else if (data.imagemUrl) {
    formData.append("imagemUrl", data.imagemUrl);
  }

  if (data.link) {
    formData.append("link", data.link);
  }

  formData.append("ordem", data.ordem.toString());

  return formData;
}

function getMultipartHeaders(): Record<string, string> {
  // Remove Content-Type para permitir multipart/form-data automático
  return Object.fromEntries(
    Object.entries(apiConfig.headers).filter(
      ([key]) => key.toLowerCase() !== "content-type"
    )
  );
}
