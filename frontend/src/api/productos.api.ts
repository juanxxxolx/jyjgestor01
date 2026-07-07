import api from './client';
import type { Producto } from '../types';

export const productosApi = {
  getAll: (page = 1, limit = 20, search?: string) =>
    api.get('/productos', { params: { page, limit, search } }).then((r) => r.data),

  getById: (id: number) =>
    api.get(`/productos/${id}`).then((r) => r.data),

  getLowStock: () =>
    api.get('/productos/bajo-stock').then((r) => r.data),

  create: (data: Omit<Producto, 'id_producto' | 'categoria'>) =>
    api.post('/productos', data).then((r) => r.data),

  update: (id: number, data: Partial<Omit<Producto, 'id_producto' | 'categoria'>>) =>
    api.patch(`/productos/${id}`, data).then((r) => r.data),

  exportExcel: () =>
    api.get('/productos/export', { responseType: 'blob' }).then((r) => r.data),

  uploadImage: (id: number, file: File) => {
    const formData = new FormData();
    formData.append('imagen', file);
    return api.post(`/productos/${id}/imagen`, formData).then((r) => r.data);
  },

  delete: (id: number) =>
    api.delete(`/productos/${id}`).then((r) => r.data),
};
