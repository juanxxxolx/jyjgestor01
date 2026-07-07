import { Table, Button, Modal, Form, Input, InputNumber, Select, Popconfirm, Space, Typography, Tag, Upload, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, HistoryOutlined, UploadOutlined, DownloadOutlined } from '@ant-design/icons';
import type { Producto } from '../../types';
import { useProductos } from './useProductos';
import { downloadExport } from '../../utils/download';
import styles from './styles.module.css';

export default function ProductosPage() {
  const {
    data, isLoading, categorias,
    historial, historyLoading,
    modalOpen, editing, form, search,
    historyModalOpen, historyProducto,
    isAdmin, page, setPage, limit,
    createMutation, updateMutation, uploadMutation, deleteMutation,
    openCreate, openEdit, closeModal,
    openHistory, closeHistory,
    onFinish, onSearch,
  } = useProductos();

  return (
    <div className={styles.page}>
      <Space className={styles.header}>
        <Typography.Title level={4} className={styles.title}>Productos</Typography.Title>
        <Space>
          <Button icon={<DownloadOutlined />} onClick={() => downloadExport('/productos/export', 'productos.xlsx')}>
            Exportar
          </Button>
          {isAdmin && (
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              Nuevo producto
            </Button>
          )}
        </Space>
      </Space>

      <Input.Search
        placeholder="Buscar por nombre o referencia"
        allowClear
        value={search}
        onChange={(e) => onSearch(e.target.value)}
        onSearch={onSearch}
        style={{ marginBottom: 16, maxWidth: 400 }}
      />

      <Table
        dataSource={data?.data ?? []}
        loading={isLoading}
        rowKey="id_producto"
        pagination={{
          current: page,
          pageSize: limit,
          total: data?.meta?.total,
          onChange: (p) => setPage(p),
          showSizeChanger: false,
        }}
        columns={[
          {
            title: 'Imagen',
            key: 'imagen',
            width: 80,
            render: (_: any, r: Producto) =>
              r.imagen_url ? (
                    <img src={r.imagen_url} alt={r.nombre} style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 4 }} />
              ) : (
                <div style={{ width: 48, height: 48, background: '#f0f0f0', borderRadius: 4 }} />
              ),
          },
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
          {
            title: 'Historial',
            key: 'historial',
            render: (_: any, record: Producto) => (
              <Button size="small" icon={<HistoryOutlined />} onClick={() => openHistory(record)} />
            ),
          },
          ...(isAdmin
            ? [{
                title: 'Acciones',
                key: 'acciones',
                render: (_: any, record: Producto) => (
                  <Space>
                    <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(record)} />
                    <Upload
                      showUploadList={false}
                      beforeUpload={(file) => {
                        uploadMutation.mutate({ id: record.id_producto, file });
                        return false;
                      }}
                      accept="image/*"
                    >
                      <Button size="small" icon={<UploadOutlined />} />
                    </Upload>
                    <Popconfirm title="¿Eliminar producto?" onConfirm={() => deleteMutation.mutate(record.id_producto)}>
                      <Button size="small" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                  </Space>
                ),
              }]
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
            <InputNumber min={0} className={styles.formInput} />
          </Form.Item>
          <Form.Item name="id_categoria" label="Categoría">
            <Select allowClear placeholder="Seleccionar categoría" options={categorias?.data?.map((c: any) => ({ label: c.nombre_categoria, value: c.id_categoria }))} />
          </Form.Item>
          <Form.Item name="stock" label="Stock inicial">
            <InputNumber min={0} className={styles.formInput} />
          </Form.Item>
          <Form.Item name="stock_minimo" label="Stock mínimo">
            <InputNumber min={0} className={styles.formInput} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`Historial de precios - ${historyProducto?.nombre ?? ''}`}
        open={historyModalOpen}
        onCancel={closeHistory}
        footer={null}
        width={600}
        destroyOnClose
      >
        <Table
          dataSource={historial?.data ?? []}
          loading={historyLoading}
          rowKey="id_historico"
          pagination={false}
          columns={[
            {
              title: 'Fecha',
              dataIndex: 'fecha_cambio',
              key: 'fecha',
              render: (v: string) => new Date(v).toLocaleString('es-CO'),
            },
            {
              title: 'Precio anterior',
              dataIndex: 'precio_anterior',
              key: 'precio_anterior',
              render: (v: number) => `$${Number(v).toLocaleString('es-CO')}`,
            },
            {
              title: 'Precio nuevo',
              dataIndex: 'precio_nuevo',
              key: 'precio_nuevo',
              render: (v: number) => `$${Number(v).toLocaleString('es-CO')}`,
            },
          ]}
        />
      </Modal>
    </div>
  );
}
