import { websiteRoutes } from "@/api/routes";
import { apiFetch } from "@/api/client";
import { apiConfig, env } from "@/lib/env";
import type {
  PlaninhasBackendResponse,
  CreatePlaninhasPayload,
  UpdatePlaninhasPayload,
} from "./types";
import type {
  SectionData,
  ProblemSolutionData,
} from "@/theme/website/components/problem-solution-section/types";

export async function listPlaninhas(
  init?: RequestInit,
): Promise<PlaninhasBackendResponse[]> {
  return apiFetch<PlaninhasBackendResponse[]>(websiteRoutes.planinhas.list(), {
    init: init ?? { headers: apiConfig.headers },
  });
}

export async function getPlaninhasById(
  id: string,
): Promise<PlaninhasBackendResponse> {
  return apiFetch<PlaninhasBackendResponse>(websiteRoutes.planinhas.get(id), {
    init: { headers: apiConfig.headers },
  });
}

function getAuthHeader(): Record<string, string> {
  if (typeof document === "undefined") return {};
  const token = document.cookie
    .split("; ")
    .find((row) => row.startsWith("token="))
    ?.split("=")[1];
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function createPlaninhas(
  data: CreatePlaninhasPayload,
): Promise<PlaninhasBackendResponse> {
  return apiFetch<PlaninhasBackendResponse>(websiteRoutes.planinhas.create(), {
    init: {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: apiConfig.headers.Accept,
        ...getAuthHeader(),
      },
      body: JSON.stringify(data),
    },
    cache: "no-cache",
  });
}

export async function updatePlaninhas(
  id: string,
  data: UpdatePlaninhasPayload,
): Promise<PlaninhasBackendResponse> {
  return apiFetch<PlaninhasBackendResponse>(websiteRoutes.planinhas.update(id), {
    init: {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: apiConfig.headers.Accept,
        ...getAuthHeader(),
      },
      body: JSON.stringify(data),
    },
    cache: "no-cache",
  });
}

export async function deletePlaninhas(id: string): Promise<void> {
  await apiFetch<void>(websiteRoutes.planinhas.delete(id), {
    init: {
      method: "DELETE",
      headers: {
        Accept: apiConfig.headers.Accept,
        ...getAuthHeader(),
      },
    },
    cache: "no-cache",
  });
}

// ----- Mapping helpers to Problem/Solution section -----

function mapToProblemSolution(latest: PlaninhasBackendResponse): ProblemSolutionData[] {
  const items: ProblemSolutionData[] = [];
  if (latest) {
    items.push(
      {
        id: `${latest.id}-1`,
        icon: latest.icone1 as any,
        title: latest.titulo1,
        description: latest.descricao1,
        order: 1,
        isActive: true,
      },
      {
        id: `${latest.id}-2`,
        icon: latest.icone2 as any,
        title: latest.titulo2,
        description: latest.descricao2,
        order: 2,
        isActive: true,
      },
      {
        id: `${latest.id}-3`,
        icon: latest.icone3 as any,
        title: latest.titulo3,
        description: latest.descricao3,
        order: 3,
        isActive: true,
      },
    );
  }
  return items.filter((i) => i.title || i.description);
}

function mapPlaninhasToSection(data: PlaninhasBackendResponse[]): SectionData {
  const latest = data?.[data.length - 1];
  return {
    id: latest?.id || "planinhas",
    mainTitle: latest?.titulo || "",
    mainDescription: latest?.descricao || "",
    problems: latest ? mapToProblemSolution(latest) : [],
    isActive: true,
  };
}

export async function getPlaninhasSectionData(): Promise<SectionData> {
  try {
    const raw = await listPlaninhas({
      headers: apiConfig.headers,
      ...apiConfig.cache.medium,
    });
    return mapPlaninhasToSection(raw);
  } catch (error) {
    if (env.apiFallback === "mock") {
      // No mock defined for planinhas; return empty structure
      return { id: "planinhas", mainTitle: "", mainDescription: "", problems: [], isActive: true };
    }
    throw error;
  }
}

export async function getPlaninhasSectionDataClient(): Promise<SectionData> {
  try {
    const raw = await listPlaninhas({ headers: apiConfig.headers });
    return mapPlaninhasToSection(raw);
  } catch (error) {
    if (env.apiFallback === "mock") {
      return { id: "planinhas", mainTitle: "", mainDescription: "", problems: [], isActive: true };
    }
    throw error;
  }
}
