import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/website/header/Header';
import Footer from '@/components/website/footer/Footer';
import { featureHighlights } from '@/config/site';
import { cn } from '@/lib/utils';

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex flex-col min-h-screen">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-primary/10 z-0" />

          <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-6">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                  Impulsione seu negócio com <span className="text-primary">inteligência</span>
                </h1>

                <p className="text-lg md:text-xl text-muted-foreground max-w-xl">
                  A plataforma completa para gestão e avanço de negócios. Faça mais com menos.
                  Automatize, acompanhe e cresça.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Link
                    href="/register"
                    className="inline-flex h-12 items-center justify-center rounded-md bg-primary px-6 py-3 text-base font-medium text-primary-foreground shadow hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    Comece agora
                  </Link>
                  <Link
                    href="/demo"
                    className="inline-flex h-12 items-center justify-center rounded-md border border-input bg-background px-6 py-3 text-base font-medium text-foreground shadow-sm hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    Solicitar demonstração
                  </Link>
                </div>
              </div>

              <div className="relative hidden md:block">
                <div className="relative rounded-lg bg-background p-2 shadow-lg border">
                  <Image
                    src="/images/dashboard-preview.png"
                    alt="AdvanceMais Dashboard Preview"
                    width={600}
                    height={400}
                    className="rounded-md"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Recursos poderosos para seu negócio</h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Nossas ferramentas foram projetadas para impulsionar seu negócio, facilitar sua
                gestão e garantir resultados.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {featureHighlights.map((feature, index) => (
                <div
                  key={index}
                  className="bg-background rounded-lg p-6 border shadow-sm transition-all hover:shadow-md"
                >
                  <div className="rounded-full bg-primary/10 p-3 w-12 h-12 flex items-center justify-center mb-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-primary h-5 w-5"
                    >
                      {feature.icon === 'LayoutDashboard' && (
                        <>
                          <rect width="7" height="9" x="3" y="3" rx="1" />
                          <rect width="7" height="5" x="14" y="3" rx="1" />
                          <rect width="7" height="9" x="14" y="12" rx="1" />
                          <rect width="7" height="5" x="3" y="16" rx="1" />
                        </>
                      )}
                      {feature.icon === 'BarChart' && (
                        <>
                          <line x1="12" y1="20" x2="12" y2="10" />
                          <line x1="18" y1="20" x2="18" y2="4" />
                          <line x1="6" y1="20" x2="6" y2="16" />
                        </>
                      )}
                      {feature.icon === 'Zap' && (
                        <>
                          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                        </>
                      )}
                      {feature.icon === 'Workflow' && (
                        <>
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                          <line x1="3" y1="9" x2="21" y2="9"></line>
                          <line x1="9" y1="21" x2="9" y2="9"></line>
                        </>
                      )}
                      {feature.icon === 'Shield' && (
                        <>
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                        </>
                      )}
                      {feature.icon === 'HelpCircle' && (
                        <>
                          <circle cx="12" cy="12" r="10"></circle>
                          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                          <line x1="12" y1="17" x2="12.01" y2="17"></line>
                        </>
                      )}
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">O que nossos clientes dizem</h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Conheça histórias reais de clientes que transformaram seus negócios com nossa
                plataforma.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  name: 'Cristina Oliveira',
                  company: 'Tech Solutions',
                  quote:
                    'A plataforma facilitou nossa gestão financeira. Temos uma visão clara e em tempo real de todas as operações.',
                  avatar: '/images/avatar-1.png',
                },
                {
                  name: 'Ricardo Mendes',
                  company: 'Construtech',
                  quote:
                    'O dashboard de análise nos ajudou a tomar decisões baseadas em dados. Nosso crescimento foi acelerado em 40%.',
                  avatar: '/images/avatar-2.png',
                },
                {
                  name: 'Amanda Santos',
                  company: 'Edu Plus',
                  quote:
                    'A automação de processos nos economizou horas de trabalho manual. A equipe agora foca no que realmente importa.',
                  avatar: '/images/avatar-3.png',
                },
              ].map((testimonial, index) => (
                <div
                  key={index}
                  className={cn(
                    'bg-background rounded-lg p-6 border shadow-sm',
                    index === 1 ? 'md:transform md:-translate-y-4' : ''
                  )}
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-lg font-semibold text-primary">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.company}</p>
                    </div>
                  </div>
                  <blockquote className="text-muted-foreground italic">
                    "{testimonial.quote}"
                  </blockquote>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6">Pronto para avançar seu negócio?</h2>
            <p className="text-primary-foreground/80 max-w-2xl mx-auto mb-8">
              Junte-se a milhares de empresas que já transformaram sua gestão com nossa plataforma.
              Registre-se hoje e comece a ver resultados imediatos.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="inline-flex h-12 items-center justify-center rounded-md bg-primary-foreground px-6 py-3 text-base font-medium text-primary shadow hover:bg-primary-foreground/90"
              >
                Criar uma conta
              </Link>
              <Link
                href="/login"
                className="inline-flex h-12 items-center justify-center rounded-md border border-primary-foreground px-6 py-3 text-base font-medium text-primary-foreground hover:bg-primary-foreground/10"
              >
                Fazer login
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
