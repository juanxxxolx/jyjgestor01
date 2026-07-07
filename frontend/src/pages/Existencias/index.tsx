import { Table, Button, Modal, Form, Input, InputNumber, Select, Tag, Space, Typography } from 'antd';
import { PlusOutlined, DownloadOutlined } from '@ant-design/icons';
import { useExistencias } from './useExistencias';
import { downloadExport } from '../../utils/download';
import type { Cliente } from '../../types';
import styles from './styles.module.css';

export default function ExistenciasPage() {
  const {
    movimientosRes, isLoading, productosRes, clientesRes,
    modalOpen, form, tipoColor, productoFiltro,
    page, setPage, limit,
    createMutation, setModalOpen, setProductoFiltro,
  } = useExistencias();

  return (
    <div className={styles.page}>
      <Space className={styles.header}>
        <Typography.Title level={4} className={styles.title}>Existencias / Movimientos</Typography.Title>
        <Space>
          <Button icon={<DownloadOutlined />} onClick={() => downloadExport('/movimientos/export', 'movimientos.xlsx')}>
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
        placeholder="Filtrar por producto"
        style={{ width: 300, marginBottom: 16 }}
        value={productoFiltro}
        onChange={(v) => { setProductoFiltro(v); setPage(1); }}
        optionFilterProp="label"
        options={(productosRes?.data ?? []).map((p: any) => ({ value: p.id_producto, label: `${p.nombre} (${p.referencia})` }))}
      />

      <Table
        dataSource={movimientosRes?.data ?? []}
        loading={isLoading}
        rowKey="id_movimiento"
        locale={{ emptyText: 'No hay movimientos' }}
        pagination={{
          current: page,
          pageSize: limit,
          total: movimientosRes?.meta?.total,
          onChange: (p) => setPage(p),
          showSizeChanger: false,
        }}
        columns={[
          { title: 'Producto', dataIndex: ['producto', 'nombre'], key: 'producto' },
          { title: 'Referencia', dataIndex: ['producto', 'referencia'], key: 'referencia' },
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

      <Modal
        title="Registrar movimiento"
        open={modalOpen}
        onCancel={() => { setModalOpen(false); form.resetFields(); }}
        onOk={() => form.submit()}
        confirmLoading={createMutation.isPending}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={(v) => createMutation.mutate(v)}>
          <Form.Item name="id_producto" label="Producto" rules={[{ required: true }]}>
            <Select
              showSearch
              optionFilterProp="label"
              options={(productosRes?.data ?? []).map((p: any) => ({
                value: p.id_producto,
                label: `${p.nombre} (${p.referencia}) — Stock: ${p.stock}`,
              }))}
            />
          </Form.Item>
          <Form.Item name="tipo_movimiento" label="Tipo" rules={[{ required: true }]}>
            <Select
              options={[
                { value: 'ENTRADA', label: 'Entrada' },
                { value: 'SALIDA', label: 'Salida' },
                { value: 'AJUSTE', label: 'Ajuste (establece stock)' },
              ]}
            />
          </Form.Item>
          <Form.Item name="cantidad" label="Cantidad" rules={[{ required: true }]}>
            <InputNumber min={0.01} className={styles.formInput} />
          </Form.Item>
          <Form.Item name="motivo" label="Motivo" rules={[{ required: true }]}>
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="id_cliente" label="Cliente (opcional)">
            <Select
              allowClear
              showSearch
              optionFilterProp="label"
              placeholder="Seleccionar cliente"
              options={(clientesRes?.data ?? []).map((c: Cliente) => ({
                value: c.id_cliente,
                label: c.nombre,
              }))}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
