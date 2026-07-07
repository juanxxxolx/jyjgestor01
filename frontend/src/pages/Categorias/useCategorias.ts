import { useState } from 'react';
import { Form, message } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoriasApi } from '../../api/categorias.api';
import { useAuth } from '../../context/AuthContext';
import type { Categoria } from '../../types';

export function useCategorias() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Categoria | null>(null);
  const [form] = Form.useForm();
  const qc = useQueryClient();
  const { isAdmin } = useAuth();

  const { data, isLoading } = useQuery({ queryKey: ['categorias'], queryFn: categoriasApi.getAll });

  const createMutation = useMutation({
    mutationFn: categoriasApi.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['categorias'] }); closeModal(); message.success('Categoría creada'); },
    onError: (e: any) => message.error(e.response?.data?.message || 'Error al crear'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => categoriasApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['categorias'] }); closeModal(); message.success('Categoría actualizada'); },
    onError: (e: any) => message.error(e.response?.data?.message || 'Error al actualizar'),
  });

  const deleteMutation = useMutation({
    mutationFn: categoriasApi.delete,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['categorias'] }); message.success('Categoría eliminada'); },
    onError: () => message.error('Error al eliminar'),
  });

  const openCreate = () => { setEditing(null); form.resetFields(); setModalOpen(true); };
  const openEdit = (c: Categoria) => { setEditing(c); form.setFieldsValue(c); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditing(null); form.resetFields(); };

  const onFinish = (values: any) => {
    if (editing) updateMutation.mutate({ id: editing.id_categoria, data: values });
    else createMutation.mutate(values);
  };

  return {
    data, isLoading, modalOpen, editing, form, isAdmin,
    createMutation, updateMutation, deleteMutation,
    openCreate, openEdit, closeModal, onFinish,
  };
}
