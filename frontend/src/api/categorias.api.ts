import api from './client';
import type { Categoria } from '../types';

export const categoriasApi = {
  getAll: () =>
    api.get('/categorias').then((r) => r.data),

  getById: (id: number) =>
    api.get(`/categorias/${id}`).then((r) => r.data),

  create: (data: Pick<Categoria, 'nombre_categoria'>) =>
    api.post('/categorias', data).then((r) => r.data),

  update: (id: number, data: Partial<Pick<Categoria, 'nombre_categoria'>>) =>
    api.patch(`/categorias/${id}`, data).then((r) => r.data),

  delete: (id: number) =>
    api.delete(`/categorias/${id}`).then((r) => r.data),
};
