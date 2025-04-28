# AdvanceMais Frontend

Plataforma completa para gestão e avanço de negócios desenvolvida com Next.js, React e TypeScript.

## Estrutura do Projeto

O projeto é organizado em três áreas principais:

- **Website**: Interface pública (landing page, blog, etc.)
- **Dashboard**: Área administrativa para usuários autenticados
- **Autenticação**: Sistema de login, registro e gerenciamento de contas

## Tecnologias Utilizadas

- **Framework**: Next.js 15
- **Linguagem**: TypeScript
- **Estilização**: Tailwind CSS
- **Gerenciador de Pacotes**: PNPM
- **Hospedagem**: Vercel

## Requisitos

- Node.js 20 ou superior
- PNPM 8 ou superior

## Desenvolvimento Local

1. Clone o repositório:

```bash
git clone https://github.com/advancemais/frontend.git
cd frontend
```

2. Instale as dependências:

```bash
pnpm install
```

3. Execute o servidor de desenvolvimento:

```bash
pnpm dev
```

4. Acesse o projeto em [http://localhost:3000](http://localhost:3000)

## Estrutura de Diretórios

```
src/
├── app/                  # Rotas e páginas (Next.js App Router)
│   ├── (auth)/           # Área de autenticação
│   ├── api/              # API Routes
│   ├── dashboard/        # Dashboard administrativo
│   └── ...               # Páginas do website
├── components/           # Componentes React reutilizáveis
├── config/               # Configurações do projeto
├── lib/                  # Utilitários e bibliotecas
├── providers/            # Providers de contexto
├── types/                # Definições de tipos TypeScript
```

## Convenções de Código

- Utilizamos ESLint e Prettier para manter a consistência do código
- Componentes seguem o padrão de nomeação PascalCase
- Arquivos de utilitários seguem o padrão de nomeação camelCase
- Utilizamos funções e não classes para componentes React
- Preferimos hooks personalizados para lógica compartilhada

## Scripts Disponíveis

- `pnpm dev`: Inicia o servidor de desenvolvimento
- `pnpm build`: Gera o build de produção
- `pnpm start`: Inicia a aplicação a partir do build
- `pnpm lint`: Executa a verificação de linting

## Segurança

O projeto implementa várias camadas de segurança:

- Middleware para proteção de rotas
- Headers de segurança (CSP, CORS, etc.)
- Sanitização de dados de entrada
- Tokens de autenticação com expiração
- Rate limiting para APIs

## Logs

Sistema de logs para monitoramento e depuração:

- Diferentes níveis de log (debug, info, warn, error)
- Contexto e metadados para cada log
- Suporte para integração com serviços externos

## Configuração de Projeto para VS Code

O projeto inclui configurações recomendadas para VS Code que melhoram a experiência de desenvolvimento. Instale as seguintes extensões:

- ESLint
- Prettier
- Tailwind CSS IntelliSense

## Implantação

O projeto está configurado para implantação automática na Vercel a partir de mudanças no branch principal.

## Contribuição

1. Crie um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/amazing-feature`)
3. Faça commit das suas alterações (`git commit -m 'Add some amazing feature'`)
4. Envie para o branch (`git push origin feature/amazing-feature`)
5. Abra um Pull Request

## Licença

Este projeto é privado e proprietário. Todos os direitos reservados.
