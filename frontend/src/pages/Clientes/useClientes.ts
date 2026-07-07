import { useState } from 'react';
import { Form, message } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientesApi } from '../../api/clientes.api';
import type { Cliente } from '../../types';

export function useClientes() {
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Cliente | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [form] = Form.useForm();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['clientes', search, page, limit],
    queryFn: () => clientesApi.getAll(search || undefined, page, limit),
  });

  const createMutation = useMutation({
    mutationFn: clientesApi.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['clientes'] }); closeModal(); message.success('Cliente creado'); },
    onError: () => message.error('Error al crear cliente'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => clientesApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['clientes'] }); closeModal(); message.success('Cliente actualizado'); },
    onError: () => message.error('Error al actualizar'),
  });

  const deleteMutation = useMutation({
    mutationFn: clientesApi.delete,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['clientes'] }); message.success('Cliente eliminado'); },
    onError: () => message.error('Error al eliminar'),
  });

  const openCreate = () => { setEditing(null); form.resetFields(); setModalOpen(true); };
  const openEdit = (c: Cliente) => { setEditing(c); form.setFieldsValue(c); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditing(null); form.resetFields(); };

  const onFinish = (values: any) => {
    if (editing) updateMutation.mutate({ id: editing.id_cliente, data: values });
    else createMutation.mutate(values);
  };

  return {
    data, isLoading, search, setSearch,
    modalOpen, editing, form,
    page, setPage, limit,
    createMutation, updateMutation, deleteMutation,
    openCreate, openEdit, closeModal, onFinish,
  };
}
