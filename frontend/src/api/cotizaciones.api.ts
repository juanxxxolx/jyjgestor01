/**
 * @fileoverview API de gestión de cotizaciones (presupuestos a clientes).
 */

import api from './client';

/** CRUD de cotizaciones con opción de convertir a venta. */
export const cotizacionesApi = {
  /** Obtiene lista paginada de cotizaciones. */
  getAll: (page = 1, limit = 20) =>
    api.get('/cotizaciones', { params: { page, limit } }).then((r) => r.data),

  /** Obtiene una cotización por su ID. */
  getById: (id: number) =>
    api.get(`/cotizaciones/${id}`).then((r) => r.data),

  /** Crea una nueva cotización. */
  create: (data: { id_cliente?: number; detalle: { id_producto: number; cantidad: number }[] }) =>
    api.post('/cotizaciones', data).then((r) => r.data),

  /** Actualiza una cotización pendiente. */
  update: (id: number, data: { id_cliente?: number; detalle?: { id_producto: number; cantidad: number }[] }) =>
    api.put(`/cotizaciones/${id}`, data).then((r) => r.data),

  /** Elimina una cotización pendiente. */
  remove: (id: number) =>
    api.delete(`/cotizaciones/${id}`).then((r) => r.data),

  /** Convierte una cotización en venta. */
  convertir: (id: number) =>
    api.post(`/cotizaciones/${id}/convertir`).then((r) => r.data),
};
