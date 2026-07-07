import api from './client';

export const reportesApi = {
  ventasPorFecha: (desde?: string, hasta?: string) =>
    api.get('/reportes/ventas-por-fecha', { params: { desde, hasta } }).then((r) => r.data),

  ventasPorProducto: (desde?: string, hasta?: string) =>
    api.get('/reportes/ventas-por-producto', { params: { desde, hasta } }).then((r) => r.data),

  ventasPorCliente: (desde?: string, hasta?: string) =>
    api.get('/reportes/ventas-por-cliente', { params: { desde, hasta } }).then((r) => r.data),

  ventasDiarias: (desde?: string, hasta?: string) =>
    api.get('/reportes/ventas-diarias', { params: { desde, hasta } }).then((r) => r.data),
};
