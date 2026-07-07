import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { auditoriaApi } from '../../api/auditoria.api';

export function useAuditoria() {
  const [page, setPage] = useState(1);
  const [limit] = useState(50);

  const { data, isLoading } = useQuery({
    queryKey: ['audit-logs', page, limit],
    queryFn: () => auditoriaApi.getAll(page, limit),
  });

  return { data, isLoading, page, setPage, limit };
}
