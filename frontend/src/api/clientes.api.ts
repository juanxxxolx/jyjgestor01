/**
 * @fileoverview API de gestión de clientes.
 */

import api from './client';
import type { Cliente } from '../types';

/** CRUD de clientes con paginación y búsqueda. */
export const clientesApi = {
  /** Obtiene lista paginada de clientes, opcionalmente filtrada por búsqueda. */
  getAll: (search?: string, page = 1, limit = 20) =>
    api.get('/clientes', { params: { search, page, limit } }).then((r) => r.data),

  /** Obtiene un cliente por su ID. */
  getById: (id: number) =>
    api.get(`/clientes/${id}`).then((r) => r.data),

  /** Crea un nuevo cliente. */
  create: (data: Omit<Cliente, 'id_cliente' | 'id_usuario'>) =>
    api.post('/clientes', data).then((r) => r.data),

  /** Actualiza los datos de un cliente existente. */
  update: (id: number, data: Partial<Omit<Cliente, 'id_cliente' | 'id_usuario'>>) =>
    api.patch(`/clientes/${id}`, data).then((r) => r.data),

  /** Elimina un cliente. */
  delete: (id: number) =>
    api.delete(`/clientes/${id}`).then((r) => r.data),
};
