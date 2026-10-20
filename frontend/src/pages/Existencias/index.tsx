/**
 * @file Página de existencias / movimientos de inventario.
 * Permite consultar, filtrar y registrar movimientos (entrada, salida, ajuste)
 * sobre los productos. Incluye exportación a Excel.
 */

import { Table, Button, Modal, Form, Input, InputNumber, Select, Tag, Space, Typography, Skeleton, Empty, message } from 'antd';
import { PlusOutlined, DownloadOutlined } from '@ant-design/icons';
import { useExistencias } from './useExistencias';
import { downloadExport } from '../../utils/download';
import type { Cliente } from '../../types';
import styles from './styles.module.css';

const ExistenciasEmpty = () => (
  <Empty
    image={Empty.PRESENTED_IMAGE_SIMPLE}
    imageStyle={{ height: 120 }}
    description="No hay movimientos registrados"
    style={{ padding: 48, textAlign: 'center' }}
  >
    <Button type="primary" icon={<PlusOutlined />} size="large" onClick={() => window.location.href = '/existencias'}>
      Registrar primer movimiento
    </Button>
  </Empty>
);

/**
 * Componente de la página Existencias.
 * - Selector para filtrar movimientos por producto.
 * - Tabla paginada con columnas: Producto, Referencia, Tipo (Tag coloreado),
 *   Cantidad, Motivo, Cliente, Usuario y Fecha.
 * - Modal para registrar un nuevo movimiento (producto, tipo, cantidad,
 *   motivo y cliente opcional).
 * - Botón de exportación a Excel.
 */
export default function ExistenciasPage() {
  const {
    movimientosRes, isLoading, productosRes, clientesRes,
    modalOpen, form, tipoColor, productoFiltro,
    page, setPage, limit,
    createMutation, setModalOpen, setProductoFiltro,
    clienteSearch, setClienteSearch,
  } = useExistencias();

  const hasData = (movimientosRes?.data?.length ?? 0) > 0;

  return (
    <div className={styles.page}>
      <Space className={styles.header}>
        <Typography.Title level={4} className={styles.title}>Existencias / Movimientos</Typography.Title>
        <Space>
          <Button icon={<DownloadOutlined />} onClick={() => { downloadExport('/movimientos/export', 'movimientos.xlsx'); message.success('Exportado'); }}>
            Exportar
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
            Registrar movimiento
          </Button>
        </Space>
      </Space>

      <Select
        allowClear
        showSearch
        placeholder="Filtrar por producto..."
        style={{ width: 300, marginBottom: 16 }}
        value={productoFiltro}
        onChange={(v) => { setProductoFiltro(v); setPage(1); }}
        optionFilterProp="label"
        options={(productosRes?.data ?? []).map((p: any) => ({ value: p.id_producto, label: `${p.nombre} (${p.codigo})` }))}
      />

      {!isLoading && !hasData ? (
        <ExistenciasEmpty />
      ) : (
        <Table
          dataSource={movimientosRes?.data ?? []}
          loading={{ spinning: isLoading, indicator: <Skeleton active /> }}
          rowKey="id_movimiento"
          locale={{ emptyText: 'No hay movimientos registrados' }}
          pagination={{
            current: page,
            pageSize: limit,
            total: movimientosRes?.meta?.total,
            onChange: (p) => setPage(p),
            showSizeChanger: false,
          }}
          scroll={{ x: 'max-content' }}
          columns={[
            { title: 'Producto', dataIndex: ['producto', 'nombre'], key: 'producto' },
            { title: 'Código', dataIndex: ['producto', 'codigo'], key: 'codigo' },
            {
              title: 'Tipo',
              dataIndex: 'tipo_movimiento',
              key: 'tipo',
              render: (v: string) => <Tag color={tipoColor[v]}>{v}</Tag>,
            },
            { title: 'Cantidad', dataIndex: 'cantidad', key: 'cantidad' },
            { title: 'Motivo', dataIndex: 'motivo', key: 'motivo', ellipsis: true },
            { title: 'Cliente', dataIndex: ['cliente', 'nombre'], key: 'cliente' },
            { title: 'Usuario', dataIndex: ['usuario', 'nombre'], key: 'usuario' },
            {
              title: 'Fecha',
              dataIndex: 'fecha_movimiento',
              key: 'fecha',
              render: (v: string) => new Date(v).toLocaleString('es-CO'),
            },
          ]}
        />
      )}

      <Modal
        title="Registrar movimiento"
        open={modalOpen}
        onCancel={() => { setModalOpen(false); form.resetFields(); }}
        onOk={() => form.submit()}
        confirmLoading={createMutation.isPending}
        destroyOnClose
        width={550}
      >
        {createMutation.isPending ? (
          <Form layout="vertical">
            <Skeleton active paragraph={{ rows: 6 }} />
          </Form>
        ) : (
          <Form form={form} layout="vertical" onFinish={(v) => createMutation.mutate(v)}>
            <Form.Item
              name="id_producto"
              label="Producto *"
              rules={[{ required: true, message: 'Seleccione un producto' }]}
            >
              <Select
                showSearch
                optionFilterProp="label"
                placeholder="Buscar producto..."
                options={(productosRes?.data ?? []).map((p: any) => ({
                  value: p.id_producto,
                  label: `${p.nombre} (${p.codigo}) — Stock: ${p.stock}`,
                }))}
              />
            </Form.Item>
            <Form.Item
              name="tipo_movimiento"
              label="Tipo *"
              rules={[{ required: true, message: 'Seleccione un tipo' }]}
            >
              <Select
                placeholder="Seleccionar tipo"
                options={[
                  { value: 'ENTRADA', label: 'Entrada' },
                  { value: 'SALIDA', label: 'Salida' },
                  { value: 'AJUSTE', label: 'Ajuste (establece stock)' },
                ]}
              />
            </Form.Item>
            <Form.Item
              name="cantidad"
              label="Cantidad *"
              rules={[{ required: true, message: 'La cantidad es obligatoria' }, { type: 'number', min: 0.01, message: 'Debe ser mayor a 0' }]}
            >
              <InputNumber min={0.01} max={999999} style={{ width: '100%' }} placeholder="0" />
            </Form.Item>
            <Form.Item
              name="motivo"
              label="Motivo *"
              rules={[
                { required: true, message: 'El motivo es obligatorio' },
                { max: 500, message: 'Máximo 500 caracteres' },
                { pattern: /^[\w\sáéíóúñüÁÉÍÓÚÑÜ.,;:!?\-()$]+$/, message: 'Caracteres no permitidos' }
              ]}
            >
              <Input.TextArea rows={2} maxLength={500} placeholder="Ej: Compra a proveedor, Venta a cliente, Ajuste por inventario" />
            </Form.Item>
            <Form.Item name="id_cliente" label="Cliente (opcional)">
              <Space direction="vertical" style={{ width: '100%' }}>
                <Input.Search
                  placeholder="Buscar cliente por teléfono..."
                  allowClear
                  value={clienteSearch}
                  onChange={(e) => setClienteSearch(e.target.value)}
                  style={{ width: '100%' }}
                  enterButton
                />
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  Escribe el número de teléfono para buscar el cliente
                </Typography.Text>
              </Space>
              <Select
                allowClear
                showSearch
                optionFilterProp="label"
                placeholder="Seleccionar cliente"
                options={(clientesRes?.data ?? []).map((c: Cliente) => ({
                  value: c.id_cliente,
                  label: `${c.nombre}${c.telefono ? ` — ${c.telefono}` : ''}`,
                }))}
              />
            </Form.Item>
          </Form>
        )}
      </Modal>
    </div>
  );
}