/**
 * @fileoverview API de gestión de categorías de productos.
 */

import api from './client';
import type { Categoria } from '../types';

/** CRUD de categorías. */
export const categoriasApi = {
  /** Obtiene todas las categorías. */
  getAll: () =>
    api.get('/categorias').then((r) => r.data),

  /** Obtiene una categoría por su ID. */
  getById: (id: number) =>
    api.get(`/categorias/${id}`).then((r) => r.data),

  /** Crea una nueva categoría. */
  create: (data: Pick<Categoria, 'nombre_categoria'>) =>
    api.post('/categorias', data).then((r) => r.data),

  /** Actualiza el nombre de una categoría. */
  update: (id: number, data: Partial<Pick<Categoria, 'nombre_categoria'>>) =>
    api.patch(`/categorias/${id}`, data).then((r) => r.data),

  /** Elimina una categoría. */
  delete: (id: number) =>
    api.delete(`/categorias/${id}`).then((r) => r.data),
};
