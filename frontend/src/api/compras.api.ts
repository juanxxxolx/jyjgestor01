/**
 * @fileoverview API de gestión de compras a proveedores.
 */

import api from './client';

/** CRUD de compras con paginación y búsqueda. */
export const comprasApi = {
  /** Obtiene lista paginada de compras. */
  getAll: (page = 1, limit = 20, search?: string) =>
    api.get('/compras', { params: { page, limit, search } }).then((r) => r.data),
  /** Obtiene una compra por su ID. */
  getById: (id: number) => api.get(`/compras/${id}`).then((r) => r.data),
  /** Registra una nueva compra con su detalle. */
  create: (data: any) => api.post('/compras', data).then((r) => r.data),
};
