/**
 * @fileoverview API de reportes y estadísticas del sistema.
 */

import api from './client';

/** Servicios de reportes con filtros por fechas. */
export const reportesApi = {
  /** Reporte de ventas agrupadas por fecha. */
  ventasPorFecha: (desde?: string, hasta?: string) =>
    api.get('/reportes/ventas-por-fecha', { params: { desde, hasta } }).then((r) => r.data),

  /** Reporte de ventas agrupadas por producto. */
  ventasPorProducto: (desde?: string, hasta?: string) =>
    api.get('/reportes/ventas-por-producto', { params: { desde, hasta } }).then((r) => r.data),

  /** Reporte de ventas agrupadas por cliente. */
  ventasPorCliente: (desde?: string, hasta?: string) =>
    api.get('/reportes/ventas-por-cliente', { params: { desde, hasta } }).then((r) => r.data),

  /** Reporte de ventas diarias en un rango de fechas. */
  ventasDiarias: (desde?: string, hasta?: string) =>
    api.get('/reportes/ventas-diarias', { params: { desde, hasta } }).then((r) => r.data),
};
