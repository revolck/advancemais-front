import Link from 'next/link';

export default function LoginPage() {
  return (
    <>
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">Entrar na sua conta</h1>
        <p className="text-sm text-muted-foreground">Digite seus dados para acessar o sistema</p>
      </div>

      <div className="space-y-4">
        <form action="/api/auth/login" method="POST" className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="document"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              CPF ou CNPJ
            </label>
            <input
              id="document"
              name="document"
              type="text"
              autoComplete="off"
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Digite apenas números"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Senha
              </label>
              <Link
                href="/reset-password"
                className="text-sm text-primary underline-offset-4 hover:underline"
              >
                Esqueceu a senha?
              </Link>
            </div>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="********"
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              id="remember"
              name="remember"
              type="checkbox"
              className="h-4 w-4 rounded border border-input"
            />
            <label
              htmlFor="remember"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Lembrar de mim
            </label>
          </div>

          <button
            type="submit"
            className="inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Entrar
          </button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Ou continue com</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent"
          >
            Google
          </button>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent"
          >
            Microsoft
          </button>
        </div>

        <div className="text-center text-sm">
          Não tem uma conta?{' '}
          <Link href="/register" className="text-primary underline-offset-4 hover:underline">
            Registre-se
          </Link>
        </div>
      </div>
    </>
  );
}
