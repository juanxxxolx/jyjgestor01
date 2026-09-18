/**
 * @fileoverview API de gestión de ventas/facturación, incluyendo anulación y descarga de PDF.
 */

import api from './client';

/** CRUD de ventas con funcionalidades de anulación y descarga de PDF. */
export const ventasApi = {
  /** Obtiene lista paginada de ventas. */
  getAll: (page = 1, limit = 20) =>
    api.get('/ventas', { params: { page, limit } }).then((r) => r.data),

  /** Obtiene una venta por su ID. */
  getById: (id: number) =>
    api.get(`/ventas/${id}`).then((r) => r.data),

  /** Crea una nueva venta con su detalle de productos. */
  create: (data: { id_cliente?: number; detalle: { id_producto: number; cantidad: number }[] }) =>
    api.post('/ventas', data).then((r) => r.data),

  /** Anula una venta existente. */
  anular: (id: number) =>
    api.patch(`/ventas/${id}/anular`).then((r) => r.data),

  /** Descarga el PDF de una factura. */
  downloadPdf: (id: number) =>
    api.get(`/ventas/${id}/pdf`, { responseType: 'blob' }).then((r) => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([r.data], { type: 'application/pdf' }));
      a.download = `factura-${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(a.href);
    }),
};
