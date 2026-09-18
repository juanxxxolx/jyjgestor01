/**
 * @fileoverview API de gestión de proveedores.
 */

import api from './client';

/** CRUD de proveedores. */
export const proveedoresApi = {
  /** Obtiene todos los proveedores. */
  getAll: () => api.get('/proveedores').then((r) => r.data),
  /** Obtiene un proveedor por su ID. */
  getById: (id: number) => api.get(`/proveedores/${id}`).then((r) => r.data),
  /** Crea un nuevo proveedor. */
  create: (data: any) => api.post('/proveedores', data).then((r) => r.data),
  /** Actualiza los datos de un proveedor. */
  update: (id: number, data: any) => api.patch(`/proveedores/${id}`, data).then((r) => r.data),
  /** Elimina un proveedor. */
  delete: (id: number) => api.delete(`/proveedores/${id}`).then((r) => r.data),
};
