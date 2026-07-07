import api from './client';

export const usuariosApi = {
  getAll: () => api.get('/usuarios').then((r) => r.data),

  getById: (id: number) => api.get(`/usuarios/${id}`).then((r) => r.data),

  update: (id: number, data: { id_rol?: number; activo?: boolean }) =>
    api.patch(`/usuarios/${id}`, data).then((r) => r.data),
};
