const DELIVERY_TIMEOUT_ERROR =
  "Tempo limite de 5 minutos excedido durante o processamento do envio.";

export function getDeliveryFailureMessage(error?: string | null) {
  if (!error) {
    return "Falha ao processar o envio da campanha.";
  }

  if (error.includes(DELIVERY_TIMEOUT_ERROR)) {
    return "O envio excedeu o limite de 5 minutos e foi encerrado automaticamente.";
  }

  return error;
}

