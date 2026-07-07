import { Table, Button, Input, Modal, Form, Popconfirm, Space, Typography } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, DownloadOutlined } from '@ant-design/icons';
import type { Cliente } from '../../types';
import { useClientes } from './useClientes';
import { downloadExport } from '../../utils/download';
import styles from './styles.module.css';

export default function ClientesPage() {
  const {
    data, isLoading, search, setSearch,
    modalOpen, editing, form,
    page, setPage, limit,
    createMutation, updateMutation, deleteMutation,
    openCreate, openEdit, closeModal, onFinish,
  } = useClientes();

  return (
    <div className={styles.page}>
      <Space className={styles.header}>
        <Typography.Title level={4} className={styles.title}>Clientes</Typography.Title>
        <Space>
          <Button icon={<DownloadOutlined />} onClick={() => downloadExport('/clientes/export', 'clientes.xlsx')}>
            Exportar
          </Button>
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
        locale={{ emptyText: 'No hay clientes' }}
        pagination={{
          current: page,
          pageSize: limit,
          total: data?.meta?.total,
          onChange: (p) => setPage(p),
          showSizeChanger: false,
        }}
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
