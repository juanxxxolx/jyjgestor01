/**
 * @fileoverview API de movimientos de inventario (entradas, salidas, ajustes).
 */

import api from './client';

/** CRUD de movimientos de inventario. */
export const movimientosApi = {
  /** Obtiene lista paginada de movimientos, opcionalmente filtrada por producto. */
  getAll: (productoId?: number, page = 1, limit = 20) =>
    api.get('/movimientos', { params: { producto: productoId, page, limit } }).then((r) => r.data),

  /** Obtiene los movimientos de un producto específico. */
  getByProducto: (id: number) =>
    api.get(`/movimientos/producto/${id}`).then((r) => r.data),

  /** Registra un nuevo movimiento de inventario. */
  create: (data: { id_producto: number; tipo_movimiento: string; cantidad: number; motivo: string; id_cliente?: number }) =>
    api.post('/movimientos', data).then((r) => r.data),
};
