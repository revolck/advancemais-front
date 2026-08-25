import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { deleteFilesStrict } from "./uploadService";

vi.mock("@/api/routes", () => ({
  default: {
    upload: { base: () => "/api/v1/upload" },
  },
}));

describe("deleteFilesStrict", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("remove cada URL apenas uma vez", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);

    await deleteFilesStrict([
      "https://arquivos.public.blob.vercel-storage.com/anexo.pdf",
      "https://arquivos.public.blob.vercel-storage.com/anexo.pdf",
    ]);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining(
        encodeURIComponent("https://arquivos.public.blob.vercel-storage.com/anexo.pdf"),
      ),
      { method: "DELETE" },
    );
  });

  it("repete falhas transitórias antes de concluir", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, status: 500 })
      .mockResolvedValueOnce({ ok: false, status: 503 })
      .mockResolvedValueOnce({ ok: true, status: 204 });
    vi.stubGlobal("fetch", fetchMock);

    const deletion = deleteFilesStrict([
      "https://arquivos.public.blob.vercel-storage.com/anexo.pdf",
    ]);
    await vi.runAllTimersAsync();
    await deletion;

    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("devolve o erro depois de três tentativas", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: false, status: 500 });
    vi.stubGlobal("fetch", fetchMock);

    const deletion = expect(
      deleteFilesStrict(["https://arquivos.public.blob.vercel-storage.com/anexo.pdf"]),
    ).rejects.toThrow("Falha ao excluir arquivo (500)");
    await vi.runAllTimersAsync();
    await deletion;

    expect(fetchMock).toHaveBeenCalledTimes(3);
  });
});
