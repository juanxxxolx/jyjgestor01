/**
 * @file Hook personalizado para la gestión de clientes.
 * Centraliza consultas, mutaciones CRUD, registro de abonos e
 * historial de abonos, más control de modales y búsqueda.
 */

import { useState } from 'react';
import { Form, message } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientesApi } from '../../api/clientes.api';
import { abonosApi } from '../../api/abonos.api';
import type { Cliente } from '../../types';

/**
 * Hook que administra el flujo completo de clientes.
 *
 * @remarks
 * - Consulta clientes paginados con filtro de búsqueda.
 * - Provee mutaciones: crear, actualizar, eliminar y registrar abono.
 * - Gestiona el estado de los modales: formulario de cliente, abono e historial.
 * - El historial de abonos se carga mediante llamada directa a la API.
 *
 * @returns Objeto con datos, estado, mutaciones y controladores de UI.
 */
export function useClientes() {
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Cliente | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [form] = Form.useForm();

  const [abonoModalOpen, setAbonoModalOpen] = useState(false);
  const [abonoCliente, setAbonoCliente] = useState<Cliente | null>(null);
  const [abonoForm] = Form.useForm();

  const [historialAbonos, setHistorialAbonos] = useState<any[]>([]);
  const [historialOpen, setHistorialOpen] = useState(false);

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

  const abonoMutation = useMutation({
    mutationFn: abonosApi.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['clientes'] }); setAbonoModalOpen(false); abonoForm.resetFields(); message.success('Abono registrado'); },
    onError: () => message.error('Error al registrar abono'),
  });

  const openCreate = () => { setEditing(null); form.resetFields(); setModalOpen(true); };
  const openEdit = (c: Cliente) => { setEditing(c); form.setFieldsValue(c); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditing(null); form.resetFields(); };

  const onFinish = (values: any) => {
    if (editing) updateMutation.mutate({ id: editing.id_cliente, data: values });
    else createMutation.mutate(values);
  };

  const openAbono = (c: Cliente) => { setAbonoCliente(c); abonoForm.resetFields(); setAbonoModalOpen(true); };

  const onAbonoFinish = (values: any) => {
    if (!abonoCliente) return;
    abonoMutation.mutate({ id_cliente: abonoCliente.id_cliente, monto: values.monto });
  };

  const openHistorial = async (c: Cliente) => {
    try {
      const res = await abonosApi.getByCliente(c.id_cliente);
      setHistorialAbonos(res.data ?? []);
      setAbonoCliente(c);
      setHistorialOpen(true);
    } catch { message.error('Error al cargar historial'); }
  };

  return {
    data, isLoading, search, setSearch,
    modalOpen, editing, form,
    page, setPage, limit,
    createMutation, updateMutation, deleteMutation,
    openCreate, openEdit, closeModal, onFinish,
    abonoModalOpen, abonoCliente, abonoForm, abonoMutation,
    openAbono, onAbonoFinish, closeAbono: () => { setAbonoModalOpen(false); abonoForm.resetFields(); },
    historialOpen, historialAbonos,
    openHistorial, closeHistorial: () => setHistorialOpen(false),
  };
}
