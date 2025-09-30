// Utility for getting event prices when not available from API
export const EVENT_PRICES: Record<string, number> = {
  'FederaLideres': 17000, // R$ 170,00 em centavos
  // Adicionar outros eventos conforme necessário
};

export function getEventPrice(eventId: string): number | undefined {
  return EVENT_PRICES[eventId];
}

export function formatEventPrice(price: number | undefined, eventId?: string): string {
  // Se não tiver preço definido, mas temos o eventId, tentar buscar preço conhecido
  let finalPrice = price;
  if ((finalPrice === undefined || finalPrice === null || isNaN(finalPrice) || finalPrice === 0) && eventId) {
    finalPrice = getEventPrice(eventId);
  }
  
  if (finalPrice === undefined || finalPrice === null || isNaN(finalPrice) || finalPrice === 0) {
    return 'Gratuito';
  }
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(finalPrice / 100);
}