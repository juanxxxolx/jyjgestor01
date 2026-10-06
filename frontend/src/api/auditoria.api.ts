/**
 * @fileoverview API de auditoría para consultar logs de actividad del sistema.
 */

import api from './client';

/** Servicios de consulta de logs de auditoría. */
export const auditoriaApi = {
  /** Obtiene lista paginada de logs de auditoría con filtros opcionales. */
  getAll: (page = 1, limit = 50, fechaDesde?: string, fechaHasta?: string) =>
    api.get('/audit-logs', { params: { page, limit, fechaDesde, fechaHasta } }).then((r) => r.data),
};
