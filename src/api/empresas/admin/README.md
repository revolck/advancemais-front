# API de Empresas - Admin

Gestão administrativa completa das empresas: cadastro, planos, pagamentos, vagas, banimentos e monitoramento operacional.

## 📋 Visão Geral

Esta API fornece endpoints para administradores gerenciarem empresas no sistema, incluindo:

- **Dashboard**: Listagem otimizada para dashboards administrativos
- **CRUD**: Criação, listagem, atualização e visualização de empresas
- **Pagamentos**: Histórico de transações financeiras
- **Banimentos**: Aplicação e revogação de banimentos
- **Vagas**: Gestão e aprovação de vagas publicadas

## 🔐 Permissões

Todos os endpoints são restritos aos perfis:

- `ADMIN`
- `MODERADOR` (exceto criação de empresas)
- `RECRUTADOR` (apenas dashboard)

## 📚 Endpoints Disponíveis

### Dashboard

#### `getAdminCompanyDashboard(params?, init?)`

Lista empresas para dashboard administrativo com até 10 empresas por página.

```typescript
import { getAdminCompanyDashboard } from "@/api/empresas/admin";

// Listar primeira página
const dashboard = await getAdminCompanyDashboard({ page: 1 });

// Buscar empresas
const search = await getAdminCompanyDashboard({
  page: 1,
  search: "Advance Tech",
});
```

**Parâmetros:**

- `page?: number` - Página atual (padrão: 1)
- `search?: string` - Filtro por nome, código, email ou CNPJ

**Resposta:**

```typescript
{
  data: AdminCompanyDashboardItem[];
  pagination: AdminCompanyPagination;
}
```

### CRUD de Empresas

#### `listAdminCompanies(params?, init?)`

Lista empresas com dados resumidos do plano ativo.

```typescript
import { listAdminCompanies } from "@/api/empresas/admin";

// Listar todas as empresas
const empresas = await listAdminCompanies();

// Listar com paginação
const empresas = await listAdminCompanies({
  page: 1,
  pageSize: 20,
  search: "São Paulo",
});
```

#### `createAdminCompany(data, init?)`

Cria uma nova empresa com plano opcional.

```typescript
import { createAdminCompany } from "@/api/empresas/admin";

const novaEmpresa = await createAdminCompany({
  nome: "Advance Tech Consultoria",
  email: "contato@advancetech.com.br",
  telefone: "11987654321",
  senha: "SenhaForte123!",
  supabaseId: "supabase-user-id",
  cnpj: "12345678000190",
  cidade: "São Paulo",
  estado: "SP",
  descricao: "Consultoria especializada em recrutamento.",
  aceitarTermos: true,
  plano: {
    planosEmpresariaisId: "b8d96a94-8a3d-4b90-8421-6f0a7bc1d42e",
    modo: "teste",
    diasTeste: 30,
  },
});
```

#### `updateAdminCompany(id, data, init?)`

Atualiza dados cadastrais da empresa.

```typescript
import { updateAdminCompany } from "@/api/empresas/admin";

const empresaAtualizada = await updateAdminCompany("empresa-id", {
  telefone: "11912345678",
  descricao: "Nova descrição da empresa.",
  status: "ATIVO",
  plano: {
    planosEmpresariaisId: "novo-plano-id",
    modo: "parceiro",
    resetPeriodo: false,
  },
});
```

#### `getAdminCompanyById(id, init?)`

Obtém detalhes completos da empresa.

```typescript
import { getAdminCompanyById } from "@/api/empresas/admin";

const empresa = await getAdminCompanyById("empresa-id");
console.log(empresa.empresa.plano.diasRestantes);
```

### Pagamentos

#### `listAdminCompanyPayments(id, params?, init?)`

Lista histórico de pagamentos da empresa.

```typescript
import { listAdminCompanyPayments } from "@/api/empresas/admin";

const pagamentos = await listAdminCompanyPayments("empresa-id", {
  page: 1,
  pageSize: 20,
});
```

### Banimentos

#### `listAdminCompanyBans(id, params?, init?)`

Lista banimentos aplicados à empresa.

```typescript
import { listAdminCompanyBans } from "@/api/empresas/admin";

const banimentos = await listAdminCompanyBans("empresa-id");
```

#### `createAdminCompanyBan(id, data, init?)`

Aplica banimento à empresa.

```typescript
import { createAdminCompanyBan } from "@/api/empresas/admin";

const banimento = await createAdminCompanyBan("empresa-id", {
  tipo: "TEMPORARIO",
  motivo: "VIOLACAO_POLITICAS",
  dias: 30,
  observacoes: "Uso indevido de dados pessoais.",
});
```

#### `revokeAdminCompanyBan(id, data?, init?)`

Revoga banimento ativo da empresa.

```typescript
import { revokeAdminCompanyBan } from "@/api/empresas/admin";

await revokeAdminCompanyBan("empresa-id", {
  observacoes: "Contato telefônico validou conformidade.",
});
```

### Vagas

#### `listAdminCompanyVacancies(id, params?, init?)`

Lista histórico de vagas da empresa.

```typescript
import { listAdminCompanyVacancies } from "@/api/empresas/admin";

// Listar todas as vagas
const vagas = await listAdminCompanyVacancies("empresa-id");

// Filtrar por status
const vagasPublicadas = await listAdminCompanyVacancies("empresa-id", {
  status: "PUBLICADO",
  page: 1,
  pageSize: 20,
});
```

#### `listAdminCompanyVacanciesInReview(id, params?, init?)`

Lista vagas em análise da empresa.

```typescript
import { listAdminCompanyVacanciesInReview } from "@/api/empresas/admin";

const vagasEmAnalise = await listAdminCompanyVacanciesInReview("empresa-id");
```

#### `approveAdminCompanyVacancy(id, vagaId, init?)`

Aprova vaga em análise.

```typescript
import { approveAdminCompanyVacancy } from "@/api/empresas/admin";

const vagaAprovada = await approveAdminCompanyVacancy("empresa-id", "vaga-id");
```

## 🎯 Tipos Principais

### Empresa (Dashboard)

```typescript
interface AdminCompanyDashboardItem {
  id: string;
  codUsuario: string;
  nome: string;
  email: string;
  telefone: string;
  avatarUrl: string;
  cnpj: string;
  status: "ATIVO" | "INATIVO";
  criadoEm: string;
  vagasPublicadas: number;
  limiteVagasPlano: number;
  plano: AdminCompanyPlano;
}
```

### Empresa (Detalhada)

```typescript
interface AdminCompanyDetail {
  id: string;
  codUsuario: string;
  nome: string;
  email: string;
  telefone: string;
  avatarUrl: string;
  cnpj: string;
  descricao: string;
  socialLinks: {
    linkedin?: string;
    instagram?: string;
  };
  cidade: string;
  estado: string;
  enderecos: AdminCompanyEndereco[];
  criadoEm: string;
  status: "ATIVO" | "INATIVO";
  ultimoLogin: string;
  ativa: boolean;
  parceira: boolean;
  diasTesteDisponibilizados: number;
  plano: AdminCompanyPlano;
  vagas: {
    publicadas: number;
    limitePlano: number;
  };
  pagamento: {
    modelo: "ASSINATURA";
    metodo: "PIX" | "CARTAO_CREDITO" | "CARTAO_DEBITO" | "BOLETO";
    status: "APROVADO" | "PENDENTE" | "REJEITADO" | "CANCELADO";
    ultimoPagamentoEm: string;
  };
  banida: boolean;
  banimentoAtivo: AdminCompanyBanItem | null;
  informacoes: {
    telefone: string;
    descricao: string;
    avatarUrl: string;
    aceitarTermos: boolean;
  };
}
```

### Plano

```typescript
interface AdminCompanyPlano {
  id: string;
  nome: string;
  modo: "teste" | "parceiro" | "ASSINATURA";
  status: "ATIVO" | "INATIVO";
  inicio: string;
  fim: string | null;
  modeloPagamento: "ASSINATURA";
  metodoPagamento: "PIX" | "CARTAO_CREDITO" | "CARTAO_DEBITO" | "BOLETO";
  statusPagamento: "APROVADO" | "PENDENTE" | "REJEITADO" | "CANCELADO";
  valor: string;
  quantidadeVagas: number;
  duracaoEmDias: number | null;
  diasRestantes: number;
}
```

### Banimento

```typescript
interface AdminCompanyBanItem {
  id: string;
  alvo: {
    tipo: "EMPRESA";
    id: string;
    nome: string;
    role: "EMPRESA";
  };
  banimento: {
    tipo: "TEMPORARIO" | "PERMANENTE";
    motivo:
      | "VIOLACAO_POLITICAS"
      | "SPAM"
      | "CONTEUDO_INAPPROPRIADO"
      | "FRAUDE"
      | "OUTROS";
    status: "ATIVO" | "REVOGADO" | "EXPIRADO";
    inicio: string;
    fim: string;
    observacoes: string;
  };
  aplicadoPor: {
    id: string;
    nome: string;
    role: "ADMIN" | "MODERADOR";
  };
  auditoria: {
    criadoEm: string;
    atualizadoEm: string;
  };
}
```

## ⚠️ Tratamento de Erros

Todas as funções retornam tipos de resposta que incluem possíveis erros:

```typescript
// Exemplo de tratamento de erro
try {
  const empresas = await listAdminCompanies();

  if ("data" in empresas) {
    // Sucesso
    console.log(empresas.data);
  } else {
    // Erro
    console.error("Erro:", empresas.message);
  }
} catch (error) {
  console.error("Erro de rede:", error);
}
```

### Códigos de Erro Comuns

- `VALIDATION_ERROR` - Dados inválidos
- `NOT_FOUND` - Recurso não encontrado
- `DUPLICATE_ERROR` - Dados duplicados
- `BANIMENTO_NOT_FOUND` - Nenhum banimento ativo encontrado

## 🔄 Migração

Se você estava usando a versão anterior da API, as principais mudanças são:

1. **Novos tipos**: Estruturas mais detalhadas e específicas
2. **Novos endpoints**: Dashboard e revogação de banimentos
3. **Melhor tipagem**: Respostas com tipos de erro específicos
4. **JSDoc completo**: Documentação inline para todas as funções

## 📝 Exemplos de Uso

### Dashboard Administrativo

```typescript
import { getAdminCompanyDashboard } from "@/api/empresas/admin";

const DashboardComponent = () => {
  const [empresas, setEmpresas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEmpresas = async () => {
      try {
        const response = await getAdminCompanyDashboard({ page: 1 });
        if ("data" in response) {
          setEmpresas(response.data);
        }
      } catch (error) {
        console.error("Erro ao carregar empresas:", error);
      } finally {
        setLoading(false);
      }
    };

    loadEmpresas();
  }, []);

  if (loading) return <div>Carregando...</div>;

  return (
    <div>
      {empresas.map((empresa) => (
        <div key={empresa.id}>
          <h3>{empresa.nome}</h3>
          <p>
            Vagas: {empresa.vagasPublicadas}/{empresa.limiteVagasPlano}
          </p>
          <p>Plano: {empresa.plano.nome}</p>
        </div>
      ))}
    </div>
  );
};
```

### Gestão de Banimentos

```typescript
import {
  listAdminCompanyBans,
  createAdminCompanyBan,
  revokeAdminCompanyBan,
} from "@/api/empresas/admin";

const BanimentoComponent = ({ empresaId }: { empresaId: string }) => {
  const [banimentos, setBanimentos] = useState([]);

  const aplicarBanimento = async () => {
    const response = await createAdminCompanyBan(empresaId, {
      tipo: "TEMPORARIO",
      motivo: "VIOLACAO_POLITICAS",
      dias: 30,
      observacoes: "Violação das políticas de uso",
    });

    if ("banimento" in response) {
      // Sucesso
      loadBanimentos();
    }
  };

  const revogarBanimento = async () => {
    const response = await revokeAdminCompanyBan(empresaId, {
      observacoes: "Banimento revogado após contato",
    });

    if (response === undefined) {
      // Sucesso (204 No Content)
      loadBanimentos();
    }
  };

  return (
    <div>
      <button onClick={aplicarBanimento}>Aplicar Banimento</button>
      <button onClick={revogarBanimento}>Revogar Banimento</button>
    </div>
  );
};
```
