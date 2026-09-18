/**
 * @file Página de administración de productos.
 * Proporciona listado paginado con búsqueda, alerta de stock bajo,
 * CRUD de productos, carga de imágenes, exportación a Excel e
 * historial de cambios de precio.
 */

import { Table, Button, Modal, Form, Input, InputNumber, Select, Popconfirm, Space, Typography, Tag, Upload, message, Alert, Image } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, HistoryOutlined, UploadOutlined, DownloadOutlined, WarningOutlined } from '@ant-design/icons';
import type { Producto } from '../../types';
import { useProductos } from './useProductos';
import { downloadExport } from '../../utils/download';
import styles from './styles.module.css';

/**
 * Página principal de Productos.
 *
 * @component
 * @description Renderiza el buscador, una alerta de stock bajo, la tabla de
 * productos con columnas de imagen, nombre, referencia, categoría, precio,
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
        scroll={{ x: 'max-content' }}
        columns={[
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
          <Form.Item name="nombre" label="Nombre" rules={[
            { required: true, message: 'Nombre requerido' },
            { min: 2, message: 'Mínimo 2 caracteres' },
            { max: 200, message: 'Máximo 200 caracteres' },
            { pattern: /^[a-zA-ZáéíóúñüÁÉÍÓÚÑÜ\s\-']+$/, message: 'Solo se permiten letras, espacios, guiones y apóstrofes' }
          ]}>
            <Input maxLength={200} />
          </Form.Item>
          <Form.Item name="referencia" label="Referencia" rules={[
            { required: true, message: 'Referencia requerida' },
            { min: 2, message: 'Mínimo 2 caracteres' },
            { max: 100, message: 'Máximo 100 caracteres' },
            { pattern: /^[a-zA-Z0-9áéíóúñüÁÉÍÓÚÑÜ\s\-\.]+$/, message: 'La referencia solo debe contener letras, números, espacios, guiones y puntos' }
          ]}>
            <Input maxLength={100} />
          </Form.Item>
          <Form.Item name="precio_venta" label="Precio de venta" rules={[{ required: true }]}>
            <InputNumber min={0} max={999999999} className={styles.formInput} />
          </Form.Item>
          <Form.Item name="id_categoria" label="Categoría">
            <Select allowClear placeholder="Seleccionar categoría" options={categorias?.data?.map((c: any) => ({ label: c.nombre_categoria, value: c.id_categoria }))} />
          </Form.Item>
          <Form.Item name="stock" label="Stock inicial" dependencies={['stock_minimo']} rules={[
            ({ getFieldValue }) => ({
              validator: (_, value) => {
                const minimo = getFieldValue('stock_minimo');
                const stock = value ?? 0;
                const min = minimo ?? 0;
                if (Number(stock) < Number(min)) {
                  return Promise.reject(new Error('El stock inicial no puede ser menor que el stock mínimo'));
                }
                return Promise.resolve();
              },
            }),
          ]}>
            <InputNumber min={0} max={9999999} className={styles.formInput} />
          </Form.Item>
          <Form.Item name="stock_minimo" label="Stock mínimo" dependencies={['stock']} rules={[
            ({ getFieldValue }) => ({
              validator: (_, value) => {
                const stock = getFieldValue('stock');
                const min = value ?? 0;
                if (Number(stock ?? 0) < Number(min)) {
                  return Promise.reject(new Error('El stock mínimo no puede ser mayor que el stock inicial'));
                }
                return Promise.resolve();
              },
            }),
          ]}>
            <InputNumber min={0} max={9999999} className={styles.formInput} />
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
          scroll={{ x: 'max-content' }}
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
