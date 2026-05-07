# InputSearch

Componente generico para substituir selects com grande volume de dados. A busca fica desacoplada do dominio: o componente recebe `apiProps.fetcher` e nao importa rotas, `apiFetch` ou servicos especificos.

## Uso basico

```tsx
import { InputSearch, type InputSearchOption } from "@/components/ui/custom/inputSearch";
import { apiFetch } from "@/api/client";

type EmpresaApiItem = {
  id: string;
  razaoSocial: string;
  cnpj: string;
  codigo?: string;
  email?: string;
};

const [empresa, setEmpresa] = useState<InputSearchOption<EmpresaApiItem> | null>(null);

<InputSearch<EmpresaApiItem>
  label="Empresa"
  placeholder="Buscar por nome, CNPJ, email ou codigo"
  value={empresa}
  onChange={(value) => setEmpresa(value as InputSearchOption<EmpresaApiItem> | null)}
  apiProps={{
    fields: ["cnpj", "name", "email", "cod"],
    minLength: 3,
    limit: 10,
    fetcher: async ({ query, fields, limit, signal }) => {
      const params = new URLSearchParams({
        search: query,
        fields: fields.join(","),
        limit: String(limit),
      });

      return apiFetch<{ empresas: EmpresaApiItem[] }>(
        `/api/v1/empresas?${params.toString()}`,
        {
          init: { signal },
          cache: "no-cache",
        }
      );
    },
  }}
/>
```

## Campos de busca

`apiProps.fields` aceita:

- `cnpj`
- `cpf`
- `name`
- `email`
- `cod`

Esses campos sao enviados ao `fetcher`; a API decide como aplicar a busca.

## Voz

`enableVoiceSearch` vem habilitado por padrao. O botao de microfone so aparece quando o navegador suporta `SpeechRecognition` ou `webkitSpeechRecognition`.
