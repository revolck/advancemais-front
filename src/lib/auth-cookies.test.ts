import { describe, expect, it } from "vitest";

import { contaDoToken } from "./auth-cookies";

const jwt = (payload: Record<string, unknown>) =>
  `h.${btoa(JSON.stringify(payload)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")}.s`;

describe("conta da sessão a partir do token", () => {
  it("usa o id da conta do payload", () => {
    expect(contaDoToken(jwt({ id: "admin-1", role: "ADMIN" }))).toBe("admin-1");
    expect(contaDoToken(jwt({ sub: "empresa-9" }))).toBe("empresa-9");
  });

  it("token renovado da mesma conta não conta como troca", () => {
    const a = jwt({ id: "u1", iat: 1 });
    const b = jwt({ id: "u1", iat: 2 });
    expect(a).not.toBe(b);
    expect(contaDoToken(a)).toBe(contaDoToken(b));
  });

  it("outra conta em outra aba muda o id; sem token, null", () => {
    expect(contaDoToken(jwt({ id: "u1" }))).not.toBe(contaDoToken(jwt({ id: "u2" })));
    expect(contaDoToken(null)).toBeNull();
    expect(contaDoToken("lixo")).toBe("lixo");
  });
});
