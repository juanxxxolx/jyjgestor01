/**
 * @fileoverview API de gestión de productos, incluyendo importación/exportación e imágenes.
 */

import api from './client';
import type { Producto } from '../types';

/** CRUD de productos y utilidades (stock bajo, exportación, imágenes). */
export const productosApi = {
  /** Obtiene lista paginada de productos, opcionalmente filtrada por búsqueda. */
  getAll: (page = 1, limit = 20, search?: string) =>
    api.get('/productos', { params: { page, limit, search } }).then((r) => r.data),

  /** Obtiene un producto por su ID. */
  getById: (id: number) =>
    api.get(`/productos/${id}`).then((r) => r.data),

  /** Obtiene productos con stock por debajo del mínimo. */
  getLowStock: () =>
    api.get('/productos/bajo-stock').then((r) => r.data),

  /** Crea un nuevo producto. */
  create: (data: Omit<Producto, 'id_producto' | 'categoria'>) =>
    api.post('/productos', data).then((r) => r.data),

  /** Actualiza los datos de un producto existente. */
  update: (id: number, data: Partial<Omit<Producto, 'id_producto' | 'categoria'>>) =>
    api.patch(`/productos/${id}`, data).then((r) => r.data),

  /** Exporta la lista de productos a un archivo Excel. */
  exportExcel: () =>
    api.get('/productos/export', { responseType: 'blob' }).then((r) => r.data),

  /** Sube una imagen para un producto. */
  uploadImage: (id: number, file: File) => {
    const formData = new FormData();
    formData.append('imagen', file);
    return api.post(`/productos/${id}/imagen`, formData).then((r) => r.data);
  },

  /** Elimina un producto. */
  delete: (id: number) =>
    api.delete(`/productos/${id}`).then((r) => r.data),
};
