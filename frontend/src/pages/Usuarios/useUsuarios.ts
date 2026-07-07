import { useState } from 'react';
import { Form, message } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../../api/auth.api';
import { usuariosApi } from '../../api/usuarios.api';
import type { User } from '../../types';

export function useUsuarios() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form] = Form.useForm();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({ queryKey: ['usuarios'], queryFn: usuariosApi.getAll });

  const createMutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['usuarios'] });
      closeModal();
      message.success('Usuario creado');
    },
    onError: (e: any) => message.error(e.response?.data?.message || 'Error al crear usuario'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => usuariosApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['usuarios'] });
      closeModal();
      message.success('Usuario actualizado');
    },
    onError: (e: any) => message.error(e.response?.data?.message || 'Error al actualizar'),
  });

  const openCreate = () => { setEditing(null); form.resetFields(); setModalOpen(true); };
  const openEdit = (u: any) => { setEditing(u); form.setFieldsValue(u); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditing(null); form.resetFields(); };

  const onFinish = (values: any) => {
    if (editing) updateMutation.mutate({ id: editing.id_usuario, data: values });
    else createMutation.mutate(values);
  };

  const rolLabel: Record<number, string> = { 1: 'Admin', 2: 'Usuario', 3: 'Invitado' };

  return {
    data, isLoading, modalOpen, editing, form, rolLabel,
    createMutation, updateMutation,
    openCreate, openEdit, closeModal, onFinish,
  };
}
