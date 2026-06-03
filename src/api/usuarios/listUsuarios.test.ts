import { beforeEach, describe, expect, it, vi } from "vitest";

import { apiFetch } from "@/api/client";
import { listUsuarios } from "./index";

vi.mock("@/api/client", () => ({
  apiFetch: vi.fn(async () => ({
    message: "Lista de usuários",
    usuarios: [],
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      pages: 0,
    },
  })),
}));

describe("listUsuarios", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("envia page e limit no endpoint de listagem", async () => {
    await listUsuarios({
      page: 7,
      limit: 10,
      search: "maria",
      role: "ALUNO_CANDIDATO",
      status: "ATIVO",
    });

    expect(apiFetch).toHaveBeenCalledWith(
      "/api/v1/usuarios/usuarios?page=7&limit=10&status=ATIVO&role=ALUNO_CANDIDATO&search=maria",
      expect.objectContaining({
        cache: "no-cache",
      }),
    );
  });

  it("usa pageSize como limit quando limit nao foi informado", async () => {
    await listUsuarios({
      page: 2,
      pageSize: 25,
    });

    expect(apiFetch).toHaveBeenCalledWith(
      "/api/v1/usuarios/usuarios?page=2&limit=25",
      expect.objectContaining({
        cache: "no-cache",
      }),
    );
  });
});
