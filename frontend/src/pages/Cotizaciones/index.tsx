/**
 * @file Página de cotizaciones y presupuestos.
 * Permite crear, editar, eliminar cotizaciones, visualizar el historial
 * y convertirlas en ventas.
 */

import { useState } from 'react';
import { Table, Button, Select, InputNumber, Card, Space, Typography, Tag, Divider, Row, Col, Modal, List, message, Popconfirm, Input } from 'antd';
import { PlusOutlined, DeleteOutlined, ShoppingCartOutlined, SwapOutlined, EditOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cotizacionesApi } from '../../api/cotizaciones.api';
import { productosApi } from '../../api/productos.api';
import { clientesApi } from '../../api/clientes.api';
import type { Producto } from '../../types';
import styles from './styles.module.css';

/** Representa una línea de producto dentro de la cotización. */
interface Linea {
  key: string;
  id_producto: number;
  nombre: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}

export default function CotizacionesPage() {
  const [page, setPage] = useState(1);
  const [lineas, setLineas] = useState<Linea[]>([]);
  const [idCliente, setIdCliente] = useState<number | undefined>(undefined);
  const [clienteSearch, setClienteSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingCotizacion, setEditingCotizacion] = useState<any>(null);
  const [editLineas, setEditLineas] = useState<Linea[]>([]);
  const [editIdCliente, setEditIdCliente] = useState<number | undefined>(undefined);
  const [editClienteSearch, setEditClienteSearch] = useState('');
  const [editBusqueda, setEditBusqueda] = useState('');
  const [editProductoModalOpen, setEditProductoModalOpen] = useState(false);
  const qc = useQueryClient();

  const { data: cotizacionesRes, isLoading } = useQuery({
    queryKey: ['cotizaciones', page],
    queryFn: () => cotizacionesApi.getAll(page),
  });

  const { data: productosRes } = useQuery({
    queryKey: ['productos-cotizacion'],
    queryFn: () => productosApi.getAll(1, 1000),
  });

  const { data: clientesRes } = useQuery({
    queryKey: ['clientes-cotizacion', clienteSearch],
    queryFn: () => clientesApi.getAll(clienteSearch || undefined, 1, 1000),
  });

  const { data: editClientesRes } = useQuery({
    queryKey: ['clientes-cotizacion-edit', editClienteSearch],
    queryFn: () => clientesApi.getAll(editClienteSearch || undefined, 1, 1000),
    enabled: editModalOpen,
  });

  const createMutation = useMutation({
    mutationFn: cotizacionesApi.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['cotizaciones'] }); setLineas([]); setIdCliente(undefined); message.success('Cotización creada'); },
    onError: (e: any) => message.error(e.response?.data?.message || 'Error'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => cotizacionesApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['cotizaciones'] }); setEditModalOpen(false); setEditingCotizacion(null); message.success('Cotización actualizada'); },
    onError: (e: any) => message.error(e.response?.data?.message || 'Error'),
  });

  const deleteMutation = useMutation({
    mutationFn: cotizacionesApi.remove,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['cotizaciones'] }); message.success('Cotización eliminada'); },
    onError: (e: any) => message.error(e.response?.data?.message || 'Error'),
  });

  const convertirMutation = useMutation({
    mutationFn: cotizacionesApi.convertir,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['cotizaciones'] }); qc.invalidateQueries({ queryKey: ['productos'] }); message.success('Convertida a venta'); },
    onError: (e: any) => message.error(e.response?.data?.message || 'Error'),
  });

  const productos = (productosRes?.data ?? []).filter((p: Producto) => p.stock > 0 && p.nombre.toLowerCase().includes(busqueda.toLowerCase()));
  const editProductos = (productosRes?.data ?? []).filter((p: Producto) => p.nombre.toLowerCase().includes(editBusqueda.toLowerCase()));

  const agregarProducto = (p: Producto) => {
    const existente = lineas.find((l) => l.id_producto === p.id_producto);
    if (existente) {
      setLineas(lineas.map((l) => l.id_producto === p.id_producto ? { ...l, cantidad: l.cantidad + 1, subtotal: (l.cantidad + 1) * l.precio_unitario } : l));
    } else {
      setLineas([...lineas, { key: `${p.id_producto}-${Date.now()}`, id_producto: p.id_producto, nombre: p.nombre, cantidad: 1, precio_unitario: Number(p.precio_venta), subtotal: Number(p.precio_venta) }]);
    }
    setModalOpen(false);
  };

  const agregarProductoEdit = (p: Producto) => {
    const existente = editLineas.find((l) => l.id_producto === p.id_producto);
    if (existente) {
      setEditLineas(editLineas.map((l) => l.id_producto === p.id_producto ? { ...l, cantidad: l.cantidad + 1, subtotal: (l.cantidad + 1) * l.precio_unitario } : l));
    } else {
      setEditLineas([...editLineas, { key: `${p.id_producto}-${Date.now()}`, id_producto: p.id_producto, nombre: p.nombre, cantidad: 1, precio_unitario: Number(p.precio_venta), subtotal: Number(p.precio_venta) }]);
    }
    setEditBusqueda('');
  };

  const cambiarCantidad = (key: string, cantidad: number) => {
    setLineas(lineas.map((l) => l.key === key ? { ...l, cantidad, subtotal: cantidad * l.precio_unitario } : l));
  };

  const cambiarCantidadEdit = (key: string, cantidad: number) => {
    setEditLineas(editLineas.map((l) => l.key === key ? { ...l, cantidad, subtotal: cantidad * l.precio_unitario } : l));
  };

  const quitarLinea = (key: string) => setLineas(lineas.filter((l) => l.key !== key));
  const quitarLineaEdit = (key: string) => setEditLineas(editLineas.filter((l) => l.key !== key));

  const total = lineas.reduce((sum, l) => sum + l.subtotal, 0);
  const editTotal = editLineas.reduce((sum, l) => sum + l.subtotal, 0);

  const crearCotizacion = () => {
    if (lineas.length === 0) { message.warning('Agrega al menos un producto'); return; }
    createMutation.mutate({ id_cliente: idCliente || undefined, detalle: lineas.map((l) => ({ id_producto: l.id_producto, cantidad: l.cantidad })) });
  };

  const abrirEditar = (cot: any) => {
    const lineasEdit: Linea[] = (cot.detalle ?? []).map((d: any, i: number) => ({
      key: `edit-${d.id_producto}-${i}`,
      id_producto: d.id_producto,
      nombre: d.producto?.nombre || `Producto ${d.id_producto}`,
      cantidad: d.cantidad,
      precio_unitario: Number(d.precio_unitario),
      subtotal: Number(d.subtotal),
    }));
    setEditingCotizacion(cot);
    setEditLineas(lineasEdit);
    setEditIdCliente(cot.id_cliente ?? undefined);
    setEditModalOpen(true);
  };

  const guardarEdicion = () => {
    if (!editingCotizacion) return;
    if (editLineas.length === 0) { message.warning('Agrega al menos un producto'); return; }
    updateMutation.mutate({
      id: editingCotizacion.id_cotizacion,
      data: {
        id_cliente: editIdCliente || undefined,
        detalle: editLineas.map((l) => ({ id_producto: l.id_producto, cantidad: l.cantidad })),
      },
    });
  };

  const eliminarCotizacion = (id: number) => {
    deleteMutation.mutate(id);
  };

  return (
    <div className={styles.page}>
      <Row gutter={24}>
        <Col xs={24} lg={14}>
          <Typography.Title level={4}>Cotizaciones / Presupuestos</Typography.Title>
          <Card title="Nueva cotización">
            <Space direction="vertical" style={{ width: '100%' }}>
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
              <Select allowClear showSearch placeholder="Seleccionar cliente (opcional)" style={{ width: '100%' }} value={idCliente} onChange={setIdCliente} optionFilterProp="label" options={(clientesRes?.data ?? []).map((c: any) => ({ value: c.id_cliente, label: `${c.nombre}${c.telefono ? ` — ${c.telefono}` : ''}` }))} />
              <Button icon={<PlusOutlined />} onClick={() => setModalOpen(true)} block>Agregar producto</Button>
            </Space>
            <Divider />
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr><th style={{ textAlign: 'left', padding: 8 }}>Producto</th><th style={{ width: 80 }}>Cant.</th><th style={{ width: 100 }}>Precio</th><th style={{ width: 100 }}>Subtotal</th><th style={{ width: 40 }} /></tr>
              </thead>
              <tbody>
                {lineas.map((l) => (
                  <tr key={l.key}>
                    <td style={{ padding: 8 }}>{l.nombre}</td>
                    <td><InputNumber min={1} max={999} value={l.cantidad} onChange={(v) => cambiarCantidad(l.key, v ?? 1)} style={{ width: 70 }} size="small" /></td>
                    <td>${l.precio_unitario.toLocaleString('es-CO')}</td>
                    <td><strong>${l.subtotal.toLocaleString('es-CO')}</strong></td>
                    <td><Button size="small" danger icon={<DeleteOutlined />} onClick={() => quitarLinea(l.key)} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {lineas.length > 0 && (
              <>
                <Divider />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography.Title level={3}>Total: ${total.toLocaleString('es-CO')}</Typography.Title>
                  <Button type="primary" size="large" icon={<ShoppingCartOutlined />} onClick={crearCotizacion} loading={createMutation.isPending}>Crear cotización</Button>
                </div>
              </>
            )}
          </Card>
        </Col>

        <Col xs={24} lg={10}>
          <Typography.Title level={4}>Historial</Typography.Title>
          <div style={{ overflowX: 'auto' }}>
            <Table
              dataSource={cotizacionesRes?.data ?? []}
              loading={isLoading}
              rowKey="id_cotizacion"
              size="small"
              scroll={{ x: 'max-content' }}
              pagination={{ current: page, pageSize: 20, total: cotizacionesRes?.meta?.total, onChange: (p) => setPage(p), showSizeChanger: false }}
              columns={[
                { title: '#', dataIndex: 'id_cotizacion', width: 50, fixed: 'left' },
                { title: 'Cliente', dataIndex: ['cliente', 'nombre'], width: 120, render: (v: string) => v || <Tag>Mostrador</Tag> },
                { title: 'Total', dataIndex: 'total', width: 100, render: (v: number) => `$${Number(v).toLocaleString('es-CO')}` },
                { title: 'Estado', dataIndex: 'estado', width: 110, render: (v: string) => <Tag color={v === 'PENDIENTE' ? 'orange' : 'green'}>{v === 'PENDIENTE' ? 'Pendiente' : 'Convertida'}</Tag> },
                { title: 'Fecha', dataIndex: 'created_at', width: 150, render: (v: string) => new Date(v).toLocaleString('es-CO') },
                {
                  title: 'Acciones', width: 180,
                  render: (_: any, r: any) => r.estado === 'PENDIENTE' ? (
                    <Space>
                      <Popconfirm title="¿Convertir a venta?" description="Se descontará del stock" onConfirm={() => convertirMutation.mutate(r.id_cotizacion)}>
                        <Button size="small" icon={<SwapOutlined />}>Vender</Button>
                      </Popconfirm>
                      <Button size="small" icon={<EditOutlined />} onClick={() => abrirEditar(r)}>Editar</Button>
                      <Popconfirm title="¿Eliminar cotización?" description="Esta acción no se puede deshacer" onConfirm={() => eliminarCotizacion(r.id_cotizacion)} okText="Sí" cancelText="No">
                        <Button size="small" danger icon={<DeleteOutlined />}>Eliminar</Button>
                      </Popconfirm>
                    </Space>
                  ) : (
                    <Tag color="gray">Finalizada</Tag>
                  ),
                },
              ]}
            />
          </div>
        </Col>
      </Row>

      <Modal title="Seleccionar producto" open={modalOpen} onCancel={() => { setModalOpen(false); setBusqueda(''); }} afterOpenChange={(open) => { if (open) setBusqueda(''); }} footer={null} width={500}>
        <Input.Search placeholder="Buscar producto por nombre..." allowClear value={busqueda} onChange={(e) => setBusqueda(e.target.value)} style={{ marginBottom: 12 }} />
        <List
          dataSource={productos}
          locale={{ emptyText: busqueda ? 'Sin resultados' : 'No hay productos disponibles' }}
          renderItem={(p: Producto) => (
            <List.Item actions={[<Button type="link" onClick={() => agregarProducto(p)} disabled={p.stock <= 0}>Agregar</Button>]}>
              <List.Item.Meta title={p.nombre} description={`Stock: ${p.stock} — Precio: $${Number(p.precio_venta).toLocaleString('es-CO')}`} />
            </List.Item>
          )}
        />
      </Modal>

      <Modal title="Editar cotización" open={editModalOpen} onCancel={() => { setEditModalOpen(false); setEditingCotizacion(null); setEditLineas([]); setEditIdCliente(undefined); setEditBusqueda(''); setEditProductoModalOpen(false); setEditClienteSearch(''); }} footer={null} width={600}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Input.Search
            placeholder="Buscar cliente por teléfono..."
            allowClear
            value={editClienteSearch}
            onChange={(e) => setEditClienteSearch(e.target.value)}
            style={{ width: '100%' }}
            enterButton
          />
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            Escribe el número de teléfono para buscar el cliente
          </Typography.Text>
        </Space>
        <Select allowClear showSearch placeholder="Seleccionar cliente (opcional)" style={{ width: '100%', marginBottom: 12 }} value={editIdCliente} onChange={setEditIdCliente} optionFilterProp="label" options={(editClientesRes?.data ?? []).map((c: any) => ({ value: c.id_cliente, label: `${c.nombre}${c.telefono ? ` — ${c.telefono}` : ''}` }))} />
        <Button icon={<PlusOutlined />} onClick={() => setEditProductoModalOpen(true)} block style={{ marginBottom: 12 }}>Agregar producto</Button>
        <Divider />
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr><th style={{ textAlign: 'left', padding: 8 }}>Producto</th><th style={{ width: 80 }}>Cant.</th><th style={{ width: 100 }}>Precio</th><th style={{ width: 100 }}>Subtotal</th><th style={{ width: 40 }} /></tr>
          </thead>
          <tbody>
            {editLineas.map((l) => (
              <tr key={l.key}>
                <td style={{ padding: 8 }}>{l.nombre}</td>
                <td><InputNumber min={1} max={999} value={l.cantidad} onChange={(v) => cambiarCantidadEdit(l.key, v ?? 1)} style={{ width: 70 }} size="small" /></td>
                <td>${l.precio_unitario.toLocaleString('es-CO')}</td>
                <td><strong>${l.subtotal.toLocaleString('es-CO')}</strong></td>
                <td><Button size="small" danger icon={<DeleteOutlined />} onClick={() => quitarLineaEdit(l.key)} /></td>
              </tr>
            ))}
          </tbody>
        </table>
        {editLineas.length > 0 && (
          <>
            <Divider />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
              <Typography.Title level={3}>Total: ${editTotal.toLocaleString('es-CO')}</Typography.Title>
              <Button type="primary" size="large" icon={<ShoppingCartOutlined />} onClick={guardarEdicion} loading={updateMutation.isPending}>Guardar cambios</Button>
            </div>
          </>
        )}
      </Modal>

      <Modal title="Seleccionar producto para editar" open={editProductoModalOpen} onCancel={() => { setEditProductoModalOpen(false); setEditBusqueda(''); }} footer={null} width={500} style={{ top: 100 }}>
        <Input.Search placeholder="Buscar producto por nombre..." allowClear value={editBusqueda} onChange={(e) => setEditBusqueda(e.target.value)} style={{ marginBottom: 12 }} />
        <List
          dataSource={editProductos}
          locale={{ emptyText: editBusqueda ? 'Sin resultados' : 'No hay productos disponibles' }}
          renderItem={(p: Producto) => (
            <List.Item actions={[<Button type="link" onClick={() => agregarProductoEdit(p)}>Agregar</Button>]}>
              <List.Item.Meta title={p.nombre} description={`Stock: ${p.stock} — Precio: $${Number(p.precio_venta).toLocaleString('es-CO')}`} />
            </List.Item>
          )}
        />
      </Modal>
    </div>
  );
}