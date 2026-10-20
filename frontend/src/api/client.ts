/**
 * @fileoverview Cliente HTTP Axios preconfigurado para consumir la API del backend.
 * Incluye interceptores para adjuntar el token JWT, manejo global de errores
 * y redirección al login en 401.
 */

import axios from 'axios';
import { message } from 'antd';

/** Instancia compartida de Axios con baseURL '/api'. */
const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
});

/** Contador de peticiones activas para loading global. */
let activeRequests = 0;

function showGlobalLoading() {
  activeRequests++;
  if (activeRequests === 1) {
    message.loading({ content: 'Procesando...', key: 'global-loading', duration: 0 });
  }
}

function hideGlobalLoading() {
  activeRequests = Math.max(0, activeRequests - 1);
  if (activeRequests === 0) {
    message.destroy('global-loading');
  }
}

/** Adjunta el token JWT del localStorage a cada petición. */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;

  // Mostrar loading global para mutaciones (POST, PUT, PATCH, DELETE)
  const method = (config.method || '').toUpperCase();
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    showGlobalLoading();
  }
  return config;
});

/** Manejo global de respuestas y errores. */
api.interceptors.response.use(
  (res) => {
    const method = (res.config.method || '').toUpperCase();
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      hideGlobalLoading();
    }
    return res;
  },
  (err) => {
    const method = err.config?.method?.toUpperCase();
    if (method && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      hideGlobalLoading();
    }

    // Error de red / timeout
    if (!err.response) {
      message.error({ content: 'Error de conexión. Verifique su red.', key: 'network-error', duration: 4 });
      return Promise.reject(err);
    }

    const status = err.response.status;

    // 401: sesión expirada
    if (status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      message.error({ content: 'Sesión expirada. Redirigiendo al login...', key: 'auth-error', duration: 3 });
      setTimeout(() => { window.location.href = '/login'; }, 1500);
      return Promise.reject(err);
    }

    // 403: sin permisos
    if (status === 403) {
      message.error({ content: 'No tiene permisos para esta acción.', key: 'forbidden-error', duration: 4 });
      return Promise.reject(err);
    }

    // 422: validación del backend
    if (status === 422) {
      const msg = err.response.data?.message || err.response.data?.error || 'Datos inválidos';
      message.error({ content: msg, key: 'validation-error', duration: 5 });
      return Promise.reject(err);
    }

    // 500+: error del servidor
    if (status >= 500) {
      message.error({ content: 'Error del servidor. Intente de nuevo más tarde.', key: 'server-error', duration: 5 });
      return Promise.reject(err);
    }

    // Otros errores: mostrar mensaje del backend si existe
    const msg = err.response.data?.message || err.response.data?.error || 'Error inesperado';
    message.error({ content: msg, key: 'api-error', duration: 4 });

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
      if (value !== undefined) {
        result[key] = sanitizePayload(value);
      }
    }
    return result;
  }
  return obj;
}

export default api;