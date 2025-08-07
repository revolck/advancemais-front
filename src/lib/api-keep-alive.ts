/**
 * Keep-Alive para API da Render
 * Previne cold starts fazendo ping a cada 8 minutos
 */
class ApiKeepAlive {
  private interval: NodeJS.Timeout | null = null;
  private readonly PING_INTERVAL = 8 * 60 * 1000; // 8 minutos
  private readonly API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  start() {
    if (typeof window === "undefined" || !this.API_URL) return;

    console.log("🔄 Keep-Alive da API iniciado");

    // Ping inicial
    this.ping();

    // Ping a cada 8 minutos
    this.interval = setInterval(() => this.ping(), this.PING_INTERVAL);
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
      console.log("⏹️ Keep-Alive da API parado");
    }
  }

  private async ping() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      await fetch(this.API_URL!, {
        method: "HEAD",
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      console.log("✅ Keep-Alive: API OK");
    } catch {
      console.log("⚠️ Keep-Alive: API fria (normal)");
    }
  }
}

export const apiKeepAlive = new ApiKeepAlive();
