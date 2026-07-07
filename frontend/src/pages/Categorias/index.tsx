import { Table, Button, Modal, Form, Input, Popconfirm, Space, Typography } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { Categoria } from '../../types';
import { useCategorias } from './useCategorias';
import styles from './styles.module.css';

export default function CategoriasPage() {
  const {
    data, isLoading, modalOpen, editing, form, isAdmin,
    createMutation, updateMutation, deleteMutation,
    openCreate, openEdit, closeModal, onFinish,
  } = useCategorias();

  return (
    <div className={styles.page}>
      <Space className={styles.header}>
        <Typography.Title level={4} className={styles.title}>Categorías</Typography.Title>
        {isAdmin && (
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            Nueva categoría
          </Button>
        )}
      </Space>

      <Table
        dataSource={data?.data ?? []}
        loading={isLoading}
        rowKey="id_categoria"
        locale={{ emptyText: 'No hay categorías' }}
        columns={[
          { title: 'ID', dataIndex: 'id_categoria', key: 'id_categoria', width: 80 },
          { title: 'Nombre', dataIndex: 'nombre_categoria', key: 'nombre_categoria' },
          ...(isAdmin
            ? [{
                title: 'Acciones',
                key: 'acciones',
                render: (_: any, record: Categoria) => (
                  <Space>
                    <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(record)} />
                    <Popconfirm title="¿Eliminar categoría?" onConfirm={() => deleteMutation.mutate(record.id_categoria)}>
                      <Button size="small" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                  </Space>
                ),
              }]
            : []),
        ]}
      />

      <Modal
        title={editing ? 'Editar categoría' : 'Nueva categoría'}
        open={modalOpen}
        onCancel={closeModal}
        onOk={() => form.submit()}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item name="nombre_categoria" label="Nombre" rules={[{ required: true, message: 'Nombre requerido' }]}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
