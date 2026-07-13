import { describe, expect, it } from "vitest";

import {
  getLegacyDashboardRedirectPath,
  getWebsiteRewritePath,
} from "./middleware";

describe("middleware legacy dashboard routes", () => {
  it("redireciona rotas legadas de configuracao para o dashboard real", () => {
    expect(getLegacyDashboardRedirectPath("/config")).toBe("/dashboard/config");
    expect(getLegacyDashboardRedirectPath("/config/empresas")).toBe(
      "/dashboard/config/empresas"
    );
    expect(
      getLegacyDashboardRedirectPath("/config/website/pagina-inicial")
    ).toBe("/dashboard/config/website/pagina-inicial");
  });

  it("nao altera rotas que nao sao legadas de configuracao", () => {
    expect(getLegacyDashboardRedirectPath("/dashboard/config/empresas")).toBe(
      null
    );
    expect(getLegacyDashboardRedirectPath("/api/v1/configuracoes/geral")).toBe(
      null
    );
  });
});

describe("middleware website rewrites", () => {
  it("trata detalhes de curso como rota do website", () => {
    expect(
      getWebsiteRewritePath(
        "/cursos/4767cfe1-32e7-46cf-8fc3-9b984d09374b",
      ),
    ).toBe("/website/cursos/4767cfe1-32e7-46cf-8fc3-9b984d09374b");
  });
});
