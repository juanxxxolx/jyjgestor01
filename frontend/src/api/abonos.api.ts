/**
 * @fileoverview API de abonos (pagos parciales de clientes).
 */

import api from './client';

/** Servicios de abonos de clientes. */
export const abonosApi = {
  /** Registra un abono para un cliente. */
  create: (data: { id_cliente: number; monto: number }) =>
    api.post('/abonos', data).then((r) => r.data),
  /** Obtiene todos los abonos de un cliente. */
  getByCliente: (clienteId: number) =>
    api.get(`/abonos/cliente/${clienteId}`).then((r) => r.data),
};
