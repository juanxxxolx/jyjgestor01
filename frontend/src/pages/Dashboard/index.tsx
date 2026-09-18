/**
 * @file Página de Dashboard (Panel General).
 * Muestra un resumen visual del inventario: tarjetas con conteos,
 * alerta de stock bajo, gráfico de barras (stock top 10), gráfico
 * circular (productos por categoría) y tabla de últimos movimientos.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Card, Statistic, Table, Tag, Alert, Typography, Spin, Button, Badge, Modal, Space } from 'antd';
import { ShoppingCartOutlined, TeamOutlined, WarningOutlined, SwapOutlined, ReloadOutlined, BellOutlined } from '@ant-design/icons';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { useDashboard } from './useDashboard';
import styles from './styles.module.css';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28DFF'];

/**
 * Componente principal del Dashboard.
 * - Estados: carga (Spin), error (mensaje + botón reintentar), datos (contenido completo).
 * - Renderiza 4 tarjetas estadísticas, alerta de bajo stock, dos gráficos
 *   (barras y pastel) y una tabla con los últimos 10 movimientos.
 */
export default function DashboardPage() {
  const { productos, clientes, movimientos, bajoStock, isLoading, isError } = useDashboard();
  const [notifOpen, setNotifOpen] = useState(false);
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className={styles.page} style={{ textAlign: 'center', paddingTop: 80 }}>
        <Spin size="large" />
        <Typography.Text type="secondary" style={{ display: 'block', marginTop: 16 }}>Cargando panel...</Typography.Text>
      </div>
    );
  }

  if (isError) {
    return (
      <div className={styles.page} style={{ textAlign: 'center', paddingTop: 80 }}>
        <Typography.Text type="danger" style={{ fontSize: 16 }}>Error al cargar los datos</Typography.Text>
        <br />
        <Button icon={<ReloadOutlined />} onClick={() => window.location.reload()} style={{ marginTop: 12 }}>
          Reintentar
        </Button>
      </div>
    );
  }

  const stockData = [...productos]
    .sort((a, b) => b.stock - a.stock)
    .slice(0, 10)
    .map((p) => ({ name: p.nombre, stock: p.stock }));

  const catCount: Record<string, number> = {};
  productos.forEach((p) => {
    const name = p.categoria?.nombre_categoria || 'Sin categoría';
    catCount[name] = (catCount[name] || 0) + 1;
  });
  const pieData = Object.entries(catCount).map(([name, value]) => ({ name, value }));

  return (
    <div className={styles.page}>
      <Typography.Title level={4} className={styles.title}>
        Panel General
      </Typography.Title>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} xl={6}>
          <Card>
            <Statistic title="Productos" value={productos.length} prefix={<ShoppingCartOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <Card>
            <Statistic title="Clientes" value={clientes.length} prefix={<TeamOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <Card hoverable onClick={() => bajoStock.length > 0 && setNotifOpen(true)} style={{ cursor: bajoStock.length > 0 ? 'pointer' : 'default' }}>
            <Badge count={bajoStock.length} size="small" offset={[4, -4]}>
              <Statistic
                title="Notificaciones"
                value={bajoStock.length}
                prefix={<BellOutlined style={{ fontSize: 24, color: bajoStock.length > 0 ? '#faad14' : undefined }} />}
                valueStyle={{ color: bajoStock.length > 0 ? '#faad14' : undefined }}
              />
            </Badge>
          </Card>
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <Card>
            <Statistic title="Movimientos" value={movimientos.length} prefix={<SwapOutlined />} />
          </Card>
        </Col>
      </Row>

      {bajoStock.length > 0 && (
        <Alert
          className={styles.alert}
          type="warning"
          showIcon
          message={
            <span style={{ cursor: 'pointer' }} onClick={() => setNotifOpen(true)}>
              {bajoStock.length} producto(s) con stock bajo o agotado — haz clic para ver detalles
            </span>
          }
        />
      )}

      <Modal
        title={
          <Space>
            <BellOutlined style={{ color: '#faad14' }} />
            Productos con stock bajo
          </Space>
        }
        open={notifOpen}
        onCancel={() => setNotifOpen(false)}
        footer={null}
        width={520}
      >
        <Table
          dataSource={bajoStock}
          rowKey="id_producto"
          size="small"
          pagination={false}
          columns={[
            { title: 'Producto', dataIndex: 'nombre', key: 'nombre' },
            { title: 'Stock actual', dataIndex: 'stock', key: 'stock', render: (v: number, r: any) => <span style={{ color: v <= 0 ? '#cf1322' : '#faad14', fontWeight: 'bold' }}>{v}</span> },
            { title: 'Stock mínimo', dataIndex: 'stock_minimo', key: 'stock_minimo' },
            {
              title: 'Acción',
              key: 'accion',
              render: (_: any, r: any) => (
                <Button
                  type="link"
                  size="small"
                  onClick={() => { setNotifOpen(false); navigate('/productos'); }}
                >
                  Ir a producto
                </Button>
              ),
            },
          ]}
        />
      </Modal>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card title="Stock por producto (top 10)">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={stockData} margin={{ bottom: 60 }}>
                <XAxis dataKey="name" angle={-20} textAnchor="end" tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="stock" fill="#1677ff" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Productos por categoría">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      <Card className={styles.card} title="Últimos movimientos" style={{ marginTop: 16 }}>
        {movimientos.length === 0 ? (
          <Typography.Text type="secondary">No hay movimientos registrados</Typography.Text>
        ) : (
          <Table
            dataSource={movimientos.slice(0, 10)}
            rowKey="id_movimiento"
            size="small"
            pagination={false}
            scroll={{ x: 'max-content' }}
            columns={[
              { title: 'Producto', dataIndex: ['producto', 'nombre'], key: 'producto' },
              {
                title: 'Tipo',
                dataIndex: 'tipo_movimiento',
                key: 'tipo',
                render: (v: string) => (
                  <Tag color={v === 'ENTRADA' ? 'green' : v === 'SALIDA' ? 'red' : 'blue'}>{v}</Tag>
                ),
              },
              { title: 'Cantidad', dataIndex: 'cantidad', key: 'cantidad' },
              { title: 'Cliente', dataIndex: ['cliente', 'nombre'], key: 'cliente' },
              { title: 'Motivo', dataIndex: 'motivo', key: 'motivo' },
              {
                title: 'Fecha',
                dataIndex: 'fecha_movimiento',
                key: 'fecha',
                render: (v: string) => new Date(v).toLocaleDateString('es-CO'),
              },
            ]}
          />
        )}
      </Card>
    </div>
  );
}
