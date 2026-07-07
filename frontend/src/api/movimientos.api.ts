import api from './client';

export const movimientosApi = {
  getAll: (productoId?: number, page = 1, limit = 20) =>
    api.get('/movimientos', { params: { producto: productoId, page, limit } }).then((r) => r.data),

  getByProducto: (id: number) =>
    api.get(`/movimientos/producto/${id}`).then((r) => r.data),

  create: (data: { id_producto: number; tipo_movimiento: string; cantidad: number; motivo: string; id_cliente?: number }) =>
    api.post('/movimientos', data).then((r) => r.data),
};
