import api from './client';
import type { Cliente } from '../types';

export const clientesApi = {
  getAll: (search?: string) =>
    api.get('/clientes', { params: search ? { search } : {} }).then((r) => r.data),

  getById: (id: number) =>
    api.get(`/clientes/${id}`).then((r) => r.data),

  create: (data: Omit<Cliente, 'id_cliente' | 'id_usuario'>) =>
    api.post('/clientes', data).then((r) => r.data),

  update: (id: number, data: Partial<Omit<Cliente, 'id_cliente' | 'id_usuario'>>) =>
    api.patch(`/clientes/${id}`, data).then((r) => r.data),

  delete: (id: number) =>
    api.delete(`/clientes/${id}`).then((r) => r.data),
};
