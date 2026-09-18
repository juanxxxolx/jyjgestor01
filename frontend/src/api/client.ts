/**
 * @fileoverview Cliente HTTP Axios preconfigurado para consumir la API del backend.
 * Incluye interceptores para adjuntar el token JWT y redirigir al login en 401.
 */

import axios from 'axios';

/** Instancia compartida de Axios con baseURL '/api'. */
const api = axios.create({
  baseURL: '/api',
});

/** Adjunta el token JWT del localStorage a cada petición. */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/** Si la respuesta es 401, limpia la sesión y redirige al login. */
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  },
);

// Sanitizar payloads: trim a todos los strings
api.interceptors.request.use((config) => {
  if (config.data && typeof config.data === 'object') {
    config.data = sanitizePayload(config.data);
  }
  return config;
});

function sanitizePayload(obj: any): any {
  if (typeof obj === 'string') return obj.trim();
  if (Array.isArray(obj)) return obj.map(sanitizePayload);
  if (obj && typeof obj === 'object') {
    const result: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = sanitizePayload(value);
    }
    return result;
  }
  return obj;
}

export default api;
