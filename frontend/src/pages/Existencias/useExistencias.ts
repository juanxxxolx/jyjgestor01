import { useState } from 'react';
import { Form, message } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { movimientosApi } from '../../api/movimientos.api';
import { productosApi } from '../../api/productos.api';
import { clientesApi } from '../../api/clientes.api';

export function useExistencias() {
  const [modalOpen, setModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [productoFiltro, setProductoFiltro] = useState<number | undefined>(undefined);
  const [form] = Form.useForm();
  const qc = useQueryClient();

  const { data: movimientosRes, isLoading } = useQuery({
    queryKey: ['movimientos', page, limit, productoFiltro],
    queryFn: () => movimientosApi.getAll(productoFiltro, page, limit),
  });

  const { data: productosRes } = useQuery({
    queryKey: ['productos-select', 1, 200],
    queryFn: () => productosApi.getAll(1, 200),
  });

  const { data: clientesRes } = useQuery({
    queryKey: ['clientes-select', 1, 200],
    queryFn: () => clientesApi.getAll(undefined, 1, 200),
  });

  const createMutation = useMutation({
    mutationFn: movimientosApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['movimientos'] });
      qc.invalidateQueries({ queryKey: ['productos'] });
      setModalOpen(false);
      form.resetFields();
      message.success('Movimiento registrado');
    },
    onError: (e: any) => message.error(e.response?.data?.message || 'Error al registrar'),
  });

  const tipoColor: Record<string, string> = { ENTRADA: 'green', SALIDA: 'red', AJUSTE: 'blue' };

  return {
    movimientosRes, isLoading, productosRes, clientesRes,
    modalOpen, form, tipoColor, productoFiltro,
    page, setPage, limit,
    createMutation, setModalOpen, setProductoFiltro,
  };
}
