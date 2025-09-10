/**
 * Utilitários para trabalhar com datas no formato brasileiro
 */

/**
 * Converte um datetime-local para formato ISO mantendo o horário como horário de Brasília
 * @param dateTimeLocal - String no formato YYYY-MM-DDTHH:mm do input datetime-local
 * @returns String no formato ISO que representa o horário brasileiro
 */
export const formatBrazilianDateTimeToISO = (dateTimeLocal: string): string => {
  if (!dateTimeLocal) return '';
  
  // O input datetime-local retorna no formato YYYY-MM-DDTHH:mm
  // Precisamos manter esse horário exato como horário brasileiro
  const localDate = new Date(dateTimeLocal);
  
  // Criar uma nova data assumindo que o input é horário de Brasília (UTC-3)
  // Ajustar para UTC adicionando 3 horas para que quando o servidor interpretar como UTC,
  // ele resulte no horário correto brasileiro
  const utcDate = new Date(localDate.getTime() + (3 * 60 * 60 * 1000));
  
  return utcDate.toISOString().replace('.000Z', 'Z');
};

/**
 * Converte uma data ISO para formato datetime-local (para usar em inputs)
 * @param isoString - String no formato ISO
 * @returns String no formato YYYY-MM-DDTHH:mm para input datetime-local
 */
export const formatISOToBrazilianDateTimeLocal = (isoString: string): string => {
  if (!isoString) return '';
  
  const date = new Date(isoString);
  // Ajustar para horário brasileiro (UTC-3)
  const brazilianDate = new Date(date.getTime() - (3 * 60 * 60 * 1000));
  
  // Retornar no formato YYYY-MM-DDTHH:mm
  return brazilianDate.toISOString().slice(0, 16);
};

/**
 * Formata uma data para exibição no formato brasileiro
 * @param dateString - String de data (ISO ou datetime-local)
 * @returns String formatada para exibição (DD/MM/AAAA HH:mm)
 */
export const formatToBrazilianDisplay = (dateString: string): string => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  return date.toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Valida se uma data está no formato correto e é válida
 * @param dateString - String de data para validar
 * @returns boolean indicando se a data é válida
 */
export const isValidBrazilianDateTime = (dateString: string): boolean => {
  if (!dateString) return false;
  
  const date = new Date(dateString);
  return !isNaN(date.getTime());
};

/**
 * Obtém a data/hora atual no formato datetime-local para o timezone brasileiro
 * @returns String no formato YYYY-MM-DDTHH:mm
 */
export const getCurrentBrazilianDateTime = (): string => {
  const now = new Date();
  const brazilianTime = new Date(now.toLocaleString("en-US", {timeZone: "America/Sao_Paulo"}));
  return brazilianTime.toISOString().slice(0, 16);
};
