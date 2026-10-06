/**
 * @file Hook personalizado para la página Auditoría.
 * Obtiene los registros de auditoría con paginación y filtros de fecha.
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { auditoriaApi } from '../../api/auditoria.api';

/**
 * Hook que consulta los logs de auditoría paginados con filtros de fecha.
 * - `useQuery`: ejecuta `auditoriaApi.getAll(page, limit, fechaDesde, fechaHasta)`.
 * - La key del query incluye `page`, `limit`, `fechaDesde`, `fechaHasta` para re-fetch al cambiar filtros.
 *
 * @returns {object} - `data`, `isLoading`, `page`, `setPage`, `limit`,
 *                     `fechaDesde`, `setFechaDesde`, `fechaHasta`, `setFechaHasta`.
 */
export function useAuditoria() {
  const [page, setPage] = useState(1);
  const [limit] = useState(50);
  const [fechaDesde, setFechaDesde] = useState<string>('');
  const [fechaHasta, setFechaHasta] = useState<string>('');

  const { data, isLoading } = useQuery({
    queryKey: ['audit-logs', page, limit, fechaDesde, fechaHasta],
    queryFn: () => auditoriaApi.getAll(page, limit, fechaDesde || undefined, fechaHasta || undefined),
  });

  return { data, isLoading, page, setPage, limit, fechaDesde, setFechaDesde, fechaHasta, setFechaHasta };
}
