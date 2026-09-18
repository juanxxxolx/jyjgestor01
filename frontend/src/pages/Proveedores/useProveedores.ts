/**
 * @file Hook personalizado para la gestión de proveedores.
 * Centraliza la consulta de proveedores, las mutaciones CRUD
 * y el control del modal de creación/edición.
 */

import { useState } from 'react';
import { Form, message } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { proveedoresApi } from '../../api/proveedores.api';
import type { Proveedor } from '../../types';

/**
 * Hook que administra el flujo de proveedores.
 *
 * @remarks
 * - Consulta la lista completa de proveedores.
 * - Provee mutaciones: crear, actualizar y eliminar.
 * - Controla el modal de formulario para crear/editar.
 *
 * @returns Objeto con datos, estado, mutaciones y controladores.
 */
export function useProveedores() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Proveedor | null>(null);
  const [form] = Form.useForm();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['proveedores'],
    queryFn: () => proveedoresApi.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: proveedoresApi.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['proveedores'] }); closeModal(); message.success('Proveedor creado'); },
    onError: () => message.error('Error al crear proveedor'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => proveedoresApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['proveedores'] }); closeModal(); message.success('Proveedor actualizado'); },
    onError: () => message.error('Error al actualizar'),
  });

  const deleteMutation = useMutation({
    mutationFn: proveedoresApi.delete,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['proveedores'] }); message.success('Proveedor eliminado'); },
    onError: () => message.error('Error al eliminar'),
  });

  const openCreate = () => { setEditing(null); form.resetFields(); setModalOpen(true); };
  const openEdit = (p: Proveedor) => { setEditing(p); form.setFieldsValue(p); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditing(null); form.resetFields(); };

  const onFinish = (values: any) => {
    if (editing) updateMutation.mutate({ id: editing.id_proveedor, data: values });
    else createMutation.mutate(values);
  };

  return {
    data, isLoading, modalOpen, editing, form,
    createMutation, updateMutation, deleteMutation,
    openCreate, openEdit, closeModal, onFinish,
  };
}
