import Link from 'next/link';

export default function ResetPasswordPage() {
  return (
    <>
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">Recuperar senha</h1>
        <p className="text-sm text-muted-foreground">
          Digite seu CPF ou CNPJ para receber um link de recuperação de senha
        </p>
      </div>

      <div className="space-y-4">
        <form action="/api/auth/reset-password" method="POST" className="space-y-4">
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

          <button
            type="submit"
            className="inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Enviar link de recuperação
          </button>
        </form>

        <div className="text-center text-sm">
          Lembrou sua senha?{' '}
          <Link href="/login" className="text-primary underline-offset-4 hover:underline">
            Voltar para o login
          </Link>
        </div>
      </div>
    </>
  );
}
