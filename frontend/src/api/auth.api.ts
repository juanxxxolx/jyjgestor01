/**
 * @fileoverview API de autenticación: login, registro, recuperación y reseteo de contraseña.
 */

import api from './client';

/** Servicios de autenticación. */
export const authApi = {
  /** Inicia sesión con email y contraseña, devuelve token y datos del usuario. */
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }).then((r) => r.data),

  /** Registra un nuevo usuario en el sistema. */
  register: (data: { nombre: string; email: string; password: string; id_rol?: number }) =>
    api.post('/auth/registro', data).then((r) => r.data),

  /** Envía un correo con el token para restablecer la contraseña. */
  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }).then((r) => r.data),

  /** Restablece la contraseña usando el token recibido por correo. */
  resetPassword: (token: string, password: string) =>
    api.post('/auth/reset-password', { token, password }).then((r) => r.data),
};
