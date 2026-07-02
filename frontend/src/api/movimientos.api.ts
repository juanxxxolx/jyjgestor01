import api from './client';

export const movimientosApi = {
  getAll: (productoId?: number) =>
    api.get('/movimientos', { params: productoId ? { producto: productoId } : {} }).then((r) => r.data),

  getByProducto: (id: number) =>
    api.get(`/movimientos/producto/${id}`).then((r) => r.data),

  create: (data: { id_producto: number; tipo_movimiento: string; cantidad: number; motivo: string }) =>
    api.post('/movimientos', data).then((r) => r.data),
};
