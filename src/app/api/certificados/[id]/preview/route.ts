import type { NextRequest } from "next/server";
import { proxyCertificadoAsset } from "../_proxy";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  return proxyCertificadoAsset(req, id, "preview");
}
