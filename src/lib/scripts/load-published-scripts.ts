import type {
  ScriptApplication,
  ScriptListParams,
  ScriptOrientation,
  ScriptResponse,
} from "@/api/scripts/types";

export interface PreparedScriptSnippet {
  id: string;
  orientation: ScriptOrientation;
  code: string;
}

type ListScriptsFn = (
  params?: ScriptListParams,
  init?: RequestInit,
) => Promise<ScriptResponse[]>;

const ORIENTATION_ORDER: Record<ScriptOrientation, number> = {
  HEADER: 0,
  BODY: 1,
  FOOTER: 2,
};

function isPublished(status: ScriptResponse["status"]): boolean {
  if (typeof status === "string") {
    return status.toUpperCase() === "PUBLICADO";
  }
  return Boolean(status);
}

export async function loadPublishedScripts(
  listFn: ListScriptsFn,
  application: ScriptApplication,
): Promise<PreparedScriptSnippet[]> {
  try {
    const data = await listFn({
      aplicacao: application,
      status: "PUBLICADO",
    });

    return (data || [])
      .filter((item) =>
        Boolean(item?.codigo?.trim()) &&
        isPublished(item.status) &&
        item.orientacao in ORIENTATION_ORDER,
      )
      .map((item, index) => ({
        id: item.id,
        orientation: item.orientacao,
        code: item.codigo.trim(),
        order: index,
      }))
      .sort((a, b) => {
        const orientationCompare =
          ORIENTATION_ORDER[a.orientation] - ORIENTATION_ORDER[b.orientation];
        if (orientationCompare !== 0) {
          return orientationCompare;
        }
        return a.order - b.order;
      })
      .map(({ order, ...item }) => item);
  } catch (error) {
    console.error("Failed to load published scripts", error);
    return [];
  }
}
