/**
 * @file Hook personalizado para la página Usuarios.
 * Centraliza las operaciones CRUD de usuarios: consulta, creación,
 * actualización, activación/desactivación y eliminación.
 */

import { useState } from 'react';
import { Form, message } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../../api/auth.api';
import { usuariosApi } from '../../api/usuarios.api';
import type { User } from '../../types';

/**
 * Hook que administra el estado y las operaciones sobre usuarios.
 * - `useQuery`: obtiene la lista completa de usuarios.
 * - `createMutation`: crea un usuario via `authApi.register`.
 * - `updateMutation`: actualiza un usuario via `usuariosApi.update`.
 * - `toggleActivoMutation`: activa/desactiva un usuario.
 * - `deleteMutation`: elimina un usuario (para rechazar pendientes).
 * - Controla la apertura/cierre del modal y la edición en curso.
 *
 * @returns {object} - Datos, estado del modal, formulario, mutaciones,
 *                     funciones `openCreate`, `openEdit`, `closeModal`,
 *                     `onFinish`, `refetch` y el mapeo `rolLabel`.
 */
export function useUsuarios() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form] = Form.useForm();
  const qc = useQueryClient();

  const { data, isLoading, refetch } = useQuery({ queryKey: ['usuarios'], queryFn: usuariosApi.getAll });

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

  const toggleActivoMutation = useMutation({
    mutationFn: ({ id, activo }: { id: number; activo: boolean }) => usuariosApi.update(id, { activo }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => usuariosApi.delete(id),
  });

  return {
    data, isLoading, modalOpen, editing, form, rolLabel, refetch,
    createMutation, updateMutation, toggleActivoMutation, deleteMutation,
    openCreate, openEdit, closeModal, onFinish,
  };
}
