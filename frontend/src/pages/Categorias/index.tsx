/**
 * @file Página de administración de categorías de productos.
 * Permite listar, crear, editar y eliminar categorías, con
 * exportación a Excel y acciones restringidas a administradores.
 */

import { Table, Button, Modal, Form, Input, Popconfirm, Space, Typography, Skeleton, Empty, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, DownloadOutlined } from '@ant-design/icons';
import type { Categoria } from '../../types';
import { useCategorias } from './useCategorias';
import { downloadExport } from '../../utils/download';
import styles from './styles.module.css';

const CategoriasEmpty = () => (
  <Empty
    image={Empty.PRESENTED_IMAGE_SIMPLE}
    imageStyle={{ height: 120 }}
    description="No hay categorías registradas"
    style={{ padding: 48, textAlign: 'center' }}
  >
    <Button type="primary" icon={<PlusOutlined />} size="large" onClick={() => window.location.href = '/categorias'}>
      Crear primera categoría
    </Button>
  </Empty>
);

/**
 * Página principal de Categorías.
 *
 * @component
 * @description Renderiza una tabla con ID y nombre de categoría, y acciones
 * de editar/eliminar (solo para administradores). Incluye un modal
 * para crear o editar una categoría con un campo de nombre.
 *
 * @returns {JSX.Element} Vista de categorías.
 */
export default function CategoriasPage() {
  const {
    data, isLoading, modalOpen, editing, form, isAdmin,
    createMutation, updateMutation, deleteMutation,
    openCreate, openEdit, closeModal, onFinish,
  } = useCategorias();

  const hasData = (data?.data?.length ?? 0) > 0;

  return (
    <div className={styles.page}>
      <Space className={styles.header}>
        <Typography.Title level={4} className={styles.title}>Categorías</Typography.Title>
        <Space>
          <Button icon={<DownloadOutlined />} onClick={() => { downloadExport('/categorias/export', 'categorias.xlsx'); message.success('Exportado'); }}>
            Exportar
          </Button>
          {isAdmin && (
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              Nueva categoría
            </Button>
          )}
        </Space>
      </Space>

      {!isLoading && !hasData ? (
        <CategoriasEmpty />
      ) : (
        <Table
          dataSource={data?.data ?? []}
          loading={{ spinning: isLoading, indicator: <Skeleton active /> }}
          rowKey="id_categoria"
          locale={{ emptyText: 'No hay categorías' }}
          scroll={{ x: 'max-content' }}
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
      )}

      <Modal
        title={editing ? 'Editar categoría' : 'Nueva categoría'}
        open={modalOpen}
        onCancel={closeModal}
        onOk={() => form.submit()}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        destroyOnClose
        width={500}
      >
        {createMutation.isPending || updateMutation.isPending ? (
          <Form layout="vertical">
            <Skeleton active paragraph={{ rows: 2 }} />
          </Form>
        ) : (
          <Form form={form} layout="vertical" onFinish={onFinish}>
            <Form.Item
              name="nombre_categoria"
              label="Nombre *"
              rules={[
                { required: true, message: 'El nombre es obligatorio' },
                { max: 100, message: 'Máximo 100 caracteres' },
                { pattern: /^[a-zA-ZáéíóúñüÁÉÍÓÚÑÜ\s\-']+$/, message: 'Solo se permiten letras, espacios, guiones y apóstrofes' }
              ]}
            >
              <Input maxLength={100} placeholder="Ej: Bebidas, Electrónica, Ropa" />
            </Form.Item>
          </Form>
        )}
      </Modal>
    </div>
  );
}