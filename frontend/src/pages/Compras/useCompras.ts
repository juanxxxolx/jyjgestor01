/**
 * @file Hook personalizado para la gestión de compras.
 * Centraliza consultas de compras, proveedores y productos,
 * así como la mutación de creación y el control del modal/formulario.
 */

import { useState } from 'react';
import { Form, message } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { comprasApi } from '../../api/compras.api';
import { proveedoresApi } from '../../api/proveedores.api';
import { productosApi } from '../../api/productos.api';

/**
 * Hook que administra el flujo de registro de compras.
 *
 * @remarks
 * - Consulta la lista paginada de compras, proveedores y productos.
 * - Controla la apertura/cierre del modal de creación y el estado del formulario.
 * - Provee la mutación `createMutation` para persistir una nueva compra.
 *
 * @returns Objeto con datos, estado del modal, mutación y controladores.
 */
export function useCompras() {
  const [modalOpen, setModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [form] = Form.useForm();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['compras', page, limit],
    queryFn: () => comprasApi.getAll(page, limit),
  });

  const { data: proveedores } = useQuery({
    queryKey: ['proveedores-select'],
    queryFn: () => proveedoresApi.getAll(),
  });

  const { data: productos } = useQuery({
    queryKey: ['productos-select'],
    queryFn: () => productosApi.getAll(1, 200),
  });

  const createMutation = useMutation({
    mutationFn: comprasApi.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['compras'] }); qc.invalidateQueries({ queryKey: ['productos'] }); qc.invalidateQueries({ queryKey: ['bajo-stock-alert'] }); closeModal(); message.success('Compra registrada'); },
    onError: (e: any) => message.error(e.response?.data?.message?.[0] || 'Error al registrar compra'),
  });

  const openCreate = () => { form.resetFields(); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); form.resetFields(); };

  const onFinish = (values: any) => {
    const detalle = values.detalle.filter((d: any) => d.id_producto && d.cantidad && d.costo_unitario);
    if (!detalle.length) { message.warning('Agregue al menos un producto'); return; }
    createMutation.mutate({ id_proveedor: values.id_proveedor || undefined, detalle });
  };

  return {
    data, isLoading, proveedores, productos,
    modalOpen, form, page, setPage, limit,
    createMutation,
    openCreate, closeModal, onFinish,
  };
}
