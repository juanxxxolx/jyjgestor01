/**
 * @file Hook personalizado para la página Auditoría.
 * Obtiene los registros de auditoría con paginación.
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { auditoriaApi } from '../../api/auditoria.api';

/**
 * Hook que consulta los logs de auditoría paginados.
 * - `useQuery`: ejecuta `auditoriaApi.getAll(page, limit)`.
 * - La key del query incluye `page` y `limit` para re-fetch al cambiar página.
 *
 * @returns {object} - `data` (respuesta de la API), `isLoading` (boolean),
 *                     `page` (número actual), `setPage` (setter), `limit` (fijo 50).
 */
export function useAuditoria() {
  const [page, setPage] = useState(1);
  const [limit] = useState(50);

  const { data, isLoading } = useQuery({
    queryKey: ['audit-logs', page, limit],
    queryFn: () => auditoriaApi.getAll(page, limit),
  });

  return { data, isLoading, page, setPage, limit };
}
