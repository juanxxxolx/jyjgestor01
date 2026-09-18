/**
 * @file Página de administración de proveedores.
 * Permite listar, crear, editar y eliminar proveedores con
 * información de contacto, teléfono, email y dirección.
 */

import { Table, Button, Modal, Form, Input, Popconfirm, Space, Typography } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useProveedores } from './useProveedores';
import styles from './styles.module.css';

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

  return (
    <div className={styles.page}>
      <Space className={styles.header}>
        <Typography.Title level={4} className={styles.title}>Proveedores</Typography.Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>Nuevo proveedor</Button>
      </Space>

      <Table
        dataSource={data?.data ?? []}
        loading={isLoading}
        rowKey="id_proveedor"
        pagination={false}
        scroll={{ x: 'max-content' }}
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

      <Modal
        title={editing ? 'Editar proveedor' : 'Nuevo proveedor'}
        open={modalOpen}
        onCancel={closeModal}
        onOk={() => form.submit()}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item name="nombre" label="Nombre" rules={[
            { required: true, message: 'Nombre requerido' },
            { max: 200, message: 'Máximo 200 caracteres' },
            { pattern: /^[a-zA-ZáéíóúñüÁÉÍÓÚÑÜ\s\-']+$/, message: 'Solo se permiten letras, espacios, guiones y apóstrofes' }
          ]}>
            <Input maxLength={200} />
          </Form.Item>
          <Form.Item name="contacto" label="Contacto" rules={[
            { max: 100, message: 'Máximo 100 caracteres' },
            { pattern: /^[a-zA-ZáéíóúñüÁÉÍÓÚÑÜ\s\-']+$/, message: 'Solo se permiten letras, espacios, guiones y apóstrofes' }
          ]}>
            <Input maxLength={100} />
          </Form.Item>
          <Form.Item name="telefono" label="Teléfono" rules={[
            { max: 20, message: 'Máximo 20 caracteres' },
            { pattern: /^[0-9\s\-\+\(\)]+$/, message: 'Solo se permiten números, espacios, guiones, paréntesis y +' }
          ]}>
            <Input maxLength={20} />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[
            { type: 'email', message: 'Email no válido' },
            { max: 100, message: 'Máximo 100 caracteres' },
            { pattern: /^\S+$/, message: 'El email no debe contener espacios' }
          ]}>
            <Input maxLength={100} />
          </Form.Item>
          <Form.Item name="direccion" label="Dirección" rules={[
            { max: 300, message: 'Máximo 300 caracteres' },
            { pattern: /^[a-zA-Z0-9áéíóúñüÁÉÍÓÚÑÜ\s\-\.#]+$/, message: 'Caracteres no permitidos en la dirección' }
          ]}>
            <Input.TextArea rows={2} maxLength={300} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
