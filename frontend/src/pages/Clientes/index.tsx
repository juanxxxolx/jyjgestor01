import { useState } from 'react';
import { Table, Button, Input, Modal, Form, message, Popconfirm, Space, Typography } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientesApi } from '../../api/clientes.api';
import type { Cliente } from '../../types';

export default function ClientesPage() {
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Cliente | null>(null);
  const [form] = Form.useForm();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['clientes', search],
    queryFn: () => clientesApi.getAll(search || undefined),
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

  return (
    <div style={{ padding: 24, background: '#fff', borderRadius: 8 }}>
      <Space style={{ marginBottom: 16, justifyContent: 'space-between', width: '100%' }}>
        <Typography.Title level={4} style={{ margin: 0 }}>Clientes</Typography.Title>
        <Space>
          <Input
            prefix={<SearchOutlined />}
            placeholder="Buscar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            allowClear
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            Nuevo cliente
          </Button>
        </Space>
      </Space>

      <Table
        dataSource={data?.data ?? []}
        loading={isLoading}
        rowKey="id_cliente"
        columns={[
          { title: 'Nombre', dataIndex: 'nombre', key: 'nombre' },
          { title: 'Email', dataIndex: 'email', key: 'email' },
          { title: 'Teléfono', dataIndex: 'telefono', key: 'telefono' },
          { title: 'Dirección', dataIndex: 'direccion', key: 'direccion', ellipsis: true },
          {
            title: 'Acciones',
            key: 'acciones',
            render: (_: any, record: Cliente) => (
              <Space>
                <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(record)} />
                <Popconfirm title="¿Eliminar cliente?" onConfirm={() => deleteMutation.mutate(record.id_cliente)}>
                  <Button size="small" danger icon={<DeleteOutlined />} />
                </Popconfirm>
              </Space>
            ),
          },
        ]}
      />

      <Modal
        title={editing ? 'Editar cliente' : 'Nuevo cliente'}
        open={modalOpen}
        onCancel={closeModal}
        onOk={() => form.submit()}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item name="nombre" label="Nombre" rules={[{ required: true, message: 'Nombre requerido' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ type: 'email', message: 'Email no válido' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="telefono" label="Teléfono">
            <Input />
          </Form.Item>
          <Form.Item name="direccion" label="Dirección">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
