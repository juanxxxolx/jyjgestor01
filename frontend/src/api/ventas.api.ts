import api from './client';

export const ventasApi = {
  getAll: (page = 1, limit = 20) =>
    api.get('/ventas', { params: { page, limit } }).then((r) => r.data),

  getById: (id: number) =>
    api.get(`/ventas/${id}`).then((r) => r.data),

  create: (data: { id_cliente?: number; detalle: { id_producto: number; cantidad: number }[] }) =>
    api.post('/ventas', data).then((r) => r.data),

  anular: (id: number) =>
    api.patch(`/ventas/${id}/anular`).then((r) => r.data),
};
