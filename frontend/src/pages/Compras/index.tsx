/**
 * @file Página de compras y reabastecimiento de inventario.
 * Permite registrar compras a proveedores con detalle de productos,
 * cantidades y costos unitarios, y visualizar el historial de compras.
 */

import { useState } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Select, Space, Typography } from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { useCompras } from './useCompras';
import styles from './styles.module.css';

/**
 * Página principal de Compras.
 *
 * @component
 * @description Muestra una tabla con el historial de compras paginado y un
 * botón para abrir un modal de creación. El modal contiene un formulario
 * dinámico con selección de proveedor y una lista de productos (con cantidad
 * y costo unitario) que se envía para registrar la compra.
 *
 * @returns {JSX.Element} Vista de compras / reabastecimiento.
 */
export default function ComprasPage() {
  const {
    data, isLoading, proveedores, productos,
    modalOpen, form, page, setPage, limit,
    createMutation, openCreate, closeModal, onFinish,
  } = useCompras();

  return (
    <div className={styles.page}>
      <Space className={styles.header}>
        <Typography.Title level={4} className={styles.title}>Compras / Reabastecimiento</Typography.Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>Nueva compra</Button>
      </Space>

      <Table
        dataSource={data?.data ?? []}
        loading={isLoading}
        rowKey="id_compra"
        pagination={{ current: page, pageSize: limit, total: data?.meta?.total, onChange: (p) => setPage(p), showSizeChanger: false }}
        scroll={{ x: 'max-content' }}
        columns={[
          { title: '#', dataIndex: 'id_compra', key: 'id' },
          { title: 'Proveedor', dataIndex: ['proveedor', 'nombre'], key: 'proveedor', render: (v: string) => v ?? '—' },
          { title: 'Productos', key: 'productos', render: (_: any, r: any) => r.detalle?.length ?? 0 },
          { title: 'Total', dataIndex: 'total', key: 'total', render: (v: number) => `$${Number(v).toLocaleString('es-CO')}` },
          {
            title: 'Fecha',
            dataIndex: 'created_at',
            key: 'fecha',
            render: (v: string) => new Date(v).toLocaleString('es-CO'),
          },
        ]}
      />

      <Modal
        title="Nueva compra"
        open={modalOpen}
        onCancel={closeModal}
        onOk={() => form.submit()}
        confirmLoading={createMutation.isPending}
        width={700}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item name="id_proveedor" label="Proveedor" rules={[{ required: true, message: 'Seleccione un proveedor' }]}>
            <Select allowClear placeholder="Seleccionar proveedor" options={proveedores?.data?.map((p: any) => ({ label: p.nombre, value: p.id_proveedor }))} />
          </Form.Item>
          <Form.List name="detalle">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...rest }) => (
                  <Space key={key} className={styles.detalleRow} align="baseline">
                    <Form.Item {...rest} name={[name, 'id_producto']} rules={[{ required: true, message: 'Requerido' }]} noStyle>
                      <Select placeholder="Producto" showSearch optionFilterProp="label" options={productos?.data?.map((p: any) => ({ label: p.nombre, value: p.id_producto }))} />
                    </Form.Item>
                    <Form.Item {...rest} name={[name, 'cantidad']} rules={[{ required: true }]} noStyle>
                      <InputNumber min={1} max={999999} placeholder="Cant" style={{ width: 80 }} />
                    </Form.Item>
                    <Form.Item {...rest} name={[name, 'costo_unitario']} rules={[{ required: true }]} noStyle>
                      <InputNumber min={0} max={999999999} prefix="$" placeholder="Costo" style={{ width: 130 }} />
                    </Form.Item>
                    <Button icon={<MinusCircleOutlined />} onClick={() => remove(name)} danger size="small" />
                  </Space>
                ))}
                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>Agregar producto</Button>
              </>
            )}
          </Form.List>
        </Form>
      </Modal>
    </div>
  );
}
