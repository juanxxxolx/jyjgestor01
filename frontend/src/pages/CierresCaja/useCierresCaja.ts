/**
 * @file Hook personalizado para el arqueo de caja.
 * Centraliza las consultas del historial de cierres y del estado
 * del día, así como la mutación para crear o actualizar un cierre.
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/client';

/**
 * Hook que administra el flujo de arqueo de caja.
 *
 * @remarks
 * - Consulta el historial paginado de cierres de caja.
 * - Consulta el resumen del día actual (ventas en efectivo, cierre del día).
 * - Provee la mutación `createMutation` para registrar un nuevo cierre
 *   o actualizar el cierre del día.
 *
 * @returns Objeto con datos de cierres, estado del día, mutación y paginación.
 */
export function useCierresCaja() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const limit = 10;

  const cierresRes = useQuery({
    queryKey: ['cierres-caja', page],
    queryFn: () => api.get('/cierres-caja', { params: { page, limit } }).then((r) => r.data),
  });

  const hoyRes = useQuery({
    queryKey: ['cierres-caja-hoy'],
    queryFn: () => api.get('/cierres-caja/hoy').then((r) => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (data: { efectivo_declarado: number }) =>
      api.post('/cierres-caja', data).then((r) => r.data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['cierres-caja'] }); queryClient.invalidateQueries({ queryKey: ['cierres-caja-hoy'] }); },
  });

  return {
    cierresRes: cierresRes.data ?? { data: [], total: 0 },
    isLoading: cierresRes.isLoading,
    hoyRes: hoyRes.data,
    createMutation,
    page, setPage, limit,
  };
}
