import Link from "next/link";
import { dashboardSummaryCards, quickActions } from "@/config/dashboard";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Visão geral do seu negócio e performance
        </p>
      </div>

      {/* Cards de resumo */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {dashboardSummaryCards.map((card, index) => (
          <div key={index} className="rounded-lg border bg-card p-5 shadow-sm">
            <div className="flex justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </p>
                <div className="flex items-center gap-1">
                  <p className="text-2xl font-bold">{card.metric}</p>

                  {/* Indicador de tendência */}
                  {card.trend === "up" ? (
                    <span className="text-sm font-medium text-green-500">
                      ↑
                    </span>
                  ) : card.trend === "down" ? (
                    <span className="text-sm font-medium text-red-500">↓</span>
                  ) : null}
                </div>
              </div>

              {/* Ícone do card */}
              <div className="rounded-full bg-primary/10 p-2 text-primary">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  {card.icon === "DollarSign" && (
                    <line x1="12" y1="1" x2="12" y2="23"></line>
                  )}
                  {card.icon === "Users" && (
                    <>
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                      <circle cx="9" cy="7" r="4"></circle>
                      <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </>
                  )}
                  {card.icon === "BarChart" && (
                    <>
                      <line x1="12" y1="20" x2="12" y2="10"></line>
                      <line x1="18" y1="20" x2="18" y2="4"></line>
                      <line x1="6" y1="20" x2="6" y2="16"></line>
                    </>
                  )}
                  {card.icon === "ShoppingCart" && (
                    <>
                      <circle cx="9" cy="21" r="1"></circle>
                      <circle cx="20" cy="21" r="1"></circle>
                      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                    </>
                  )}
                </svg>
              </div>
            </div>

            {/* Descrição do card */}
            <p className="mt-2 text-xs text-muted-foreground">
              {card.description}
            </p>
          </div>
        ))}
      </div>

      {/* Ações rápidas */}
      <div>
        <h2 className="text-xl font-semibold tracking-tight mb-4">
          Ações rápidas
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              href={action.href}
              className={cn(
                "flex items-center gap-2 rounded-md border bg-card p-4 shadow-sm transition-colors hover:bg-accent"
              )}
            >
              <div className="rounded-full bg-primary/10 p-2 text-primary">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  {action.icon === "UserPlus" && (
                    <>
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                      <circle cx="9" cy="7" r="4"></circle>
                      <line x1="19" y1="8" x2="19" y2="14"></line>
                      <line x1="22" y1="11" x2="16" y2="11"></line>
                    </>
                  )}
                  {action.icon === "Plus" && (
                    <>
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </>
                  )}
                  {action.icon === "Package" && (
                    <>
                      <path d="M12.89 1.45l8 4A2 2 0 0 1 22 7.24v9.53a2 2 0 0 1-1.11 1.79l-8 4a2 2 0 0 1-1.79 0l-8-4a2 2 0 0 1-1.1-1.8V7.24a2 2 0 0 1 1.11-1.79l8-4a2 2 0 0 1 1.78 0z"></path>
                      <polyline points="2.32 6.16 12 11 21.68 6.16"></polyline>
                      <line x1="12" y1="22.76" x2="12" y2="11"></line>
                      <line x1="7" y1="3.5" x2="17" y2="8.5"></line>
                    </>
                  )}
                  {action.icon === "Megaphone" && (
                    <>
                      <path d="M3 11l18-5v12L3 13v-2z"></path>
                      <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"></path>
                    </>
                  )}
                </svg>
              </div>
              <span>{action.title}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Gráficos e dados recentes - Placeholder */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border p-6 shadow-sm">
          <h3 className="text-lg font-medium">Vendas recentes</h3>
          <div className="mt-4 h-[300px] w-full bg-muted/30 flex items-center justify-center">
            <p className="text-muted-foreground">
              Gráfico de vendas carregando...
            </p>
          </div>
        </div>

        <div className="rounded-lg border p-6 shadow-sm">
          <h3 className="text-lg font-medium">Atividade recente</h3>
          <div className="mt-4 space-y-4">
            {/* Atividades recentes - Placeholder */}
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="flex items-center gap-4 border-b pb-4 last:border-0"
              >
                <div className="h-8 w-8 rounded-full bg-muted"></div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">Atividade {i}</p>
                  <p className="text-xs text-muted-foreground">
                    Descrição breve da atividade {i}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">há {i} horas</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
