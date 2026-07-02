import api from './client';

export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }).then((r) => r.data),

  register: (data: { nombre: string; email: string; password: string; id_rol?: number }) =>
    api.post('/auth/registro', data).then((r) => r.data),
};
