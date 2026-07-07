import api from './client';

export const preciosHistoricosApi = {
  getAll: (productoId?: number) =>
    api.get('/precios-historicos', { params: { producto: productoId } }).then((r) => r.data),

  getByProducto: (productoId: number) =>
    api.get(`/precios-historicos/producto/${productoId}`).then((r) => r.data),
};
