/**
 * @file Página de facturación y ventas.
 * Permite registrar ventas seleccionando productos y clientes,
 * visualizar el historial de ventas, anular ventas y generar
 * recibos en formato PDF o impresión.
 */

import { useState, useRef, useEffect } from 'react';
import { Table, Button, Select, InputNumber, Card, Space, Typography, Tag, Divider, Row, Col, Modal, List, Popconfirm, Descriptions, Input, Alert } from 'antd';
import { ShoppingCartOutlined, DeleteOutlined, PlusOutlined, StopOutlined, FileTextOutlined, PrinterOutlined, FilePdfOutlined } from '@ant-design/icons';
import { useVentas } from './useVentas';
import { ventasApi } from '../../api/ventas.api';
import type { Producto } from '../../types';
import styles from './styles.module.css';

/**
 * Página principal de Ventas.
 *
 * @component
 * @description Renderiza el formulario de nueva venta (selector de cliente,
 * agregar productos, líneas con cantidad/precio/subtotal, total y botón
 * "Cobrar"), la tabla de historial de ventas (con paginación, tags de estado
 * y acciones de ver recibo/anular), un modal para seleccionar productos
 * disponibles y un modal de recibo con detalle de la venta.
 *
 * @returns {JSX.Element} Vista completa de facturación/ventas.
 */
export default function VentasPage() {
  const reciboRef = useRef<HTMLDivElement>(null);
  const {
    ventasRes, isLoading, productosRes, clientesRes,
    lineas, idCliente, setIdCliente, clienteSearch, setClienteSearch, total, page, setPage, limit,
    reciboVenta, reciboData, reciboLoading,
    createMutation, anularMutation, agregarProducto, cambiarCantidad, quitarLinea, registrarVenta,
    setReciboVenta,
  } = useVentas();

  const [modalOpen, setModalOpen] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const productos = (productosRes?.data ?? []).filter((p: Producto) => p.stock > 0 && p.nombre.toLowerCase().includes(busqueda.toLowerCase()));

  // Clientes que coinciden SOLO por teléfono
  const clientesPorTelefono = clienteSearch
    ? (clientesRes?.data ?? []).filter((c: any) => c.telefono?.includes(clienteSearch))
    : [];

  // Cliente único para auto-selección
  const clienteUnico = clientesPorTelefono.length === 1 ? clientesPorTelefono[0] : null;

  // Auto-seleccionar si hay exactamente 1 coincidencia
  useEffect(() => {
    if (clienteUnico && idCliente !== clienteUnico.id_cliente) {
      setIdCliente(clienteUnico.id_cliente);
    }
  }, [clienteUnico, idCliente, setIdCliente]);

  // Limpiar selección si se borra la búsqueda
  useEffect(() => {
    if (!clienteSearch && idCliente) {
      setIdCliente(undefined);
    }
  }, [clienteSearch, idCliente, setIdCliente]);

  return (
    <div className={styles.page}>
      <Row gutter={24}>
        <Col xs={24} lg={14}>
          <Typography.Title level={4}>Facturación / Ventas</Typography.Title>

          <Card title="Nueva venta" className={styles.card}>
            <Space direction="vertical" style={{ width: '100%' }}>
                <Input.Search
                  placeholder="Buscar cliente por teléfono..."
                  allowClear
                  value={clienteSearch}
                  onChange={(e) => setClienteSearch(e.target.value)}
                  onSearch={(value) => setClienteSearch(value)}
                  style={{ width: '100%' }}
                  enterButton
                />
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  Escribe el número de teléfono y presiona Enter para buscar
                </Typography.Text>
                {clienteSearch && (
                  <Space direction="vertical" style={{ width: '100%' }}>
                    {clientesPorTelefono.length === 0 && (
                      <Alert type="warning" message="No se encontró cliente con ese teléfono" style={{ width: '100%' }} />
                    )}
                    {clientesPorTelefono.length > 1 && (
                      <Alert type="info" message={`Se encontraron ${clientesPorTelefono.length} clientes. Refina la búsqueda.`} style={{ width: '100%' }} />
                    )}
                    {clienteUnico && (
                      <div style={{ padding: 12, background: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 6, width: '100%' }}>
                        <Typography.Text strong>Cliente seleccionado:</Typography.Text>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                          <span>
                            {clienteUnico.nombre}
                            {clienteUnico.telefono && <span style={{ marginLeft: 8, color: '#666' }}>— {clienteUnico.telefono}</span>}
                          </span>
                          <Button size="small" danger onClick={() => { setIdCliente(undefined); setClienteSearch(''); }}>Quitar</Button>
                        </div>
                      </div>
                    )}
                  </Space>
                )}
                <Button icon={<PlusOutlined />} onClick={() => setModalOpen(true)} block>
                  Agregar producto
                </Button>
              </Space>

            <Divider />

            <div style={{ overflowX: 'auto' }}>
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
            </div>

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
          <div style={{ overflowX: 'auto' }}>
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
            scroll={{ x: 'max-content' }}
            columns={[
              { title: '#', dataIndex: 'id_venta', key: 'id', width: 50, fixed: 'left' },
              {
                title: 'Cliente',
                dataIndex: ['cliente', 'nombre'],
                key: 'cliente',
                width: 130,
                render: (v: string) => v || <Tag>Mostrador</Tag>,
              },
              {
                title: 'Total',
                dataIndex: 'total',
                key: 'total',
                width: 100,
                render: (v: number) => `$${Number(v).toLocaleString('es-CO')}`,
              },
              {
                title: 'Estado',
                dataIndex: 'estado',
                key: 'estado',
                width: 100,
                render: (v: string) => (
                  <Tag color={v === 'ANULADA' ? 'red' : 'green'}>{v === 'ANULADA' ? 'Anulada' : 'Completada'}</Tag>
                ),
              },
              {
                title: 'Fecha',
                dataIndex: 'created_at',
                key: 'fecha',
                width: 150,
                render: (v: string) => new Date(v).toLocaleString('es-CO'),
              },
              {
                title: 'Acción',
                key: 'accion',
                width: 110,
                render: (_: any, r: any) => (
                  <Space>
                    <Button size="small" icon={<FileTextOutlined />} onClick={() => setReciboVenta(r)} />
                    {r.estado !== 'ANULADA' && (
                      <Popconfirm title="¿Anular venta?" description="Se revertirá el stock" onConfirm={() => anularMutation.mutate(r.id_venta)}>
                        <Button size="small" danger icon={<StopOutlined />} />
                      </Popconfirm>
                    )}
                  </Space>
                ),
              },
            ]}
          />
          </div>
        </Col>
      </Row>

      <Modal
        title="Seleccionar producto"
        open={modalOpen}
        onCancel={() => { setModalOpen(false); setBusqueda(''); }}
        afterOpenChange={(open) => { if (open) setBusqueda(''); }}
        footer={null}
        width={500}
      >
        <Input.Search
          placeholder="Buscar producto por nombre..."
          allowClear
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={{ marginBottom: 12 }}
        />
        <List
          dataSource={productos}
          locale={{ emptyText: busqueda ? 'Sin resultados' : 'No hay productos disponibles' }}
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
          <Button key="pdf" icon={<FilePdfOutlined />} onClick={() => ventasApi.downloadPdf(reciboVenta?.id_venta)}>
            PDF
          </Button>,
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
