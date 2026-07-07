import { Table, Button, Modal, Form, Input, Select, Switch, Typography, Space, Tag } from 'antd';
import { PlusOutlined, EditOutlined } from '@ant-design/icons';
import { useUsuarios } from './useUsuarios';
import styles from './styles.module.css';

export default function UsuariosPage() {
  const {
    data, isLoading, modalOpen, editing, form, rolLabel,
    createMutation, updateMutation,
    openCreate, openEdit, closeModal, onFinish,
  } = useUsuarios();

  return (
    <div className={styles.page}>
      <Space className={styles.header}>
        <Typography.Title level={4} className={styles.title}>Usuarios</Typography.Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
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
          {
            title: 'Activo',
            dataIndex: 'activo',
            key: 'activo',
            render: (v: boolean) => <Tag color={v ? 'green' : 'red'}>{v ? 'Sí' : 'No'}</Tag>,
          },
          {
            title: 'Acciones',
            key: 'acciones',
            render: (_: any, record: any) => (
              <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(record)} />
            ),
          },
        ]}
      />

      <Modal
        title={editing ? 'Editar usuario' : 'Nuevo usuario'}
        open={modalOpen}
        onCancel={closeModal}
        onOk={() => form.submit()}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item name="nombre" label="Nombre" rules={[{ required: true }]}>
            <Input disabled={!!editing} />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
            <Input disabled={!!editing} />
          </Form.Item>
          {!editing && (
            <Form.Item name="password" label="Contraseña" rules={[{ required: true }]}>
              <Input.Password placeholder="Mín. 8 chars, mayúscula, número y símbolo" />
            </Form.Item>
          )}
          <Form.Item name="id_rol" label="Rol">
            <Select
              options={[
                { value: 1, label: 'Admin' },
                { value: 2, label: 'Usuario' },
                { value: 3, label: 'Invitado' },
              ]}
            />
          </Form.Item>
          {editing && (
            <Form.Item name="activo" label="Activo" valuePropName="checked">
              <Switch />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
}
