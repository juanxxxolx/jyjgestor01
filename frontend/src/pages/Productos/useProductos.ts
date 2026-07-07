import { useState } from 'react';
import { Form, message } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productosApi } from '../../api/productos.api';
import { preciosHistoricosApi } from '../../api/precios-historicos.api';
import { categoriasApi } from '../../api/categorias.api';
import { useAuth } from '../../context/AuthContext';
import type { Producto } from '../../types';

export function useProductos() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Producto | null>(null);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [historyProducto, setHistoryProducto] = useState<Producto | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [search, setSearch] = useState('');
  const [form] = Form.useForm();
  const qc = useQueryClient();
  const { isAdmin } = useAuth();

  const { data: historial, isLoading: historyLoading } = useQuery({
    queryKey: ['precios-historicos', historyProducto?.id_producto],
    queryFn: () => preciosHistoricosApi.getByProducto(historyProducto!.id_producto),
    enabled: !!historyProducto,
  });

  const { data, isLoading } = useQuery({
    queryKey: ['productos', page, limit, search],
    queryFn: () => productosApi.getAll(page, limit, search || undefined),
  });

  const { data: categorias } = useQuery({
    queryKey: ['categorias'],
    queryFn: () => categoriasApi.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: productosApi.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['productos'] }); closeModal(); message.success('Producto creado'); },
    onError: (e: any) => message.error(e.response?.data?.message || 'Error al crear'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => productosApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['productos'] }); closeModal(); message.success('Producto actualizado'); },
    onError: (e: any) => message.error(e.response?.data?.message || 'Error al actualizar'),
  });

  const uploadMutation = useMutation({
    mutationFn: ({ id, file }: { id: number; file: File }) => productosApi.uploadImage(id, file),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['productos'] }); message.success('Imagen subida'); },
    onError: (e: any) => message.error(e.response?.data?.message || e.message || 'Error al subir imagen'),
  });

  const deleteMutation = useMutation({
    mutationFn: productosApi.delete,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['productos'] }); message.success('Producto eliminado'); },
    onError: () => message.error('Error al eliminar'),
  });

  const openCreate = () => { setEditing(null); form.resetFields(); setModalOpen(true); };
  const openEdit = (p: Producto) => { setEditing(p); form.setFieldsValue(p); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditing(null); form.resetFields(); };

  const openHistory = (p: Producto) => {
    setHistoryProducto(p);
    setHistoryModalOpen(true);
  };
  const closeHistory = () => {
    setHistoryModalOpen(false);
    setTimeout(() => setHistoryProducto(null), 300);
  };

  const onFinish = (values: any) => {
    if (editing) updateMutation.mutate({ id: editing.id_producto, data: values });
    else createMutation.mutate(values);
  };

  const onSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  return {
    data, isLoading, categorias,
    historial, historyLoading,
    modalOpen, editing, form, search,
    historyModalOpen, historyProducto,
    isAdmin, page, setPage, limit,
    createMutation, updateMutation, uploadMutation, deleteMutation,
    openCreate, openEdit, closeModal,
    openHistory, closeHistory,
    onFinish, onSearch,
  };
}
