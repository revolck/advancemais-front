# Mercado Pago - Tokenização de Cartão

## Visão Geral

Este módulo fornece integração com o SDK do Mercado Pago para tokenização de cartões de crédito/débito no frontend. Isso permite que dados sensíveis do cartão nunca passem pelo seu servidor (conformidade PCI-DSS).

## Arquivos

```
src/lib/mercadopago/
├── index.ts          # Exports públicos
├── types.ts          # Tipos TypeScript
├── provider.tsx      # MercadoPagoProvider (contexto)
├── useCardToken.ts   # Hook para tokenização
└── README.md         # Esta documentação
```

## Configuração

### 1. Variável de Ambiente

```env
# .env.local
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=APP_USR-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

### 2. Provider (já configurado em `src/app/providers.tsx`)

O `MercadoPagoProvider` já está configurado no layout da aplicação. Ele inicializa o SDK automaticamente.

## Uso

### Componente CardFormTokenized

O componente `CardFormTokenized` encapsula todo o fluxo de coleta e tokenização:

```tsx
import { CardFormTokenized } from "@/theme/website/components/checkout/components";

function CheckoutPage() {
  const handleTokenGenerated = (token: string, lastFour: string, brand: string) => {
    // Enviar token para o backend
    console.log("Token gerado:", token);
    console.log("Últimos 4 dígitos:", lastFour);
    console.log("Bandeira:", brand);
  };

  return (
    <CardFormTokenized
      documentType="CPF"
      documentNumber="12345678900"
      onTokenGenerated={handleTokenGenerated}
      onError={(error) => console.error(error)}
    />
  );
}
```

### Hook useCardToken (uso avançado)

Para casos onde você precisa de mais controle:

```tsx
import { useCardToken, type CardData } from "@/lib/mercadopago";

function CustomCardForm() {
  const { tokenize, isTokenizing, error } = useCardToken();

  const handleSubmit = async () => {
    const cardData: CardData = {
      cardNumber: "4111111111111111",
      cardholderName: "FULANO DE TAL",
      expirationMonth: "12",
      expirationYear: "25",
      securityCode: "123",
      identificationType: "CPF",
      identificationNumber: "12345678900",
    };

    const result = await tokenize(cardData);

    if (result.success) {
      // Enviar result.token para o backend
      await sendToBackend({
        token: result.token,
        // ...outros dados
      });
    }
  };

  return (
    <div>
      {/* Seus inputs customizados */}
      <button onClick={handleSubmit} disabled={isTokenizing}>
        {isTokenizing ? "Processando..." : "Pagar"}
      </button>
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
}
```

## Integração com Backend

### Enviando o token para assinaturas

```typescript
// CheckoutIntent com token de cartão
const checkoutIntent: CheckoutIntent = {
  usuarioId: userId,
  planosEmpresariaisId: planId,
  metodo: "assinatura",
  pagamento: "card",
  aceitouTermos: true,
  card: {
    token: cardToken,      // ← Token gerado pelo SDK
    installments: 1,       // Opcional: parcelas
  },
  // ...
};

const result = await startCheckout(checkoutIntent);
```

### Enviando o token para pagamentos únicos (cursos)

```typescript
// Para pagamentos únicos de cursos (implementação futura)
const paymentIntent: SinglePaymentIntent = {
  usuarioId: userId,
  items: [{ title: "Curso XYZ", quantity: 1, unit_price: 199.90 }],
  card: {
    token: cardToken,
    installments: 3,
  },
  // ...
};
```

## Cartões de Teste

| Bandeira | Número | CVV | Validade |
|----------|--------|-----|----------|
| Visa | 4111 1111 1111 1111 | 123 | Qualquer futura |
| Mastercard | 5031 4332 1540 6351 | 123 | Qualquer futura |
| Amex | 3711 803032 57522 | 1234 | Qualquer futura |

**Importante:** Use credenciais de teste para ambiente de desenvolvimento.

## Fluxo de Segurança

```
[Navegador] → [SDK Mercado Pago] → [Servidores MP] → Token
                    ↓
                Dados do cartão NUNCA passam pelo seu servidor
                    ↓
[Seu Backend] ← Token ← [Frontend]
                    ↓
[Backend] → [API Mercado Pago] → Pagamento processado
```

## Troubleshooting

### "SDK do Mercado Pago não está pronto"

- Verifique se `NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY` está configurada
- Aguarde a inicialização do SDK (hook `useMercadoPago().isReady`)

### "Número do cartão inválido"

- Verifique o algoritmo de Luhn
- Confirme que o cartão não está expirado
- Use um cartão de teste válido em ambiente de desenvolvimento

### Erro de identificação

- CPF deve ter 11 dígitos (apenas números)
- CNPJ deve ter 14 dígitos (apenas números)

## Referências

- [Documentação Mercado Pago - Checkout API](https://www.mercadopago.com.br/developers/pt/docs/checkout-api/landing)
- [SDK React do Mercado Pago](https://github.com/mercadopago/sdk-react)

