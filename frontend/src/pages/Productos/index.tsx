/**
 * @file Página de administración de productos.
 * Proporciona listado paginado con búsqueda, alerta de stock bajo,
 * CRUD de productos, carga de imágenes, exportación a Excel e
 * historial de cambios de precio.
 */

import { Table, Button, Modal, Form, Input, InputNumber, Select, Popconfirm, Space, Typography, Tag, Upload, message, Alert, Image, Skeleton, Empty } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, HistoryOutlined, UploadOutlined, DownloadOutlined, WarningOutlined } from '@ant-design/icons';
import type { Producto } from '../../types';
import { useProductos } from './useProductos';
import { downloadExport } from '../../utils/download';
import { formatCOP } from '../../utils/format';
import styles from './styles.module.css';

/**
 * Empty state personalizado para la tabla de productos.
 */
const ProductosEmpty = ({ onCreate }: { onCreate: () => void }) => (
  <Empty
    image={Empty.PRESENTED_IMAGE_SIMPLE}
    imageStyle={{ height: 120 }}
    description="No hay productos registrados"
    style={{ padding: 48, textAlign: 'center' }}
  >
    <Button type="primary" icon={<PlusOutlined />} size="large" onClick={onCreate}>
      Crear primer producto
    </Button>
  </Empty>
);

/**
 * Skeleton para el modal de producto (create/edit).
 */
const ProductoModalSkeleton = () => (
  <Form layout="vertical">
    <Skeleton active paragraph={{ rows: 4 }} />
    <Skeleton active paragraph={{ rows: 3 }} />
    <Skeleton active paragraph={{ rows: 3 }} />
    <Skeleton active paragraph={{ rows: 3 }} />
  </Form>
);

/**
 * Skeleton para el modal de historial.
 */
const HistorialModalSkeleton = () => (
  <Table
    dataSource={[1, 2, 3, 4, 5]}
    columns={[
      { title: 'Fecha', dataIndex: 'fecha', key: 'fecha' },
      { title: 'Precio', dataIndex: 'precio', key: 'precio' },
    ]}
    loading={{ spinning: true, indicator: <Skeleton active /> }}
    pagination={false}
    rowKey="fecha"
  />
);

/**
 * Página principal de Productos.
 *
 * @component
 * @description Renderiza el buscador, una alerta de stock bajo, la tabla de
 * productos con columnas de imagen, nombre, código, categoría, precio,
 * stock (con color según mínimo), y acciones de editar/subir imagen/eliminar
 * (solo admin). Incluye un modal para crear/editar producto y otro para
 * visualizar el historial de precios.
 *
 * @returns {JSX.Element} Vista completa de productos.
 */
export default function ProductosPage() {
  const {
    data, isLoading, categorias, bajoStock,
    historial, historyLoading,
    modalOpen, editing, form, search,
    historyModalOpen, historyProducto,
    isAdmin, page, setPage, limit,
    createMutation, updateMutation, uploadMutation, deleteMutation,
    openCreate, openEdit, closeModal,
    openHistory, closeHistory,
    onFinish, onSearch,
  } = useProductos();

  const columns = [
    {
      title: 'Imagen',
      key: 'imagen',
      width: 80,
      render: (_: any, r: Producto) =>
        r.imagen_url ? (
          <Image src={r.imagen_url} alt={r.nombre} width={48} height={48} style={{ objectFit: 'cover', borderRadius: 4 }} preview={{ mask: 'Ampliar' }} />
        ) : (
          <div style={{ width: 48, height: 48, background: '#f0f0f0', borderRadius: 4 }} />
        ),
    },
    { title: 'Nombre', dataIndex: 'nombre', key: 'nombre' },
    { title: 'Código', dataIndex: 'codigo', key: 'codigo' },
    { title: 'Categoría', dataIndex: ['categoria', 'nombre_categoria'], key: 'categoria' },
    {
      title: 'Precio',
      dataIndex: 'precio_venta',
      key: 'precio',
      render: (v: number) => formatCOP(v),
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
    ...(isAdmin ? [{
      title: 'Acciones',
      key: 'acciones',
      render: (_: any, record: Producto) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(record)} />
          <Upload
            showUploadList={false}
            accept="image/jpeg,image/png,image/webp"
            beforeUpload={(file) => {
              const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
              if (!validTypes.includes(file.type)) {
                message.error('Solo se permiten imágenes JPG, PNG o WEBP');
                return false;
              }
              if (file.size > 5 * 1024 * 1024) {
                message.error('La imagen no puede superar 5MB');
                return false;
              }
              uploadMutation.mutate({ id: record.id_producto, file });
              return false;
            }}
          >
            <Button size="small" icon={<UploadOutlined />} />
          </Upload>
          <Popconfirm title="¿Eliminar producto?" onConfirm={() => deleteMutation.mutate(record.id_producto)}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    }] : []),
  ];

  const hasData = (data?.data?.length ?? 0) > 0;
  const tableLoading = isLoading;

  return (
    <div className={styles.page}>
      <Space className={styles.header}>
        <Typography.Title level={4} className={styles.title}>Productos</Typography.Title>
        <Space>
          <Button icon={<DownloadOutlined />} onClick={() => { downloadExport('/productos/export', 'productos.xlsx'); message.success('Exportado'); }}>
            Exportar
          </Button>
          {isAdmin && (
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate} block>
              Nuevo producto
            </Button>
          )}
        </Space>
      </Space>

      {bajoStock?.data?.length > 0 && (
        <Alert
          type="warning"
          showIcon
          icon={<WarningOutlined />}
          message={`${bajoStock.data.length} producto(s) con stock bajo`}
          banner
          style={{ marginBottom: 16 }}
        />
      )}

      <Input.Search
        placeholder="Buscar por nombre o código..."
        allowClear
        value={search}
        onChange={(e) => onSearch(e.target.value)}
        onSearch={onSearch}
        style={{ marginBottom: 16, maxWidth: 400 }}
      />

      <Table
        dataSource={data?.data ?? []}
        loading={{ spinning: isLoading, indicator: <Skeleton active /> }}
        rowKey="id_producto"
        pagination={{
          current: page,
          pageSize: limit,
          total: data?.meta?.total,
          onChange: (p) => setPage(p),
          showSizeChanger: false,
        }}
        scroll={{ x: 'max-content' }}
        locale={{ emptyText: hasData ? '' : 'No hay productos' }}
        columns={columns}
      />

      {!isLoading && !hasData && isAdmin && (
        <ProductosEmpty onCreate={openCreate} />
      )}

      {/* Modal Crear/Editar Producto */}
      <Modal
        title={editing ? 'Editar producto' : 'Nuevo producto'}
        open={modalOpen}
        onCancel={closeModal}
        onOk={() => form.submit()}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        destroyOnClose
        width={600}
      >
        {isLoading || createMutation.isPending || updateMutation.isPending ? (
          <ProductoModalSkeleton />
        ) : (
          <Form form={form} layout="vertical" onFinish={onFinish}>
            <Form.Item
              name="nombre"
              label="Nombre *"
              rules={[
                { required: true, message: 'El nombre es obligatorio' },
                { max: 200, message: 'Máximo 200 caracteres' },
                { validator: (_: any, value: string) => { if (!value || !value.trim()) return Promise.reject(new Error('El nombre no puede estar vacío')); return Promise.resolve(); } }
              ]}
            >
              <Input maxLength={200} placeholder="Ej: Camiseta básica algodón" />
            </Form.Item>

            <Form.Item
              name="codigo"
              label="Código *"
              rules={[
                { required: true, message: 'El código es obligatorio' },
                { max: 50, message: 'Máximo 50 caracteres' },
                { pattern: /^[A-Z0-9\-_]+$/, message: 'Solo mayúsculas, números, guiones y guiones bajos' },
              ]}
            >
              <Input maxLength={50} placeholder="Ej: CAM-ALG-001" style={{ textTransform: 'uppercase' }} />
            </Form.Item>

            <Form.Item
              name="id_categoria"
              label="Categoría *"
              rules={[{ required: true, message: 'Seleccione una categoría' }]}
            >
              <Select
                placeholder="Seleccionar categoría"
                options={categorias?.data?.map((c: any) => ({ label: c.nombre_categoria, value: c.id_categoria })) ?? []}
                showSearch
                filterOption={(input, option) => (option?.label as string)?.toLowerCase().includes(input.toLowerCase())}
              />
            </Form.Item>

            <Form.Item
              name="precio_venta"
              label="Precio de venta *"
              rules={[
                { required: true, message: 'El precio es obligatorio' },
                { type: 'number', min: 0, message: 'Debe ser mayor o igual a 0' },
              ]}
            >
              <InputNumber min={0} max={999999999} style={{ width: '100%' }} placeholder="0" />
            </Form.Item>

            <Form.Item
              name="stock"
              label="Stock inicial *"
              rules={[
                { required: true, message: 'El stock es obligatorio' },
                { type: 'number', min: 0, message: 'Debe ser mayor o igual a 0' },
              ]}
            >
              <InputNumber min={0} max={999999} style={{ width: '100%' }} placeholder="0" />
            </Form.Item>

            <Form.Item
              name="stock_minimo"
              label="Stock mínimo *"
              rules={[
                { required: true, message: 'El stock mínimo es obligatorio' },
                { type: 'number', min: 0, message: 'Debe ser mayor o igual a 0' },
              ]}
            >
              <InputNumber min={0} max={999999} style={{ width: '100%' }} placeholder="5" />
            </Form.Item>
          </Form>
        )}
      </Modal>

      {/* Modal Historial de Precios */}
      <Modal
        title={historyProducto ? `Historial de precios - ${historyProducto.nombre}` : 'Historial de precios'}
        open={historyModalOpen}
        onCancel={closeHistory}
        footer={null}
        destroyOnClose
        width={700}
      >
        {historyLoading ? (
          <HistorialModalSkeleton />
        ) : (
          <Table
            dataSource={historial?.data ?? []}
            rowKey="id_precio_historico"
            pagination={false}
            scroll={{ x: 'max-content' }}
            locale={{ emptyText: 'No hay cambios de precio registrados' }}
            columns={[
              {
                title: 'Fecha',
                dataIndex: 'created_at',
                key: 'fecha',
                render: (v: string) => new Date(v).toLocaleString('es-CO'),
              },
              {
                title: 'Precio anterior',
                dataIndex: 'precio_anterior',
                key: 'precio_anterior',
                render: (v: number) => formatCOP(v),
              },
              {
                title: 'Precio nuevo',
                dataIndex: 'precio_nuevo',
                key: 'precio_nuevo',
                render: (v: number) => formatCOP(v),
              },
              {
                title: 'Diferencia',
                key: 'diferencia',
                render: (_: any, r: any) => {
                  const diff = Number(r.precio_nuevo) - Number(r.precio_anterior);
                  return <Tag color={diff >= 0 ? 'green' : 'red'}>{diff >= 0 ? '+' : ''}{formatCOP(diff)}</Tag>;
                },
              },
              {
                title: 'Usuario',
                dataIndex: ['usuario', 'nombre'],
                key: 'usuario',
              },
            ]}
          />
        )}
      </Modal>
    </div>
  );
}