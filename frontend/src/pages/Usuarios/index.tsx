import { useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, message, Typography, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../../api/auth.api';
import api from '../../api/client';

const usuariosApi = {
  getAll: () => api.get('/usuarios').then((r) => r.data),
};

export default function UsuariosPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({ queryKey: ['usuarios'], queryFn: usuariosApi.getAll });

  const createMutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['usuarios'] });
      setModalOpen(false);
      form.resetFields();
      message.success('Usuario creado');
    },
    onError: (e: any) => message.error(e.response?.data?.message || 'Error al crear usuario'),
  });

  const rolLabel: Record<number, string> = { 1: 'Admin', 2: 'Usuario', 3: 'Invitado' };

  return (
    <div style={{ padding: 24, background: '#fff', borderRadius: 8 }}>
      <Space style={{ marginBottom: 16, justifyContent: 'space-between', width: '100%' }}>
        <Typography.Title level={4} style={{ margin: 0 }}>Usuarios</Typography.Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
          Nuevo usuario
        </Button>
      </Space>

      <Table
        dataSource={data?.data ?? []}
        loading={isLoading}
        rowKey="id_usuario"
        columns={[
          { title: 'Nombre', dataIndex: 'nombre', key: 'nombre' },
          { title: 'Email', dataIndex: 'email', key: 'email' },
          { title: 'Rol', dataIndex: 'id_rol', key: 'rol', render: (v: number) => rolLabel[v] ?? v },
          { title: 'Activo', dataIndex: 'activo', key: 'activo', render: (v: boolean) => (v ? 'Sí' : 'No') },
        ]}
      />

      <Modal
        title="Nuevo usuario"
        open={modalOpen}
        onCancel={() => { setModalOpen(false); form.resetFields(); }}
        onOk={() => form.submit()}
        confirmLoading={createMutation.isPending}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={(v) => createMutation.mutate(v)}>
          <Form.Item name="nombre" label="Nombre" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="password" label="Contraseña" rules={[{ required: true }]}>
            <Input.Password placeholder="Mín. 8 chars, mayúscula, número y símbolo" />
          </Form.Item>
          <Form.Item name="id_rol" label="Rol" initialValue={2}>
            <Select
              options={[
                { value: 1, label: 'Admin' },
                { value: 2, label: 'Usuario' },
                { value: 3, label: 'Invitado' },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
