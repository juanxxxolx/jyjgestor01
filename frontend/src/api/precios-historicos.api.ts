/**
 * @fileoverview API de precios históricos de productos.
 */

import api from './client';

/** Servicios de consulta de historial de precios. */
export const preciosHistoricosApi = {
  /** Obtiene todos los registros de precios históricos, opcionalmente filtrados por producto. */
  getAll: (productoId?: number) =>
    api.get('/precios-historicos', { params: { producto: productoId } }).then((r) => r.data),

  /** Obtiene el historial de precios de un producto específico. */
  getByProducto: (productoId: number) =>
    api.get(`/precios-historicos/producto/${productoId}`).then((r) => r.data),
};
