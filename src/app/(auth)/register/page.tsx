import Link from 'next/link';

export default function RegisterPage() {
  return (
    <>
      <div className="space-y-6 text-center">
        <div>
          <h1 className="text-2xl font-bold">Criar uma conta</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Escolha o tipo de conta que deseja criar
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-md mx-auto">
          <Link
            href="/register/pessoa-fisica"
            className="flex flex-col items-center justify-center p-6 rounded-md border bg-card text-card-foreground shadow-sm hover:bg-accent transition-colors"
          >
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-primary"
              >
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <h2 className="text-lg font-medium">Pessoa Física</h2>
            <p className="text-sm text-muted-foreground mt-2">
              Para clientes e parceiros individuais
            </p>
          </Link>

          <Link
            href="/register/pessoa-juridica"
            className="flex flex-col items-center justify-center p-6 rounded-md border bg-card text-card-foreground shadow-sm hover:bg-accent transition-colors"
          >
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-primary"
              >
                <path d="M3 21h18"></path>
                <path d="M3 7v14"></path>
                <path d="M21 7v14"></path>
                <path d="M7 7V3h10v4"></path>
                <path d="M7 11h10"></path>
                <path d="M7 15h10"></path>
                <path d="M7 19h10"></path>
              </svg>
            </div>
            <h2 className="text-lg font-medium">Pessoa Jurídica</h2>
            <p className="text-sm text-muted-foreground mt-2">Para empresas e organizações</p>
          </Link>
        </div>

        <div className="text-center text-sm mt-8">
          Já tem uma conta?{' '}
          <Link href="/login" className="text-primary underline-offset-4 hover:underline">
            Entrar
          </Link>
        </div>
      </div>
    </>
  );
}
