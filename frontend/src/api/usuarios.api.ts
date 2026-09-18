/**
 * @fileoverview API de administración de usuarios.
 */

import api from './client';

/** CRUD de usuarios del sistema. */
export const usuariosApi = {
  /** Obtiene todos los usuarios. */
  getAll: () => api.get('/usuarios').then((r) => r.data),

  /** Obtiene un usuario por su ID. */
  getById: (id: number) => api.get(`/usuarios/${id}`).then((r) => r.data),

  /** Actualiza el rol o estado activo de un usuario. */
  update: (id: number, data: { id_rol?: number; activo?: boolean }) =>
    api.patch(`/usuarios/${id}`, data).then((r) => r.data),

  /** Elimina (desactiva) un usuario. */
  delete: (id: number) => api.delete(`/usuarios/${id}`).then((r) => r.data),
};
