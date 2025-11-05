/*
 * Quick test runner for Brevo module endpoints
 * Usage:
 *   BREVO_BASE_URL=http://localhost:3000/api/v1/brevo \
 *   BREVO_ADMIN_TOKEN=seu_token_aqui \
 *   npm run brevo:test
 */

const BASE_URL =
  process.env.BREVO_BASE_URL ?? "http://localhost:3000/api/v1/brevo";
const TOKEN = process.env.BREVO_ADMIN_TOKEN ?? "";

async function safeJson(res: Response) {
  try {
    return await res.json();
  } catch (e) {
    return { error: `Failed to parse JSON: ${String(e)}` };
  }
}

export async function testBrevoAPI() {
  console.log("🧪 Testando API Brevo...\n");

  // 1. Info
  console.log("1️⃣  Testando GET /");
  try {
    const res = await fetch(`${BASE_URL}/`);
    const data = await safeJson(res);
    console.log("✅ Info:", data.module, data.version);
  } catch (error: any) {
    console.log("❌ Info Error:", error?.message ?? String(error));
  }

  // 2. Health
  console.log("\n2️⃣  Testando GET /health");
  try {
    const res = await fetch(`${BASE_URL}/health`);
    const data = await safeJson(res);
    console.log("✅ Health:", data.status, data.module ?? "");
  } catch (error: any) {
    console.log("❌ Health Error:", error?.message ?? String(error));
  }

  // 3. Config (auth)
  console.log("\n3️⃣  Testando GET /config");
  try {
    const res = await fetch(`${BASE_URL}/config`, {
      headers: TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {},
    });
    const data = await safeJson(res);
    console.log(
      "✅ Config:",
      data.module,
      "Configured:",
      data.configuration?.isConfigured,
    );
  } catch (error: any) {
    console.log("❌ Config Error:", error?.message ?? String(error));
  }

  // 4. Test email
  console.log("\n4️⃣  Testando POST /test/email");
  try {
    const res = await fetch(`${BASE_URL}/test/email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}),
      },
      body: JSON.stringify({
        email: "test@example.com",
        name: "Teste Dev",
        type: "welcome",
      }),
    });
    const data = await safeJson(res);
    console.log(
      "✅ Email Test:",
      data.success,
      data.data?.simulated ? "(simulado)" : "(real)",
    );
  } catch (error: any) {
    console.log("❌ Email Test Error:", error?.message ?? String(error));
  }

  // 5. Test SMS
  console.log("\n5️⃣  Testando POST /test/sms");
  try {
    const res = await fetch(`${BASE_URL}/test/sms`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}),
      },
      body: JSON.stringify({
        to: "+5511999999999",
        message: "Teste do dev",
      }),
    });
    const data = await safeJson(res);
    console.log(
      "✅ SMS Test:",
      data.success,
      data.data?.simulated ? "(simulado)" : "(real)",
    );
  } catch (error: any) {
    console.log("❌ SMS Test Error:", error?.message ?? String(error));
  }

  console.log("\n🎉 Testes concluídos!");
}

if (require.main === module) {
  testBrevoAPI().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

export default testBrevoAPI;

