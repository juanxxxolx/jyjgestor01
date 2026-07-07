import { useState, useRef } from 'react';
import { Table, Button, Select, InputNumber, Card, Space, Typography, Tag, Divider, Row, Col, Modal, List, Popconfirm, Descriptions } from 'antd';
import { ShoppingCartOutlined, DeleteOutlined, PlusOutlined, StopOutlined, FileTextOutlined, PrinterOutlined } from '@ant-design/icons';
import { useVentas } from './useVentas';
import type { Producto } from '../../types';
import styles from './styles.module.css';

export default function VentasPage() {
  const reciboRef = useRef<HTMLDivElement>(null);
  const {
    ventasRes, isLoading, productosRes, clientesRes,
    lineas, idCliente, setIdCliente, total, page, setPage, limit,
    reciboVenta, reciboData, reciboLoading,
    createMutation, anularMutation, agregarProducto, cambiarCantidad, quitarLinea, registrarVenta,
    setReciboVenta,
  } = useVentas();

  const [modalOpen, setModalOpen] = useState(false);
  const productos = (productosRes?.data ?? []).filter((p: Producto) => p.stock > 0);

  return (
    <div className={styles.page}>
      <Row gutter={24}>
        <Col xs={24} lg={14}>
          <Typography.Title level={4}>Facturación / Ventas</Typography.Title>

          <Card title="Nueva venta" className={styles.card}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Select
                allowClear
                showSearch
                placeholder="Cliente (opcional)"
                style={{ width: '100%' }}
                value={idCliente}
                onChange={setIdCliente}
                optionFilterProp="label"
                options={(clientesRes?.data ?? []).map((c: any) => ({
                  value: c.id_cliente,
                  label: c.nombre,
                }))}
              />

              <Button icon={<PlusOutlined />} onClick={() => setModalOpen(true)} block>
                Agregar producto
              </Button>
            </Space>

            <Divider />

            <table className={styles.lineasTable}>
              <thead>
                <tr><th>Producto</th><th style={{width:80}}>Cant.</th><th style={{width:100}}>Precio</th><th style={{width:100}}>Subtotal</th><th style={{width:40}}/></tr>
              </thead>
              <tbody>
                {lineas.map((l) => (
                  <tr key={l.key}>
                    <td>{l.nombre}</td>
                    <td>
                      <InputNumber
                        min={1}
                        max={999}
                        value={l.cantidad}
                        onChange={(v) => cambiarCantidad(l.key, v ?? 1)}
                        style={{ width: 70 }}
                        size="small"
                      />
                    </td>
                    <td>${l.precio_unitario.toLocaleString('es-CO')}</td>
                    <td><strong>${l.subtotal.toLocaleString('es-CO')}</strong></td>
                    <td>
                      <Button size="small" danger icon={<DeleteOutlined />} onClick={() => quitarLinea(l.key)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {lineas.length > 0 && (
              <>
                <Divider />
                <div className={styles.totalRow}>
                  <Typography.Title level={3}>Total: ${total.toLocaleString('es-CO')}</Typography.Title>
                  <Button
                    type="primary"
                    size="large"
                    icon={<ShoppingCartOutlined />}
                    onClick={registrarVenta}
                    loading={createMutation.isPending}
                  >
                    Cobrar
                  </Button>
                </div>
              </>
            )}
          </Card>
        </Col>

        <Col xs={24} lg={10}>
          <Typography.Title level={4}>Historial de ventas</Typography.Title>
          <Table
            dataSource={ventasRes?.data ?? []}
            loading={isLoading}
            rowKey="id_venta"
            size="small"
            pagination={{
              current: page, pageSize: limit,
              total: ventasRes?.meta?.total,
              onChange: (p) => setPage(p),
              showSizeChanger: false,
            }}
            columns={[
              { title: '#', dataIndex: 'id_venta', key: 'id', width: 50 },
              {
                title: 'Cliente',
                dataIndex: ['cliente', 'nombre'],
                key: 'cliente',
                render: (v: string) => v || <Tag>Mostrador</Tag>,
              },
              {
                title: 'Total',
                dataIndex: 'total',
                key: 'total',
                render: (v: number) => `$${Number(v).toLocaleString('es-CO')}`,
              },
              {
                title: 'Estado',
                dataIndex: 'estado',
                key: 'estado',
                render: (v: string) => (
                  <Tag color={v === 'ANULADA' ? 'red' : 'green'}>{v === 'ANULADA' ? 'Anulada' : 'Completada'}</Tag>
                ),
              },
              {
                title: 'Fecha',
                dataIndex: 'created_at',
                key: 'fecha',
                render: (v: string) => new Date(v).toLocaleString('es-CO'),
              },
              {
                title: 'Acción',
                key: 'accion',
                render: (_: any, r: any) => (
                  <Space>
                    <Button size="small" icon={<FileTextOutlined />} onClick={() => setReciboVenta(r)}>Ver recibo</Button>
                    {r.estado !== 'ANULADA' && (
                      <Popconfirm title="¿Anular venta?" description="Se revertirá el stock" onConfirm={() => anularMutation.mutate(r.id_venta)}>
                        <Button size="small" danger icon={<StopOutlined />}>Anular</Button>
                      </Popconfirm>
                    )}
                  </Space>
                ),
              },
            ]}
          />
        </Col>
      </Row>

      <Modal
        title="Seleccionar producto"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={500}
      >
        <List
          dataSource={productos}
          renderItem={(p: Producto) => (
            <List.Item
              actions={[
                <Button
                  type="link"
                  onClick={() => { agregarProducto(p); setModalOpen(false); }}
                  disabled={p.stock <= 0}
                >
                  Agregar
                </Button>,
              ]}
            >
              <List.Item.Meta
                title={p.nombre}
                description={`Stock: ${p.stock} — Precio: $${Number(p.precio_venta).toLocaleString('es-CO')}`}
              />
            </List.Item>
          )}
        />
      </Modal>

      <Modal
        title={`Recibo de venta #${reciboVenta?.id_venta || ''}`}
        open={!!reciboVenta}
        onCancel={() => setReciboVenta(null)}
        footer={[
          <Button key="print" type="primary" icon={<PrinterOutlined />} onClick={() => window.print()}>
            Imprimir
          </Button>,
          <Button key="close" onClick={() => setReciboVenta(null)}>Cerrar</Button>,
        ]}
        width={500}
        loading={reciboLoading}
      >
        {reciboData?.data && (
          <div ref={reciboRef} style={{ padding: 16, fontFamily: 'monospace' }}>
            <Typography.Title level={4} style={{ textAlign: 'center' }}>JYJGestor</Typography.Title>
            <Typography.Text style={{ display: 'block', textAlign: 'center' }}>Sistema de Inventario</Typography.Text>
            <Divider />
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Factura #">{reciboData.data.id_venta}</Descriptions.Item>
              <Descriptions.Item label="Cliente">{reciboData.data.cliente?.nombre || 'Mostrador'}</Descriptions.Item>
              <Descriptions.Item label="Vendedor">{reciboData.data.usuario?.nombre}</Descriptions.Item>
              <Descriptions.Item label="Fecha">{new Date(reciboData.data.created_at).toLocaleString('es-CO')}</Descriptions.Item>
              <Descriptions.Item label="Estado">
                <Tag color={reciboData.data.estado === 'ANULADA' ? 'red' : 'green'}>
                  {reciboData.data.estado === 'ANULADA' ? 'ANULADA' : 'Completada'}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
            <Divider />
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #000' }}>
                  <th style={{ textAlign: 'left', padding: 4 }}>Producto</th>
                  <th style={{ textAlign: 'center', padding: 4 }}>Cant.</th>
                  <th style={{ textAlign: 'right', padding: 4 }}>Precio</th>
                  <th style={{ textAlign: 'right', padding: 4 }}>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {reciboData.data.detalle?.map((d: any, i: number) => (
                  <tr key={i} style={{ borderBottom: '1px solid #ddd' }}>
                    <td style={{ padding: 4 }}>{d.producto?.nombre || `#${d.id_producto}`}</td>
                    <td style={{ textAlign: 'center', padding: 4 }}>{d.cantidad}</td>
                    <td style={{ textAlign: 'right', padding: 4 }}>${Number(d.precio_unitario).toLocaleString('es-CO')}</td>
                    <td style={{ textAlign: 'right', padding: 4 }}>${Number(d.subtotal).toLocaleString('es-CO')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Divider />
            <Typography.Title level={3} style={{ textAlign: 'right' }}>
              Total: ${Number(reciboData.data.total).toLocaleString('es-CO')}
            </Typography.Title>
          </div>
        )}
      </Modal>
    </div>
  );
}
