import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container px-4 md:px-6 py-8 md:py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
          <div className="col-span-2 lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <span className="font-bold text-xl">AdvanceMais</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              Plataforma completa para gestão e avanço de negócios. Desenvolvida para ajudar
              empresas a crescerem de forma inteligente e sustentável.
            </p>
          </div>

          {/* Links do rodapé agrupados por categoria */}
        </div>

        {/* Rodapé inferior com direitos autorais e links legais */}
        <div className="mt-8 border-t pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} AdvanceMais. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="/termos-de-uso"
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Termos
            </Link>
            <Link
              href="/politica-de-privacidade"
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Privacidade
            </Link>
            <Link href="/cookies" className="text-xs text-muted-foreground hover:text-foreground">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
