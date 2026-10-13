/**
 * @fileoverview Utilidades de formato para Pesos Colombianos (COP).
 * COP no usa decimales, por lo que se formatea sin decimales.
 */

/**
 * Formatea un número como Pesos Colombianos (COP) sin decimales.
 * @param value - Valor numérico a formatear
 * @returns String formateado con separadores de miles y símbolo COP
 */
export function formatCOP(value: number | string | undefined | null): string {
  if (value === undefined || value === null) return '0';
  const num = Number(value);
  if (isNaN(num)) return '0';
  return num.toLocaleString('es-CO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

/**
 * Formatea un número como COP con el símbolo 'COP ' prefijo.
 * @param value - Valor numérico a formatear
 * @returns String formateado con 'COP ' y separadores de miles
 */
export function formatCOPWithSymbol(value: number | string | undefined | null): string {
  if (value === undefined || value === null) return 'COP 0';
  const num = Number(value);
  if (isNaN(num)) return 'COP 0';
  return `COP ${num.toLocaleString('es-CO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

/**
 * Formatea un número con separadores de miles (sin símbolo).
 * @param value - Valor numérico a formatear
 * @returns String formateado con separadores de miles
 */
export function formatNumber(value: number | string | undefined | null): string {
  if (value === undefined || value === null) return '0';
  const num = Number(value);
  if (isNaN(num)) return '0';
  return num.toLocaleString('es-CO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}