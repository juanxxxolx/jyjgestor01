import { useState } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, message, Popconfirm, Space, Typography, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productosApi } from '../../api/productos.api';
import { useAuth } from '../../context/AuthContext';
import type { Producto } from '../../types';

export default function ProductosPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Producto | null>(null);
  const [form] = Form.useForm();
  const qc = useQueryClient();
  const { isAdmin } = useAuth();

  const { data, isLoading } = useQuery({ queryKey: ['productos'], queryFn: productosApi.getAll });

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

  const deleteMutation = useMutation({
    mutationFn: productosApi.delete,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['productos'] }); message.success('Producto eliminado'); },
    onError: () => message.error('Error al eliminar'),
  });

  const openCreate = () => { setEditing(null); form.resetFields(); setModalOpen(true); };
  const openEdit = (p: Producto) => { setEditing(p); form.setFieldsValue(p); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditing(null); form.resetFields(); };

  const onFinish = (values: any) => {
    if (editing) updateMutation.mutate({ id: editing.id_producto, data: values });
    else createMutation.mutate(values);
  };

  return (
    <div style={{ padding: 24, background: '#fff', borderRadius: 8 }}>
      <Space style={{ marginBottom: 16, justifyContent: 'space-between', width: '100%' }}>
        <Typography.Title level={4} style={{ margin: 0 }}>Productos</Typography.Title>
        {isAdmin && (
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            Nuevo producto
          </Button>
        )}
      </Space>

      <Table
        dataSource={data?.data ?? []}
        loading={isLoading}
        rowKey="id_producto"
        columns={[
          { title: 'Nombre', dataIndex: 'nombre', key: 'nombre' },
          { title: 'Referencia', dataIndex: 'referencia', key: 'referencia' },
          { title: 'Categoría', dataIndex: ['categoria', 'nombre_categoria'], key: 'categoria' },
          {
            title: 'Precio',
            dataIndex: 'precio_venta',
            key: 'precio',
            render: (v: number) => `$${Number(v).toLocaleString('es-CO')}`,
          },
          {
            title: 'Stock',
            key: 'stock',
            render: (_: any, r: Producto) => (
              <Tag color={r.stock <= r.stock_minimo ? 'red' : 'green'}>{r.stock}</Tag>
            ),
          },
          { title: 'Mín.', dataIndex: 'stock_minimo', key: 'stock_minimo' },
          ...(isAdmin
            ? [
                {
                  title: 'Acciones',
                  key: 'acciones',
                  render: (_: any, record: Producto) => (
                    <Space>
                      <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(record)} />
                      <Popconfirm title="¿Eliminar producto?" onConfirm={() => deleteMutation.mutate(record.id_producto)}>
                        <Button size="small" danger icon={<DeleteOutlined />} />
                      </Popconfirm>
                    </Space>
                  ),
                },
              ]
            : []),
        ]}
      />

      <Modal
        title={editing ? 'Editar producto' : 'Nuevo producto'}
        open={modalOpen}
        onCancel={closeModal}
        onOk={() => form.submit()}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item name="nombre" label="Nombre" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="referencia" label="Referencia" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="precio_venta" label="Precio de venta" rules={[{ required: true }]}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="stock" label="Stock inicial">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="stock_minimo" label="Stock mínimo">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
