/**
 * @file Página de administración de proveedores.
 * Permite listar, crear, editar y eliminar proveedores con
 * información de contacto, teléfono, email y dirección.
 */

import { Table, Button, Modal, Form, Input, Popconfirm, Space, Typography, Skeleton, Empty } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useProveedores } from './useProveedores';
import styles from './styles.module.css';

const ProveedoresEmpty = () => (
  <Empty
    image={Empty.PRESENTED_IMAGE_SIMPLE}
    imageStyle={{ height: 120 }}
    description="No hay proveedores registrados"
    style={{ padding: 48, textAlign: 'center' }}
  >
    <Button type="primary" icon={<PlusOutlined />} size="large" onClick={() => window.location.href = '/proveedores'}>
      Registrar primer proveedor
    </Button>
  </Empty>
);

/**
 * Página principal de Proveedores.
 *
 * @component
 * @description Renderiza una tabla con todos los proveedores (nombre, contacto,
 * teléfono, email, dirección) y acciones de editar/eliminar. Incluye un modal
 * para crear o editar un proveedor.
 *
 * @returns {JSX.Element} Vista de proveedores.
 */
export default function ProveedoresPage() {
  const {
    data, isLoading, modalOpen, editing, form,
    createMutation, updateMutation, deleteMutation,
    openCreate, openEdit, closeModal, onFinish,
  } = useProveedores();

  const hasData = (data?.data?.length ?? 0) > 0;

  return (
    <div className={styles.page}>
      <Space className={styles.header}>
        <Typography.Title level={4} className={styles.title}>Proveedores</Typography.Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>Nuevo proveedor</Button>
      </Space>

      {!isLoading && !hasData ? (
        <ProveedoresEmpty />
      ) : (
        <Table
          dataSource={data?.data ?? []}
          loading={{ spinning: isLoading, indicator: <Skeleton active /> }}
          rowKey="id_proveedor"
          pagination={false}
          scroll={{ x: 'max-content' }}
          locale={{ emptyText: 'No hay proveedores registrados' }}
          columns={[
            { title: 'Nombre', dataIndex: 'nombre', key: 'nombre' },
            { title: 'Contacto', dataIndex: 'contacto', key: 'contacto' },
            { title: 'Teléfono', dataIndex: 'telefono', key: 'telefono' },
            { title: 'Email', dataIndex: 'email', key: 'email' },
            { title: 'Dirección', dataIndex: 'direccion', key: 'direccion', ellipsis: true },
            {
              title: 'Acciones',
              key: 'acciones',
              render: (_: any, record: any) => (
                <Space>
                  <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(record)} />
                  <Popconfirm title="¿Eliminar proveedor?" onConfirm={() => deleteMutation.mutate(record.id_proveedor)}>
                    <Button size="small" danger icon={<DeleteOutlined />} />
                  </Popconfirm>
                </Space>
              ),
            },
          ]}
        />
      )}

      <Modal
        title={editing ? 'Editar proveedor' : 'Nuevo proveedor'}
        open={modalOpen}
        onCancel={closeModal}
        onOk={() => form.submit()}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        destroyOnClose
        width={550}
      >
        {createMutation.isPending || updateMutation.isPending ? (
          <Form layout="vertical">
            <Skeleton active paragraph={{ rows: 6 }} />
          </Form>
        ) : (
          <Form form={form} layout="vertical" onFinish={onFinish}>
            <Form.Item
              name="nombre"
              label="Nombre *"
              rules={[
                { required: true, message: 'El nombre es obligatorio' },
                { max: 200, message: 'Máximo 200 caracteres' },
                { pattern: /^[a-zA-ZáéíóúñüÁÉÍÓÚÑÜ\s\-']+$/, message: 'Solo se permiten letras, espacios, guiones y apóstrofes' }
              ]}
            >
              <Input maxLength={200} placeholder="Ej: Distribuidora Central S.A." />
            </Form.Item>
            <Form.Item
              name="contacto"
              label="Persona de contacto"
              rules={[
                { max: 100, message: 'Máximo 100 caracteres' },
                { pattern: /^[a-zA-ZáéíóúñüÁÉÍÓÚÑÜ\s\-']+$/, message: 'Solo se permiten letras, espacios, guiones y apóstrofes' }
              ]}
            >
              <Input maxLength={100} placeholder="Ej: Juan Pérez" />
            </Form.Item>
            <Form.Item
              name="telefono"
              label="Teléfono"
              rules={[
                { max: 20, message: 'Máximo 20 caracteres' },
                { pattern: /^[0-9\s\-\+\(\)]+$/, message: 'Solo se permiten números, espacios, guiones, paréntesis y +' }
              ]}
            >
              <Input maxLength={20} placeholder="Ej: +57 1 234 5678" />
            </Form.Item>
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { type: 'email', message: 'Email no válido' },
                { max: 100, message: 'Máximo 100 caracteres' },
                { pattern: /^\S+$/, message: 'El email no debe contener espacios' }
              ]}
            >
              <Input maxLength={100} placeholder="Ej: contacto@proveedor.com" />
            </Form.Item>
            <Form.Item
              name="direccion"
              label="Dirección"
              rules={[
                { max: 300, message: 'Máximo 300 caracteres' },
                { pattern: /^[a-zA-Z0-9áéíóúñüÁÉÍÓÚÑÜ\s\-\.#]+$/, message: 'Caracteres no permitidos en la dirección' }
              ]}
            >
              <Input.TextArea rows={2} maxLength={300} placeholder="Ej: Av. Principal #123, Zona Industrial" />
            </Form.Item>
          </Form>
        )}
      </Modal>
    </div>
  );
}